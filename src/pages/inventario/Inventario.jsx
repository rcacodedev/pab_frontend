import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useCategorias } from "../../hooks/inventario/useCategorias";
import { useProductos } from "../../hooks/inventario/useProductos";

import CategoriaModal from "../../components/inventario/CategoriaModal";
import ProductoModal from "../../components/inventario/ProductoModal";

import {
  createCategoria,
  createProducto,
} from "../../services/inventarioService";

export default function Inventario() {
  const { categorias, loadCategorias } = useCategorias();
  const [expandedIds, setExpandedIds] = useState([]);
  const [isCategoriaModalOpen, setCategoriaModalOpen] = useState(false);
  const [isProductoModalOpen, setProductoModalOpen] = useState(false);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { productos, loadProductos, page, totalPages, setPage } =
    useProductos(selectedCategoriaId);

  // ======================
  // 📌 Cargar categorías al inicio
  // ======================
  useEffect(() => {
    loadCategorias();
  }, []);

  // ======================
  // 📌 Expandir / Contraer categorías con animación y lazy load
  // ======================
  const toggleExpand = async (categoriaId) => {
    if (expandedIds.includes(categoriaId)) {
      setExpandedIds(expandedIds.filter((id) => id !== categoriaId));
    } else {
      setExpandedIds([...expandedIds, categoriaId]);
      setSelectedCategoriaId(categoriaId);
      await loadProductos(1); // Lazy load productos
    }
  };

  // ======================
  // 📌 Crear categoría
  // ======================
  const handleCreateCategoria = async (data) => {
    if (!data.nombre) return toast.error("El nombre es obligatorio");
    try {
      await createCategoria(data);
      toast.success("Categoría creada correctamente");
      loadCategorias();
      setCategoriaModalOpen(false);
    } catch {
      toast.error("Error al crear categoría");
    }
  };

  // ======================
  // 📌 Crear producto
  // ======================
  const handleCreateProducto = async (data) => {
    if (!data.nombre || !data.stock)
      return toast.error("Todos los campos son obligatorios");
    try {
      await createProducto({ ...data, categoria: selectedCategoriaId });
      toast.success("Producto creado correctamente");
      loadProductos(page);
      setProductoModalOpen(false);
    } catch {
      toast.error("Error al crear producto");
    }
  };

  // ======================
  // 📌 Render recursivo de categorías
  // ======================
  const renderCategoria = (categoria, level = 0) => {
    const isExpanded = expandedIds.includes(categoria.id);

    return (
      <div
        key={categoria.id}
        className={`ml-${level * 4} border-l border-gray-300 pl-2 py-1`}
      >
        <div className="flex justify-between items-center">
          <button
            onClick={() => toggleExpand(categoria.id)}
            className="text-left font-medium flex-1 hover:text-blue-600 transition-colors duration-200"
          >
            {isExpanded ? "▼ " : "▶ "} {categoria.nombre}
          </button>
          <button
            onClick={() => {
              setSelectedCategoriaId(categoria.id);
              setProductoModalOpen(true);
            }}
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors duration-200"
          >
            + Producto
          </button>
        </div>

        {isExpanded && (
          <div className="mt-2 space-y-2 transition-all duration-300 ease-in-out">
            {/* Subcategorías */}
            {categoria.children?.map((child) =>
              renderCategoria(child, level + 1)
            )}

            {/* Productos */}
            {categoria.id === selectedCategoriaId && productos.length > 0 && (
              <div className="overflow-x-auto bg-white shadow rounded-lg mt-2">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2">Nombre</th>
                      <th className="px-4 py-2">Stock</th>
                      <th className="px-4 py-2">Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-2">{p.nombre}</td>
                        <td className="px-4 py-2">{p.stock}</td>
                        <td className="px-4 py-2">{p.categoria_nombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-2 py-1 border rounded ${
                          page === i + 1
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        } transition-colors duration-200`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ======================
  // 📌 Render principal
  // ======================
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCategoriaModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition-colors duration-200"
        >
          + Crear Categoría
        </button>

        <input
          type="text"
          placeholder="Buscar categorías o productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-1/3"
        />
      </div>

      <div className="space-y-2">
        {categorias
          .filter((c) =>
            c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((c) => renderCategoria(c))}
      </div>

      {/* Modales */}
      {isCategoriaModalOpen && (
        <CategoriaModal
          onClose={() => setCategoriaModalOpen(false)}
          onSubmit={handleCreateCategoria}
        />
      )}
      {isProductoModalOpen && (
        <ProductoModal
          categorias={categorias}
          onClose={() => setProductoModalOpen(false)}
          onSubmit={handleCreateProducto}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
