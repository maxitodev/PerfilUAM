import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">PerfilUAM</h3>
            <div className="w-12 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mb-4"></div>
            <p className="text-gray-300">
              Plataforma de gestión de perfiles académicos de la Universidad Autónoma Metropolitana.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Enlaces útiles</h3>
            <div className="w-12 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mb-4"></div>
            <ul className="space-y-2">
              <li><a href="https://github.com/maxitodev" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">GitHub</a></li>
              <li><a href="https://www.linkedin.com/in/maxitodev/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">LinkedIn</a></li>
              <li><a href="https://www.maxitodev.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Portafolio Web</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Contacto</h3>
            <div className="w-12 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mb-4"></div>
            <p className="text-gray-300">
              <strong>Desarrollador:</strong><br />
              Max Uriel Sánchez Díaz<br />
              <a href="mailto:contacto@maxitodev.com" className="text-gray-300 hover:text-white">contacto@maxitodev.com</a>
            </p>
            <p className="text-gray-300 mt-4">
              <strong>Supervisores del proyecto:</strong><br />
              Dra. María del Carmen Gómez Fuentes<br />
              Dr. Jorge Cervantes Ojeda<br />
              DMAS - Ingeniería en Computación<br />
              Universidad Autónoma Metropolitana
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 PerfilUAM. Todos los derechos reservados.
          </p>
          <p className="text-xs mt-2 text-gray-400">
            Idea original: Max Uriel Sánchez Díaz
          </p>
        </div>
      </div>
    </footer>
  );
}
