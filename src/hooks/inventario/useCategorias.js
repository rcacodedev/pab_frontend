import React, { useState } from "react";
import { fetchCategorias } from "../../services/inventarioService";

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [expanded, setExpanded] = useState({});

  const loadCategorias = async () => {
    const data = await fetchCategorias();
    setCategorias(data);
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return { categorias, expanded, loadCategorias, toggleExpand, setCategorias };
};
