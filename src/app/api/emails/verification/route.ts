import { NextRequest, NextResponse } from 'next/server';
import EmailNotificationService from '@/lib/email-notifications';

export async function POST(request: NextRequest) {
  try {
    const { email, userName, verificationCode } = await request.json();

    if (!email || !userName || !verificationCode) {
      return NextResponse.json(
        { error: 'Email, nombre de usuario y código de verificación son requeridos' },
        { status: 400 }
      );
    }

    const success = await EmailNotificationService.sendVerificationEmail(
      email,
      userName,
      verificationCode
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Código de verificación enviado exitosamente'
      });
    } else {
      return NextResponse.json(
        { error: 'Error al enviar el código de verificación' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error enviando código de verificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
