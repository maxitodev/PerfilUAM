import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { bio, userInfo } = await request.json()
    
    if (!bio || bio.trim().length === 0) {
      return NextResponse.json(
        { error: 'Se requiere una biografía para mejorar' },
        { status: 400 }
      )
    }

    const prompt = `
Eres un asistente especializado en escribir biografías profesionales para estudiantes universitarios.

Información del estudiante:
- Carrera: ${userInfo?.carrera || 'No especificada'}
- Trimestre: ${userInfo?.trimestre || 'No especificado'}
- División: ${userInfo?.division || 'No especificada'}
- Habilidades: ${userInfo?.skills?.join(', ') || 'No especificadas'}

Biografía actual:
"${bio}"

Por favor, mejora esta biografía profesional siguiendo estos criterios:
1. Mantén un tono profesional pero cercano
2. Destaca las fortalezas académicas y técnicas
3. Incluye aspiraciones profesionales realistas
4. Hazla concisa y estrictamente de máximo 300 caracteres (no más de 300)
5. Usa un lenguaje positivo
6. Enfócate en el potencial y crecimiento profesional
7. Mantén la esencia original pero mejórala

Devuelve SOLO la biografía mejorada, sin explicaciones adicionales.
    `.trim()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un experto en redacción de biografías profesionales para estudiantes universitarios. Siempre respondes con biografías concisas, profesionales y enfocadas en el potencial del estudiante."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 120, // ajustado para ~300 caracteres
      temperature: 0.7
    })

    const improvedBio = completion.choices[0]?.message?.content?.trim()

    // Limitar estrictamente a 350 caracteres
    const improvedBioCapped = improvedBio && improvedBio.length > 300
      ? improvedBio.slice(0, 350)
      : improvedBio

    if (!improvedBioCapped) {
      return NextResponse.json(
        { error: 'No se pudo generar una mejora para la biografía' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      originalBio: bio,
      improvedBio: improvedBioCapped,
      message: 'Biografía mejorada exitosamente'
    })

  } catch (error) {
    console.error('Error improving bio:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Error de configuración de IA. Contacta al administrador.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor al mejorar biografía' },
      { status: 500 }
    )
  }
}