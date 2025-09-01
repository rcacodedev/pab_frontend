// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { registerUser } from "../../services/accountsService";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    password2: "",
    nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    direccion: "",
    dni: "",
    ciudad: "",
    pais: "",
    provincia: "",
    codigo_postal: "",
    phone: "",
    accept_terms: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validación en tiempo real
  useEffect(() => {
    const newErrors = {};
    if (touched.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email inválido";
    }
    if (touched.password && form.password.length < 6) {
      newErrors.password = "Debe tener al menos 6 caracteres";
    }
    if (touched.password2 && form.password2 !== form.password) {
      newErrors.password2 = "Las contraseñas no coinciden";
    }
    if (touched.nombre && form.nombre.trim() === "") {
      newErrors.nombre = "Obligatorio";
    }
    if (touched.primer_apellido && form.primer_apellido.trim() === "") {
      newErrors.primer_apellido = "Obligatorio";
    }
    if (touched.dni && !/^[0-9A-Za-z]{5,20}$/.test(form.dni)) {
      newErrors.dni = "DNI inválido";
    }
    if (touched.codigo_postal && !/^\d{4,10}$/.test(form.codigo_postal)) {
      newErrors.codigo_postal = "Código postal inválido";
    }
    if (touched.phone && !/^\+?\d{7,15}$/.test(form.phone)) {
      newErrors.phone = "Teléfono inválido";
    }
    setErrors(newErrors);
  }, [form, touched]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marcar todos como tocados para validar todo
    const allTouched = {};
    Object.keys(form).forEach((key) => (allTouched[key] = true));
    setTouched(allTouched);

    if (Object.keys(errors).length > 0) {
      toast.error("Corrige los errores antes de enviar");
      return;
    }

    try {
      const response = await registerUser(form);
      toast.success("Registro exitoso!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Error en el registro");
    }
  };

  const getInputClass = (name) => {
    if (!touched[name]) return "border-gray-300";
    return errors[name] ? "border-red-500" : "border-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Registro
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border ${getInputClass(
                "email"
              )} rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.email ? "focus:ring-red-500" : "focus:ring-green-500"
              }`}
              placeholder="tuemail@ejemplo.com"
              required
            />
            <p className="text-sm text-gray-500">
              Ejemplo: usuario@dominio.com
            </p>
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border ${getInputClass(
                "password"
              )} rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.password ? "focus:ring-red-500" : "focus:ring-green-500"
              }`}
              placeholder="Mínimo 6 caracteres"
              required
            />
            <p className="text-sm text-gray-500">Mínimo 6 caracteres</p>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              name="password2"
              value={form.password2}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border ${getInputClass(
                "password2"
              )} rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.password2 ? "focus:ring-red-500" : "focus:ring-green-500"
              }`}
              placeholder="Repite la contraseña"
              required
            />
            {errors.password2 && (
              <p className="text-red-500 text-sm">{errors.password2}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border ${getInputClass(
                "nombre"
              )} rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.nombre ? "focus:ring-red-500" : "focus:ring-green-500"
              }`}
            />
            <p className="text-sm text-gray-500">Tu nombre completo</p>
            {errors.nombre && (
              <p className="text-red-500 text-sm">{errors.nombre}</p>
            )}
          </div>

          {/* Primer Apellido */}
          <div>
            <label className="block text-gray-700 mb-1">Primer Apellido</label>
            <input
              type="text"
              name="primer_apellido"
              value={form.primer_apellido}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border ${getInputClass(
                "primer_apellido"
              )} rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.primer_apellido
                  ? "focus:ring-red-500"
                  : "focus:ring-green-500"
              }`}
            />
            <p className="text-sm text-gray-500">Primer apellido</p>
            {errors.primer_apellido && (
              <p className="text-red-500 text-sm">{errors.primer_apellido}</p>
            )}
          </div>

          {/* Segundo Apellido */}
          <div>
            <label className="block text-gray-700 mb-1">Segundo Apellido</label>
            <input
              type="text"
              name="segundo_apellido"
              value={form.segundo_apellido}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-sm text-gray-500">Segundo apellido (opcional)</p>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-gray-700 mb-1">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Calle, número, piso..."
            />
          </div>

          {/* DNI */}
          <div>
            <label className="block text-gray-700 mb-1">DNI / NIE</label>
            <input
              type="text"
              name="dni"
              value={form.dni}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border ${getInputClass(
                "dni"
              )} rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.dni ? "focus:ring-red-500" : "focus:ring-green-500"
              }`}
              placeholder="12345678A"
            />
            {errors.dni && <p className="text-red-500 text-sm">{errors.dni}</p>}
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-gray-700 mb-1">Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* País */}
          <div>
            <label className="block text-gray-700 mb-1">País</label>
            <input
              type="text"
              name="pais"
              value={form.pais}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Provincia */}
          <div>
            <label className="block text-gray-700 mb-1">Provincia</label>
            <input
              type="text"
              name="provincia"
              value={form.provincia}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Código Postal */}
          <div>
            <label className="block text-gray-700 mb-1">Código Postal</label>
            <input
              type="text"
              name="codigo_postal"
              value={form.codigo_postal}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border ${getInputClass(
                "codigo_postal"
              )} rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.codigo_postal
                  ? "focus:ring-red-500"
                  : "focus:ring-green-500"
              }`}
              placeholder="08001"
            />
            {errors.codigo_postal && (
              <p className="text-red-500 text-sm">{errors.codigo_postal}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-gray-700 mb-1">Teléfono</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border ${getInputClass(
                "phone"
              )} rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.phone ? "focus:ring-red-500" : "focus:ring-green-500"
              }`}
              placeholder="+34123456789"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Términos */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="accept_terms"
              checked={form.accept_terms}
              onChange={handleChange}
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-gray-700 text-sm">
              Acepto los{" "}
              <a
                href="/terms.pdf"
                target="_blank"
                className="text-blue-600 underline"
              >
                términos y condiciones
              </a>{" "}
              y la{" "}
              <a
                href="/privacy.pdf"
                target="_blank"
                className="text-blue-600 underline"
              >
                política de privacidad
              </a>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            Registrarse
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-semibold"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
