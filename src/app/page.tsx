"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
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
          filter: 'brightness(0.7) blur(1.5px) saturate(1.1)'
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
      <div className="fixed top-6 left-1/2 md:left-8 md:top-8 -translate-x-1/2 md:translate-x-0 p-0 z-50">
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
            width={320}
            height={160}
            className="w-52 h-28 sm:w-64 sm:h-32 md:w-36 md:h-20 lg:w-44 lg:h-24 xl:w-56 xl:h-28 object-contain"
            priority
          />
        </div>
      </div>

      {/* Centered Text Content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center px-4" style={{ zIndex: 10 }}>
        <h1
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
          className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 h-1.5 rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300"
          style={{
            width: 'clamp(80px, 14vw, 160px)',
            marginBottom: 'clamp(1.2rem, 3vw, 2rem)'
          }}
        ></div>
        <p
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
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group z-20"
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

      {/* Custom animations */}
      <style jsx>{`
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
        
        .scroll-indicator {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
