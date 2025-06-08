import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Permitir acceso a usuarios autenticados
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Verificar si hay un token válido
        if (token) {
          return true
        }
        
        // Si no hay token, verificar si es una ruta que requiere autenticación
        const { pathname } = req.nextUrl
        
        // Permitir acceso a rutas públicas
        if (pathname.startsWith('/api/auth') || 
            pathname === '/login' || 
            pathname === '/register' ||
            pathname === '/' ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/favicon')) {
          return true
        }
        
        // Denegar acceso a rutas protegidas sin token
        return false
      }
    },
  }
)

// Solo aplicar middleware a rutas específicas que requieren autenticación
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/users/:path*',
    '/api/profile/:path*',
    '/api/projects/:path*'
  ]
}