// src/services/inventarioService.js
import api from "./api";

/** Construye querystrings limpios: elimina null/undefined/"" */
const buildQuery = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
};

/** Genera un UUID v4 simple para operation_id / Idempotency-Key */
const uuid = () => {
  if (globalThis.crypto?.getRandomValues) {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }
  // Fallback (no-crypto): suficientemente único para idempotencia en UI
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);
  return `${s4()}${s4()}-${s4()}-4${s4().slice(
    0,
    3
  )}-${s4()}-${s4()}${s4()}${s4()}`;
};

/* ===========================
 * Categorías
 * =========================== */

/** Lista categorías (soporta ?q, ?root=true, ?ordering, ?page, ?page_size) */
export const getCategorias = (params = {}) =>
  api.get(`/inventario/categorias/${buildQuery(params)}`).then((r) => r.data);

/** Crea categoría */
export const createCategoria = (payload) =>
  api.post(`/inventario/categorias/`, payload).then((r) => r.data);

/** Detalle/actualiza/elimina categoría */
export const getCategoria = (id) =>
  api.get(`/inventario/categorias/${id}/`).then((r) => r.data);

export const updateCategoria = (id, payload) =>
  api.patch(`/inventario/categorias/${id}/`, payload).then((r) => r.data);

export const deleteCategoria = (id) =>
  api.delete(`/inventario/categorias/${id}/`).then((r) => r.data);

/** Lista simplificada para selects */
export const getCategoriaChoices = () =>
  api.get(`/inventario/categorias/choices/`).then((r) => r.data);

/** Categoría con productos y subcategorías */
export const getCategoriaConProductos = (id) =>
  api.get(`/inventario/categorias/${id}/productos/`).then((r) => r.data);

/** Búsqueda por nombre (?q=) */
export const searchCategorias = (q) =>
  api
    .get(`/inventario/categorias/search/${buildQuery({ q })}`)
    .then((r) => r.data);

/* ===========================
 * Productos
 * =========================== */

/**
 * Lista productos
 * params: { categoria, q, is_active, bajo_stock, min_stock, max_stock, ordering, page, page_size }
 * Devuelve objeto paginado DRF { count, next, previous, results }
 */
export const getProductos = (params = {}) =>
  api.get(`/inventario/productos/${buildQuery(params)}`).then((r) => r.data);

/** Crea producto (devuelve el objeto creado con id) */
export const createProducto = (payload) =>
  api.post(`/inventario/productos/`, payload).then((r) => r.data);

/** Detalle/actualiza/elimina producto */
export const getProducto = (id) =>
  api.get(`/inventario/productos/${id}/`).then((r) => r.data);

export const updateProducto = (id, payload) =>
  api.patch(`/inventario/productos/${id}/`, payload).then((r) => r.data);

export const deleteProducto = (id) =>
  api.delete(`/inventario/productos/${id}/`).then((r) => r.data);

/** Búsqueda rápida (?q=) */
export const searchProductos = (q, extra = {}) =>
  api
    .get(`/inventario/productos/search/${buildQuery({ q, ...extra })}`)
    .then((r) => r.data);

/** Productos con stock bajo */
export const getProductosLowStock = (params = {}) =>
  api
    .get(`/inventario/productos/low-stock/${buildQuery(params)}`)
    .then((r) => r.data);

/**
 * Actualiza stock de un producto creando un movimiento.
 * body: { movimiento_tipo: "IN|OUT|ADJ", cantidad, notas?, operation_id?, performed_at? }
 * Envía también Idempotency-Key.
 * Devuelve el movimiento creado.
 */
export const patchProductoStock = (id, body) => {
  const operationId = body?.operation_id || uuid();
  const payload = {
    operation_id: operationId,
    movimiento_tipo: body.movimiento_tipo,
    cantidad: Number(body.cantidad),
    notas: body.notas ?? "",
    ...(body.performed_at ? { performed_at: body.performed_at } : {}),
  };
  return api
    .patch(`/inventario/productos/${id}/stock/`, payload, {
      headers: { "Idempotency-Key": operationId },
    })
    .then((r) => r.data);
};

/* ===========================
 * Movimientos
 * =========================== */

/**
 * Lista movimientos
 * params: { producto, usuario, tipo, fecha_inicio, fecha_fin, search, ordering, page, page_size }
 * Devuelve objeto paginado DRF
 */
export const getMovimientos = (params = {}) =>
  api.get(`/inventario/movimientos/${buildQuery(params)}`).then((r) => r.data);

/**
 * Crea movimiento con idempotencia.
 * body: { producto, movimiento_tipo: "IN|OUT|ADJ", cantidad, notas?, operation_id?, performed_at? }
 * Devuelve el movimiento creado.
 */
export const createMovimiento = (body) => {
  const operationId = body?.operation_id || uuid();
  const payload = {
    operation_id: operationId,
    producto: Number(body.producto),
    movimiento_tipo: body.movimiento_tipo,
    cantidad: Number(body.cantidad),
    notas: body.notas ?? "",
    ...(body.performed_at ? { performed_at: body.performed_at } : {}),
  };
  return api
    .post(`/inventario/movimientos/`, payload, {
      headers: { "Idempotency-Key": operationId },
    })
    .then((r) => r.data);
};

/** Detalle de movimiento */
export const getMovimiento = (id) =>
  api.get(`/inventario/movimientos/${id}/`).then((r) => r.data);

/* ===========================
 * Export agrupado
 * =========================== */
const inventarioService = {
  // Categorías
  getCategorias,
  createCategoria,
  getCategoria,
  updateCategoria,
  deleteCategoria,
  getCategoriaChoices,
  getCategoriaConProductos,
  searchCategorias,
  // Productos
  getProductos,
  createProducto,
  getProducto,
  updateProducto,
  deleteProducto,
  searchProductos,
  getProductosLowStock,
  patchProductoStock,
  // Movimientos
  getMovimientos,
  createMovimiento,
  getMovimiento,
};

export default inventarioService;
