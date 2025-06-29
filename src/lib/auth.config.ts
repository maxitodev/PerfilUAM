import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcryptjs from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          hd: "cua.uam.mx" // Restricción de dominio en Google OAuth
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        try {
          await connectDB()
          
          const user = await User.findOne({ 
            email: credentials.email,
            isActive: true 
          }).select('+password')
          
          if (!user) {
            return null
          }
          
          const passwordMatch = await bcryptjs.compare(credentials.password, user.password)
          
          if (!passwordMatch) {
            return null
          }
          
          // Actualizar última conexión
          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date()
          })
          
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
    async signIn({ user, account }) {
      
      if (account?.provider === 'google') {
        // Verificar que el email sea del dominio UAM
        if (!user.email?.endsWith('@cua.uam.mx')) {
          return false
        }
        
        try {
          await connectDB()
          
          // Buscar usuario existente
          let existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            // Crear nuevo usuario OAuth
            existingUser = await User.create({
              name: user.name,
              email: user.email,
              imageBase64: user.image,
              provider: 'google',
              providerId: account.providerAccountId,
              isActive: true,
              lastLogin: new Date()
            })
          } else {
            // Actualizar usuario existente
            await User.findByIdAndUpdate(existingUser._id, {
              lastLogin: new Date(),
              imageBase64: user.image || existingUser.imageBase64
            })
          }
          
          return true
        } catch (error) {
          console.error('Error en signIn callback:', error)
          return false
        }
      }
      
      return true
    },
    async jwt({ token, user, account, trigger }) {
      
      // Persistir el ID del usuario en el token
      if (user) {
        
        // Para usuarios OAuth, necesitamos obtener el ID de la base de datos
        if (account?.provider === 'google') {
          try {
            await connectDB()
            const dbUser = await User.findOne({ email: user.email })
            if (dbUser) {
              token.id = dbUser._id.toString()
              token.provider = 'google'
            }
          } catch (error) {
            console.error('Error finding OAuth user in DB:', error)
          }
        } else {
          token.id = user.id
          token.provider = 'credentials'
        }
        
        token.email = user.email
        token.name = user.name
      }
      
      // Verificar que el usuario sigue activo solo en updates, no en cada request
      if (trigger === 'update' && token.id) {
        try {
          await connectDB()
          const dbUser = await User.findById(token.id).select('isActive')
          if (!dbUser || !dbUser.isActive) {
            return { id: '', email: '', name: '' } // Return a valid but empty JWT object
          }
        } catch (error) {
          console.error('Error verifying user in JWT callback:', error)
          return { id: '', email: '', name: '' } // Return a valid but empty JWT object
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
