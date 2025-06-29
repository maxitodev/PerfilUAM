import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña requeridos' },
        { status: 400 }
      )
    }

    // Validar contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    await connectDB()

    // Buscar usuario con el token válido y no expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      )
    }

    // Hash de la nueva contraseña
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Actualizar contraseña y limpiar tokens de recuperación
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpiry: undefined,
      lastPasswordChange: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })

  } catch (_error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
