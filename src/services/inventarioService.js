// src/services/inventarioService.js
import api from "./api";

// ----------------- CATEGORÍAS -----------------
export const fetchCategorias = async (params = {}) => {
  // GET /categorias/
  const response = await api.get("/categorias/", { params });
  return response.data;
};

export const fetchCategoriaDetalle = async (id) => {
  const response = await api.get(`/categorias/${id}/`);
  return response.data;
};

export const fetchCategoriasChoices = async () => {
  const response = await api.get("/categorias/choices/");
  return response.data;
};

export const fetchCategoriaConProductos = async (id) => {
  const response = await api.get(`/categorias/${id}/productos/`);
  return response.data;
};

export const searchCategorias = async (query) => {
  const response = await api.get("/categorias/search/", {
    params: { q: query },
  });
  return response.data;
};

export const createCategoria = async (data) => {
  const response = await api.post("/categorias/", data);
  return response.data;
};

export const updateCategoria = async (id, data) => {
  const response = await api.put(`/categorias/${id}/`, data);
  return response.data;
};

export const deleteCategoria = async (id) => {
  const response = await api.delete(`/categorias/${id}/`);
  return response.data;
};

// ----------------- PRODUCTOS -----------------
export const fetchProductos = async (params = {}) => {
  // GET /productos/?page=1&page_size=20&categoria=1&q=xxx&bajo_stock=true
  const response = await api.get("/productos/", { params });
  return response.data;
};

export const fetchProductoDetalle = async (id) => {
  const response = await api.get(`/productos/${id}/`);
  return response.data;
};

export const searchProductos = async (query) => {
  const response = await api.get("/productos/search/", {
    params: { q: query },
  });
  return response.data;
};

export const fetchProductosLowStock = async () => {
  const response = await api.get("/productos/low-stock/");
  return response.data;
};

export const createProducto = async (data) => {
  const response = await api.post("/productos/", data);
  return response.data;
};

export const updateProducto = async (id, data) => {
  const response = await api.put(`/productos/${id}/`, data);
  return response.data;
};

export const deleteProducto = async (id) => {
  const response = await api.delete(`/productos/${id}/`);
  return response.data;
};

export const updateStockProducto = async (id, data) => {
  // data: { movimiento_tipo: 'IN|OUT|ADJ', cantidad: number, notas?: string }
  const response = await api.patch(`/productos/${id}/stock/`, data);
  return response.data;
};

// ----------------- MOVIMIENTOS -----------------
export const fetchMovimientos = async (params = {}) => {
  // GET /movimientos/?page=1&page_size=20&producto=1&tipo=IN&usuario=2
  const response = await api.get("/movimientos/", { params });
  return response.data;
};

export const fetchMovimientoDetalle = async (id) => {
  const response = await api.get(`/movimientos/${id}/`);
  return response.data;
};

export const createMovimiento = async (data) => {
  const response = await api.post("/movimientos/", data);
  return response.data;
};
