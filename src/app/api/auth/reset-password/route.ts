import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import EmailNotificationService from '@/lib/email-notifications'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de correo electrónico inválido' },
        { status: 400 }
      )
    }

    await connectDB()

    // Buscar usuario por email
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        success: true,
        message: 'Si el correo está registrado, recibirás un enlace de recuperación'
      })
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora desde ahora

    // Guardar token en la base de datos
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpiry: resetTokenExpiry
    })

    // Crear enlace de recuperación
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password/confirm?token=${resetToken}`

    // Enviar email de recuperación
    const emailSent = await EmailNotificationService.sendPasswordResetEmail(
      email,
      user.name,
      resetLink
    )

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Error al enviar el correo de recuperación' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Se ha enviado un enlace de recuperación a tu correo electrónico'
    })

  } catch (_error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
