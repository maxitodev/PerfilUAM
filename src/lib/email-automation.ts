import EmailNotificationService from './email-notifications';

/**
 * Utilidades para automatizar el envío de emails en eventos específicos de la aplicación
 */
export class EmailAutomation {
  
  /**
   * Envía email de bienvenida cuando un usuario se registra
   */
  static async onUserRegistration(userEmail: string, userName: string) {
    try {
      const profileUrl = `${process.env.NEXTAUTH_URL}/profile`;
      
      const result = await EmailNotificationService.sendWelcomeEmail(
        userEmail,
        userName,
        profileUrl
      );
      
      return result;
    } catch (error) {
      if (error instanceof Error) {
        // Error details available but not logged
      }
      throw error;
    }
  }

  /**
   * Envía notificación cuando un usuario agrega un nuevo proyecto
   */
  static async onProjectAdded(userEmail: string, userName: string, projectName: string, projectDescription: string) {
    try {
      const profileUrl = `${process.env.NEXTAUTH_URL}/profile`;
      
      await EmailNotificationService.sendProjectNotification(
        userEmail,
        userName,
        projectName,
        projectDescription,
        profileUrl
      );
      
    } catch (_error) {
      // Error handled silently
    }
  }

  /**
   * Envía notificación cuando se actualiza el perfil
   */
  static async onProfileUpdate(userEmail: string, userName: string) {
    try {
      const profileUrl = `${process.env.NEXTAUTH_URL}/profile`;
      
      await EmailNotificationService.sendProfileUpdateNotification(
        userEmail,
        userName,
        profileUrl
      );
      
    } catch (_error) {
      // Error handled silently
    }
  }

  /**
   * Envía alerta de seguridad por intento de acceso sospechoso
   */
  static async onSuspiciousLogin(userEmail: string, userName: string, location: string) {
    try {
      const timestamp = new Date().toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const resetLink = `${process.env.NEXTAUTH_URL}/reset-password`;
      
      await EmailNotificationService.sendSecurityAlert(
        userEmail,
        userName,
        location,
        timestamp,
        resetLink
      );
      
    } catch (_error) {
      // Error handled silently
    }
  }

  /**
   * Genera y envía un código de verificación
   */
  static async sendVerificationCode(userEmail: string, userName: string): Promise<string> {
    try {
      // Generar código de 6 dígitos
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      await EmailNotificationService.sendVerificationEmail(
        userEmail,
        userName,
        verificationCode
      );
      
      return verificationCode;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Notificación para administradores sobre nuevos registros
   */
  static async notifyAdminNewUser(newUserEmail: string, newUserName: string) {
    try {
      // Esta función se puede expandir para enviar notificaciones a administradores
      // Aquí podrías enviar un email a los administradores
      // const adminEmails = ['admin@cua.uam.mx'];
      // await EmailNotificationService.sendAdminNotification(adminEmails, {...});
      
    } catch (_error) {
      // Error handled silently
    }
  }

  /**
   * Envío masivo de notificaciones de mantenimiento
   */
  static async broadcastMaintenanceNotification(userEmails: string[]) {
    try {
      const results = await EmailNotificationService.sendMaintenanceNotification(userEmails);
      const successCount = results.filter(Boolean).length;
      
      return { successCount, totalCount: userEmails.length };
    } catch (error) {
      throw error;
    }
  }
}

interface UserEventData {
  email: string;
  name: string;
  id?: string;
  projectName?: string;
  projectDescription?: string;
  location?: string;
  userAgent?: string;
}

/**
 * Middleware para capturar eventos y enviar emails automáticamente
 */
export class EmailEventListener {
  
  /**
   * Configura los listeners de eventos para envío automático de emails
   */
  static setupEventListeners() {
    // Aquí puedes configurar listeners para diferentes eventos de la aplicación
  }

  /**
   * Procesa eventos de usuario y envía emails correspondientes
   */
  static async processUserEvent(eventType: string, userData: UserEventData) {
    switch (eventType) {
      case 'user_registered':
        await EmailAutomation.onUserRegistration(
          userData.email,
          userData.name
        );
        break;
        
      case 'project_added':
        if (userData.projectName) {
          await EmailAutomation.onProjectAdded(
            userData.email,
            userData.name,
            userData.projectName,
            userData.projectDescription || ''
          );
        }
        break;
        
      case 'profile_updated':
        await EmailAutomation.onProfileUpdate(
          userData.email,
          userData.name
        );
        break;
        
      case 'suspicious_login':
        if (userData.location) {
          await EmailAutomation.onSuspiciousLogin(
            userData.email,
            userData.name,
            userData.location
          );
        }
        break;
        
      default:
        // Evento no manejado
    }
  }
}

export default EmailAutomation;
