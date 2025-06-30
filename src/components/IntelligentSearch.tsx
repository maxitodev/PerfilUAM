"use client";
import { useState } from 'react';

interface StudentProfile {
  _id: string;
  user: {
    name: string;
    email: string;
    matricula: string;
    carrera: string;
    imageBase64?: string;
  };
  division: string;
  trimestre: string;
  location: string;
  linkedin?: string;
  github?: string;
  bio: string;
  skills: string[];
  cvLink?: string;
  tesinaLink?: string;
  completionPercentage: number;
  projects: Array<{
    _id: string;
    name: string;
    description: string;
    technologies: string[];
    type: string;
    status: string;
    featured: boolean;
  }>;
}

interface SearchInsights {
  query: string;
  matchedSkills: string[];
  matchedProjects: string[];
  confidenceScore: number;
  suggestions: string[];
}

interface IntelligentSearchProps {
  profiles: StudentProfile[];
  onResults: (filteredProfiles: StudentProfile[], searchInsights: SearchInsights, reasoning: string) => void;
}

export default function IntelligentSearch({ profiles, onResults }: IntelligentSearchProps) {
  // Estado para búsqueda tradicional
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para búsqueda avanzada IA
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [iaQuery, setIaQuery] = useState('');
  const [isSearchingIA, setIsSearchingIA] = useState(false);

  // Búsqueda tradicional (sin IA)
  const handleTraditionalSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      onResults(profiles, {
        query: '',
        matchedSkills: [],
        matchedProjects: [],
        confidenceScore: 1,
        suggestions: []
      }, "Mostrando todos los perfiles");
      return;
    }

    const normalizeString = (str: string) => str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

    const filtered = profiles.filter(p => {
      const normalizedName = normalizeString(p.user.name);
      const normalizedBio = normalizeString(p.bio);
      const normalizedSkills = p.skills.map(skill => normalizeString(skill));
      const normalizedProjects = p.projects.map(project => ({
        name: normalizeString(project.name),
        technologies: project.technologies.map(tech => normalizeString(tech))
      }));

      return (
        normalizedName.includes(term) ||
        normalizedBio.includes(term) ||
        normalizedSkills.some(skill => skill.includes(term)) ||
        normalizedProjects.some(project =>
          project.name.includes(term) ||
          project.technologies.some(tech => tech.includes(term))
        )
      );
    });

    onResults(filtered, {
      query: term,
      matchedSkills: [],
      matchedProjects: [],
      confidenceScore: 0.7,
      suggestions: []
    }, "Búsqueda tradicional por coincidencia de palabras clave");
  };

  // Búsqueda avanzada con IA
  const handleIntelligentSearch = async () => {
    if (!iaQuery.trim()) return;
    setIsSearchingIA(true);
    try {
      const response = await fetch('/api/intelligent-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: iaQuery,
          profiles: profiles.map(p => ({
            id: p._id,
            name: p.user.name,
            career: p.user.carrera,
            skills: p.skills,
            bio: p.bio,
            projects: p.projects.map(proj => ({
              name: proj.name,
              description: proj.description,
              technologies: proj.technologies,
              type: proj.type
            }))
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Filtrar perfiles basado en los IDs recomendados
      const recommendedProfiles = profiles.filter(p =>
        result.recommendedIds.includes(p._id)
      );

      onResults(recommendedProfiles, result.insights, result.reasoning);
    } catch (error) {
      console.error('Error en búsqueda inteligente:', error);

      // Búsqueda de respaldo simple
      const fallbackResults = profiles.filter(p =>
        p.user.name.toLowerCase().includes(iaQuery.toLowerCase()) ||
        p.bio.toLowerCase().includes(iaQuery.toLowerCase()) ||
        p.skills.some(skill => skill.toLowerCase().includes(iaQuery.toLowerCase()))
      );

      onResults(fallbackResults, {
        query: iaQuery,
        matchedSkills: [],
        matchedProjects: [],
        confidenceScore: 0.5,
        suggestions: ["Búsqueda básica aplicada (IA no disponible)"]
      }, "Búsqueda básica por falta de conectividad con IA");
    } finally {
      setIsSearchingIA(false);
    }
  };

  // Enter para búsqueda tradicional
  const handleTraditionalKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTraditionalSearch();
    }
  };

  // Enter para búsqueda IA
  const handleIAKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleIntelligentSearch();
    }
  };

  return (
    <div className="relative">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-purple-50 rounded-2xl sm:rounded-3xl transform -rotate-1 scale-105 opacity-60"></div>
      
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-100 p-4 sm:p-8 mb-6 sm:mb-8 backdrop-blur-sm">
        {/* Header con gradiente */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Sistema de búsqueda inteligente
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Encuentra el <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">talento perfecto</span>
          </h3>
          <p className="text-sm sm:text-base text-gray-600 px-2">Usa búsqueda tradicional o IA avanzada para encontrar estudiantes del DMAS</p>
        </div>

        {/* Búsqueda tradicional mejorada */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-2 sm:mr-3">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <label className="text-base sm:text-lg font-bold text-gray-900 flex-1">
              Búsqueda rápida
            </label>
            <div className="ml-auto">
              <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Tradicional
              </span>
            </div>
          </div>
          
          <div className="relative group">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={handleTraditionalKeyPress}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-lg text-sm sm:text-lg"
                placeholder="Ej: Nombre, habilidades, Python, machine learning..."
              />
              <button
                onClick={handleTraditionalSearch}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                type="button"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Separador con estilo */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium">o usa búsqueda avanzada</span>
          </div>
        </div>

        {/* Botón para búsqueda avanzada mejorado */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className={`w-full flex items-center justify-between p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
              showAdvanced 
                ? 'bg-gradient-to-r from-orange-50 to-purple-50 border-orange-300 shadow-lg' 
                : 'bg-gray-50 border-gray-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 hover:border-orange-200'
            }`}
            type="button"
          >
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-sm sm:text-lg font-bold text-gray-900 truncate">Búsqueda inteligente con IA</h4>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Describe tu proyecto ideal en lenguaje natural</p>
              </div>
            </div>
            <div className="flex items-center flex-shrink-0 ml-2">
              <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full text-xs font-semibold mr-2 sm:mr-3">
                IA
              </span>
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Búsqueda avanzada con IA mejorada */}
        {showAdvanced && (
          <div className="mb-4 sm:mb-6 transform transition-all duration-500 ease-out">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 via-white to-purple-50 rounded-xl sm:rounded-2xl border-2 border-orange-200 shadow-lg">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full mr-2 sm:mr-3">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <label className="text-base sm:text-lg font-bold text-gray-900">
                  Describe tu búsqueda ideal
                </label>
              </div>
              
              <textarea
                value={iaQuery}
                onChange={e => setIaQuery(e.target.value)}
                onKeyPress={handleIAKeyPress}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-orange-200 rounded-xl sm:rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none shadow-sm text-sm sm:text-base"
                rows={3}
                placeholder="Ej: Busco un estudiante de Ingeniería en Computación con experiencia en React y Node.js para desarrollar una aplicación web..."
              />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 gap-3 sm:gap-0">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-gray-600">IA lista para analizar</span>
                </div>
                
                <button
                  onClick={handleIntelligentSearch}
                  disabled={!iaQuery.trim() || isSearchingIA}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                  type="button"
                >
                  {isSearchingIA ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">Analizando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm sm:text-base">Buscar con IA</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Ejemplos mejorados y específicos para DMAS */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-orange-200">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Ejemplos de búsqueda para proyectos DMAS:
                </p>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {/*
                    Aquí puedes agregar ejemplos específicos para la búsqueda de proyectos DMAS
                  */}
                  {[
                    {
                      text: "Desarrollador full-stack para app de análisis financiero",
                      icon: "💰",
                      tags: ["React", "Python", "Finanzas"]
                    },
                    {
                      text: "Estudiante de MA con R y machine learning para investigación",
                      icon: "📊",
                      tags: ["R", "ML", "Estadística"]
                    },
                    {
                      text: "Programador Java con Spring Boot para sistema empresarial",
                      icon: "🏢",
                      tags: ["Java", "Spring", "Backend"]
                    },
                    {
                      text: "Especialista en ciencia de datos con Python y visualización",
                      icon: "📈",
                      tags: ["Python", "Tableau", "Analytics"]
                    }
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setIaQuery(example.text)}
                      className="group p-3 sm:p-4 bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 rounded-lg sm:rounded-xl border border-gray-200 hover:border-orange-300 transition-all duration-300 text-left transform hover:scale-105"
                      type="button"
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <span className="text-lg sm:text-2xl flex-shrink-0">{example.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-800 font-medium mb-2 group-hover:text-gray-900 leading-tight">
                            {example.text}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {example.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-gray-100 group-hover:bg-orange-100 text-gray-600 group-hover:text-orange-700 rounded text-xs font-medium transition-colors duration-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer informativo */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 pt-4 sm:pt-6 border-t border-gray-100">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full mr-2"></div>
            <span>Sistema activo</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>IA optimizada para DMAS</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Resultados en tiempo real</span>
          </div>
        </div>
      </div>
    </div>
  );
}