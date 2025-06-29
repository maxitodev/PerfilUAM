'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido')
      setIsValidToken(false)
      return
    }

    // Verificar token al cargar la página
    verifyToken(token)
  }, [token])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setIsValidToken(true)
      } else {
        setError(data.error || 'Token inválido o expirado')
        setIsValidToken(false)
      }
    } catch {
      setError('Error de conexión')
      setIsValidToken(false)
    }
  }

  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    if (!hasUpperCase) {
      return 'La contraseña debe tener al menos una letra mayúscula'
    }
    if (!hasLowerCase) {
      return 'La contraseña debe tener al menos una letra minúscula'
    }
    if (!hasNumbers) {
      return 'La contraseña debe tener al menos un número'
    }
    if (!hasSpecialChar) {
      return 'La contraseña debe tener al menos un carácter especial'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos')
      return
    }

    // Validar contraseña
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep('success')
      } else {
        setError(data.error || 'Error al actualizar la contraseña')
      }
    } catch {
      setError('Error de conexión. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Token inválido o expirado
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Enlace inválido
              </h1>
              <p className="text-gray-600 leading-relaxed mb-6">
                {error || 'El enlace de recuperación no es válido o ha expirado'}
              </p>
            </div>

            <div className="space-y-4">
              <Link 
                href="/reset-password"
                className="block w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 text-center"
              >
                Solicitar nuevo enlace
              </Link>
              
              <Link 
                href="/login"
                className="block w-full py-3 px-4 text-gray-600 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-200 text-center"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Verificando token...
  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando enlace...</p>
          </div>
        </div>
      </div>
    )
  }

  // Éxito
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Contraseña actualizada!
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Formulario
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
              Nueva contraseña
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-200 rounded-xl text-black placeholder-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md hover:border-gray-300 focus:shadow-lg"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L7.05 7.05M9.878 9.878a3 3 0 105.303 5.303m0 0L17.05 17.05M14.121 14.121L17.05 17.05" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-200 rounded-xl text-black placeholder-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md hover:border-gray-300 focus:shadow-lg"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-orange-500 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L7.05 7.05M9.878 9.878a3 3 0 105.303 5.303m0 0L17.05 17.05M14.121 14.121L17.05 17.05" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">La contraseña debe tener:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className={`mr-2 ${password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
                    {password.length >= 8 ? '✓' : '•'}
                  </span>
                  Al menos 8 caracteres
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
                    {/[A-Z]/.test(password) ? '✓' : '•'}
                  </span>
                  Una letra mayúscula
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${/[a-z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
                    {/[a-z]/.test(password) ? '✓' : '•'}
                  </span>
                  Una letra minúscula
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${/\d/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
                    {/\d/.test(password) ? '✓' : '•'}
                  </span>
                  Un número
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : 'text-gray-400'}`}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '•'}
                  </span>
                  Un carácter especial
                </li>
              </ul>
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
                  Actualizando...
                </div>
              ) : (
                'Actualizar contraseña'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading component for Suspense fallback
function LoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function ConfirmResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ConfirmResetPasswordContent />
    </Suspense>
  )
}
