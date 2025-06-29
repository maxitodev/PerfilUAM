import { EmailTemplateData } from '@/types/email';

export class EmailTemplates {
  /**
   * Template base para todos los emails - Diseño moderno con gradiente naranja
   */
  private static baseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PerfilUAM</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: #2d3748;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ff9a56 100%);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            margin: 0;
            padding: 20px 0;
            min-height: 100vh;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .email-wrapper {
            max-width: 680px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .header {
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #ff8c42 50%, #ff6b35 75%, #e55d75 100%);
            background-size: 200% 200%;
            animation: headerGradient 8s ease infinite;
            padding: 50px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes headerGradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
            0%, 100% { transform: translate(-20px, -20px) rotate(0deg); }
            50% { transform: translate(20px, 20px) rotate(180deg); }
        }
        
        .logo {
            font-size: 36px;
            font-weight: 700;
            color: white;
            margin-bottom: 8px;
            text-shadow: 0 4px 8px rgba(0,0,0,0.2);
            letter-spacing: -0.5px;
        }
        
        .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 400;
            margin: 0;
        }
        
        .content {
            padding: 50px 40px;
            background: white;
        }
        
        .content h2 {
            color: #1a202c;
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 24px;
            line-height: 1.3;
        }
        
        .content p {
            margin-bottom: 20px;
            color: #4a5568;
            font-size: 16px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            margin: 30px 0;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(255, 107, 53, 0.4);
            background: linear-gradient(135deg, #e55d32 0%, #de831b 100%);
        }
        
        .verification-code {
            background: linear-gradient(135deg, #fff5f0 0%, #fed7cc 100%);
            border: 2px solid #ff6b35;
            padding: 30px;
            text-align: center;
            font-size: 36px;
            font-weight: 700;
            color: #ff6b35;
            letter-spacing: 8px;
            margin: 30px 0;
            border-radius: 16px;
            box-shadow: 0 8px 25px rgba(255, 107, 53, 0.15);
            position: relative;
            overflow: hidden;
        }
        
        .verification-code::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        .info-card {
            background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
            border-left: 4px solid #38b2ac;
            padding: 24px;
            border-radius: 12px;
            margin: 25px 0;
            box-shadow: 0 4px 15px rgba(56, 178, 172, 0.1);
        }
        
        .warning-card {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-left: 4px solid #f59e0b;
            padding: 24px;
            border-radius: 12px;
            margin: 25px 0;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.1);
        }
        
        .danger-card {
            background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
            border-left: 4px solid #ef4444;
            padding: 24px;
            border-radius: 12px;
            margin: 25px 0;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.1);
        }
        
        .feature-list {
            list-style: none;
            padding: 0;
            margin: 25px 0;
        }
        
        .feature-list li {
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 16px;
            display: flex;
            align-items: center;
        }
        
        .feature-list li:last-child {
            border-bottom: none;
        }
        
        .feature-list li::before {
            content: '✨';
            margin-right: 12px;
            font-size: 18px;
        }
        
        .emoji-icon {
            font-size: 24px;
            margin-right: 12px;
        }
        
