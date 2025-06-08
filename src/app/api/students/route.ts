import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import Profile from '@/models/profile'
import Project from '@/models/project'

// GET - Obtener todos los perfiles públicos de estudiantes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const carrera = searchParams.get('carrera')
    const trimestre = searchParams.get('trimestre')
    const skills = searchParams.get('skills')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')

    console.log('=== DEBUGGING STUDENTS API ===')
    console.log('Search params:', { carrera, trimestre, skills, page, limit, search })

    await connectDB()
    console.log('Database connected')

    // Si hay parámetros de búsqueda, usar la funcionalidad de filtros
    if (carrera || trimestre || skills || search || page > 1) {
      console.log('Using filtered search')
      return await getFilteredStudents(request)
    }

    // Primero, verificar cuántos perfiles y usuarios hay
    const totalProfiles = await Profile.countDocuments()
    const totalUsers = await User.countDocuments()
    const activeProfiles = await Profile.countDocuments({ isActive: true })
    const activeUsers = await User.countDocuments({ isActive: true })
    
    console.log('Database counts:', {
      totalProfiles,
      totalUsers,
      activeProfiles,
      activeUsers
    })

    // Buscar todos los perfiles activos primero sin populate
    const rawProfiles = await Profile.find({ isActive: true }).lean()
    console.log('Raw profiles found:', rawProfiles.length)
    console.log('Sample raw profile:', rawProfiles[0])

    // Buscar todos los perfiles activos y poblar la información del usuario
    const profiles = await Profile.find({ isActive: true })
      .populate({
        path: 'user',
        select: 'name email matricula carrera imageBase64 isActive'
      })
      .lean()
    
    console.log('Profiles found after populate:', profiles.length)
    console.log('Sample profile after populate:', profiles[0])
    
    // Verificar cada perfil individualmente
    profiles.forEach((profile, index) => {
      console.log(`Profile ${index}:`, {
        hasUser: !!profile.user,
        userId: profile.user,
        profileId: profile._id
      })
    })
    
    // Filtrar perfiles que tienen usuario válido (después del populate)
    const validProfiles = profiles.filter(profile => profile.user && typeof profile.user === 'object')
    
    console.log('Valid profiles after filtering:', validProfiles.length)
    
    if (validProfiles.length === 0) {
      console.log('No valid profiles found, checking user references...')
      
      // Verificar manualmente los usuarios referenciados
      const userIds = rawProfiles.map(p => p.user)
      console.log('User IDs from profiles:', userIds)
      
      const users = await User.find({ _id: { $in: userIds }, isActive: true }).lean()
      console.log('Users found:', users.length)
      console.log('Sample user:', users[0])
    }
    
    // Obtener proyectos públicos para cada perfil
    const profilesWithProjects = await Promise.all(
      validProfiles.map(async (profile: any) => {
        const projects = await Project.find({ 
          profile: profile._id, 
          isPublic: true 
        })
        .select('name description technologies type status featured')
        .lean()
        
        console.log(`Projects for profile ${profile._id}:`, projects.length)
        
        return {
          _id: profile._id,
          user: {
            name: profile.user.name,
            email: profile.user.email,
            matricula: profile.user.matricula,
            carrera: profile.user.carrera,
            imageBase64: profile.user.imageBase64
          },
          division: profile.division,
          trimestre: profile.trimestre,
          location: profile.location,
          linkedin: profile.linkedin || '',
          github: profile.github || '',
          bio: profile.bio,
          skills: profile.skills || [],
          cvLink: profile.cvLink || '',
          tesinaLink: profile.tesinaLink || '',
          completionPercentage: profile.completionPercentage || 0,
          projects: projects.map((p: any) => ({
            _id: p._id,
            name: p.name,
            description: p.description,
            technologies: p.technologies || [],
            type: p.type,
            status: p.status,
            featured: p.featured || false
          }))
        }
      })
    )
    
    // Ordenar por porcentaje de completitud y nombre
    const sortedProfiles = profilesWithProjects.sort((a, b) => {
      if (b.completionPercentage !== a.completionPercentage) {
        return b.completionPercentage - a.completionPercentage
      }
      return a.user.name.localeCompare(b.user.name)
    })
    
    console.log('Final profiles to return:', sortedProfiles.length)
    console.log('Sample final profile:', sortedProfiles[0])
    
    const response = {
      profiles: sortedProfiles,
      total: sortedProfiles.length,
      debug: {
        totalProfiles,
        totalUsers,
        activeProfiles,
        activeUsers,
        rawProfilesFound: rawProfiles.length,
        profilesAfterPopulate: profiles.length,
        validProfiles: validProfiles.length,
        finalProfiles: sortedProfiles.length
      }
    }
    
    console.log('API Response:', response)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching student profiles:', error)
    return NextResponse.json(
      { 
        error: 'Error al cargar perfiles de estudiantes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Función auxiliar para manejar búsquedas con filtros
async function getFilteredStudents(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const carrera = searchParams.get('carrera')
    const trimestre = searchParams.get('trimestre')
    const skills = searchParams.get('skills')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')

    // Construir filtros para perfiles
    const profileFilters: any = { isActive: true }
    if (trimestre) profileFilters.trimestre = trimestre
    if (skills) {
      const skillArray = skills.split(',')
      profileFilters.skills = { $in: skillArray }
    }

    // Buscar perfiles y poblar usuarios
    let profileQuery = Profile.find(profileFilters)
      .populate({
        path: 'user',
        select: 'name email matricula carrera imageBase64 isActive',
        match: { 
          isActive: true,
          ...(carrera && { carrera }),
          ...(search && {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          })
        }
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ completionPercentage: -1, createdAt: -1 })

    const profiles = await profileQuery.lean()
    
    // Filtrar perfiles que tienen usuario válido (después del populate y match)
    const validProfiles = profiles.filter((profile: any) => profile.user)

    // Obtener proyectos para cada perfil
    const profilesWithProjects = await Promise.all(
      validProfiles.map(async (profile: any) => {
        const projects = await Project.find({ 
          profile: profile._id, 
          isPublic: true 
        }).limit(3).sort({ featured: -1, createdAt: -1 }).lean()

        return {
          _id: profile._id,
          user: {
            name: profile.user.name,
            email: profile.user.email,
            matricula: profile.user.matricula,
            carrera: profile.user.carrera,
            imageBase64: profile.user.imageBase64
          },
          division: profile.division,
          trimestre: profile.trimestre,
          location: profile.location,
          linkedin: profile.linkedin || '',
          github: profile.github || '',
          bio: profile.bio,
          skills: profile.skills,
          cvLink: profile.cvLink || '',
          tesinaLink: profile.tesinaLink || '',
          completionPercentage: profile.completionPercentage,
          projects: projects.map((p: any) => ({
            _id: p._id,
            name: p.name,
            description: p.description,
            technologies: p.technologies,
            type: p.type,
            status: p.status,
            featured: p.featured
          }))
        }
      })
    )

    // Contar total para paginación
    const totalCount = await Profile.countDocuments(profileFilters)

    return NextResponse.json({
      profiles: profilesWithProjects,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      filters: {
        carrera,
        trimestre,
        skills,
        search
      }
    })
  } catch (error) {
    console.error('Error al obtener estudiantes filtrados:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
