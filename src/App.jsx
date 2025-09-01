import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Inventario from "./pages/inventario/Inventario";

function App() {
  return (
    <>
      <Routes>
        <Route path="/inventario/" element={<Inventario />} />
      </Routes>

      {/* Contenedor global de notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={3000} // tiempo en ms
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // también "light" o "dark"
      />
    </>
  );
}

export default App;
