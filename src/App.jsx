import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/general/Navbar";
import Inventario from "./pages/inventario/Inventario";
import Login from "./pages/accounts/Login";
import Register from "./pages/accounts/Register";

/**
 * Componente que protege rutas, redirigiendo al login si no hay access_token
 */
const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("access_token");
  return token ? element : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/logout"]; // rutas donde no queremos navbar
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route
            path="/inventario"
            element={<PrivateRoute element={<Inventario />} />}
          />

          {/* Ruta raíz redirige al inventario si logueado, sino a login */}
          <Route
            path="/"
            element={
              localStorage.getItem("access_token") ? (
                <Navigate to="/inventario" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </AppLayout>

      {/* Contenedor global de notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;
