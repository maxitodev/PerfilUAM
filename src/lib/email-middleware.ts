import { EmailEventListener } from '@/lib/email-automation';

/**
 * Middleware para automatizar el envío de emails en eventos específicos
 */
export class EmailMiddleware {
  
  /**
   * Inicializar el middleware de emails
   */
  static init() {
    EmailEventListener.setupEventListeners();
  }

  /**
   * Interceptar eventos de registro de usuario
   */
  static async onUserRegister(userData: { email: string; name: string; id: string }) {
    try {
      await EmailEventListener.processUserEvent('user_registered', {
        email: userData.email,
        name: userData.name,
        id: userData.id
      });
    } catch (_error) {
      // Error handled silently
    }
  }

  /**
   * Interceptar eventos de creación de proyecto
   */
  static async onProjectCreate(userData: { 
    email: string; 
    name: string; 
    id: string; 
    projectName: string; 
    projectDescription: string; 
  }) {
    try {
      await EmailEventListener.processUserEvent('project_added', {
        email: userData.email,
        name: userData.name,
        id: userData.id,
        projectName: userData.projectName,
        projectDescription: userData.projectDescription
      });
    } catch (_error) {
      // Error handled silently
    }
  }

  /**
   * Interceptar eventos de actualización de perfil
   */
  static async onProfileUpdate(userData: { email: string; name: string; id: string }) {
    try {
      await EmailEventListener.processUserEvent('profile_updated', {
        email: userData.email,
        name: userData.name,
        id: userData.id
      });
    } catch (_error) {
      // Error handled silently
    }
  }

  /**
   * Interceptar eventos de acceso sospechoso
   */
  static async onSuspiciousLogin(userData: { 
    email: string; 
    name: string; 
    location: string; 
    userAgent: string; 
  }) {
    try {
      await EmailEventListener.processUserEvent('suspicious_login', {
        email: userData.email,
        name: userData.name,
        location: userData.location,
        userAgent: userData.userAgent
      });
    } catch (_error) {
      // Error handled silently
    }
  }
}

export default EmailMiddleware;
