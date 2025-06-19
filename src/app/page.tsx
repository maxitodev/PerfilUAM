"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IntelligentSearch from "@/components/IntelligentSearch";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Interfaces para los perfiles
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

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<StudentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [profilesPerPage] = useState(12); // 12 perfiles por página
  
  // Calculate currentProfiles here, before any useEffects that depend on it
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const startIndex = (currentPage - 1) * profilesPerPage;
  const endIndex = startIndex + profilesPerPage;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);
  
  // Refs for GSAP animations
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLHeadingElement>(null);
  const heroDividerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLParagraphElement>(null);
  const profilesSectionRef = useRef<HTMLElement>(null);
  const profilesHeaderRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const profilesGridRef = useRef<HTMLDivElement>(null);
  const profileCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Hero section entrance animation
  useEffect(() => {
    // Only animate if all refs are available
    if (
      !heroTitleRef.current ||
      !heroSubtitleRef.current ||
      !heroDividerRef.current ||
      !heroTextRef.current
    ) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      heroTitleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2 }
    )
    .fromTo(
      heroSubtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1 },
      "-=0.8"
    )
    .fromTo(
      heroDividerRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8 },
      "-=0.6"
    )
    .fromTo(
      heroTextRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    );
  }, []);

  // Profiles section entrance animations with ScrollTrigger
  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;

    // Header and search bar animations (mantener)
    if (profilesHeaderRef.current && profilesSectionRef.current) {
      gsap.fromTo(
        profilesHeaderRef.current,
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          scrollTrigger: {
            trigger: profilesSectionRef.current,
            start: "top 80%",
          }
        }
      );
    }

    if (searchBarRef.current && profilesSectionRef.current) {
      gsap.fromTo(
        searchBarRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.8,
          delay: 0.2,
          scrollTrigger: {
            trigger: profilesSectionRef.current,
            start: "top 75%",
          }
        }
      );
    }

    // Quitar animaciones de perfiles (cards)
    if (
      profilesGridRef.current &&
      profileCardsRef.current.length > 0 &&
      profileCardsRef.current.every(Boolean) &&
      !loading
    ) {
      // Forzar visibilidad sin animación
      gsap.set(profilesGridRef.current, { opacity: 1, y: 0 });
      gsap.set(profileCardsRef.current, { opacity: 1, y: 0, scale: 1 });
    }
  }, [loading, currentProfiles]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const PARTICLE_COUNT = 120;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.5,
      baseOpacity: Math.random() * 0.3 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      frame++;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        const currentPulseOpacity = p.baseOpacity + (Math.sin(frame * p.pulseSpeed + p.pulseOffset) * p.baseOpacity * 0.8);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, currentPulseOpacity))})`;
        ctx.shadowColor = "rgba(255,255,255,0.4)";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.closePath();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x - p.r < 0 || p.x + p.r > width) p.dx *= -1;
        if (p.y - p.r < 0 || p.y + p.r > height) p.dy *= -1;
      }
      animationId = requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
      particles.forEach(p => {
        p.x = Math.random() * width;
        p.y = Math.random() * height;
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Function to animate profile cards when filtering/changing page
  // Eliminar animación, solo forzar visibilidad
  useEffect(() => {
    if (
      profilesGridRef.current &&
      profileCardsRef.current.length > 0 &&
      profileCardsRef.current.every(Boolean) &&
      !loading
    ) {
      gsap.set(profilesGridRef.current, { opacity: 1, y: 0 });
      gsap.set(profileCardsRef.current, { opacity: 1, y: 0, scale: 1 });
    }
  }, [filteredProfiles, currentPage, loading, searchTerm, selectedCarrera]);

  // Modal animation
  useEffect(() => {
    if (showProfileModal && modalRef.current) {
      // Animate modal entrance
      gsap.fromTo(
        modalRef.current,
        { 
          opacity: 0,
          scale: 0.9,
        },
        { 
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power3.out"
        }
      );
    }
  }, [showProfileModal]);

  // Función para cargar perfiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        console.log('Fetching profiles...')
        const response = await fetch('/api/students');
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response data:', data)
          console.log('Profiles received:', data.profiles?.length || 0)
          
          if (data.profiles) {
            setProfiles(data.profiles || []);
            setFilteredProfiles(data.profiles || []);
            console.log('Profiles set in state:', data.profiles.length)
          } else {
            console.log('No profiles property in response')
            setProfiles([]);
            setFilteredProfiles([]);
          }
        } else {
          const errorData = await response.text()
          console.error('Response not ok:', errorData)
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Función para filtrar perfiles
  useEffect(() => {
    let filtered = profiles;

    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        profile.projects.some(project => 
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }

    if (selectedCarrera) {
      filtered = filtered.filter(profile => profile.user.carrera === selectedCarrera);
    }

    setFilteredProfiles(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando se filtran los resultados
  }, [searchTerm, selectedCarrera, profiles]);

  // Estados para búsqueda inteligente
  const [searchInsights, setSearchInsights] = useState<any>(null);
  const [searchReasoning, setSearchReasoning] = useState<string>("");

  // Callback para resultados de búsqueda inteligente
  const handleIntelligentSearchResults = (
    filteredProfiles: StudentProfile[],
    insights: any,
    reasoning: string
  ) => {
    setFilteredProfiles(filteredProfiles);
    setCurrentPage(1);
    setSearchInsights(insights);
    setSearchReasoning(reasoning);
  };

  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(page);
    
    const profilesSection = document.getElementById('profiles-section');
    if (profilesSection) {
      profilesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Scroll to element function
  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generar números de páginas para mostrar
  const getPageNumbers = () => {
    const delta = 2; // Cuántas páginas mostrar a cada lado de la página actual
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  };

  const openProfileModal = (profile: StudentProfile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeProfileModal = () => {
    if (modalRef.current) {
      // Animate modal exit
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        onComplete: () => {
          setSelectedProfile(null);
          setShowProfileModal(false);
          document.body.style.overflow = 'unset';
        }
      });
    } else {
      setSelectedProfile(null);
      setShowProfileModal(false);
      document.body.style.overflow = 'unset';
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Sección del video hero */}
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-neutral-950">
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={(e) => console.error('Video error:', e)}
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{
            zIndex: 0,
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            filter: 'brightness(0.7) blur(1.5px) saturate(1.1)',
          }}
        >
          <source src="/uamcuajimalpa.mp4" type="video/mp4" />
        </video>

        {/* Modern gradient overlay */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            zIndex: 1,
            background: `
              linear-gradient(
                120deg,
                rgba(249,115,22,0.10) 0%,
                rgba(0,0,0,0.35) 40%,
                rgba(0,0,0,0.65) 70%,
                rgba(0,0,0,0.92) 100%
              )
            `,
            backdropFilter: 'brightness(0.95) blur(0.5px)'
          }}
        ></div>

        {/* Canvas Particles */}
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 4 }}
        />

        {/* Logo */}
        <div className="absolute top-6 left-1/2 md:left-8 md:top-8 -translate-x-1/2 md:translate-x-0 p-0 z-50">
          <div
            className="flex items-center justify-center"
            style={{
              background: "transparent",
              border: "none",
              boxShadow: "none",
              padding: 0
            }}
          >
            <Image
              src="/logouam.webp"
              alt="UAM Logo"
              width={90}
              height={45}
              className="w-24 h-12 sm:w-28 sm:h-14 md:w-20 md:h-10 lg:w-24 lg:h-12 xl:w-32 xl:h-16 object-contain"
              priority
            />
          </div>
        </div>

        {/* Centered Text Content */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center px-4" style={{ zIndex: 10 }}>
          <h1
            ref={heroTitleRef}
            className="text-white font-black tracking-wider leading-tight drop-shadow-[0_4px_32px_rgba(249,115,22,0.12)]"
            style={{
              fontSize: 'clamp(2.8rem, 10vw, 12rem)',
              fontFamily: '"Montserrat", "Inter", system-ui, sans-serif',
              fontWeight: 900,
              letterSpacing: '0.16em',
              textShadow: '0 2px 16px rgba(249,115,22,0.12), 0 0 40px rgba(255,255,255,0.08)',
              whiteSpace: 'nowrap',
              width: 'fit-content',
              maxWidth: '95vw',
              marginBottom: 'clamp(0rem, 0vw, 0rem)'
            }}
          >
            PERFIL-UAM
          </h1>
          <h2
            ref={heroSubtitleRef}
            className="text-orange-500 font-bold drop-shadow-[0_2px_16px_rgba(249,115,22,0.18)]"
            style={{
              fontSize: 'clamp(1.4rem, 5.5vw, 6rem)',
              fontFamily: '"Poppins", "Inter", system-ui, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.09em',
              textShadow: '0 4px 24px rgba(249, 115, 22, 0.22), 0 0 40px rgba(249, 115, 22, 0.12)',
              textTransform: 'uppercase',
              marginBottom: '0.7rem',
              whiteSpace: 'nowrap',
              maxWidth: '95vw'
            }}
          >
            UNIDAD CUAJIMALPA
          </h2>
          {/* Orange Bar */}
          <div
            ref={heroDividerRef}
            className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 h-1.5 rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300"
            style={{
              width: 'clamp(80px, 14vw, 160px)',
              marginBottom: 'clamp(1.2rem, 3vw, 2rem)',
              transformOrigin: 'center'
            }}
          ></div>
          <p
            ref={heroTextRef}
            className="text-gray-100 font-medium px-4 max-w-2xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]"
            style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.4rem)',
              fontFamily: '"Inter", "Roboto", system-ui, sans-serif',
              fontWeight: 500,
              letterSpacing: '0.03em',
              lineHeight: '1.6',
              marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)'
            }}
          >
            Descubre el talento del Departamento de Matemáticas Aplicadas y Sistemas
          </p>
        </div>

        {/* Scroll Down Indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group z-20"
          onClick={() => scrollToElement('profiles-section')}
        >
          <span className="text-white text-sm font-semibold mb-3 tracking-wide opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            <span className="hidden md:inline">Desliza hacia abajo</span>
            <span className="md:hidden">Desliza hacia arriba</span>
          </span>
          {/* Mouse icon for desktop */}
          <div className="hidden md:flex w-6 h-10 border-2 border-orange-400 rounded-full justify-center bg-gradient-to-b from-orange-500/20 to-transparent shadow-lg shadow-orange-500/30">
            <div className="w-1.5 h-3 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full mt-1.5 animate-pulse shadow-sm"></div>
          </div>
          {/* Mobile phone icon for mobile */}
          <div className="flex md:hidden flex-col items-center">
            <svg className="w-8 h-8 text-orange-400 drop-shadow-[0_2px_12px_rgba(249,115,22,0.18)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <rect x="6" y="2.5" width="12" height="19" rx="3" fill="none" stroke="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" className="text-orange-300"/>
              <rect x="9" y="5" width="6" height="1.5" rx="0.75" fill="currentColor" className="text-orange-300"/>
            </svg>
          </div>
          <div className="text-orange-400 group-hover:text-orange-300 transition-colors" style={{ marginTop: 'clamp(2rem, 1vw, 4rem)' }}>
            <svg
              className="w-6 h-6 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              style={{
                animation: 'bounce 2s infinite, glow 2s ease-in-out infinite alternate'
              }}
            >
              {/* Solo la flecha, sin el palito */}
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Nueva sección de perfiles */}
      <section ref={profilesSectionRef} id="profiles-section" className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 relative">
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-gray-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          {/* Header */}
          <div ref={profilesHeaderRef} className="text-center mb-12">
            <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Descubre <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Talento</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explora los perfiles de estudiantes destacados del Departamento de Matemáticas Aplicadas y Sistemas
            </p>
          </div>

          {/* Barra de búsqueda inteligente */}
          <div ref={searchBarRef} className="mb-10">
            <IntelligentSearch
              profiles={profiles}
              onResults={handleIntelligentSearchResults}
            />
          </div>

          {/* Grid de perfiles */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Cargando perfiles...</p>
              </div>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No se encontraron perfiles</h3>
              <p className="text-gray-600">Intenta con otros términos de búsqueda o filtros.</p>
            </div>
          ) : (
            <>
              {/* Grid de perfiles actuales */}
              <div ref={profilesGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentProfiles.map((profile, index) => (
                  <div
                    key={profile._id}
                    ref={(el) => {
                      profileCardsRef.current[index] = el;
                    }}
                    className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                    onClick={() => openProfileModal(profile)}
                  >
                    {/* Header con imagen */}
                    <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border-3 border-white shadow-lg">
                            {profile.user.imageBase64 ? (
                              <Image
                                src={profile.user.imageBase64}
                                alt={profile.user.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                unoptimized={true}
                              />
                            ) : (
                              <div className="w-full h-full bg-white flex items-center justify-center">
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white truncate">{profile.user.name}</h3>
                          <p className="text-orange-100 text-sm">{profile.user.carrera}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                      {/* Información de contacto */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{profile.user.email}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {profile.bio}
                      </p>

                      {/* Skills */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {profile.skills.length > 3 && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                              +{profile.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Estadísticas */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {profile.projects.length} proyectos
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {profile.location}
                        </span>
                      </div>

                      {/* Botón de acción */}
                      <button className="w-full bg-gray-900 hover:bg-orange-600 text-white font-semibold py-3 rounded-2xl transition-all duration-300 group-hover:bg-orange-600">
                        Ver perfil completo
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                  {/* Información de página */}
                  <div className="mb-4 sm:mb-0">
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium text-orange-600">{startIndex + 1}</span>
                      {' '}- {' '}
                      <span className="font-medium text-orange-600">{Math.min(endIndex, filteredProfiles.length)}</span>
                      {' '}de{' '}
                      <span className="font-medium text-orange-600">{filteredProfiles.length}</span>
                      {' '}perfiles
                    </p>
                  </div>

                  {/* Controles de paginación */}
                  <div className="flex items-center space-x-2">
                    {/* Botón anterior */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Anterior
                    </button>

                    {/* Números de página */}
                    <div className="hidden sm:flex items-center space-x-1">
                      {getPageNumbers().map((pageNumber, index) => {
                        if (pageNumber === '...') {
                          return (
                            <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        
                        const isCurrentPage = pageNumber === currentPage;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber as number)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              isCurrentPage
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'text-gray-700 bg-gray-100 hover:bg-orange-100 hover:text-orange-600'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selector de página en móvil */}
                    <div className="sm:hidden">
                      <select
                        value={currentPage}
                        onChange={(e) => goToPage(parseInt(e.target.value))}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <option key={page} value={page}>
                            {page} de {totalPages}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Botón siguiente */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Siguiente
                      <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Resumen de resultados */}
              {filteredProfiles.length > profilesPerPage && (
                <div className="text-center bg-orange-50 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{filteredProfiles.length}</div>
                      <div className="text-sm text-gray-600">Perfiles encontrados</div>
                    </div>
                    <div className="w-px h-12 bg-orange-200"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{totalPages}</div>
                      <div className="text-sm text-gray-600">Páginas totales</div>
                    </div>
                    <div className="w-px h-12 bg-orange-200"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{profilesPerPage}</div>
                      <div className="text-sm text-gray-600">Por página</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Call to action */}
<div className="text-center mt-20">
  <div className="relative bg-gradient-to-br from-white via-orange-50/30 to-white rounded-[2.5rem] shadow-2xl border border-gray-100/80 p-12 max-w-4xl mx-auto overflow-hidden backdrop-blur-sm">
    {/* Elementos decorativos de fondo */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-200/40 to-orange-300/20 rounded-full blur-xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-orange-100/30 to-orange-200/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-orange-50/40 to-transparent rounded-full blur-3xl"></div>
    </div>

    {/* Contenido principal */}
    <div className="relative z-10">
      {/* Icono destacado */}
      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-500/25 group-hover:shadow-xl transition-all duration-500">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>

      <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-orange-600 mb-6 tracking-tight leading-tight">
        ¿Eres estudiante del 
        <span className="block text-orange-600 font-black tracking-wider">DMAS?</span>
      </h3>
      
      <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
        Únete a nuestra plataforma exclusiva y 
        <span className="text-orange-600 font-semibold"> destaca tu talento </span>
        ante reclutadores y empresas de tecnología
      </p>
      

      {/* Estadísticas rápidas */}
      <div className="flex flex-wrap items-center justify-center gap-8 mb-10 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium">+{filteredProfiles.length} estudiantes activos</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Registro gratuito</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Verificación UAM</span>
        </div>
      </div>
      </div>

      {/* Botones de acción mejorados */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        <Link
          href="/register"
          className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white font-bold rounded-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl shadow-orange-500/30 hover:shadow-orange-600/40 overflow-hidden"
        >
          {/* Efecto de brillo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative flex items-center">
            <span className="text-lg tracking-wide">Crear mi Perfil</span>
            <div className="ml-3 flex items-center justify-center w-8 h-8 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300">
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
          
          {/* Partículas decorativas */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300 delay-75"></div>
        </Link>

        <Link
          href="/login"
          className="group relative inline-flex items-center px-10 py-5 bg-white border-2 border-orange-500 text-orange-600 font-bold rounded-2xl transition-all duration-500 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 hover:border-orange-600 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 overflow-hidden"
        >
          {/* Efecto de fondo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          <div className="relative flex items-center">
            <span className="text-lg tracking-wide">Ingresar a mi Perfil</span>
            <div className="ml-3 flex items-center justify-center w-8 h-8 border border-orange-500/30 rounded-full group-hover:border-orange-600/50 group-hover:bg-orange-500/10 transition-all duration-300">
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

    </div>
  </div>
</div>
      </section>

      {/* Modal de perfil detallado */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div 
            ref={modalRef} 
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-modal-scrollbar"
          >
            {/* Header del modal */}
        <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-6">
          {/* Botón X único para cerrar - bien posicionado */}
          <button
            onClick={closeProfileModal}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center z-20 border border-gray-200 shadow-lg transition-all duration-200 hover:scale-105"
            aria-label="Cerrar perfil"
          >
            <svg 
              className="w-5 h-5 text-gray-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>

          <div className="flex items-center space-x-6 pr-16">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                {selectedProfile.user.imageBase64 ? (
                  <Image
                    src={selectedProfile.user.imageBase64}
                    alt={selectedProfile.user.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized={true}
                  />
                ) : (
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-3 border-white"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{selectedProfile.user.name}</h2>
              <p className="text-orange-100 text-lg">{selectedProfile.user.carrera}</p>
              <p className="text-orange-200 text-sm">Matrícula: {selectedProfile.user.matricula}</p>
            </div>
          </div>
        </div>

            {/* Contenido del modal */}
            <div className="p-8">
              {/* Información básica */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Información académica</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium w-24">Email:</span>
                      <span className="text-gray-900 text-sm">{selectedProfile.user.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium w-24">Trimestre:</span>
                      <span className="text-gray-900">{selectedProfile.trimestre}°</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium w-24">División:</span>
                      <span className="text-gray-900 text-sm">{selectedProfile.division}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium w-24">Ubicación:</span>
                      <span className="text-gray-900">{selectedProfile.location}</span>
                    </div>
                  </div>
                </div>

                {/* Solo mostrar la sección de enlaces si hay al menos un enlace */}
                {(selectedProfile.linkedin || selectedProfile.github || selectedProfile.cvLink || selectedProfile.tesinaLink) && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Enlaces</h3>
                    <div className="space-y-3">
                      {selectedProfile.linkedin && (
                        <a
                          href={selectedProfile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </a>
                      )}
                      {selectedProfile.github && (
                        <a
                          href={selectedProfile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-900 hover:text-gray-700 transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub
                        </a>
                      )}
                      {selectedProfile.cvLink && (
                        <a
                          href={selectedProfile.cvLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-orange-600 hover:text-orange-700 transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Curriculum Vitae
                        </a>
                      )}
                      {selectedProfile.tesinaLink && (
                        <a
                          href={selectedProfile.tesinaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Tesina
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Biografía */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Acerca de mí</h3>
                <p className="text-gray-600 leading-relaxed">{selectedProfile.bio}</p>
              </div>

              {/* Habilidades */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Habilidades técnicas</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedProfile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Proyectos */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Proyectos ({selectedProfile.projects.length})
                </h3>
                {selectedProfile.projects.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay proyectos públicos disponibles</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {selectedProfile.projects.map((project) => (
                      <div key={project._id} className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-bold text-gray-900">{project.name}</h4>
                          {project.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              Destacado
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{project.type}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'Completado' ? 'bg-green-100 text-green-800' :
                            project.status === 'En Desarrollo' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'En Pausa' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos globales consolidados */}
      <style jsx global>{`
        /* Force scrollbar to always show and use our custom styling */
        html {
          overflow-y: scroll;
          --scrollbarBG: rgba(249, 115, 22, 0.05);
          --thumbBG: linear-gradient(45deg, #ff4500, #ff8c00);
        }
        
        /* Main scrollbar - with higher specificity and !important */
        html::-webkit-scrollbar,
        body::-webkit-scrollbar,
        .custom-scrollbar::-webkit-scrollbar {
          width: 16px !important;
          height: 16px !important;
          display: block !important;
        }
        
        html::-webkit-scrollbar-track,
        body::-webkit-scrollbar-track,
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--scrollbarBG) !important;
          border-radius: 10px !important;
        }
        
        html::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-thumb,
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--thumbBG) !important;
          border-radius: 8px !important;
          border: 3px solid rgba(255, 255, 255, 0.9) !important;
          background-clip: padding-box !important;
          transition: all 0.3s ease !important;
          box-shadow: inset 0 0 6px rgba(255, 69, 0, 0.3) !important;
        }
        
        html::-webkit-scrollbar-thumb:hover,
        body::-webkit-scrollbar-thumb:hover,
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #ff5722, #ff9800) !important;
          border-width: 2px !important;
        }
        
        /* Firefox scrollbar */
        html, body, .custom-scrollbar {
          scrollbar-width: thin !important;
          scrollbar-color: #ff4500 rgba(249, 115, 22, 0.05) !important;
        }
        
        /* Modal scrollbar - with !important to override any default styling */
        .custom-modal-scrollbar::-webkit-scrollbar {
          width: 10px !important;
          display: block !important;
        }
        
        .custom-modal-scrollbar::-webkit-scrollbar-track {
          background: var(--scrollbarBG) !important;
          border-radius: 8px !important;
        }
        
        .custom-modal-scrollbar::-webkit-scrollbar-thumb {
          background: var(--thumbBG) !important;
          border-radius: 6px !important;
          border: 2px solid rgba(255, 255, 255, 0.9) !important;
          background-clip: padding-box !important;
          box-shadow: inset 0 0 6px rgba(255, 69, 0, 0.3) !important;
        }

        /* Existing animations */
        @keyframes glow {
          from {
            filter: drop-shadow(0 0 5px rgba(249, 115, 22, 0.5));
          }
          to {
            filter: drop-shadow(0 0 15px rgba(249, 115, 22, 0.8));
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .scroll-indicator {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
