// src/components/inventario/ProductoForm.jsx
import { useEffect, useState } from "react";

export default function ProductoForm({
  categoriaId,
  initial,
  onSubmit,
  submitting,
}) {
  const [form, setForm] = useState({
    referencia_codigo: initial?.referencia_codigo ?? "",
    nombre: initial?.nombre ?? "",
    descripcion: initial?.descripcion ?? "",
    stock: initial?.stock ?? 0,
    min_stock: initial?.min_stock ?? 5,
    max_stock: initial?.max_stock ?? "",
    coste_precio: initial?.coste_precio ?? "",
    venta_precio: initial?.venta_precio ?? "",
    localizacion: initial?.localizacion ?? "",
    barcode: initial?.barcode ?? "",
    is_active: initial?.is_active ?? true,
  });

  useEffect(() => {
    if (initial?.id != null) {
      setForm({
        referencia_codigo: initial?.referencia_codigo ?? "",
        nombre: initial?.nombre ?? "",
        descripcion: initial?.descripcion ?? "",
        stock: initial?.stock ?? 0,
        min_stock: initial?.min_stock ?? 5,
        max_stock: initial?.max_stock ?? "",
        coste_precio: initial?.coste_precio ?? "",
        venta_precio: initial?.venta_precio ?? "",
        localizacion: initial?.localizacion ?? "",
        barcode: initial?.barcode ?? "",
        is_active: initial?.is_active ?? true,
      });
    }
  }, [initial?.id]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const isEdit = Boolean(initial?.id);

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const payload = {
          ...form,
          ...(categoriaId ? { categoria: categoriaId } : {}),
          stock: Number(form.stock),
          min_stock: Number(form.min_stock),
          max_stock: form.max_stock === "" ? null : Number(form.max_stock),
          coste_precio: String(form.coste_precio ?? "0"),
          venta_precio: String(form.venta_precio ?? "0"),
        };
        onSubmit(payload);
      }}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Ref. (SKU)
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            value={form.referencia_codigo}
            onChange={(e) => set("referencia_codigo", e.target.value)}
            required
            placeholder="SKU-001"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Nombre
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            required
            placeholder="Producto"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-gray-700 md:col-span-2">
          Descripción
          <textarea
            className="min-h-[80px] resize-y rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            value={form.descripcion}
            onChange={(e) => set("descripcion", e.target.value)}
            placeholder="Opcional"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Stock actual
          <input
            type="number"
            min={0}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            required
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Min. stock
          <input
            type="number"
            min={0}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            value={form.min_stock}
            onChange={(e) => set("min_stock", e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Max. stock
          <input
            type="number"
            min={0}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            value={form.max_stock}
            onChange={(e) => set("max_stock", e.target.value)}
            placeholder="(opcional)"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Coste (€)
          <input
            type="number"
            step="0.01"
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            value={form.coste_precio}
            onChange={(e) => set("coste_precio", e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Venta (€)
          <input
            type="number"
            step="0.01"
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            value={form.venta_precio}
            onChange={(e) => set("venta_precio", e.target.value)}
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Localización
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            value={form.localizacion}
            onChange={(e) => set("localizacion", e.target.value)}
            placeholder="A1-B2"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Código de barras
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            value={form.barcode}
            onChange={(e) => set("barcode", e.target.value)}
            placeholder="EAN/UPC"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
          />
          Activo
        </label>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting
            ? isEdit
              ? "Guardando..."
              : "Creando..."
            : isEdit
            ? "Guardar cambios"
            : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
