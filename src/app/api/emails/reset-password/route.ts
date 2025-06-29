import { NextRequest, NextResponse } from 'next/server';
import EmailNotificationService from '@/lib/email-notifications';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/user';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Buscar el usuario
    const user = await User.findOne({ email });
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace de restablecimiento'
      });
    }

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Crear enlace de restablecimiento
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // Enviar email
    const success = await EmailNotificationService.sendPasswordResetEmail(
      email,
      user.name || 'Usuario',
      resetLink
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Enlace de restablecimiento enviado a tu email'
      });
    } else {
      return NextResponse.json(
        { error: 'Error al enviar el email de restablecimiento' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en restablecimiento de contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
