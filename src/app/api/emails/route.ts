import { NextRequest, NextResponse } from 'next/server';
import EmailNotificationService, { EmailType } from '@/lib/email-notifications';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';

interface SendEmailRequest {
  type: EmailType;
  email: string;
  data: {
    userName?: string;
    verificationCode?: string;
    resetLink?: string;
    profileUrl?: string;
    projectName?: string;
    projectDescription?: string;
    loginAttemptLocation?: string;
    loginAttemptTime?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar autenticación para ciertos tipos de email
    const publicEmailTypes = [EmailType.VERIFICATION, EmailType.PASSWORD_RESET];
    const body: SendEmailRequest = await request.json();
    
    if (!publicEmailTypes.includes(body.type) && !session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { type, email, data } = body;

    if (!type || !email) {
      return NextResponse.json(
        { error: 'Tipo de email y destinatario son requeridos' },
        { status: 400 }
      );
    }

    let success = false;

    switch (type) {
      case EmailType.WELCOME:
        if (!data.userName || !data.profileUrl) {
          return NextResponse.json(
            { error: 'Datos insuficientes para email de bienvenida' },
            { status: 400 }
          );
        }
        success = await EmailNotificationService.sendWelcomeEmail(
          email,
          data.userName,
          data.profileUrl
        );
        break;

      case EmailType.VERIFICATION:
        if (!data.userName || !data.verificationCode) {
          return NextResponse.json(
            { error: 'Datos insuficientes para email de verificación' },
            { status: 400 }
          );
        }
        success = await EmailNotificationService.sendVerificationEmail(
          email,
          data.userName,
          data.verificationCode
        );
        break;

      case EmailType.PASSWORD_RESET:
        if (!data.userName || !data.resetLink) {
          return NextResponse.json(
            { error: 'Datos insuficientes para email de restablecimiento' },
            { status: 400 }
          );
        }
        success = await EmailNotificationService.sendPasswordResetEmail(
          email,
          data.userName,
          data.resetLink
        );
        break;

      case EmailType.PROJECT_NOTIFICATION:
        if (!data.userName || !data.projectName || !data.profileUrl) {
          return NextResponse.json(
            { error: 'Datos insuficientes para notificación de proyecto' },
            { status: 400 }
          );
        }
        success = await EmailNotificationService.sendProjectNotification(
          email,
          data.userName,
          data.projectName,
          data.projectDescription || '',
          data.profileUrl
        );
        break;

      case EmailType.SECURITY_ALERT:
        if (!data.userName || !data.loginAttemptLocation || !data.loginAttemptTime || !data.resetLink) {
          return NextResponse.json(
            { error: 'Datos insuficientes para alerta de seguridad' },
            { status: 400 }
          );
        }
        success = await EmailNotificationService.sendSecurityAlert(
          email,
          data.userName,
          data.loginAttemptLocation,
          data.loginAttemptTime,
          data.resetLink
        );
        break;

      case EmailType.PROFILE_UPDATE:
        if (!data.userName || !data.profileUrl) {
          return NextResponse.json(
            { error: 'Datos insuficientes para notificación de actualización' },
            { status: 400 }
          );
        }
        success = await EmailNotificationService.sendProfileUpdateNotification(
          email,
          data.userName,
          data.profileUrl
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de email no soportado' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email enviado correctamente'
      });
    } else {
      return NextResponse.json(
        { error: 'Error al enviar el email' },
        { status: 500 }
      );
    }

  } catch (_error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para envío de emails en lote
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { emails, type } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Lista de emails requerida' },
        { status: 400 }
      );
    }

    if (type === EmailType.MAINTENANCE) {
      const results = await EmailNotificationService.sendMaintenanceNotification(emails);
      const successCount = results.filter(Boolean).length;
      
      return NextResponse.json({
        success: true,
        message: `Emails enviados: ${successCount}/${emails.length}`,
        results
      });
    }

    return NextResponse.json(
      { error: 'Tipo de email en lote no soportado' },
      { status: 400 }
    );

  } catch (_error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
