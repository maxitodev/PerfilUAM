import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcryptjs from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }
        
        try {
          console.log('Attempting to authorize user:', credentials.email)
          await connectDB()
          
          const user = await User.findOne({ 
            email: credentials.email,
            isActive: true 
          }).select('+password')
          
          console.log('User found:', !!user)
          
          if (!user) {
            console.log('User not found or inactive')
            return null
          }
          
          const passwordMatch = await bcryptjs.compare(credentials.password, user.password)
          console.log('Password match:', passwordMatch)
          
          if (!passwordMatch) {
            console.log('Password does not match')
            return null
          }
          
          // Actualizar última conexión
          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date()
          })
          
          console.log('Authorization successful for user:', user.email)
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.imageBase64
          }
        } catch (error) {
          console.error('Error in authorize:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // 24 horas
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log('JWT callback - trigger:', trigger)
      
      // Persistir el ID del usuario en el token
      if (user) {
        console.log('Adding user to token:', user.email)
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      
      // Verificar que el usuario sigue activo solo en updates, no en cada request
      if (trigger === 'update' && token.id) {
        try {
          await connectDB()
          const dbUser = await User.findById(token.id).select('isActive')
          if (!dbUser || !dbUser.isActive) {
            console.log('User no longer active, invalidating token')
            return {} // Token inválido si el usuario no existe o no está activo
          }
        } catch (error) {
          console.error('Error verifying user in JWT callback:', error)
          return {}
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // Enviar propiedades al cliente
      if (token && token.id) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback - url:', url, 'baseUrl:', baseUrl)
      
      // Manejar redirecciones después del login
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/profile`
      }
      
      // Si la URL ya está en nuestro dominio, usarla
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // Para URLs relativas
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Por defecto, ir a profile
      return `${baseUrl}/profile`
    }
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 días
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }