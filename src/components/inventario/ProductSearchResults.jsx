// src/components/inventario/ProductSearchResults.jsx
export default function ProductSearchResults({
  data,
  loading,
  error,
  fetching,
  page,
  pageSize,
  onChangePage,
  onChangePageSize,
}) {
  const total = data?.count ?? 0;
  const items = data?.items ?? data?.results ?? []; // por si tu fetch devuelve results
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

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
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold">Resultados de productos</h3>
        <div className="text-sm text-gray-600">
          {fetching ? "Actualizando…" : `Coincidencias: ${total}`}
        </div>
      </div>

      {loading && <p className="text-sm text-gray-600">Buscando productos…</p>}
      {error && (
        <p className="text-sm text-red-600">Error al buscar productos.</p>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500">
          No hay productos que coincidan.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
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
                    Categoría
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Venta (€)
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Localización
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{p.referencia_codigo}</td>
                    <td className="px-3 py-2">{p.nombre}</td>
                    <td className="px-3 py-2">{p.categoria_nombre ?? "-"}</td>
                    <td className="px-3 py-2">{p.stock}</td>
                    <td className="px-3 py-2">{p.venta_precio}</td>
                    <td className="px-3 py-2">{p.localizacion || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              {fetching
                ? "Actualizando…"
                : `Mostrando ${start}–${end} de ${total}`}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Por página</span>
                <select
                  value={pageSize}
                  onChange={(e) => onChangePageSize(Number(e.target.value))}
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
                  onClick={() => onChangePage(page - 1)}
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
                      onClick={() => onChangePage(p)}
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
                  onClick={() => onChangePage(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
