// Tipos e interfaces compartidas entre cliente y servidor
export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export enum EmailType {
  WELCOME = 'welcome',
  VERIFICATION = 'verification',
  PASSWORD_RESET = 'password_reset',
  PROJECT_NOTIFICATION = 'project_notification',
  SECURITY_ALERT = 'security_alert',
  PROFILE_UPDATE = 'profile_update',
  MAINTENANCE = 'maintenance'
}

export interface EmailTemplateData {
  userName?: string;
  userEmail?: string;
  profileUrl?: string;
  projectName?: string;
  projectDescription?: string;
  verificationCode?: string;
  resetLink?: string;
  loginAttemptLocation?: string;
  loginAttemptTime?: string;
}
