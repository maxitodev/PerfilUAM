'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState<'email' | 'success'>('email')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Por favor ingresa tu correo electrónico')
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido')
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep('success')
        setMessage(data.message || 'Se ha enviado un enlace de recuperación a tu correo')
      } else {
        setError(data.error || 'Error al procesar la solicitud')
      }
    } catch (error) {
      setError('Error de conexión. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8">
            {/* Header Success */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Correo enviado!
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Hemos enviado un enlace de recuperación a <strong className="text-orange-600">{email}</strong>
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 mb-6 border border-orange-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-lg mr-2">📧</span>
                Revisa tu bandeja de entrada
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-0.5">•</span>
                  El correo puede tardar unos minutos en llegar
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-0.5">•</span>
                  No olvides revisar tu carpeta de spam
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-0.5">•</span>
                  El enlace expira en 1 hora por seguridad
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => setStep('email')}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Enviar a otro correo
              </button>
              
              <Link 
                href="/login"
                className="block w-full py-3 px-4 text-gray-600 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-200 text-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0a2 2 0 01-2 2m2-2H9m6 0V9a2 2 0 00-2-2M9 7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Recuperar contraseña
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-black placeholder-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md hover:border-gray-300 focus:shadow-lg"
                  placeholder="tu@cua.uam.mx"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{message}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </div>
              ) : (
                'Enviar enlace de recuperación'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿Recordaste tu contraseña?{' '}
              <Link 
                href="/login" 
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>

          {/* Help */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 text-center">
              ¿Tienes problemas? Contacta a soporte técnico en{' '}
              <a href="mailto:soporte@cua.uam.mx" className="text-orange-600 hover:text-orange-700">
                soporte@cua.uam.mx
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
