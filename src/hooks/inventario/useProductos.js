import React, { useState } from "react";
import { fetchCategoriaConProductos } from "../../services/inventarioService";

export const useProductos = (categoriaId) => {
  const [productos, setProductos] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const loadProductos = async (p = 1) => {
    if (!categoriaId) return;
    const data = await fetchCategoriaConProductos(categoriaId, p);
    setProductos(data.productos);
    setTotalPages(data.total_pages || 1);
    setPage(p);
  };

  return { productos, loadProductos, page, setPage, totalPages };
};
