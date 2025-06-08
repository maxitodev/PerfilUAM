'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    imageBase64: '',
    matricula: '',
    carrera: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, imageBase64: base64String });
        setImagePreview(base64String);
        setError('');
      };
      reader.onerror = () => {
        setError('Error al leer la imagen');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido.');
      return false;
    }
    if (!formData.matricula.trim()) {
      setError('La matrícula es requerida.');
      return false;
    }
    if (!/^\d{10}$/.test(formData.matricula)) {
      setError('La matrícula debe tener exactamente 10 dígitos.');
      return false;
    }
    if (!formData.carrera) {
      setError('Debes seleccionar tu carrera.');
      return false;
    }
    if (!formData.password) {
      setError('La contraseña es requerida.');
      return false;
    }
    if (!formData.confirmPassword) {
      setError('Debes confirmar tu contraseña.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido.');
      return false;
    }
    // Validar correo institucional UAM
    if (!formData.email.includes('@cua.uam.mx')) {
      setError('Debes usar tu correo institucional de la UAM (@cua.uam.mx).');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          imageBase64: formData.imageBase64,
          matricula: formData.matricula.trim(),
          carrera: formData.carrera
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Error al registrar usuario.');
        return;
      }
      
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
      
    } catch {
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 relative overflow-hidden">
      {/* Dynamic Background Layers */}
      
      {/* Animated Wave Background */}
      <div className="absolute inset-0 z-0">
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgba(251, 146, 60, 0.1)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(251, 146, 60, 0.05)', stopOpacity:0}} />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'rgba(249, 115, 22, 0.08)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'rgba(249, 115, 22, 0.02)', stopOpacity:0}} />
            </linearGradient>
          </defs>
          
          <path
            d="M0,400 C240,450 480,350 720,400 C960,450 1200,350 1440,400 L1440,800 L0,800 Z"
            fill="url(#wave-gradient-1)"
            className="animate-wave-slow"
          />
          <path
            d="M0,500 C240,550 480,450 720,500 C960,550 1200,450 1440,500 L1440,800 L0,800 Z"
            fill="url(#wave-gradient-2)"
            className="animate-wave-medium"
          />
        </svg>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={`geo-${i}`}
            className="absolute animate-float-geometric opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${20 + Math.random() * 15}s`
            }}
          >
            {i % 3 === 0 ? (
              <div className="w-8 h-8 bg-orange-400 rounded-full" />
            ) : i % 3 === 1 ? (
              <div className="w-6 h-6 bg-orange-500 transform rotate-45" />
            ) : (
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-orange-300" />
            )}
          </div>
        ))}
      </div>

      {/* Interactive Particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute animate-particle opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${25 + Math.random() * 20}s`
            }}
          >
            <div className={`w-1 h-1 rounded-full ${
              Math.random() > 0.7 ? 'bg-orange-400' : 
              Math.random() > 0.4 ? 'bg-orange-300' : 'bg-gray-300'
            }`} />
          </div>
        ))}
      </div>

      {/* Gradient Orbs with Movement */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-radial from-orange-200/30 via-orange-100/20 to-transparent rounded-full blur-3xl animate-blob-1" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-radial from-orange-300/25 via-orange-200/15 to-transparent rounded-full blur-3xl animate-blob-2" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-orange-100/20 via-gray-100/10 to-transparent rounded-full blur-2xl animate-blob-3" />

      {/* Flowing Lines */}
      <div className="absolute inset-0 z-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 1440 800">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'#f97316', stopOpacity:0.8}} />
              <stop offset="50%" style={{stopColor:'#fb923c', stopOpacity:0.4}} />
              <stop offset="100%" style={{stopColor:'#fed7aa', stopOpacity:0.1}} />
            </linearGradient>
          </defs>
          
          {[...Array(8)].map((_, i) => (
            <path
              key={`line-${i}`}
              d={`M${i * 200},0 Q${i * 200 + 100},${200 + i * 50} ${i * 200 + 200},400 T${i * 200 + 400},800`}
              stroke="url(#line-gradient)"
              strokeWidth="2"
              fill="none"
              className="animate-line-flow"
              style={{
                animationDelay: `${i * 2}s`,
                animationDuration: `${15 + i * 2}s`
              }}
            />
          ))}
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-block p-4 bg-black rounded-2xl shadow-lg mb-6 transform hover:scale-105 transition-transform duration-300">
              <Image 
                src="/logouam.webp" 
                alt="Logo UAM" 
                width={64} 
                height={64} 
                className="rounded-xl"
              />
            </div>
            <h1 className="text-4xl font-bold text-black mb-3 tracking-tight">
              Únete al
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 ml-2">
                DMAS
              </span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Plataforma de perfiles profesionales para estudiantes de Ingeniería en Computación y Matemáticas Aplicadas
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8 animate-fade-in-up animation-delay-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-black">
                  Nombre completo
                </label>
                <div className="relative group">
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100"
                    placeholder="Tu nombre completo"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Matricula Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-black">
                  Matrícula (10 dígitos)
                </label>
                <div className="relative group">
                  <input
                    name="matricula"
                    type="text"
                    required
                    maxLength={10}
                    pattern="\d{10}"
                    value={formData.matricula}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100"
                    placeholder="1234567890"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Carrera Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-black">
                  Carrera
                </label>
                <div className="relative group">
                  <select
                    name="carrera"
                    required
                    value={formData.carrera}
                    onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 appearance-none"
                  >
                    <option value="">Selecciona tu carrera</option>
                    <option value="Ingeniería en Computación">Ingeniería en Computación</option>
                    <option value="Matemáticas Aplicadas">Matemáticas Aplicadas</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-black">
                  Correo institucional UAM
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100"
                    placeholder="tu@cua.uam.mx"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-black">
                  Contraseña
                </label>
                <div className="relative group">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 pr-12"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-orange-500 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-black">
                  Confirmar contraseña
                </label>
                <div className="relative group">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 pr-12"
                    placeholder="Repite tu contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-orange-500 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Image Upload Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-black">
                  Imagen de perfil profesional
                  <span className="text-xs text-gray-500 font-normal ml-1">(opcional, máx. 5MB)</span>
                </label>
                <div className="relative group">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="image-upload"
                    />
                    <div className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black hover:bg-gray-100 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="flex-1 text-center">
                          <span className="text-sm font-medium text-gray-600 group-hover:text-orange-600 transition-colors">
                            {formData.imageBase64 ? 'Cambiar imagen' : 'Seleccionar imagen'}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            JPG, PNG o WEBP hasta 5MB
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="px-4 py-2 bg-orange-100 text-orange-600 rounded-xl text-sm font-semibold group-hover:bg-orange-200 transition-colors">
                            Examinar
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4 animate-fade-in-up">
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-orange-200 shadow-lg">
                          <Image 
                            src={imagePreview} 
                            alt="Vista previa de imagen de perfil" 
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, imageBase64: '' });
                            setImagePreview('');
                            // Reset file input
                            const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                          title="Eliminar imagen"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Vista previa de tu imagen de perfil
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl animate-shake">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl animate-bounce-in">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-green-700 font-medium">{success}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando perfil...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Crear mi perfil profesional</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link 
                  href="/login" 
                  className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Al crear una cuenta, podrás publicar tu currículum, competencias, datos de contacto y tesina en la plataforma del DMAS. 
                Acepto los{' '}
                <Link 
                  href="/terms" 
                  className="text-orange-600 hover:text-orange-700 underline transition-colors"
                >
                  términos y condiciones
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx global>{`
        @keyframes wave-slow {
          0%, 100% { 
            transform: translateX(0) scaleY(1);
          }
          50% { 
            transform: translateX(-25px) scaleY(1.1);
          }
        }
        
        @keyframes wave-medium {
          0%, 100% { 
            transform: translateX(0) scaleY(1);
          }
          50% { 
            transform: translateX(25px) scaleY(0.9);
          }
        }
        
        @keyframes float-geometric {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          25% { 
            transform: translate(20px, -30px) rotate(90deg) scale(1.1);
          }
          50% { 
            transform: translate(-15px, -60px) rotate(180deg) scale(0.9);
          }
          75% { 
            transform: translate(-30px, -30px) rotate(270deg) scale(1.05);
          }
        }
        
        @keyframes particle {
          0% { 
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
            transform: scale(1);
          }
          90% {
            opacity: 0.2;
          }
          100% { 
            transform: translate(100px, -200px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes blob-1 {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          33% { 
            transform: translate(50px, -40px) scale(1.2) rotate(120deg);
          }
          66% { 
            transform: translate(-30px, 30px) scale(0.8) rotate(240deg);
          }
        }
        
        @keyframes blob-2 {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          33% { 
            transform: translate(-40px, 50px) scale(1.1) rotate(-120deg);
          }
          66% { 
            transform: translate(40px, -30px) scale(0.9) rotate(-240deg);
          }
        }
        
        @keyframes blob-3 {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.3) rotate(180deg);
          }
        }
        
        @keyframes line-flow {
          0% {
            stroke-dasharray: 0 1000;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 100 1000;
            stroke-dashoffset: -200;
          }
          100% {
            stroke-dasharray: 0 1000;
            stroke-dashoffset: -1000;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-wave-slow {
          animation: wave-slow 8s ease-in-out infinite;
        }
        
        .animate-wave-medium {
          animation: wave-medium 6s ease-in-out infinite;
        }
        
        .animate-float-geometric {
          animation: float-geometric 25s ease-in-out infinite;
        }
        
        .animate-particle {
          animation: particle 30s linear infinite;
        }
        
        .animate-blob-1 {
          animation: blob-1 20s ease-in-out infinite;
        }
        
        .animate-blob-2 {
          animation: blob-2 25s ease-in-out infinite reverse;
        }
        
        .animate-blob-3 {
          animation: blob-3 15s ease-in-out infinite;
        }
        
        .animate-line-flow {
          animation: line-flow 20s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </main>
  );
}