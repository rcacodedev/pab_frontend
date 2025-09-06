// src/components/inventario/CategoriaForm.jsx
import { useEffect, useState } from "react";

export default function CategoriaForm({ initial, onSubmit, submitting }) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");

  useEffect(() => {
    if (initial?.id != null) {
      setNombre(initial?.nombre ?? "");
      setDescripcion(initial?.descripcion ?? "");
    }
  }, [initial?.id]);

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
        });
      }}
    >
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Nombre
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          placeholder="Ej. Fontanería"
          value={nombre}
          required
          autoFocus
          onChange={(e) => setNombre(e.target.value)}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Descripción
        <textarea
          className="min-h-[80px] resize-y rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          placeholder="Opcional"
          value={descripcion || ""}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </label>
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
