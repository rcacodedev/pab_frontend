// src/components/inventario/MovimientosTable.jsx
import { useEffect, useMemo, useState } from "react";
import { useMovimientos } from "../../hooks/inventario/useInventario";

const TIPOS = [
  { value: "", label: "Todos" },
  { value: "IN", label: "Entradas" },
  { value: "OUT", label: "Salidas" },
  { value: "ADJ", label: "Ajustes" },
];

export default function MovimientosTable() {
  // Filtros
  const [producto, setProducto] = useState("");
  const [usuario, setUsuario] = useState("");
  const [tipo, setTipo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Debounce filtros
  const [debounced, setDebounced] = useState({
    producto,
    usuario,
    tipo,
    desde,
    hasta,
  });
  useEffect(() => {
    const t = setTimeout(
      () => setDebounced({ producto, usuario, tipo, desde, hasta }),
      300
    );
    return () => clearTimeout(t);
  }, [producto, usuario, tipo, desde, hasta]);

  const params = useMemo(() => {
    const p = { page, page_size: pageSize };
    if (debounced.producto) p.producto = debounced.producto;
    if (debounced.usuario) p.usuario = debounced.usuario;
    if (debounced.tipo) p.tipo = debounced.tipo;
    if (debounced.desde) p.fecha_inicio = debounced.desde;
    if (debounced.hasta) p.fecha_fin = debounced.hasta;
    return p;
  }, [debounced, page, pageSize]);

  const { data, isLoading, isError, isFetching } = useMovimientos(params);
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
      if (i < arr.length - 1 && arr[i + 1] !== arr[i] + 1) out.push("…");
    }
    return out;
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-5">
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Producto (ID)
          <input
            type="number"
            min={1}
            className="rounded-lg border border-gray-300 px-3 py-2"
            value={producto}
            onChange={(e) => {
              setProducto(e.target.value);
              setPage(1);
            }}
            placeholder="Ej. 42"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Usuario (ID)
          <input
            type="number"
            min={1}
            className="rounded-lg border border-gray-300 px-3 py-2"
            value={usuario}
            onChange={(e) => {
              setUsuario(e.target.value);
              setPage(1);
            }}
            placeholder="Opcional"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Tipo
          <select
            className="rounded-lg border border-gray-300 px-3 py-2"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setPage(1);
            }}
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Desde
          <input
            type="date"
            className="rounded-lg border border-gray-300 px-3 py-2"
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          Hasta
          <input
            type="date"
            className="rounded-lg border border-gray-300 px-3 py-2"
            value={hasta}
            onChange={(e) => {
              setHasta(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Fecha
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Tipo
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Producto
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Ref
              </th>
              <th className="px-3 py-2 text-right font-semibold text-gray-700">
                Cantidad
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Usuario
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Notas
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td className="px-3 py-3 text-gray-500" colSpan={7}>
                  Cargando movimientos…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-3 py-3 text-red-600" colSpan={7}>
                  Error al cargar movimientos.
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-gray-500" colSpan={7}>
                  Sin resultados.
                </td>
              </tr>
            ) : (
              items.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {new Date(m.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    {m.movimiento_tipo_display ?? m.movimiento_tipo}
                  </td>
                  <td className="px-3 py-2">
                    {m.producto_nombre ?? m.producto}
                  </td>
                  <td className="px-3 py-2">{m.producto_referencia ?? "-"}</td>
                  <td className="px-3 py-2 text-right">{m.cantidad}</td>
                  <td className="px-3 py-2">
                    {m.usuario
                      ? `${m.usuario.nombre ?? ""} ${
                          m.usuario.primer_apellido ?? ""
                        }`.trim() || m.usuario.email
                      : "-"}
                  </td>
                  <td className="px-3 py-2">{m.notas || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
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
              p === "…" ? (
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
    </div>
  );
}
