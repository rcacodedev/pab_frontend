import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import inventarioService from "../../services/inventarioService";

// ---------------------
// Query Keys (consistentes)
// ---------------------
const qk = {
  categorias: (params = {}) => ["inventario", "categorias", params],
  categoria: (id) => ["inventario", "categoria", id],

  productos: (params = {}) => ["inventario", "productos", params],
  producto: (id) => ["inventario", "producto", id],
  productosLow: (params = {}) => ["inventario", "productos-low", params],

  movimientos: (params = {}) => ["inventario", "movimientos", params],
  movimiento: (id) => ["inventario", "movimiento", id],
};

// ---------------------
// Helpers
// ---------------------
const withPagination = (data) => {
  if (!data)
    return {
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
      count: 0,
    };
  const { results = [], count = 0 } = data;
  // DRF no expone page/page_size; los pasamos en params desde el componente.
  return {
    items: results,
    count,
    total: count,
    page: undefined,
    pageSize: undefined,
    totalPages: undefined,
    raw: data,
  };
};

// Ajustes por defecto: reduce ruido de red y flicker en UI
const defaultQueryOpts = {
  staleTime: 60_000, // 1 min cache "fresco"
  gcTime: 5 * 60_000, // 5 min en caché
  refetchOnWindowFocus: false,
  retry: 1,
  placeholderData: (prev) => prev, // keepPreviousData
};

// ---------------------
// Categorías
// ---------------------
export function useCategorias(params = {}, options = {}) {
  return useQuery({
    queryKey: qk.categorias(params),
    queryFn: () => inventarioService.getCategorias(params),
    ...defaultQueryOpts,
    ...options,
  });
}

export function useCategoria(id, options = {}) {
  return useQuery({
    queryKey: qk.categoria(id),
    queryFn: () => inventarioService.getCategoria(id),
    enabled: !!id,
    ...defaultQueryOpts,
    ...options,
  });
}

export function useCreateCategoria(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventarioService.createCategoria,
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: qk.categorias({}) });
    },
    ...options,
  });
}

export function useUpdateCategoria(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) =>
      inventarioService.updateCategoria(id, payload),
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: qk.categoria(id) });
      qc.invalidateQueries({ queryKey: qk.categorias({}) });
    },
    ...options,
  });
}

export function useDeleteCategoria(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => inventarioService.deleteCategoria(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categorias({}) });
    },
    ...options,
  });
}

export function useCategoriaChoices(options = {}) {
  return useQuery({
    queryKey: ["inventario", "categorias", "choices"],
    queryFn: inventarioService.getCategoriaChoices,
    ...defaultQueryOpts,
    ...options,
  });
}

export function useCategoriaConProductos(id, options = {}) {
  return useQuery({
    queryKey: ["inventario", "categoria", id, "con-productos"],
    queryFn: () => inventarioService.getCategoriaConProductos(id),
    enabled: !!id,
    ...defaultQueryOpts,
    ...options,
  });
}

// ---------------------
// Productos
// ---------------------
export function useProductos(params = {}, options = {}) {
  return useQuery({
    queryKey: qk.productos(params),
    queryFn: () => inventarioService.getProductos(params),
    select: withPagination,
    ...defaultQueryOpts,
    ...options,
  });
}

export function useProducto(id, options = {}) {
  return useQuery({
    queryKey: qk.producto(id),
    queryFn: () => inventarioService.getProducto(id),
    enabled: !!id,
    ...defaultQueryOpts,
    ...options,
  });
}

export function useCreateProducto(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventarioService.createProducto,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: qk.productos({}) });
      if (data?.id) qc.invalidateQueries({ queryKey: qk.producto(data.id) });
    },
    ...options,
  });
}

export function useUpdateProducto(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) =>
      inventarioService.updateProducto(id, payload),
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: qk.producto(id) });
      qc.invalidateQueries({ queryKey: qk.productos({}) });
      qc.invalidateQueries({ queryKey: qk.productosLow({}) });
    },
    ...options,
  });
}

export function useDeleteProducto(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => inventarioService.deleteProducto(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.productos({}) });
      qc.invalidateQueries({ queryKey: qk.productosLow({}) });
    },
    ...options,
  });
}

export function useProductosLowStock(params = {}, options = {}) {
  return useQuery({
    queryKey: qk.productosLow(params),
    queryFn: () => inventarioService.getProductosLowStock(params),
    select: withPagination,
    ...defaultQueryOpts,
    ...options,
  });
}

// Movimiento rápido de stock por producto (PATCH /productos/:id/stock)
export function usePatchProductoStock(productId, options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => inventarioService.patchProductoStock(productId, body),
    // Optimistic update (ligero): solo ajusta cache del producto si está en caché
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: qk.producto(productId) });
      const previous = qc.getQueryData(qk.producto(productId));
      if (previous) {
        const { movimiento_tipo, cantidad } = variables || {};
        let stock = previous.stock ?? 0;
        if (movimiento_tipo === "IN") stock += cantidad;
        if (movimiento_tipo === "OUT") stock -= cantidad;
        if (movimiento_tipo === "ADJ") stock = cantidad;
        qc.setQueryData(qk.producto(productId), { ...previous, stock });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(qk.producto(productId), ctx.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.producto(productId) });
      qc.invalidateQueries({ queryKey: qk.productos({}) });
      qc.invalidateQueries({ queryKey: qk.movimientos({}) });
      qc.invalidateQueries({ queryKey: qk.productosLow({}) });
    },
    ...options,
  });
}

// ---------------------
// Movimientos
// ---------------------
export function useMovimientos(params = {}, options = {}) {
  return useQuery({
    queryKey: qk.movimientos(params),
    queryFn: () => inventarioService.getMovimientos(params),
    select: withPagination,
    ...defaultQueryOpts,
    ...options,
  });
}

export function useMovimiento(id, options = {}) {
  return useQuery({
    queryKey: qk.movimiento(id),
    queryFn: () => inventarioService.getMovimiento(id),
    enabled: !!id,
    ...defaultQueryOpts,
    ...options,
  });
}

export function useCreateMovimiento(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["inventario", "movimiento", "create"],
    mutationFn: inventarioService.createMovimiento,
    onMutate: async (vars) => {
      const prodId = vars?.producto;
      if (!prodId) return;

      await qc.cancelQueries({ queryKey: ["inventario", "producto", prodId] });
      const previous = qc.getQueryData(["inventario", "producto", prodId]);

      if (previous) {
        let nextStock = previous.stock ?? 0;
        const qty = Number(vars.cantidad) || 0;
        if (vars.movimiento_tipo === "IN") nextStock += qty;
        if (vars.movimiento_tipo === "OUT") nextStock -= qty;
        if (vars.movimiento_tipo === "ADJ") nextStock = qty;
        qc.setQueryData(["inventario", "producto", prodId], {
          ...previous,
          stock: nextStock,
        });
      }
      return { previous };
    },
    onError: (_err, vars, ctx) => {
      const prodId = vars?.producto;
      if (ctx?.previous && prodId) {
        qc.setQueryData(["inventario", "producto", prodId], ctx.previous);
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: qk.movimientos({}) });
      if (variables?.producto) {
        qc.invalidateQueries({ queryKey: qk.producto(variables.producto) });
        qc.invalidateQueries({ queryKey: qk.productos({}) });
        qc.invalidateQueries({ queryKey: qk.productosLow({}) });
      }
    },
    ...options,
  });
}
