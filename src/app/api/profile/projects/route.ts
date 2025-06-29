import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import Profile from '@/models/profile'
import Project from '@/models/project'
import { EmailAutomation } from '@/lib/email-automation'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { name, description, technologies, link, type, status, isPublic, featured } = await request.json()
    
    // Validar campos requeridos
    if (!name || !description || !technologies || !type || !status) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, description, technologies, type, status' },
        { status: 400 }
      )
    }

    // Validar que technologies sea un array
    if (!Array.isArray(technologies) || technologies.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos una tecnología' },
        { status: 400 }
      )
    }

    await connectDB()
    
    // Buscar usuario
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    
    // Buscar el perfil del usuario
    const profile = await Profile.findOne({ user: user._id })
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Debes crear un perfil primero' },
        { status: 400 }
      )
    }
    
    // Crear el proyecto
    const project = new Project({
      profile: profile._id,
      name: name.trim(),
      description: description.trim(),
      technologies: technologies.map((tech: string) => tech.trim()),
      link: link?.trim() || '',
      type,
      status,
      isPublic: isPublic !== undefined ? isPublic : true,
      featured: featured !== undefined ? featured : false
    })
    
    await project.save()
    
    // Enviar notificación por email de forma asíncrona
    EmailAutomation.onProjectAdded(
      user.email,
      user.name,
      project.name,
      project.description
    ).catch(error => console.error('Error enviando notificación de proyecto:', error));
    
    return NextResponse.json(
      { 
        message: 'Proyecto creado exitosamente',
        project: project.toObject()
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating project:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Error al crear proyecto', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await connectDB()
    
    // Buscar usuario
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    
    // Buscar el perfil del usuario
    const profile = await Profile.findOne({ user: user._id })
    
    if (!profile) {
      return NextResponse.json({ projects: [] })
    }
    
    // Buscar proyectos del usuario
    const projects = await Project.find({ profile: profile._id })
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Error al cargar proyectos' },
      { status: 500 }
    )
  }
}
