import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes, FaUser, FaUserPlus, FaChevronRight } from 'react-icons/fa';

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Cerrar menú con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Hamburger Icon - Moderno y llamativo */}
      <button
        onClick={toggleMenu}
        className={`relative w-12 h-12 rounded-2xl backdrop-blur-md transition-all duration-300 ease-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-orange-500/30 group ${
          isOpen 
            ? 'bg-white/95 shadow-2xl rotate-180' 
            : 'bg-white/10 hover:bg-white/20 shadow-lg hover:shadow-xl'
        }`}
        aria-label="Toggle menu"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center justify-center w-full h-full">
          {isOpen ? (
            <FaTimes className="text-gray-800 text-xl transition-all duration-300" />
          ) : (
            <FaBars className="text-white text-xl transition-all duration-300 group-hover:text-orange-100" />
          )}
        </div>
      </button>

      {/* Menu Overlay con animación mejorada */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={toggleMenu}
        ></div>
      )}

      {/* Menu Content - Diseño moderno y profesional */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-all duration-500 ease-out z-50 border-l border-gray-200/50`}
      >
        {/* Header del menú */}
        <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-6 shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-1">Bienvenido</h2>
            <p className="text-orange-100 text-sm">Accede a tu cuenta</p>
          </div>
          {/* Elemento decorativo */}
          <div className="absolute -bottom-3 left-6 w-16 h-1 bg-white/30 rounded-full"></div>
        </div>

        {/* Contenido del menú */}
        <div className="p-8 space-y-6">
          {/* Opciones de autenticación */}
          <div className="space-y-4">
            <Link href="/login" legacyBehavior>
              <a 
                className="group flex items-center justify-between p-4 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 hover:border-orange-200"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaUser className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      Iniciar sesión
                    </h3>
                    <p className="text-sm text-gray-500">Accede a tu perfil</p>
                  </div>
                </div>
                <FaChevronRight className="text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" />
              </a>
            </Link>

            <Link href="/register" legacyBehavior>
              <a 
                className="group flex items-center justify-between p-4 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 hover:border-orange-200"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                    <FaUserPlus className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      Registrarse
                    </h3>
                    <p className="text-sm text-gray-500">Crea tu cuenta</p>
                  </div>
                </div>
                <FaChevronRight className="text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" />
              </a>
            </Link>
          </div>

          {/* Información adicional */}
          <div className="pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">¿Nuevo aquí?</h4>
              <p className="text-sm text-orange-600 leading-relaxed">
                Únete a nuestra comunidad de estudiantes y descubre oportunidades únicas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer del menú */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2025 UAM Cuajimalpa - Perfil UAM
          </p>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
