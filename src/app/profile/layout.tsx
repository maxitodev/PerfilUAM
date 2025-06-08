'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return // Aún cargando

    if (status === 'unauthenticated') {
      // No autenticado, redirigir al login
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      // Autenticado, permitir acceso
      setIsLoading(false)
    }
  }, [status, router])

  // Mostrar loading mientras se verifica la autenticación
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // No mostrar nada si no está autenticado (se redirigirá)
  if (status === 'unauthenticated') {
    return null
  }

  return <>{children}</>
}
