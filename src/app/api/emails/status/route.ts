import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const emailConfig = {
      sendgridConfigured: !!process.env.SENDGRID_API_KEY,
      emailFromConfigured: !!process.env.EMAIL_FROM,
      emailFromNameConfigured: !!process.env.EMAIL_FROM_NAME,
      nextAuthUrlConfigured: !!process.env.NEXTAUTH_URL,
      environment: process.env.NODE_ENV,
      emailFrom: process.env.EMAIL_FROM,
      emailFromName: process.env.EMAIL_FROM_NAME,
      nextAuthUrl: process.env.NEXTAUTH_URL
    };

    // No mostrar la API key completa por seguridad
    const sendgridStatus = process.env.SENDGRID_API_KEY 
      ? `Configurada (${process.env.SENDGRID_API_KEY.substring(0, 10)}...)`
      : 'No configurada';

    return NextResponse.json({
      status: 'ok',
      message: 'Configuración del sistema de emails',
      config: {
        ...emailConfig,
        sendgridApiKey: sendgridStatus
      },
      allConfigured: emailConfig.sendgridConfigured && 
                    emailConfig.emailFromConfigured && 
                    emailConfig.emailFromNameConfigured &&
                    emailConfig.nextAuthUrlConfigured
    });

  } catch (error) {
    console.error('Error verificando configuración de emails:', error);
    return NextResponse.json(
      { 
        error: 'Error verificando configuración',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
