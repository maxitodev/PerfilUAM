"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion"; // Import motion

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Trigger animations

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
      opacity: Math.random() * 0.5 + 0.5, // This is the original opacity, not directly used for fillStyle now
      baseOpacity: Math.random() * 0.3 + 0.2, // Base opacity for pulsing
      pulseSpeed: Math.random() * 0.02 + 0.005, // Individual pulse speed
      pulseOffset: Math.random() * Math.PI * 2, // Random start for pulse
    }));

    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      // Removed: ctx.fillStyle = "black"; 
      // Removed: ctx.fillRect(0, 0, width, height);
      frame++;

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        // Pulsating opacity
        const currentPulseOpacity = p.baseOpacity + (Math.sin(frame * p.pulseSpeed + p.pulseOffset) * p.baseOpacity * 0.8);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, currentPulseOpacity))})`; 
        ctx.shadowColor = "rgba(255,255,255,0.3)"; // Brighter shadow for white particles on black
        ctx.shadowBlur = 8; // Slightly increased blur
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
      // Re-initialize particle positions if needed, or adjust existing ones
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

  // Animation Variants
  const logoVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut", delay: 0.1 }, 
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 }, // Only controls the container's initial opacity if needed
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Stagger direct children of this container
        delayChildren: 0.3, 
      },
    },
  };

  const estudiantesTextVariants = { 
    hidden: { opacity: 0, y: 20, scale: 0.98 }, 
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "circOut" }, 
    },
    shimmer: {
      backgroundPosition: ["200% center", "-200% center"],
      transition: {
        duration: 3.0,
        repeat: Infinity,
        ease: "linear",
      }
    },
    glow: {
      textShadow: [
        '4px 4px 12px rgba(0,0,0,0.8), 2px 2px 6px rgba(0,0,0,0.6), 0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)',
        '4px 4px 12px rgba(0,0,0,0.8), 2px 2px 6px rgba(0,0,0,0.6), 0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.2)',
        '4px 4px 12px rgba(0,0,0,0.8), 2px 2px 6px rgba(0,0,0,0.6), 0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)'
      ],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  const itemVariants = { // This will be used by P, and the divisions container
    hidden: { opacity: 0, y: 20, scale: 0.98 }, 
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "circOut" }, 
    },
  };

  const uamTextVariants = { // Kept separate for the pulse effect, but entry is similar to itemVariants
    hidden: { opacity: 0, y: 20, scale: 0.98 }, 
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "circOut" },
    },
  };
  
  const barVariants = {
    hidden: { opacity: 0, width: 0, scaleX: 0.5 }, 
    visible: {
      opacity: 1,
      width: "24rem", 
      scaleX: 1,
      transition: { duration: 0.6, ease: "circOut" }, 
    },
  };

  // divisionItemVariants will animate each division block (icon + text) as one unit.
  // The container of these three items will use itemVariants to be part of the main stagger.
  const divisionItemVariants = { 
    hidden: { opacity: 0, y: 20, scale: 0.95 }, 
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "circOut" }, 
    },
    hover: { // Optional: add hover effect
      scale: 1.05,
      transition: { duration: 0.3 }
    },
  };

  // New variant for the container of the three division columns
  // This allows the three columns themselves to be staggered
  const divisionsContainerVariants = {
    hidden: { opacity: 0 }, // Can be simple, as itemVariants on this div handles its entry
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Stagger the three division columns
      }
    }
  };


  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
        onError={(e) => console.error('Video error:', e)}
        className="fixed inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/uamcuajimalpa.mp4" type="video/mp4" />
        Tu navegador no soporta el elemento video.
      </video>
      
      {/* Modern gradient overlay to reduce brightness and add diffused bottom */}
      <div 
        className="fixed inset-0 w-full h-full"
        style={{ 
          zIndex: 1,
          background: `
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.3) 0%,
              rgba(0, 0, 0, 0.4) 40%,
              rgba(0, 0, 0, 0.6) 70%,
              rgba(0, 0, 0, 0.8) 100%
            )
          `,
          backdropFilter: 'brightness(0.7) contrast(1.1)'
        }}
      ></div>
      
      <motion.div
        className="fixed top-4 left-4 bg-white p-2 rounded-lg shadow-md"
        style={{ zIndex: 50 }}
        variants={logoVariants}
        initial="hidden"
        animate={isMounted ? "visible" : "hidden"}
      >
        <Image
          src="/logouam.webp"
          alt="UAM Logo"
          width={150}
          height={75}
          className="w-16 h-8 sm:w-20 sm:h-10 md:w-24 md:h-12 lg:w-[150px] lg:h-[75px]"
        />
      </motion.div>
      
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 4 }}
      />

      {/* Centered Text Content */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center pointer-events-none px-4"
        style={{ zIndex: 10 }}
        variants={containerVariants}
        initial="hidden"
        animate={isMounted ? "visible" : "hidden"}
      >
        <motion.h1
          className="text-white font-display font-black tracking-widest mb-2 sm:mb-4 lg:mb-6 leading-tight max-w-[95vw] whitespace-nowrap overflow-x-auto"
          // Responsive text size: clamp between 2rem and 10vw, up to 10rem
          style={{ 
            fontSize: 'clamp(2rem, 10vw, 10rem)',
            background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            wordBreak: 'normal',
            width: '100%',
          }}
          variants={estudiantesTextVariants} 
          animate={isMounted ? ["visible", "shimmer", "glow"] : "hidden"}
        >
          PERFILUAM
        </motion.h1>
        <motion.h2
          className="text-orange-500 text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-heading font-bold mb-2 sm:mb-3 lg:mb-4"
          variants={uamTextVariants} 
          animate={isMounted ? "visible" : "hidden"}
          style={{
            textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
          }}
        >
          UNIDAD CUAJIMALPA
        </motion.h2>
        <motion.div
          className="bg-orange-500 h-1 sm:h-1.5 md:h-2 rounded-full w-24 sm:w-40 md:w-56 lg:w-80 xl:w-[24rem] mb-4 sm:mb-6"
          variants={barVariants} 
          animate={isMounted ? "visible" : "hidden"}
          style={{ transformOrigin: "center" }}
        ></motion.div>

        <motion.p
          className="text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mt-4 sm:mt-6 lg:mt-10 font-body font-medium px-2"
          style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}
          variants={itemVariants} 
        >
          Conoce el talento de las tres divisiones académicas:
        </motion.p>
        
        <motion.div 
          className="mt-4 sm:mt-6 flex flex-col md:flex-row justify-around w-full max-w-xs sm:max-w-sm md:max-w-3xl lg:max-w-5xl px-2 sm:px-4 gap-4 md:gap-2"
          variants={divisionsContainerVariants}
        >
          <motion.div
            className="flex flex-col items-center text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-center px-2 font-body"
            variants={divisionItemVariants}
            whileHover="hover" 
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}
          >
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1 sm:mb-2 text-orange-500" >🔬</span>
            Ciencias Naturales e Ingeniería
          </motion.div>
          <motion.div
            className="flex flex-col items-center text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-center px-2 font-body"
            variants={divisionItemVariants} 
            whileHover="hover"
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}
          >
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1 sm:mb-2 text-orange-500" >🎨</span>
            Comunicación y Diseño
          </motion.div>
          <motion.div
            className="flex flex-col items-center text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-center px-2 font-body"
            variants={divisionItemVariants} 
            whileHover="hover"
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}
          >
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1 sm:mb-2 text-orange-500" >🌍</span>
            Ciencias Sociales y Humanidades
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