        .footer {
            background: linear-gradient(135deg, #f7fafc 0%, #e2e8f0 100%);
            padding: 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
            color: #718096;
            font-size: 14px;
            margin: 8px 0;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #ff6b35;
            text-decoration: none;
            font-weight: 500;
        }
        
        @media (max-width: 600px) {
            .email-wrapper {
                margin: 10px;
                border-radius: 16px;
            }
            
            .header, .content, .footer {
                padding: 30px 20px;
            }
            
            .logo {
                font-size: 28px;
            }
            
            .content h2 {
                font-size: 24px;
            }
            
            .verification-code {
                font-size: 28px;
                letter-spacing: 4px;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <h1 class="logo">PerfilUAM</h1>
            <p class="header-subtitle">Universidad Autónoma Metropolitana - Cuajimalpa</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <div class="social-links">
                <a href="#">Portal UAM</a>
                <a href="#">Soporte</a>
                <a href="#">Ayuda</a>
            </div>
            <p><strong>© 2025 PerfilUAM - UAM Cuajimalpa</strong></p>
            <p>Este es un correo automático generado por el sistema. Por favor no responder directamente.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Email de bienvenida para nuevos usuarios - Diseño moderno
   */
  static welcomeEmail(data: EmailTemplateData): string {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 64px;">🎉</span>
      </div>
      
      <h2>¡Bienvenido a la familia PerfilUAM!</h2>
      <p>Hola <strong style="color: #ff6b35;">${data.userName}</strong>,</p>
      
      <p>¡Estamos emocionados de tenerte en nuestra comunidad! PerfilUAM es mucho más que una plataforma de perfiles, es el lugar donde tu talento académico cobra vida y se conecta con oportunidades increíbles.</p>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">🌟</span>¿Qué puedes hacer aquí?</h3>
        <ul class="feature-list">
          <li>Crear un perfil académico que destaque tu potencial único</li>
          <li>Mostrar tus proyectos más innovadores y creativos</li>
          <li>Conectar con estudiantes, profesores y profesionales</li>
          <li>Descubrir oportunidades de colaboración y crecimiento</li>
          <li>Acceder a recursos exclusivos de la UAM Cuajimalpa</li>
        </ul>
      </div>
      
      <p>Tu cuenta está <strong style="color: #38a169;">✅ completamente activa</strong> y lista para personalizar. Es momento de mostrar al mundo lo increíble que eres.</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.profileUrl}" class="cta-button">🚀 Explorar mi perfil</a>
      </div>
      
      <div class="warning-card">
        <p style="margin: 0;"><span class="emoji-icon">💡</span><strong>Consejo pro:</strong> Completa tu perfil al 100% para aparecer en las primeras búsquedas y atraer más colaboraciones.</p>
      </div>
      
      <p>Si tienes preguntas o necesitas ayuda para comenzar, nuestro equipo está aquí para apoyarte en cada paso del camino.</p>
      
      <p style="font-size: 18px; color: #ff6b35; font-weight: 600;">¡Bienvenido a tu nueva aventura académica! 🎓</p>
      
      <p><strong>Con cariño,<br>El equipo de PerfilUAM 💙</strong></p>
    `;
    return this.baseTemplate(content);
  }

  /**
   * Email de verificación de cuenta - Diseño moderno y seguro
   */
  static verificationEmail(data: EmailTemplateData): string {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 64px;">🔐</span>
      </div>
      
      <h2>Verificación de seguridad</h2>
      <p>Hola <strong style="color: #ff6b35;">${data.userName}</strong>,</p>
      
      <p>Estás a solo un paso de completar tu registro en PerfilUAM. Para garantizar la seguridad de tu cuenta, necesitamos verificar que esta dirección de correo te pertenece.</p>
      
      <div class="info-card">
        <p style="margin: 0;"><span class="emoji-icon">🛡️</span><strong>Tu código de verificación seguro:</strong></p>
      </div>
      
      <div class="verification-code">${data.verificationCode}</div>
      
      <div class="warning-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">⏰</span>Información importante</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Vigencia:</strong> Este código expira en 15 minutos</li>
          <li><strong>Uso único:</strong> Solo puede ser utilizado una vez</li>
          <li><strong>Seguridad:</strong> Nunca compartas este código con nadie</li>
        </ul>
      </div>
      
      <p>Una vez verificada tu cuenta, tendrás acceso completo a:</p>
      <ul class="feature-list">
        <li>Panel de control personalizado</li>
        <li>Editor de perfil avanzado</li>
        <li>Gestión de proyectos</li>
        <li>Red de contactos académicos</li>
        <li>Notificaciones y actualizaciones</li>
      </ul>
      
      <div class="info-card">
        <p style="margin: 0;"><span class="emoji-icon">💡</span><strong>¿No solicitaste esta verificación?</strong> Si no creaste una cuenta en PerfilUAM, puedes ignorar este correo de forma segura. Tu información está protegida.</p>
      </div>
      
      <p><strong>Gracias por elegir PerfilUAM,<br>El equipo de seguridad 🔒</strong></p>
    `;
    return this.baseTemplate(content);
  }

  /**
   * Email para restablecer contraseña - Diseño moderno y seguro
   */
  static passwordResetEmail(data: EmailTemplateData): string {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 64px;">🔑</span>
      </div>
      
      <h2>Restablecimiento de contraseña</h2>
      <p>Hola <strong style="color: #ff6b35;">${data.userName}</strong>,</p>
      
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en PerfilUAM. No te preocupes, ¡esto pasa a los mejores! 😊</p>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">🛡️</span>Proceso seguro de restablecimiento</h3>
        <p style="margin: 0;">Hemos generado un enlace seguro y temporal para que puedas crear una nueva contraseña. Este enlace está encriptado y es único para tu cuenta.</p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.resetLink}" class="cta-button">🔐 Crear nueva contraseña</a>
      </div>
      
      <div class="warning-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">⚠️</span>Información de seguridad</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Vigencia:</strong> Este enlace expira en 1 hora por tu seguridad</li>
          <li><strong>Uso único:</strong> Solo puede ser utilizado una vez</li>
          <li><strong>Privacidad:</strong> Nunca compartas este enlace con terceros</li>
        </ul>
      </div>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">💡</span>Consejos para una contraseña segura</h3>
        <ul class="feature-list">
          <li>Usa al menos 8 caracteres</li>
          <li>Combina letras mayúsculas y minúsculas</li>
          <li>Incluye números y símbolos especiales</li>
          <li>Evita información personal obvia</li>
          <li>No reutilices contraseñas de otras cuentas</li>
        </ul>
      </div>
      
      <div class="danger-card">
        <p style="margin: 0;"><span class="emoji-icon">🚨</span><strong>¿No solicitaste este cambio?</strong> Si no fuiste tú quien solicitó restablecer la contraseña, ignora este correo. Tu cuenta permanece segura y tu contraseña actual sigue siendo válida.</p>
      </div>
      
      <p><strong>Cuidamos tu seguridad,<br>El equipo de PerfilUAM 🔒</strong></p>
    `;
    return this.baseTemplate(content);
  }

  /**
   * Email de notificación de nuevo proyecto - Diseño celebratorio
   */
  static projectNotificationEmail(data: EmailTemplateData): string {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 64px;">🚀</span>
      </div>
      
      <h2>¡Proyecto agregado exitosamente!</h2>
      <p>Hola <strong style="color: #ff6b35;">${data.userName}</strong>,</p>
      
      <p>¡Fantástico! Has dado un paso más hacia el éxito al agregar un nuevo proyecto a tu perfil en PerfilUAM. Tu portafolio académico sigue creciendo y eso es algo digno de celebrar. 🎉</p>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">📋</span>Detalles de tu nuevo proyecto</h3>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff6b35;">
          <p style="margin: 8px 0;"><strong>Nombre del proyecto:</strong></p>
          <h4 style="color: #ff6b35; margin: 8px 0; font-size: 20px;">${data.projectName}</h4>
          ${data.projectDescription ? `
            <p style="margin: 8px 0;"><strong>Descripción:</strong></p>
            <p style="color: #4a5568; margin: 8px 0; font-style: italic;">"${data.projectDescription}"</p>
          ` : ''}
        </div>
      </div>
      
      <div class="warning-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">🌟</span>¡Tu proyecto ya está en vivo!</h3>
        <ul class="feature-list">
          <li>Visible en tu perfil público</li>
          <li>Indexado en las búsquedas de la plataforma</li>
          <li>Disponible para colaboraciones</li>
          <li>Listo para recibir comentarios y valoraciones</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.profileUrl}" class="cta-button">👀 Ver mi perfil actualizado</a>
      </div>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">💡</span>Consejos para maximizar el impacto</h3>
        <ul class="feature-list">
          <li>Agrega imágenes o capturas de pantalla de tu proyecto</li>
          <li>Incluye las tecnologías y herramientas utilizadas</li>
          <li>Menciona los retos superados y aprendizajes obtenidos</li>
          <li>Conecta con otros estudiantes que trabajen en áreas similares</li>
          <li>Comparte tu proyecto en redes sociales académicas</li>
        </ul>
      </div>
      
      <p>Recuerda que cada proyecto que agregues no solo enriquece tu perfil, sino que también inspira a otros estudiantes y puede abrir puertas a nuevas oportunidades de colaboración y crecimiento profesional.</p>
      
      <p style="font-size: 18px; color: #ff6b35; font-weight: 600;">¡Sigue brillando y construyendo tu futuro! ⭐</p>
      
      <p><strong>Con orgullo por tus logros,<br>El equipo de PerfilUAM 🏆</strong></p>
    `;
    return this.baseTemplate(content);
  }

  /**
   * Email de alerta de seguridad - Diseño de alta prioridad
   */
  static securityAlertEmail(data: EmailTemplateData): string {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 64px;">�️</span>
      </div>
      
      <h2 style="color: #e53e3e;">Alerta de seguridad importante</h2>
      <p>Hola <strong style="color: #ff6b35;">${data.userName}</strong>,</p>
      
      <p>Nuestro sistema de seguridad ha detectado un intento de acceso a tu cuenta desde una ubicación o dispositivo que no reconocemos. Por tu protección, hemos bloqueado temporalmente este intento.</p>
      
      <div class="danger-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">🚨</span>Detalles del intento de acceso</h3>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 8px 0;"><strong>📍 Ubicación detectada:</strong></p>
          <p style="color: #e53e3e; font-weight: 600; margin: 8px 0;">${data.loginAttemptLocation}</p>
          
          <p style="margin: 8px 0;"><strong>🕐 Fecha y hora:</strong></p>
          <p style="color: #e53e3e; font-weight: 600; margin: 8px 0;">${data.loginAttemptTime}</p>
        </div>
      </div>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">✅</span>¿Fuiste tú?</h3>
        <p style="margin: 0;">Si reconoces este intento de acceso y eras tú intentando ingresar desde un nuevo dispositivo o ubicación, puedes ignorar esta alerta. Tu cuenta está segura.</p>
      </div>
      
      <div class="danger-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">⚠️</span>Si NO fuiste tú, actúa inmediatamente</h3>
        <p>Tu cuenta podría estar en riesgo. Sigue estos pasos de seguridad:</p>
        <ul class="feature-list" style="margin-top: 15px;">
          <li style="color: #e53e3e; font-weight: 600;">Cambia tu contraseña AHORA</li>
          <li>Revisa la actividad reciente de tu cuenta</li>
          <li>Verifica que tu información personal no haya sido modificada</li>
          <li>Cierra sesión en todos los dispositivos</li>
          <li>Contacta a nuestro equipo de soporte si tienes dudas</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.resetLink}" class="cta-button" style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); box-shadow: 0 8px 25px rgba(229, 62, 62, 0.3);">🔐 Cambiar contraseña ahora</a>
      </div>
      
      <div class="warning-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">🔒</span>Medidas de seguridad adicionales</h3>
        <ul class="feature-list">
          <li>Usa contraseñas únicas y complejas</li>
          <li>Activa la verificación en dos pasos cuando esté disponible</li>
          <li>No accedas a tu cuenta desde dispositivos públicos</li>
          <li>Mantén actualizado tu navegador y antivirus</li>
          <li>Reporta cualquier actividad sospechosa inmediatamente</li>
        </ul>
      </div>
      
      <div class="info-card">
        <p style="margin: 0;"><span class="emoji-icon">📞</span><strong>¿Necesitas ayuda?</strong> Nuestro equipo de seguridad está disponible 24/7 para asistirte. No dudes en contactarnos si tienes preguntas o necesitas apoyo adicional.</p>
      </div>
      
      <p>Tu seguridad es nuestra máxima prioridad. Trabajamos constantemente para proteger tu información y mantener PerfilUAM como un espacio seguro para toda la comunidad académica.</p>
      
      <p><strong>Cuidando tu seguridad,<br>El equipo de seguridad de PerfilUAM 🛡️</strong></p>
    `;
    return this.baseTemplate(content);
  }

  /**
   * Email de notificación de actualización de perfil - Diseño confirmatorio
   */
  static profileUpdateEmail(data: EmailTemplateData): string {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 64px;">✨</span>
      </div>
      
      <h2>¡Tu perfil ha sido actualizado!</h2>
      <p>Hola <strong style="color: #ff6b35;">${data.userName}</strong>,</p>
      
      <p>¡Excelente! Tus cambios han sido guardados exitosamente. Tu perfil en PerfilUAM acaba de recibir una actualización que lo hace aún más atractivo y profesional. 🎯</p>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">📅</span>Confirmación de actualización</h3>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #38a169;">
          <p style="margin: 8px 0;"><strong>Fecha de actualización:</strong></p>
          <p style="color: #38a169; font-weight: 600; margin: 8px 0;">${new Date().toLocaleString('es-MX', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p style="margin: 8px 0;"><strong>Estado:</strong> <span style="color: #38a169; font-weight: 600;">✅ Actualizado correctamente</span></p>
        </div>
      </div>
      
      <div class="warning-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">🌐</span>Tu perfil está en vivo</h3>
        <p>Los cambios ya son visibles para toda la comunidad de PerfilUAM:</p>
        <ul class="feature-list">
          <li>Visible en búsquedas de estudiantes y profesores</li>
          <li>Actualizado en el directorio académico</li>
          <li>Disponible para nuevas conexiones</li>
          <li>Indexado para oportunidades de colaboración</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.profileUrl}" class="cta-button">👁️ Ver mi perfil actualizado</a>
      </div>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">💡</span>Mantén tu perfil al día</h3>
        <p>Para maximizar tu visibilidad y oportunidades, te recomendamos:</p>
        <ul class="feature-list">
          <li>Actualizar tu información cada semestre</li>
          <li>Agregar nuevos proyectos y logros regularmente</li>
          <li>Revisar y actualizar tu biografía</li>
          <li>Mantener tu foto de perfil actual y profesional</li>
          <li>Conectar con compañeros y profesores activamente</li>
        </ul>
      </div>
      
      <div class="warning-card">
        <p style="margin: 0;"><span class="emoji-icon">🔒</span><strong>Seguridad:</strong> Si no realizaste estos cambios, contacta inmediatamente a nuestro equipo de soporte. Tu seguridad es importante para nosotros.</p>
      </div>
      
      <p>Gracias por mantener tu perfil actualizado y contribuir a hacer de PerfilUAM una comunidad académica vibrante y conectada.</p>
      
      <p style="font-size: 18px; color: #ff6b35; font-weight: 600;">¡Tu perfil se ve increíble! 🌟</p>
      
      <p><strong>Apoyando tu crecimiento académico,<br>El equipo de PerfilUAM 📚</strong></p>
    `;
    return this.baseTemplate(content);
  }

