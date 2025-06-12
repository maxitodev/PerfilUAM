import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializar OpenAI (necesitarás configurar tu API key)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { query, profiles } = await request.json();

    if (!query || !profiles || profiles.length === 0) {
      return NextResponse.json(
        { error: 'Query y profiles son requeridos' },
        { status: 400 }
      );
    }

    // Crear el prompt para OpenAI
    const prompt = `
Eres un asistente especializado en matching de perfiles técnicos para proyectos académicos y profesionales.
Tu tarea es analizar una consulta de búsqueda y recomendar los mejores perfiles de estudiantes que coincidan.

INSTRUCCIONES:
1. Analiza la consulta del usuario y extrae los requisitos clave
2. Evalúa cada perfil basándote en: habilidades, proyectos, carrera, descripción personal
3. Asigna una puntuación de relevancia (0-100) a cada perfil
4. Ordena por relevancia y devuelve máximo 10 resultados
5. Identifica palabras clave que coincidieron
6. Proporciona sugerencias para mejorar la búsqueda

CONSULTA DEL USUARIO: "${query}"

PERFILES DISPONIBLES:
${profiles.map((p, i) => `
PERFIL ${i + 1}:
- ID: ${p.id}
- Nombre: ${p.name}
- Carrera: ${p.career}
- Habilidades: ${p.skills.join(', ')}
- Biografía: ${p.bio}
- Proyectos: ${p.projects.map(proj => `${proj.name} (${proj.technologies.join(', ')}) - ${proj.description.substring(0, 100)}...`).join('; ')}
`).join('\n')}

Responde ÚNICAMENTE en formato JSON válido con esta estructura exacta:
{
  "recommendedIds": ["id1", "id2", "id3"],
  "insights": {
    "query": "${query}",
    "matchedSkills": ["skill1", "skill2"],
    "matchedProjects": ["project1", "project2"],
    "confidenceScore": 0.85,
    "suggestions": ["sugerencia1", "sugerencia2"]
  },
  "reasoning": "Explicación breve de por qué estos perfiles coinciden mejor con la consulta"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo más económico y rápido
      messages: [
        {
          role: "system",
          content: "Eres un experto en matching de perfiles técnicos. Responde siempre en JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Menos creatividad, más consistencia
      max_tokens: 1500,
      response_format: { type: "json_object" } // Fuerza respuesta JSON
    });

    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const result = JSON.parse(responseContent);
    
    // Validar la estructura de la respuesta
    if (!result.recommendedIds || !Array.isArray(result.recommendedIds)) {
      throw new Error('Formato de respuesta inválido');
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error en búsqueda inteligente:', error);
    
    // Si es un error de parsing JSON, intentar búsqueda básica
    if (error instanceof SyntaxError) {
      return fallbackSearch(request);
    }
    
    return NextResponse.json(
      { 
        error: 'Error en la búsqueda inteligente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Función de respaldo para búsqueda básica sin IA
async function fallbackSearch(request: NextRequest) {
  try {
    const { query, profiles } = await request.json();
    
    const searchTerms = query.toLowerCase().split(' ');
    
    const scoredProfiles = profiles.map((profile) => {
      let score = 0;
      const searchableText = [
        profile.name,
        profile.career,
        profile.bio,
        ...profile.skills,
        ...profile.projects.flatMap(p => [p.name, p.description, ...p.technologies])
      ].join(' ').toLowerCase();
      
      searchTerms.forEach(term => {
        const occurrences = (searchableText.match(new RegExp(term, 'g')) || []).length;
        score += occurrences;
      });
      
      return { ...profile, score };
    });
    
    const recommended = scoredProfiles
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(p => p.id);
    
    return NextResponse.json({
      recommendedIds: recommended,
      insights: {
        query,
        matchedSkills: [],
        matchedProjects: [],
        confidenceScore: 0.6,
        suggestions: ["Intenta ser más específico en tu búsqueda", "Incluye tecnologías específicas"]
      },
      reasoning: "Búsqueda básica por coincidencia de palabras clave (IA no disponible)"
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en búsqueda de respaldo' },
      { status: 500 }
    );
  }
}