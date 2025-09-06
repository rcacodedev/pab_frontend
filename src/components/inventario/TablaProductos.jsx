// src/components/inventario/TablaProductosDeSubcategoria.jsx
import { useEffect, useState } from "react";
import {
  useProductos,
  useUpdateProducto,
  useDeleteProducto,
} from "../../hooks/inventario/useInventario";
import Modal from "../general/Modal";
import ProductoForm from "./ProductoForm";
import MovimientoForm from "./MovimientoForm"; // 👈 nuevo
import { IconEdit, IconTrash } from "../general/Icons";

export default function TablaProductosDeSubcategoria({ subcatId }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [openMovimientoFor, setOpenMovimientoFor] = useState(null); // 👈 producto o null

  useEffect(() => setPage(1), [subcatId]);

  const params = {
    categoria: subcatId,
    page,
    page_size: pageSize,
    ordering: "nombre",
  };
  const { data, isLoading, isError, isFetching, refetch } =
    useProductos(params);

  const { mutate: updateProducto, isPending: updating } = useUpdateProducto();
  const { mutate: deleteProducto, isPending: deletingReq } =
    useDeleteProducto();

  const items = data?.items || [];
  const total = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const goTo = (n) => setPage(Math.max(1, Math.min(totalPages, n)));

  const buildPages = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, current, current - 1, current + 1]);
    if (current <= 4) [2, 3, 4, 5].forEach((p) => pages.add(p));
    if (current >= total - 3)
      [total - 1, total - 2, total - 3, total - 4].forEach((p) => pages.add(p));
    const arr = Array.from(pages)
      .filter((p) => p >= 1 && p <= total)
      .sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      out.push(arr[i]);
      if (i < arr.length - 1 && arr[i + 1] !== arr[i] + 1) out.push("...");
    }
    return out;
  };

  const onSaveEdit = (payload) => {
    const clean = {
      ...(payload.referencia_codigo !== undefined && {
        referencia_codigo: String(payload.referencia_codigo).trim(),
      }),
      ...(payload.nombre !== undefined && {
        nombre: String(payload.nombre).trim(),
      }),
      ...(payload.descripcion !== undefined && {
        descripcion: payload.descripcion === "" ? null : payload.descripcion,
      }),
      ...(payload.stock !== undefined && { stock: Number(payload.stock) }),
      ...(payload.min_stock !== undefined && {
        min_stock: Number(payload.min_stock),
      }),
      ...(payload.max_stock !== undefined && {
        max_stock:
          payload.max_stock === "" || payload.max_stock === null
            ? null
            : Number(payload.max_stock),
      }),
      ...(payload.coste_precio !== undefined && {
        coste_precio:
          payload.coste_precio === "" || payload.coste_precio === null
            ? "0"
            : String(payload.coste_precio),
      }),
      ...(payload.venta_precio !== undefined && {
        venta_precio:
          payload.venta_precio === "" || payload.venta_precio === null
            ? "0"
            : String(payload.venta_precio),
      }),
      ...(payload.localizacion !== undefined && {
        localizacion: payload.localizacion ?? "",
      }),
      ...(payload.barcode !== undefined && { barcode: payload.barcode ?? "" }),
      ...(payload.is_active !== undefined && {
        is_active: !!payload.is_active,
      }),
    };
    Object.keys(clean).forEach(
      (k) => clean[k] === undefined && delete clean[k]
    );

    updateProducto(
      { id: editing.id, payload: clean },
      {
        onSuccess: () => {
          setEditing(null);
          refetch();
        },
        onError: (err) =>
          console.error("PATCH producto error:", err?.response?.data || err),
      }
    );
  };

  const onConfirmDelete = () => {
    deleteProducto(deleting.id, {
      onSuccess: () => {
        setDeleting(null);
        const remaining = total - 1;
        const newTotalPages = Math.max(1, Math.ceil(remaining / pageSize));
        if (page > newTotalPages) setPage(newTotalPages);
        refetch();
      },
    });
  };

  if (isLoading)
    return <p className="text-sm text-gray-500">Cargando productos…</p>;
  if (isError)
    return <p className="text-sm text-red-600">Error al cargar productos.</p>;
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500">
        No hay productos.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Ref
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Nombre
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Stock
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Mín
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Venta (€)
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Localización
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Estado
              </th>
              <th className="px-3 py-2 text-right font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{p.referencia_codigo}</td>
                <td className="px-3 py-2">{p.nombre}</td>
                <td className="px-3 py-2">{p.stock}</td>
                <td className="px-3 py-2">{p.min_stock}</td>
                <td className="px-3 py-2">{p.venta_precio}</td>
                <td className="px-3 py-2">{p.localizacion || "-"}</td>
                <td className="px-3 py-2">
                  {p.estado_stock ||
                    (p.stock <= p.min_stock ? "Bajo" : "Disponible")}
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    {/* Botón movimiento rápido */}
                    <button
                      className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                      title="Crear movimiento"
                      onClick={() => setOpenMovimientoFor(p)}
                    >
                      Mov.
                    </button>

                    <button
                      className="rounded-lg p-2 hover:bg-gray-100"
                      title="Editar"
                      onClick={() => setEditing(p)}
                    >
                      <IconEdit />
                    </button>
                    <button
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      title="Eliminar"
                      onClick={() => setDeleting(p)}
                      disabled={deletingReq}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Barra inferior paginación */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          {isFetching
            ? "Actualizando…"
            : `Mostrando ${start}–${end} de ${total}`}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Por página</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page <= 1}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
            >
              ←
            </button>
            {buildPages(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goTo(p)}
                  className={`rounded-md px-2 py-1 text-sm ${
                    p === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => goTo(page + 1)}
              disabled={page >= totalPages}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Modal editar producto */}
      <Modal
        open={!!editing}
        title={`Editar producto: ${editing?.nombre ?? ""}`}
        onClose={() => setEditing(null)}
      >
        <ProductoForm
          initial={editing || {}}
          onSubmit={onSaveEdit}
          submitting={updating}
        />
      </Modal>

      {/* Modal confirmar eliminar */}
      <Modal
        open={!!deleting}
        title="Eliminar producto"
        onClose={() => setDeleting(null)}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            ¿Seguro que quieres eliminar <strong>{deleting?.nombre}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
              onClick={() => setDeleting(null)}
            >
              Cancelar
            </button>
            <button
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              onClick={onConfirmDelete}
              disabled={deletingReq}
            >
              {deletingReq ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal movimiento rápido */}
      <Modal
        open={!!openMovimientoFor}
        title={
          openMovimientoFor
            ? `Movimiento para: ${openMovimientoFor.nombre}`
            : "Movimiento"
        }
        onClose={() => setOpenMovimientoFor(null)}
      >
        <MovimientoForm
          productoId={openMovimientoFor?.id}
          productoNombre={openMovimientoFor?.nombre}
          onSuccess={() => {
            setOpenMovimientoFor(null);
            refetch(); // refresca tabla (stock actualizado)
          }}
          onCancel={() => setOpenMovimientoFor(null)}
        />
      </Modal>
    </div>
  );
}
