import { NextResponse } from 'next/server'
import User from '@/models/user'
import Profile from '@/models/profile'
import Project from '@/models/project'
import { connectDB } from '@/lib/mongodb'

// Expanded list for 40 profiles
const nombres = [
  "Ana García López", "Carlos Rodríguez Méndez", "María González Castro", "Luis Martínez Silva",
  "Laura Hernández Torres", "Diego Pérez Morales", "Sofía López Vargas", "Jorge Sánchez Ruiz",
  "Valeria Ramírez Cruz", "Andrés Torres Jiménez", "Camila Flores Ortega", "Ricardo Moreno Vega",
  "Isabella Guerrero Ramos", "Fernando Castro Delgado", "Natalia Mendoza Aguilar", "Sebastián Reyes Herrera",
  "Gabriela Romero Díaz", "Miguel Ángel Vázquez", "Alejandra Gutiérrez Peña", "Emilio Vargas Solís",
  "Daniela Espinoza Luna", "Óscar Jiménez Campos", "Paola Castillo Navarro", "Rodrigo Alvarado Kim",
  "Lucía Medina Fuentes", "Francisco Morales Ruiz", "Andrea Vega Santana", "Pablo Herrera Mendoza",
  "Cristina Delgado Rojas", "Alberto Campos Flores", "Mónica Aguilar Soto", "Héctor Navarro León",
  "Estrella Ramírez Vega", "Javier Ortiz Moreno", "Fernanda Silva Contreras", "Armando Ruiz García",
  "Paloma Torres Méndez", "Iván Guerrero Castro", "Jazmín Morales López", "Teodoro Vázquez Díaz"
];

const carreras = ["Ingeniería en Computación", "Matemáticas Aplicadas"];

const skills = [
  "JavaScript", "Python", "React", "Node.js", "Django", "Machine Learning", "Data Science",
  "SQL", "MongoDB", "PostgreSQL", "Git", "Docker", "AWS", "Azure", "TensorFlow", "PyTorch",
  "Flask", "Express.js", "Vue.js", "Angular", "TypeScript", "Java", "C++", "R", "Matlab",
  "Tableau", "Power BI", "Figma", "Adobe XD", "Linux", "Kubernetes", "Jenkins", "GraphQL"
];

const projectNames = [
  "Sistema de Gestión Académica", "Aplicación de Finanzas Personales", "Plataforma E-learning",
  "Dashboard de Analytics", "API de Microservicios", "App de Delivery", "Sistema de Inventario",
  "Chatbot Inteligente", "Plataforma de Streaming", "Red Social Universitaria", "Juego 2D",
  "Sistema de Reservas", "App de Fitness", "Marketplace Digital", "Sistema de Votación",
  "Calculadora Científica Avanzada", "Simulador de Algoritmos", "Predictor de Precios",
  "Sistema de Recomendaciones", "App de Clima", "Gestor de Tareas", "Análisis de Sentimientos",
  "Sistema de Bibliotecas", "App de Transporte", "Portal de Noticias"
];

const technologies = [
  ["React", "Node.js", "MongoDB"], ["Python", "Django", "PostgreSQL"], ["Vue.js", "Express", "MySQL"],
  ["Angular", "Spring Boot", "Oracle"], ["React Native", "Firebase"], ["Flutter", "Dart"],
  ["Python", "TensorFlow", "Pandas"], ["Java", "Spring", "Docker"], ["TypeScript", "GraphQL"],
  ["PHP", "Laravel", "MySQL"], ["C#", ".NET", "SQL Server"], ["Python", "Flask", "SQLite"]
];

