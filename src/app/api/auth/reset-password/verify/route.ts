import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
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

    return NextResponse.json({
      success: true,
      message: 'Token válido'
    })

  } catch (_error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
