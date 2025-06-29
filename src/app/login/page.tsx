'use client'
import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/profile')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales inválidas. Verifica tu email y contraseña.')
      } else if (result?.ok) {
        // Dar tiempo para que la sesión se establezca
        setTimeout(() => {
          router.push('/profile')
          router.refresh()
        }, 100)
      } else {
        setError('Error inesperado durante el login.')
      }
    } catch (error) {
      console.error('Login catch error:', error)
      setError('Error de conexión. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || status === 'authenticated') return null;

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
              Bienvenido al
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 ml-2">
                DMAS
              </span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Accede a tu perfil profesional 
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8 animate-fade-in-up animation-delay-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-black">
                  Correo institucional UAM
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 pr-12"
                    placeholder="Ingresa tu contraseña"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded bg-gray-50"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-orange-600 hover:text-orange-700 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Iniciar Sesión</span>
                  </div>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">o continúa con</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/profile' })}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 border border-gray-300 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transform hover:scale-105"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Iniciar sesión con Google</span>
                </div>
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link 
                  href="/register" 
                  className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Accede a tu perfil profesional en la plataforma del DMAS.
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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
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
  )
}