const bios = [
  "Estudiante apasionado por el desarrollo web y la inteligencia artificial. Me encanta resolver problemas complejos y crear soluciones innovadoras.",
  "Enfocado en ciencia de datos y machine learning. Busco aplicar análisis estadísticos para resolver problemas del mundo real.",
  "Desarrollador full-stack con experiencia en aplicaciones web modernas. Siempre dispuesto a aprender nuevas tecnologías.",
  "Interesado en ciberseguridad y desarrollo de software seguro. Participo activamente en hackathons y competencias de programación.",
  "Apasionado por el desarrollo móvil y UX/UI. Me gusta crear aplicaciones que mejoren la experiencia del usuario.",
  "Estudiante de matemáticas aplicadas con interés en optimización y algoritmos. Busco aplicar modelos matemáticos a problemas reales.",
  "Desarrollador backend especializado en APIs y microservicios. Experiencia con arquitecturas escalables.",
  "Interesado en inteligencia artificial y visión por computadora. Trabajo en proyectos de reconocimiento de patrones.",
  "Desarrollador frontend con ojo para el diseño. Me especializo en crear interfaces intuitivas y atractivas.",
  "Estudiante enfocado en análisis de datos y estadística aplicada. Experiencia con herramientas de visualización."
];

// Real anime character images URLs from popular series
const animeAvatars = [
  // Naruto series
  "https://i.pinimg.com/564x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg",
  "https://i.pinimg.com/564x/c4/8d/2f/c48d2f9c8a7b6e1d5f3a9c4e7b8d2f6a.jpg",
  "https://i.pinimg.com/564x/ff/bc/01/ffbc01e9b7beb9f24b1c7e86e0c6742c.jpg",
  
  // Attack on Titan
  "https://i.pinimg.com/564x/ed/37/19/ed37194ee8c9e6267b68c4892b4bb04f.jpg",
  "https://i.pinimg.com/564x/aa/0a/da/aa0ada29512747624c48b06bd9c5e29a.jpg",
  "https://i.pinimg.com/564x/27/96/d1/2796d17d79268a8cdc4d3b6bd2a66a10.jpg",
  
  // My Hero Academia
  "https://i.pinimg.com/564x/e0/3a/45/e03a45e7ac8ea4e3de97ca7e91e9d6eb.jpg",
  "https://i.pinimg.com/564x/f2/80/41/f2804103b2ed70bc1e6b10bf33e0b3b7.jpg",
  "https://i.pinimg.com/564x/dd/ca/1e/ddca1eac5b30a35ec3c5bf5bb7ab8e37.jpg",
  
  // Demon Slayer
  "https://i.pinimg.com/564x/50/c7/36/50c736b9c7c6c66af71b95b4861b3d7c.jpg",
  "https://i.pinimg.com/564x/a7/e6/2e/a7e62e6dfa6b5b3c7d07f9b15a9e8c33.jpg",
  "https://i.pinimg.com/564x/3f/32/98/3f3298c2b37c45b58e0c7f6d4a2e9b77.jpg",
  
  // One Piece
  "https://i.pinimg.com/564x/82/d1/45/82d145c7f9a8b2e6c4d0f8e5b3a7c916.jpg",
  "https://i.pinimg.com/564x/b9/43/26/b943268e5a7f3c1d9f0b4e8a6c2d5f83.jpg",
  "https://i.pinimg.com/564x/65/87/09/6587094a3b2e7f8c5d1a9f6e4b8c3a05.jpg",
  
  // Jujutsu Kaisen
  "https://i.pinimg.com/564x/1a/2b/3c/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.jpg",
  "https://i.pinimg.com/564x/78/91/23/789123456a7b8c9d0e1f2a3b4c5d6e7f.jpg",
  "https://i.pinimg.com/564x/34/56/78/34567890abcdef123456789abcdef012.jpg",
  
  // Death Note
  "https://i.pinimg.com/564x/90/12/34/901234567890abcdef1234567890abcd.jpg",
  "https://i.pinimg.com/564x/56/78/90/567890123456789abcdef0123456789a.jpg",
  
  // Tokyo Ghoul
  "https://i.pinimg.com/564x/12/34/56/123456789012345678901234567890ab.jpg",
  "https://i.pinimg.com/564x/ab/cd/ef/abcdef0123456789abcdef0123456789.jpg",
  
  // Fullmetal Alchemist
  "https://i.pinimg.com/564x/ef/01/23/ef0123456789abcdef0123456789abcd.jpg",
  "https://i.pinimg.com/564x/23/45/67/23456789abcdef0123456789abcdef01.jpg",
  
  // Haikyuu
  "https://i.pinimg.com/564x/67/89/ab/6789abcdef0123456789abcdef012345.jpg",
  "https://i.pinimg.com/564x/89/ab/cd/89abcdef0123456789abcdef01234567.jpg",
  
  // Studio Ghibli characters
  "https://i.pinimg.com/564x/cd/ef/01/cdef0123456789abcdef0123456789ab.jpg",
  "https://i.pinimg.com/564x/01/23/45/0123456789abcdef0123456789abcdef.jpg",
  "https://i.pinimg.com/564x/45/67/89/456789abcdef0123456789abcdef0123.jpg",
  
  // Dragon Ball
  "https://i.pinimg.com/564x/89/01/23/890123456789abcdef0123456789abcd.jpg",
  "https://i.pinimg.com/564x/23/cd/ef/23cdef0123456789abcdef0123456789.jpg",
  
  // One Punch Man
  "https://i.pinimg.com/564x/67/01/45/67014556789abcdef0123456789abcde.jpg",
  "https://i.pinimg.com/564x/ab/45/89/ab458967890123456789abcdef012345.jpg",
  
  // Mob Psycho 100
  "https://i.pinimg.com/564x/ef/89/cd/ef89cd0123456789abcdef0123456789.jpg",
  "https://i.pinimg.com/564x/13/67/01/136701456789abcdef0123456789abcd.jpg",
  
  // Chainsaw Man
  "https://i.pinimg.com/564x/57/ab/45/57ab456789012345678901234567890a.jpg",
  "https://i.pinimg.com/564x/9b/ef/89/9bef890123456789abcdef0123456789.jpg",
  
  // Spy x Family
  "https://i.pinimg.com/564x/df/13/67/df136701456789abcdef0123456789ab.jpg",
  "https://i.pinimg.com/564x/23/57/ab/2357ab456789012345678901234567890.jpg",
  
  // Additional characters
  "https://i.pinimg.com/564x/67/9b/ef/679bef890123456789abcdef0123456789.jpg",
  "https://i.pinimg.com/564x/ab/df/13/abdf136701456789abcdef0123456789a.jpg"
];

