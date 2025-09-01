import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useCategorias } from "../../hooks/inventario/useCategorias";
import { useProductos } from "../../hooks/inventario/useProductos";

import {
  createProducto,
  createCategoria,
  createMovimiento,
} from "../../services/inventarioService";

import ProductoModal from "../../components/inventario/ProductoModal";
import CategoriaModal from "../../components/inventario/CategoriaModal";
import MovimientoModal from "../../components/inventario/MovimientoModal";

export default function Inventario() {
  const [activeTab, setActiveTab] = useState("productos");

  // -------------------------------
  // Hooks para categorías y productos
  // -------------------------------
  const {
    categorias,
    loading: loadingCategorias,
    refetch: refetchCategorias,
  } = useCategorias();

  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const {
    productos,
    loadProductos,
    page,
    setPage,
    totalPages,
    loading: loadingProductos,
  } = useProductos(selectedCategoria?.id);

  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);

  // -------------------------------
  // Modal
  // -------------------------------
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  // -------------------------------
  // Fetch movimientos
  // -------------------------------
  const fetchMovimientos = async () => {
    setLoadingMovimientos(true);
    try {
      const res = await fetch("/api/movimientos/");
      const data = await res.json();
      setMovimientos(data.results || data);
    } catch (err) {
      toast.error("Error cargando movimientos");
    } finally {
      setLoadingMovimientos(false);
    }
  };

  useEffect(() => {
    if (selectedCategoria) loadProductos(1);
    fetchMovimientos();
  }, [selectedCategoria]);

  // -------------------------------
  // Manejo de creación
  // -------------------------------
  const handleCreate = async (data) => {
    try {
      if (modalType === "producto") {
        await createProducto(data);
        toast.success("Producto creado");
        loadProductos(1);
      } else if (modalType === "categoria") {
        await createCategoria(data);
        toast.success("Categoría creada");
        refetchCategorias();
      } else if (modalType === "movimiento") {
        await createMovimiento(data);
        toast.success("Movimiento registrado");
        fetchMovimientos();
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al crear");
    }
  };

  // -------------------------------
  // Tabs
  // -------------------------------
  const renderTabs = () => (
    <div className="flex space-x-4 border-b mb-6">
      {["productos", "categorias", "movimientos"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 font-medium ${
            activeTab === tab
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-blue-500"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );

  // -------------------------------
  // Contenido de tabs
  // -------------------------------
  const renderContent = () => {
    if (activeTab === "productos") {
      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Productos</h2>
            <button
              onClick={() => openModal("producto")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Añadir Producto
            </button>
          </div>
          {loadingProductos ? (
            <div className="text-center py-10">Cargando productos...</div>
          ) : (
            <table className="min-w-full text-left bg-white shadow rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">{p.nombre}</td>
                    <td className="px-4 py-2">{p.stock}</td>
                    <td className="px-4 py-2">{p.categoria_nombre || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    }

    if (activeTab === "categorias") {
      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Categorías</h2>
            <button
              onClick={() => openModal("categoria")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Añadir Categoría
            </button>
          </div>
          {loadingCategorias ? (
            <div className="text-center py-10">Cargando categorías...</div>
          ) : (
            <ul className="bg-white shadow rounded-lg overflow-hidden">
              {categorias.map((c) => (
                <li
                  key={c.id}
                  className="px-4 py-2 border-t cursor-pointer hover:bg-gray-100"
                  onClick={() => setSelectedCategoria(c)}
                >
                  {c.nombre}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    if (activeTab === "movimientos") {
      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Movimientos</h2>
            <button
              onClick={() => openModal("movimiento")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              + Registrar Movimiento
            </button>
          </div>
          {loadingMovimientos ? (
            <div className="text-center py-10">Cargando movimientos...</div>
          ) : (
            <table className="min-w-full text-left bg-white shadow rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2">Cantidad</th>
                  <th className="px-4 py-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-2">{m.producto_nombre}</td>
                    <td className="px-4 py-2">{m.cantidad}</td>
                    <td className="px-4 py-2">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Inventario</h1>

      {renderTabs()}
      {renderContent()}

      {/* Modales separados */}
      {modalType === "producto" && (
        <ProductoModal
          categorias={categorias}
          onClose={closeModal}
          onSubmit={handleCreate}
        />
      )}
      {modalType === "categoria" && (
        <CategoriaModal onClose={closeModal} onSubmit={handleCreate} />
      )}
      {modalType === "movimiento" && (
        <MovimientoModal
          productos={productos}
          onClose={closeModal}
          onSubmit={handleCreate}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
