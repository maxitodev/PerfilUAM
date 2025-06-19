import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import Profile from '@/models/profile'
import Project from '@/models/project'

// GET - Obtener proyecto específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
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
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }
    
    // Buscar el proyecto por ID y perfil
    const project = await Project.findOne({ 
      _id: id, 
      profile: profile._id 
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })

  } catch (error) {
    console.error('Error al obtener proyecto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar proyecto
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }
    
    // Buscar y actualizar el proyecto
    const project = await Project.findOneAndUpdate(
      { 
        _id: id, 
        profile: profile._id 
      },
      {
        name: name.trim(),
        description: description.trim(),
        technologies: technologies.map((tech: string) => tech.trim()),
        link: link?.trim() || '',
        type,
        status,
        isPublic: isPublic !== undefined ? isPublic : true,
        featured: featured !== undefined ? featured : false
      },
      { new: true }
    )
    
    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Proyecto actualizado exitosamente',
        project: project.toObject()
      }
    )
  } catch (error) {
    console.error('Error updating project:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Error al actualizar proyecto', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar proyecto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }
    
    // Buscar y eliminar el proyecto
    const project = await Project.findOneAndDelete({ 
      _id: id, 
      profile: profile._id 
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Proyecto eliminado exitosamente' }
    )
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Error al eliminar proyecto' },
      { status: 500 }
    )
  }
}
