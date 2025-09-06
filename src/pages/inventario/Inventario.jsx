// src/pages/Inventario.jsx
import { useEffect, useMemo, useState } from "react";
import {
  useCategorias,
  useCreateCategoria,
  useUpdateCategoria,
  useDeleteCategoria,
  useCreateProducto,
  useProductos, // para resultados de productos (si ya lo usas)
} from "../../hooks/inventario/useInventario";

import Modal from "../../components/general/Modal";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCube,
  IconSearch,
} from "../../components/general/Icons";
import CategoriaForm from "../../components/inventario/CategoriaForm";
import ProductoForm from "../../components/inventario/ProductoForm";
import TablaProductosDeSubcategoria from "../../components/inventario/TablaProductos";
import ProductSearchResults from "../../components/inventario/ProductSearchResults"; // si ya lo tienes
import MovimientosTable from "../../components/inventario/MovimientosTable"; // 👈 nuevo

export default function Inventario() {
  const { data, isLoading, isError, refetch } = useCategorias({
    ordering: "nombre",
  });
  const categorias = Array.isArray(data) ? data : data?.results ?? [];

  const { mutate: createCategoria, isPending: creatingCat } =
    useCreateCategoria();
  const { mutate: updateCategoria, isPending: updatingCat } =
    useUpdateCategoria();
  const { mutate: deleteCategoria, isPending: deletingCat } =
    useDeleteCategoria();
  const { mutate: createProducto, isPending: creatingProd } =
    useCreateProducto();

  const [openCreateCat, setOpenCreateCat] = useState(false);
  const [openEditCat, setOpenEditCat] = useState(null);
  const [openCreateSub, setOpenCreateSub] = useState(null);
  const [openCreateProdForSub, setOpenCreateProdForSub] = useState(null);
  const [openHistorial, setOpenHistorial] = useState(false); // 👈 modal historial

  // Buscador + debounce (si ya lo tienes, déjalo tal cual)
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { roots, byParent } = useMemo(() => {
    const roots = [];
    const byParent = {};
    (categorias || []).forEach((c) => {
      if (!c.parent) roots.push(c);
      else {
        byParent[c.parent] = byParent[c.parent] || [];
        byParent[c.parent].push(c);
      }
    });
    roots.sort((a, b) => a.nombre.localeCompare(b.nombre));
    Object.values(byParent).forEach((arr) =>
      arr.sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    return { roots, byParent };
  }, [categorias]);

  const { filteredRoots, filteredByParent } = useMemo(() => {
    if (!debounced) return { filteredRoots: roots, filteredByParent: byParent };
    const match = (txt) => (txt || "").toLowerCase().includes(debounced);
    const filteredByParent = {};
    const filteredRoots = [];
    roots.forEach((root) => {
      const children = byParent[root.id] || [];
      const rootMatch = match(root.nombre);
      const matchingChildren = children.filter((c) => match(c.nombre));
      if (rootMatch || matchingChildren.length > 0) {
        filteredRoots.push(root);
        filteredByParent[root.id] = rootMatch ? children : matchingChildren;
      }
    });
    return { filteredRoots, filteredByParent };
  }, [roots, byParent, debounced]);

  // (Opcional) resultados de productos si ya los usas
  const [prodPage, setProdPage] = useState(1);
  const [prodPageSize, setProdPageSize] = useState(10);
  useEffect(() => {
    setProdPage(1);
  }, [debounced]);
  const {
    data: prodData,
    isLoading: prodLoading,
    isError: prodError,
    isFetching: prodFetching,
  } = useProductos(
    {
      q: debounced,
      page: prodPage,
      page_size: prodPageSize,
      ordering: "nombre",
    },
    { enabled: !!debounced }
  );

  // Handlers categorías
  const handleCreateRoot = (payload) => {
    createCategoria(payload, {
      onSuccess: () => {
        setOpenCreateCat(false);
        refetch();
      },
    });
  };
  const handleCreateSub = (parentId, payload) => {
    createCategoria(
      { ...payload, parent: parentId },
      {
        onSuccess: () => {
          setOpenCreateSub(null);
          refetch();
        },
      }
    );
  };
  const handleEdit = (catId, payload) => {
    updateCategoria(
      { id: catId, payload },
      {
        onSuccess: () => {
          setOpenEditCat(null);
          refetch();
        },
      }
    );
  };
  const handleDelete = (catId) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    deleteCategoria(catId, { onSuccess: () => refetch() });
  };
  const handleCreateProducto = (_subcat, payload) => {
    createProducto(payload, { onSuccess: () => setOpenCreateProdForSub(null) });
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Inventario</h1>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          {/* Buscador */}
          <div className="relative w-full max-w-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categorías, subcategorías o productos…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-9 outline-none focus:border-blue-500"
            />
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
              <IconSearch />
            </span>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-sm text-gray-500 hover:bg-gray-100"
                title="Limpiar"
              >
                ×
              </button>
            )}
          </div>

          {/* 👇 Historial de movimientos (modal) */}
          <button
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
            onClick={() => setOpenHistorial(true)}
          >
            Historial
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={() => setOpenCreateCat(true)}
            disabled={creatingCat}
          >
            <IconPlus />
            Añadir categoría
          </button>
        </div>
      </div>

      {isLoading && <p className="mt-4 text-gray-500">Cargando categorías…</p>}
      {isError && (
        <p className="mt-4 text-red-600">Error cargando categorías.</p>
      )}

      {/* Resultados de productos cuando hay búsqueda (si lo usas) */}
      {debounced && (
        <ProductSearchResults
          data={prodData}
          loading={prodLoading}
          error={prodError}
          fetching={prodFetching}
          page={prodPage}
          pageSize={prodPageSize}
          onChangePage={setProdPage}
          onChangePageSize={(n) => {
            setProdPageSize(n);
            setProdPage(1);
          }}
        />
      )}

      {/* Árbol de categorías/subcategorías */}
      <div className="mt-4 grid gap-4">
        {filteredRoots.map((cat) => (
          <div
            key={cat.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{cat.nombre}</h2>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg p-2 hover:bg-gray-100"
                  title="Editar"
                  onClick={() => setOpenEditCat(cat)}
                >
                  <IconEdit />
                </button>
                <button
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  title="Eliminar"
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingCat}
                >
                  <IconTrash />
                </button>
                <button
                  className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                  title="Añadir subcategoría"
                  onClick={() => setOpenCreateSub(cat)}
                >
                  <IconPlus />
                </button>
              </div>
            </div>

            {/* Subcategorías */}
            <div className="mt-3 grid gap-3">
              {(filteredByParent[cat.id] || []).map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{sub.nombre}</div>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg p-2 hover:bg-gray-100"
                        title="Editar"
                        onClick={() => setOpenEditCat(sub)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Eliminar"
                        onClick={() => handleDelete(sub.id)}
                        disabled={deletingCat}
                      >
                        <IconTrash />
                      </button>
                      <button
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="Añadir producto"
                        onClick={() => setOpenCreateProdForSub(sub)}
                      >
                        <IconCube />
                      </button>
                    </div>
                  </div>

                  {/* Tabla de productos */}
                  <div className="mt-3">
                    <TablaProductosDeSubcategoria subcatId={sub.id} />
                  </div>
                </div>
              ))}
              {(filteredByParent[cat.id] || []).length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500">
                  {debounced ? "Sin coincidencias." : "Sin subcategorías."}
                </div>
              )}
            </div>
          </div>
        ))}

        {!isLoading && filteredRoots.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
            {debounced
              ? "No hay resultados."
              : "No hay categorías. Crea la primera para empezar."}
          </div>
        )}
      </div>

      {/* Modales categorías/productos */}
      <Modal
        open={openCreateCat}
        title="Nueva categoría"
        onClose={() => setOpenCreateCat(false)}
      >
        <CategoriaForm onSubmit={handleCreateRoot} submitting={creatingCat} />
      </Modal>

      <Modal
        open={!!openEditCat}
        title={`Editar: ${openEditCat?.nombre ?? ""}`}
        onClose={() => setOpenEditCat(null)}
      >
        <CategoriaForm
          initial={openEditCat || {}}
          onSubmit={(p) => handleEdit(openEditCat.id, p)}
          submitting={updatingCat}
        />
      </Modal>

      <Modal
        open={!!openCreateSub}
        title={`Nueva subcategoría en: ${openCreateSub?.nombre ?? ""}`}
        onClose={() => setOpenCreateSub(null)}
      >
        <CategoriaForm
          onSubmit={(p) => handleCreateSub(openCreateSub.id, p)}
          submitting={creatingCat}
        />
      </Modal>

      <Modal
        open={!!openCreateProdForSub}
        title={`Nuevo producto en: ${openCreateProdForSub?.nombre ?? ""}`}
        onClose={() => setOpenCreateProdForSub(null)}
      >
        <ProductoForm
          categoriaId={openCreateProdForSub?.id}
          onSubmit={(payload) =>
            handleCreateProducto(openCreateProdForSub, payload)
          }
          submitting={creatingProd}
        />
      </Modal>

      {/* 👇 Modal Historial de movimientos */}
      <Modal
        open={openHistorial}
        title="Historial de movimientos"
        onClose={() => setOpenHistorial(false)}
        width={900}
      >
        <MovimientosTable />
      </Modal>
    </div>
  );
}
