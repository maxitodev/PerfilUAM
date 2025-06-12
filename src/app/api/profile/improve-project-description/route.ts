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

    const { description, projectInfo } = await request.json()
    
    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Se requiere una descripción para mejorar' },
        { status: 400 }
      )
    }

    const prompt = `
Eres un asistente especializado en escribir descripciones de proyectos para estudiantes universitarios.

Información del proyecto:
- Nombre: ${projectInfo?.name || 'No especificado'}
- Tipo: ${projectInfo?.type || 'No especificado'}
- Estado: ${projectInfo?.status || 'No especificado'}
- Tecnologías: ${projectInfo?.technologies?.join(', ') || 'No especificadas'}

Descripción actual:
"${description}"

Por favor, mejora esta descripción del proyecto siguiendo estos criterios:
1. Mantén un tono profesional y técnico
2. Destaca las características principales del proyecto
3. Menciona el valor o impacto del proyecto
4. Incluye objetivos claros y resultados alcanzados
5. Hazla concisa y estrictamente de máximo 300 caracteres (no más de 300)
6. Usa un lenguaje técnico apropiado para el área de estudio
7. Enfócate en las competencias demostradas
8. Mantén la esencia original pero mejórala

Devuelve SOLO la descripción mejorada, sin explicaciones adicionales.
    `.trim()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un experto en redacción de descripciones de proyectos técnicos para estudiantes universitarios. Siempre respondes con descripciones claras, profesionales y enfocadas en el valor técnico del proyecto."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 120, // ajustado para ~300 caracteres
      temperature: 0.7
    })

    const improvedDescription = completion.choices[0]?.message?.content?.trim()

    // Limitar estrictamente a 300 caracteres
    const improvedDescriptionCapped = improvedDescription && improvedDescription.length > 300
      ? improvedDescription.slice(0, 350)
      : improvedDescription

    if (!improvedDescriptionCapped) {
      return NextResponse.json(
        { error: 'No se pudo generar una mejora para la descripción' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      originalDescription: description,
      improvedDescription: improvedDescriptionCapped,
      message: 'Descripción mejorada exitosamente'
    })

  } catch (error) {
    console.error('Error improving project description:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Error de configuración de IA. Contacta al administrador.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor al mejorar descripción' },
      { status: 500 }
    )
  }
}