  /**
   * Email de notificación de mantenimiento - Diseño informativo
   */
  static maintenanceEmail(data: EmailTemplateData): string {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 64px;">🔧</span>
      </div>
      
      <h2>Mantenimiento programado del sistema</h2>
      <p>Hola <strong style="color: #ff6b35;">${data.userName || 'Usuario'}</strong>,</p>
      
      <p>Te informamos que realizaremos un mantenimiento programado en la plataforma PerfilUAM para mejorar tu experiencia y agregar nuevas funcionalidades emocionantes.</p>
      
      <div class="warning-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">📋</span>Detalles del mantenimiento</h3>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 8px 0;"><strong>⏱️ Duración estimada:</strong> <span style="color: #f59e0b; font-weight: 600;">2 horas aproximadamente</span></p>
          <p style="margin: 8px 0;"><strong>🎯 Objetivo:</strong> Mejoras de rendimiento y nuevas características</p>
          <p style="margin: 8px 0;"><strong>📱 Servicios afectados:</strong> Acceso completo a la plataforma</p>
          <p style="margin: 8px 0;"><strong>🔄 Tipo:</strong> Mantenimiento preventivo programado</p>
        </div>
      </div>
      
      <div class="danger-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">⏸️</span>Durante el mantenimiento</h3>
        <p>Los siguientes servicios estarán temporalmente no disponibles:</p>
        <ul class="feature-list">
          <li style="color: #e53e3e;">Acceso al portal de PerfilUAM</li>
          <li style="color: #e53e3e;">Edición de perfiles y proyectos</li>
          <li style="color: #e53e3e;">Registro de nuevos usuarios</li>
          <li style="color: #e53e3e;">Sistema de mensajería interna</li>
          <li style="color: #e53e3e;">Búsquedas y exploración de perfiles</li>
        </ul>
      </div>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">🚀</span>¿Qué estamos mejorando?</h3>
        <ul class="feature-list">
          <li>Velocidad de carga de perfiles</li>
          <li>Nuevas herramientas de búsqueda avanzada</li>
          <li>Interfaz más intuitiva y moderna</li>
          <li>Mejor sistema de notificaciones</li>
          <li>Funcionalidades de colaboración mejoradas</li>
        </ul>
      </div>
      
      <div class="warning-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">💡</span>Aprovecha este tiempo</h3>
        <p>Mientras realizamos las mejoras, puedes:</p>
        <ul class="feature-list">
          <li>Planear las actualizaciones que quieres hacer a tu perfil</li>
          <li>Preparar nuevos proyectos para agregar</li>
          <li>Revisar tus logros académicos recientes</li>
          <li>Conectar con compañeros en persona</li>
          <li>Explorar nuevas ideas para colaboraciones</li>
        </ul>
      </div>
      
      <div class="info-card">
        <h3 style="margin-top: 0; color: #2d3748;"><span class="emoji-icon">🔔</span>Te mantendremos informado</h3>
        <p style="margin: 0;">Una vez finalizado el mantenimiento, recibirás una notificación confirmando que todas las funciones están nuevamente disponibles. También publicaremos actualizaciones en nuestros canales oficiales.</p>
      </div>
      
      <p>Entendemos que las interrupciones pueden ser inconvenientes, pero estas mejoras asegurarán que PerfilUAM siga siendo la mejor plataforma para la comunidad académica de la UAM Cuajimalpa.</p>
      
      <p style="font-size: 18px; color: #ff6b35; font-weight: 600;">¡Gracias por tu paciencia y comprensión! 🙏</p>
      
      <p><strong>Trabajando para ti,<br>El equipo técnico de PerfilUAM ⚙️</strong></p>
    `;
    return this.baseTemplate(content);
  }
}
