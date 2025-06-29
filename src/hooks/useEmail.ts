import { useState } from 'react';
import { EmailType, EmailTemplateData } from '@/types/email';

export type EmailData = EmailTemplateData;

export interface UseEmailReturn {
  sending: boolean;
  error: string | null;
  success: boolean;
  sendEmail: (type: EmailType, email: string, data: EmailData) => Promise<boolean>;
  sendVerificationEmail: (email: string, userName: string, verificationCode: string) => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  clearStatus: () => void;
}

export const useEmail = (): UseEmailReturn => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clearStatus = () => {
    setError(null);
    setSuccess(false);
  };

  const sendEmail = async (type: EmailType, email: string, data: EmailData): Promise<boolean> => {
    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          email,
          data,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        return true;
      } else {
        setError(result.error || 'Error al enviar el email');
        return false;
      }
    } catch (error) {
      console.error('Error enviando email:', error);
      setError('Error de conexión al enviar el email');
      return false;
    } finally {
      setSending(false);
    }
  };

  const sendVerificationEmail = async (
    email: string,
    userName: string,
    verificationCode: string
  ): Promise<boolean> => {
    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/emails/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userName,
          verificationCode,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        return true;
      } else {
        setError(result.error || 'Error al enviar el código de verificación');
        return false;
      }
    } catch (error) {
      console.error('Error enviando código de verificación:', error);
      setError('Error de conexión al enviar el código de verificación');
      return false;
    } finally {
      setSending(false);
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/emails/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        return true;
      } else {
        setError(result.error || 'Error al enviar el enlace de restablecimiento');
        return false;
      }
    } catch (error) {
      console.error('Error enviando enlace de restablecimiento:', error);
      setError('Error de conexión al enviar el enlace de restablecimiento');
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    sending,
    error,
    success,
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    clearStatus,
  };
};
