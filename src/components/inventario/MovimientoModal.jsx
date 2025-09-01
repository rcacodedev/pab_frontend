import React, { useState } from "react";

export default function MovimientoModal({ productos, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    producto: "",
    cantidad: 0,
    movimiento_tipo: "IN", // por defecto IN
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.producto) return alert("Seleccione un producto");
    if (!formData.cantidad || formData.cantidad <= 0)
      return alert("Cantidad debe ser mayor a 0");
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Registrar Movimiento</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="producto"
            value={formData.producto}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Seleccione producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="cantidad"
            placeholder="Cantidad"
            value={formData.cantidad}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min={1}
          />

          <select
            name="movimiento_tipo"
            value={formData.movimiento_tipo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="IN">Entrada</option>
            <option value="OUT">Salida</option>
            <option value="ADJ">Ajuste</option>
          </select>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
