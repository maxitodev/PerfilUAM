import EmailService from './email';
import { EmailTemplates } from './email-templates';
import { EmailType, EmailTemplateData } from '@/types/email';

export { EmailType } from '@/types/email';

export interface NotificationData extends EmailTemplateData {
  email: string;
  type: EmailType;
}

export class EmailNotificationService {
  /**
   * Envía un correo de bienvenida a un nuevo usuario
   */
  static async sendWelcomeEmail(email: string, userName: string, profileUrl: string): Promise<boolean> {
    const html = EmailTemplates.welcomeEmail({
      userName,
      profileUrl
    });

    return EmailService.send({
      to: email,
      subject: '🎉 ¡Bienvenido a PerfilUAM!',
      html
    });
  }

  /**
   * Envía un código de verificación por email
   */
  static async sendVerificationEmail(email: string, userName: string, verificationCode: string): Promise<boolean> {
    const html = EmailTemplates.verificationEmail({
      userName,
      verificationCode
    });

    return EmailService.send({
      to: email,
      subject: '🔐 Verifica tu cuenta en PerfilUAM',
      html
    });
  }

  /**
   * Envía un enlace para restablecer contraseña
   */
  static async sendPasswordResetEmail(email: string, userName: string, resetLink: string): Promise<boolean> {
    const html = EmailTemplates.passwordResetEmail({
      userName,
      resetLink
    });

    return EmailService.send({
      to: email,
      subject: '🔑 Restablece tu contraseña - PerfilUAM',
      html
    });
  }

  /**
   * Envía notificación cuando se agrega un nuevo proyecto
   */
  static async sendProjectNotification(
    email: string, 
    userName: string, 
    projectName: string, 
    projectDescription: string, 
    profileUrl: string
  ): Promise<boolean> {
    const html = EmailTemplates.projectNotificationEmail({
      userName,
      projectName,
      projectDescription,
      profileUrl
    });

    return EmailService.send({
      to: email,
      subject: '🚀 Nuevo proyecto agregado a tu perfil',
      html
    });
  }

  /**
   * Envía alerta de seguridad por actividad sospechosa
   */
  static async sendSecurityAlert(
    email: string, 
    userName: string, 
    location: string, 
    timestamp: string,
    resetLink: string
  ): Promise<boolean> {
    const html = EmailTemplates.securityAlertEmail({
      userName,
      loginAttemptLocation: location,
      loginAttemptTime: timestamp,
      resetLink
    });

    return EmailService.send({
      to: email,
      subject: '🔒 Alerta de seguridad - PerfilUAM',
      html
    });
  }

  /**
   * Envía notificación cuando se actualiza el perfil
   */
  static async sendProfileUpdateNotification(email: string, userName: string, profileUrl: string): Promise<boolean> {
    const html = EmailTemplates.profileUpdateEmail({
      userName,
      profileUrl
    });

    return EmailService.send({
      to: email,
      subject: '✨ Tu perfil ha sido actualizado',
      html
    });
  }

  /**
   * Envía notificación de mantenimiento del sistema
   */
  static async sendMaintenanceNotification(emails: string[], userName?: string): Promise<boolean[]> {
    const html = EmailTemplates.maintenanceEmail({
      userName: userName || 'Usuario'
    });

    const templates = emails.map(email => ({
      to: email,
      subject: '🔧 Mantenimiento programado - PerfilUAM',
      html
    }));

    return EmailService.sendMultiple(templates);
  }

  /**
   * Método genérico para enviar cualquier tipo de notificación
   */
  static async sendNotification(data: NotificationData): Promise<boolean> {
    let html: string;
    let subject: string;

    switch (data.type) {
      case EmailType.WELCOME:
        html = EmailTemplates.welcomeEmail(data);
        subject = '🎉 ¡Bienvenido a PerfilUAM!';
        break;

      case EmailType.VERIFICATION:
        html = EmailTemplates.verificationEmail(data);
        subject = '🔐 Verifica tu cuenta en PerfilUAM';
        break;

      case EmailType.PASSWORD_RESET:
        html = EmailTemplates.passwordResetEmail(data);
        subject = '🔑 Restablece tu contraseña - PerfilUAM';
        break;

      case EmailType.PROJECT_NOTIFICATION:
        html = EmailTemplates.projectNotificationEmail(data);
        subject = '🚀 Nuevo proyecto agregado a tu perfil';
        break;

      case EmailType.SECURITY_ALERT:
        html = EmailTemplates.securityAlertEmail(data);
        subject = '🔒 Alerta de seguridad - PerfilUAM';
        break;

      case EmailType.PROFILE_UPDATE:
        html = EmailTemplates.profileUpdateEmail(data);
        subject = '✨ Tu perfil ha sido actualizado';
        break;

      case EmailType.MAINTENANCE:
        html = EmailTemplates.maintenanceEmail(data);
        subject = '🔧 Mantenimiento programado - PerfilUAM';
        break;

      default:
        throw new Error(`Tipo de email no soportado: ${data.type}`);
    }

    return EmailService.send({
      to: data.email,
      subject,
      html
    });
  }

  /**
   * Envía múltiples notificaciones del mismo tipo
   */
  static async sendBulkNotifications(notifications: NotificationData[]): Promise<boolean[]> {
    return EmailService.sendMultiple(
      notifications.map(data => {
        const { email, type, ...templateData } = data;
        let html: string;
        let subject: string;

        switch (type) {
          case EmailType.WELCOME:
            html = EmailTemplates.welcomeEmail(templateData);
            subject = '🎉 ¡Bienvenido a PerfilUAM!';
            break;
          // ... otros casos
          default:
            html = EmailTemplates.welcomeEmail(templateData);
            subject = 'Notificación - PerfilUAM';
        }

        return {
          to: email,
          subject,
          html
        };
      })
    );
  }
}

export default EmailNotificationService;
