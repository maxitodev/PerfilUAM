import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import Profile from '@/models/profile'
import Project from '@/models/project'

// Interfaces para tipado
interface UserDocument {
  _id: string
  name: string
  email: string
  matricula: string
  carrera: string
  imageBase64?: string
}

interface ProfileDocument {
  _id: string
  user: string
  division: string
  trimestre: string
  location: string
  linkedin?: string
  github?: string
  bio: string
  skills: string[]
  promedio: string
  graduationDate: string
  completionPercentage: number
  isActive: boolean
  tesinaLink?: string
  cvLink?: string
}

interface ProjectDocument {
  _id: string
  profile: string
  name: string
  description: string
  technologies: string[]
  link?: string
  type: string
  status: string
  isPublic: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

// GET - Obtener datos del perfil del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await connectDB()
    
    // Buscar usuario con imagen
    const user = await User.findOne({ email: session.user.email })
      .select('+imageBase64')
      .lean() as unknown as UserDocument | null
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Buscar perfil
    const profile = await Profile.findOne({ user: user._id }).lean() as unknown as ProfileDocument | null
    
    let projects: unknown[] = []
    if (profile) {
      // Buscar proyectos del usuario
      projects = await Project.find({ profile: profile._id })
        .sort({ createdAt: -1 })
        .lean()
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        matricula: user.matricula,
        carrera: user.carrera,
        imageBase64: user.imageBase64
      },
      hasProfile: !!profile,
      profile: profile || null,
      projects
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Error al cargar perfil' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo perfil
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const profileData = await request.json()

    await connectDB()

    // Buscar usuario
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya tiene perfil
    const existingProfile = await Profile.findOne({ user: user._id })
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Ya tienes un perfil creado' },
        { status: 400 }
      )
    }

    // Crear nuevo perfil
    const profile = new Profile({
      user: user._id,
      ...profileData
    })

    await profile.save()

    return NextResponse.json({
      message: 'Perfil creado exitosamente',
      profile
    })

  } catch (error) {
    console.error('Error al crear perfil:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar perfil existente
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const profileData = await request.json()

    await connectDB()

    // Buscar usuario
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar perfil
    const profile = await Profile.findOneAndUpdate(
      { user: user._id },
      { ...profileData },
      { new: true, runValidators: true }
    )

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      profile
    })

  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
