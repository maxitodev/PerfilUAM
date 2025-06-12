import { NextResponse } from 'next/server'
import User from '@/models/user'
import Profile from '@/models/profile'
import Project from '@/models/project'
import { connectDB } from '@/lib/mongodb'

export async function DELETE(request: Request) {
  try {
    await connectDB()
    
    console.log('Iniciando limpieza de la base de datos...')
    
    // Contar documentos antes de eliminar
    const userCount = await User.countDocuments()
    const profileCount = await Profile.countDocuments()
    const projectCount = await Project.countDocuments()
    
    console.log(`Documentos encontrados:`)
    console.log(`- Usuarios: ${userCount}`)
    console.log(`- Perfiles: ${profileCount}`)
    console.log(`- Proyectos: ${projectCount}`)
    
    // Eliminar en orden inverso por dependencias
    // 1. Primero eliminar proyectos (dependen de perfiles)
    const deletedProjects = await Project.deleteMany({})
    console.log(`Proyectos eliminados: ${deletedProjects.deletedCount}`)
    
    // 2. Luego eliminar perfiles (dependen de usuarios)
    const deletedProfiles = await Profile.deleteMany({})
    console.log(`Perfiles eliminados: ${deletedProfiles.deletedCount}`)
    
    // 3. Finalmente eliminar usuarios
    const deletedUsers = await User.deleteMany({})
    console.log(`Usuarios eliminados: ${deletedUsers.deletedCount}`)
    
    return NextResponse.json(
      { 
        message: 'Base de datos limpiada exitosamente',
        deleted: {
          users: deletedUsers.deletedCount,
          profiles: deletedProfiles.deletedCount,
          projects: deletedProjects.deletedCount,
          total: deletedUsers.deletedCount + deletedProfiles.deletedCount + deletedProjects.deletedCount
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error limpiando la base de datos:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// También añadir un método POST para mayor flexibilidad
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { confirm } = body
    
    // Requerir confirmación explícita
    if (confirm !== 'DELETE_ALL_PROFILES') {
      return NextResponse.json(
        { 
          error: 'Se requiere confirmación explícita',
          message: 'Envía {"confirm": "DELETE_ALL_PROFILES"} para confirmar la eliminación'
        },
        { status: 400 }
      )
    }
    
    // Reutilizar la lógica del método DELETE
    return await DELETE(request)
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error procesando la solicitud',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    )
  }
}
