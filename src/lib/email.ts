// Este archivo solo debe ejecutarse en el servidor
import { EmailTemplate } from '@/types/email';

// Función para importar SendGrid dinámicamente solo en el servidor
async function getSendGridMail() {
  if (typeof window !== 'undefined') {
    throw new Error('SendGrid no puede ejecutarse en el cliente');
  }
  
  const sgMail = await import('@sendgrid/mail');
  sgMail.default.setApiKey(process.env.SENDGRID_API_KEY!);
  return sgMail.default;
}

export class EmailService {
  static async send(template: EmailTemplate): Promise<boolean> {
    try {
      // Verificar que estamos en el servidor
      if (typeof window !== 'undefined') {
        throw new Error('EmailService solo puede ejecutarse en el servidor');
      }

      // Verificar variables de entorno
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY no está configurada');
      }
      if (!process.env.EMAIL_FROM) {
        throw new Error('EMAIL_FROM no está configurada');
      }
      if (!process.env.EMAIL_FROM_NAME) {
        throw new Error('EMAIL_FROM_NAME no está configurada');
      }

      const sgMail = await getSendGridMail();
      
      const msg = {
        to: template.to,
        from: {
          email: process.env.EMAIL_FROM,
          name: process.env.EMAIL_FROM_NAME,
        },
        subject: template.subject,
        html: template.html,
        text: template.text || this.htmlToText(template.html),
      };

      await sgMail.send(msg);
      return true;
    } catch (_error) {
      return false;
    }
  }

  static async sendMultiple(templates: EmailTemplate[]): Promise<boolean[]> {
    const results = await Promise.allSettled(
      templates.map(template => this.send(template))
    );
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }

  private static htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export default EmailService;
