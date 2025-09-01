// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { logoutUser } from "../../services/accountsService"; // importa tu servicio

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logoutUser(); // Borra tokens de localStorage
    navigate("/login"); // Redirige al login
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0H7v12h4v-6h2v6h4V12h-4V5z"
          />
        </svg>
      ),
    },
    {
      name: "Inventario",
      path: "/inventario",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0h-4m0 0v4m0-4H8m8 0v4m-8-4v4m-4 4h16a2 2 0 002-2V9a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold">
            MiApp
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded hover:bg-gray-700 transition ${
                  location.pathname === item.path ? "bg-gray-700" : ""
                }`}
              >
                {item.svg}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            ))}

            {/* Botón de Logout */}
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
            >
              {isOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center p-2 rounded hover:bg-gray-700 transition ${
                location.pathname === item.path ? "bg-gray-700" : ""
              }`}
            >
              {item.svg}
              <span className="ml-2">{item.name}</span>
            </Link>
          ))}

          {/* Logout en móvil */}
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="w-full text-left bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
