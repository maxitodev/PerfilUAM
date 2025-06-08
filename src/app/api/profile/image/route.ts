import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'

// PUT - Actualizar imagen de perfil del usuario
export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { imageBase64 } = await request.json()
    
    // Validar que se proporcione una imagen
    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Se requiere una imagen' },
        { status: 400 }
      )
    }

    // Validar formato base64 de imagen
    if (!imageBase64.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Formato de imagen no válido' },
        { status: 400 }
      )
    }

    // Validar tamaño aproximado (base64 es ~33% más grande que el archivo original)
    const sizeInBytes = (imageBase64.length * 3) / 4
    const maxSizeInBytes = 5 * 1024 * 1024 // 5MB
    
    if (sizeInBytes > maxSizeInBytes) {
      return NextResponse.json(
        { error: 'La imagen es demasiado grande. Máximo 5MB.' },
        { status: 400 }
      )
    }

    await connectDB()

    // Buscar y actualizar usuario
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        imageBase64,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Imagen actualizada exitosamente',
      imageBase64: user.imageBase64
    })

  } catch (error) {
    console.error('Error al actualizar imagen:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar imagen de perfil del usuario
export async function DELETE() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    // Buscar y actualizar usuario eliminando la imagen
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $unset: { imageBase64: "" },
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Imagen eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar imagen:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
