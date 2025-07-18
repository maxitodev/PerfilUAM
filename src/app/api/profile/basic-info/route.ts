import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await connectDB()
    
    const { name, matricula, carrera } = await request.json()

    // Validaciones
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    if (!matricula || !matricula.trim()) {
      return NextResponse.json({ error: 'La matrícula es requerida' }, { status: 400 })
    }

    if (!/^\d{10}$/.test(matricula)) {
      return NextResponse.json({ error: 'La matrícula debe tener exactamente 10 dígitos' }, { status: 400 })
    }

    if (!carrera || !carrera.trim()) {
      return NextResponse.json({ error: 'La carrera es requerida' }, { status: 400 })
    }

    const validCareers = ['Ingeniería en Computación', 'Matemáticas Aplicadas']
    if (!validCareers.includes(carrera)) {
      return NextResponse.json({ error: 'Carrera no válida' }, { status: 400 })
    }

    // Verificar si la matrícula ya está en uso por otro usuario
    const existingUser = await User.findOne({ 
      matricula: matricula.trim(),
      email: { $ne: session.user.email } // Usar email en lugar de _id
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Esta matrícula ya está registrada por otro usuario' }, { status: 400 })
    }

    // Actualizar usuario por email y preservar imagen existente
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        name: name.trim(),
        matricula: matricula.trim(),
        carrera: carrera.trim()
        // No incluir imageBase64 aquí para no sobrescribir
      },
      { new: true, runValidators: true }
    ).select('+imageBase64') // Incluir imagen en la respuesta

    if (!updatedUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Información básica actualizada exitosamente',
      user: updatedUser.getDataWithImage() // Usar método que incluye imagen
    })

  } catch (error: unknown) {
    console.error('Error updating basic info:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json({ error: 'Esta matrícula ya está registrada' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