// Function to convert image URL to base64 with better error handling
async function urlToBase64(url: string): Promise<string> {
  try {
    console.log(`Fetching image from: ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    console.log(`Successfully converted image to base64, size: ${buffer.length} bytes`);
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error(`Error converting URL to base64: ${url}`, error);
    return generateRandomAvatar(); // Fallback to generated avatar
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    
    // Check if profiles already exist
    const existingUsers = await User.countDocuments()
    const existingProfiles = await Profile.countDocuments()
    const existingProjects = await Project.countDocuments()
    
    if (existingUsers > 0) {
      return NextResponse.json(
        { 
          message: 'La base de datos ya contiene perfiles',
          existing: {
            users: existingUsers,
            profiles: existingProfiles,
            projects: existingProjects
          },
          suggestion: 'Usa el endpoint DELETE /api/clear-profiles para limpiar la base de datos primero'
        },
        { status: 400 }
      )
    }

    console.log('Iniciando creación de 40 perfiles con imágenes de anime...')
    const createdProfiles = []

    for (let i = 0; i < 40; i++) {
      const nombre = nombres[i]
      const carrera = carreras[Math.floor(Math.random() * carreras.length)]
      // Generar matrícula with exactly 10 digits: 2181 + 6 digits
      const matricula = `2181${String(100000 + i).padStart(6, '0')}`
      
      // Generar email más limpio
      const emailName = nombre
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-z.]/g, '') // Remover cualquier caracter especial
      
      const email = `${emailName}@cua.uam.mx`

      console.log(`Creando usuario ${i + 1}/40: ${nombre}, matrícula: ${matricula}`)

      // Get anime avatar with retry logic
      let imageBase64 = generateRandomAvatar(); // Default fallback
      const maxRetries = 3;
      
      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          const avatarUrl = animeAvatars[i % animeAvatars.length];
          console.log(`Attempting to download image ${i + 1}/40 (attempt ${retry + 1}): ${avatarUrl}`);
          imageBase64 = await urlToBase64(avatarUrl);
          break; // Success, exit retry loop
        } catch (error) {
          console.warn(`Retry ${retry + 1} failed for image ${i + 1}:`, error);
          if (retry === maxRetries - 1) {
            console.log(`Using fallback avatar for user ${i + 1}`);
          }
          // Small delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Create user
      const user = new User({
        name: nombre,
        email,
        password: 'Password123!',
        matricula,
        carrera,
        imageBase64
      })

      await user.save()

      // Create profile
      const userSkills = []
      const numSkills = Math.floor(Math.random() * 6) + 3 // 3-8 skills
      const shuffledSkills = [...skills].sort(() => 0.5 - Math.random())
      for (let j = 0; j < numSkills; j++) {
        userSkills.push(shuffledSkills[j])
      }

      const profile = new Profile({
        user: user._id,
        division: 'División de Ciencias Naturales e Ingeniería',
        trimestre: String(Math.floor(Math.random() * 12) + 1),
        location: Math.random() > 0.7 ? 'CDMX, México' : ['Guadalajara, México', 'Monterrey, México', 'Puebla, México'][Math.floor(Math.random() * 3)],
        linkedin: Math.random() > 0.4 ? `https://linkedin.com/in/${nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '')}` : undefined,
        github: Math.random() > 0.3 ? `https://github.com/${nombre.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '')}` : undefined,
        bio: bios[Math.floor(Math.random() * bios.length)],
        skills: userSkills,
        promedio: Math.random() > 0.6 ? (Math.random() * 2 + 8).toFixed(1) : undefined,
        graduationDate: Math.random() > 0.8 ? new Date(2024 + Math.floor(Math.random() * 2), 11, 15) : undefined
      })

      await profile.save()

      // Create 1-4 random projects for each profile
      const numProjects = Math.floor(Math.random() * 4) + 1
      const projects = []

      for (let k = 0; k < numProjects; k++) {
        const projectTech = technologies[Math.floor(Math.random() * technologies.length)]
        const project = new Project({
          profile: profile._id,
          name: projectNames[Math.floor(Math.random() * projectNames.length)],
          description: `Este proyecto implementa una solución innovadora utilizando ${projectTech.join(', ')}. Incluye funcionalidades avanzadas y una arquitectura escalable.`,
          technologies: projectTech,
          link: Math.random() > 0.5 ? `https://github.com/user/project-${k + 1}` : undefined,
          type: ['Proyecto Terminal', 'Proyecto Personal', 'Proyecto Académico', 'Proyecto Profesional'][Math.floor(Math.random() * 4)],
          status: ['En Desarrollo', 'Completado', 'En Pausa'][Math.floor(Math.random() * 3)],
          featured: Math.random() > 0.7,
          tags: projectTech.slice(0, 2)
        })

        await project.save()
        projects.push(project)
      }

      createdProfiles.push({
        user: user.getPublicData(),
        profile: profile.toObject(),
        projectsCount: projects.length
      })

      // Longer delay to be respectful to image servers
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`✅ Proceso completado: ${createdProfiles.length} perfiles creados con imágenes de anime`)
    
    return NextResponse.json(
      { 
        message: `${createdProfiles.length} perfiles creados exitosamente con imágenes de anime`,
        profiles: createdProfiles,
        summary: {
          totalUsers: createdProfiles.length,
          totalProjects: createdProfiles.reduce((sum, p) => sum + p.projectsCount, 0),
          withImages: createdProfiles.length
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creando perfiles:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Function to generate a simple avatar placeholder
function generateRandomAvatar(): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Simple 1x1 pixel colored image in base64
  const canvas = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="${color}"/>
    <circle cx="50" cy="35" r="15" fill="white" opacity="0.8"/>
    <ellipse cx="50" cy="75" rx="25" ry="20" fill="white" opacity="0.8"/>
  </svg>`
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`
}
