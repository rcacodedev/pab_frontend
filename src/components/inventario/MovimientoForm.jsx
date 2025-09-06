// components/inventario/MovimientoForm.jsx
import { useEffect, useState } from "react";
import { useCreateMovimiento } from "../../hooks/inventario/useInventario";

const TIPOS = [
  { value: "IN", label: "Entrada" },
  { value: "OUT", label: "Salida" },
  { value: "ADJ", label: "Ajuste" },
];

export default function MovimientoForm({
  productoId,
  productoNombre,
  onSuccess,
  onCancel,
}) {
  const [form, setForm] = useState({
    producto: productoId ?? "",
    movimiento_tipo: "IN",
    cantidad: "",
    notas: "",
  });
  const [apiError, setApiError] = useState(""); // 👈 nuevo

  useEffect(() => {
    if (productoId) setForm((s) => ({ ...s, producto: productoId }));
  }, [productoId]);

  const { mutate: createMovimiento, isPending } = useCreateMovimiento();
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setApiError("");

    const payload = {
      producto: Number(form.producto),
      movimiento_tipo: form.movimiento_tipo,
      cantidad: Number(form.cantidad),
      notas: form.notas?.trim() || "",
    };

    // Validación rápida en cliente
    if (!payload.producto || payload.producto <= 0) {
      setApiError("Debes indicar un producto válido.");
      return;
    }
    if (!payload.cantidad || payload.cantidad <= 0) {
      setApiError("La cantidad debe ser mayor que 0.");
      return;
    }
    if (!["IN", "OUT", "ADJ"].includes(payload.movimiento_tipo)) {
      setApiError("Tipo de movimiento inválido.");
      return;
    }

    createMovimiento(payload, {
      onSuccess: () => onSuccess?.(),
      onError: (err) => {
        // Muestra el motivo real del 400:
        const data = err?.response?.data;
        console.error("Movimiento POST error:", data || err);
        // Intenta formatear los errores de DRF
        if (data && typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          const firstVal = Array.isArray(data[firstKey])
            ? data[firstKey][0]
            : data[firstKey];
          setApiError(
            typeof firstVal === "string"
              ? firstVal
              : "Error al crear el movimiento."
          );
        } else {
          setApiError("Error al crear el movimiento.");
        }
      },
    });
  };

  return (
    <form className="grid gap-3" onSubmit={submit}>
      {!productoId ? (
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Producto (ID)
          <input
            type="number"
            min={1}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            value={form.producto}
            onChange={(e) => set("producto", e.target.value)}
            required
            placeholder="ID del producto"
          />
          <span className="text-xs text-gray-500">
            (Puedes mejorar esto con un selector/buscador de productos)
          </span>
        </label>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          Producto: <strong>#{productoId}</strong>{" "}
          {productoNombre ? `— ${productoNombre}` : ""}
        </div>
      )}

      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Tipo de movimiento
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          value={form.movimiento_tipo}
          onChange={(e) => set("movimiento_tipo", e.target.value)}
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Cantidad
        <input
          type="number"
          min={1}
          className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          value={form.cantidad}
          onChange={(e) => set("cantidad", e.target.value)}
          required
        />
      </label>

      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Notas (opcional)
        <textarea
          className="min-h-[80px] resize-y rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          value={form.notas}
          onChange={(e) => set("notas", e.target.value)}
          placeholder="Motivo, albarán, cliente/proveedor, etc."
        />
      </label>

      {/* 👇 Mensaje de error de la API */}
      {apiError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <div className="mt-1 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "Guardando..." : "Crear movimiento"}
        </button>
      </div>
    </form>
  );
}
