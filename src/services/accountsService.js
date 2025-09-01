// services/accountsService.js
import api from "./api";

/**
 * Registro de usuario
 * @param {FormData} data - Puede incluir profile_image
 * @returns {Promise} Respuesta del backend
 */
export const registerUser = (data) => {
  // Si envías archivos (imagen), asegurarte de usar FormData y multipart/form-data
  return api.post("/accounts/register/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Login de usuario
 * @param {Object} credentials - { email, password }
 * @returns {Promise} Respuesta del backend
 */
export const loginUser = (credentials) => {
  return api.post("/accounts/login/", credentials);
};

/**
 * Refrescar token (opcional)
 * @param {string} refreshToken
 */
export const refreshToken = (refreshToken) => {
  return api.post("/accounts/token/refresh/", { refresh: refreshToken });
};

/**
 * Obtener datos del usuario logueado
 * @returns {Promise} Datos del usuario
 */
export const getUser = () => {
  return api.get("/accounts/protected/");
};

/**
 * Logout: limpiar tokens del localStorage
 */
export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
