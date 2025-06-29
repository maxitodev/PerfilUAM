import { NextResponse } from 'next/server'
import User from '@/models/user'
import { connectDB } from '@/lib/mongodb'
import { EmailAutomation } from '@/lib/email-automation'

export async function POST(request: Request) {
  try {
    const { name, email, password, imageBase64, matricula, carrera } = await request.json()
    
    if (!name || !email || !password || !matricula || !carrera) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios son requeridos' },
        { status: 400 }
      )
    }

    // Validar correo institucional UAM
    if (!email.includes('@cua.uam.mx')) {
      return NextResponse.json(
        { error: 'Debes usar tu correo institucional de la UAM (@cua.uam.mx)' },
        { status: 400 }
      )
    }

    // Validar matrícula (10 dígitos)
    if (!/^\d{10}$/.test(matricula)) {
      return NextResponse.json(
        { error: 'La matrícula debe tener exactamente 10 dígitos' },
        { status: 400 }
      )
    }

    // Validar carrera
    const carrerasValidas = ['Ingeniería en Computación', 'Matemáticas Aplicadas']
    if (!carrerasValidas.includes(carrera)) {
      return NextResponse.json(
        { error: 'Carrera no válida' },
        { status: 400 }
      )
    }

    // Validar imagen base64 si se proporciona
    if (imageBase64 && !imageBase64.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Formato de imagen no válido' },
        { status: 400 }
      )
    }
    
    await connectDB()
    
    // Verificar si el usuario ya existe por email
    const existingUserByEmail = await User.findOne({ email })
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este correo electrónico' },
        { status: 400 }
      )
    }

    // Verificar si la matrícula ya existe
    const existingUserByMatricula = await User.findOne({ matricula })
    if (existingUserByMatricula) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con esta matrícula' },
        { status: 400 }
      )
    }
    
    // Crear nuevo usuario (el password se hashea automáticamente)
    const user = new User({
      name,
      email,
      password,
      imageBase64: imageBase64 || '',
      matricula,
      carrera
    })
    
    await user.save()
    
    console.log(`Usuario registrado exitosamente: ${user.email}`);
    
    // Enviar email de bienvenida de forma asíncrona
    console.log(`Intentando enviar email de bienvenida a: ${user.email}`);
    EmailAutomation.onUserRegistration(user.email, user.name)
      .then(() => {
        console.log(`Email de bienvenida enviado exitosamente a: ${user.email}`);
      })
      .catch(error => {
        console.error('Error enviando email de bienvenida:', error);
        console.error('Stack trace:', error.stack);
      });
    
    // No devolver la contraseña ni la imagen base64 completa
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, imageBase64: _imageBase64, ...userWithoutSensitiveData } = user.toObject()
    
    return NextResponse.json(
      { 
        message: 'Usuario creado exitosamente', 
        user: {
          ...userWithoutSensitiveData,
          hasImage: !!imageBase64
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en registro:', error)
    
    // Manejar errores específicos de MongoDB
    if (error instanceof Error) {
      if (error.message.includes('E11000') && error.message.includes('email')) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este correo electrónico' },
          { status: 400 }
        )
      }
      if (error.message.includes('E11000') && error.message.includes('matricula')) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con esta matrícula' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}