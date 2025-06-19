'use client'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Profile {
  _id?: string
  division: string
  trimestre: string
  location: string
  linkedin?: string
  github?: string
  bio: string
  skills: string[]
  promedio: string
  graduationDate: string
  completionPercentage: number
  isActive: boolean
  tesinaLink?: string
  cvLink?: string
}

interface Project {
  _id?: string
  name: string
  description: string
  technologies: string[]
  link?: string
  type: string
  status: string
  isPublic: boolean
  featured: boolean
}

interface UserData {
  _id: string
  name: string
  email: string
  matricula: string
  carrera: string
  imageBase64?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form states
  const [profileForm, setProfileForm] = useState<Profile>({
    division: 'División de Ciencias Naturales e Ingeniería',
    trimestre: '',
    location: 'CDMX, México',
    linkedin: '',
    github: '',
    bio: '',
    skills: [],
    promedio: '',
    graduationDate: '',
    completionPercentage: 0,
    isActive: true,
    tesinaLink: '',
    cvLink: ''
  })
  
  const [newSkill, setNewSkill] = useState('')
  const [projectForm, setProjectForm] = useState<Project>({
    name: '',
    description: '',
    technologies: [],
    link: '',
    type: 'Proyecto Personal',
    status: 'En Desarrollo',
    isPublic: true,
    featured: false
  })
  const [newTechnology, setNewTechnology] = useState('')
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  
  // Image states
  const [newImageBase64, setNewImageBase64] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [updatingImage, setUpdatingImage] = useState(false)

  // Agregar estados para la mejora de biografía con IA
  const [improvingBio, setImprovingBio] = useState(false)
  const [improvedBio, setImprovedBio] = useState('')
  const [showImprovedBio, setShowImprovedBio] = useState(false)

  // Agregar estados para la mejora de descripción de proyecto con IA
  const [improvingProjectDescription, setImprovingProjectDescription] = useState(false)
  const [improvedProjectDescription, setImprovedProjectDescription] = useState('')
  const [showImprovedProjectDescription, setShowImprovedProjectDescription] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchUserData()
    }
  }, [status, router])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
        setHasProfile(data.hasProfile)
        
        if (data.hasProfile) {
          setProfile(data.profile)
          setProfileForm(data.profile)
          setProjects(data.projects || [])
        }
      } else {
        setError('Error al cargar los datos del perfil')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Error de conexión al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const url = hasProfile ? '/api/profile' : '/api/profile'
      const method = hasProfile ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setHasProfile(true)
        setSuccess(hasProfile ? 'Perfil actualizado exitosamente' : 'Perfil creado exitosamente')
        setTimeout(() => setSuccess(''), 3000)
        // Eliminado el scroll automático al mensaje
        // const messageElement = document.getElementById('profile-message')
        // if (messageElement) {
        //   messageElement.scrollIntoView({ behavior: 'smooth' })
        // }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al guardar el perfil')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setError('Error de conexión al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = editingProject ? `/api/profile/projects/${editingProject}` : '/api/profile/projects'
      const method = editingProject ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm)
      })

      if (response.ok) {
        const data = await response.json()
        if (editingProject) {
          setProjects(prev => prev.map(p => p._id === editingProject ? data.project : p))
          setSuccess('Proyecto actualizado exitosamente')
        } else {
          setProjects(prev => [...prev, data.project])
          setSuccess('Proyecto creado exitosamente')
        }
        
        resetProjectForm()
        setShowProjectForm(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al guardar el proyecto')
      }
    } catch (error) {
      console.error('Error saving project:', error)
      setError('Error de conexión al guardar proyecto')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return

    try {
      const response = await fetch(`/api/profile/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProjects(prev => prev.filter(p => p._id !== projectId))
        setSuccess('Proyecto eliminado exitosamente')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Error al eliminar el proyecto')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      setError('Error de conexión al eliminar proyecto')
    }
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      // Dividir por comas y limpiar cada habilidad
      const skills = newSkill
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
        .filter(skill => !profileForm.skills.includes(skill)) // Evitar duplicados

      if (skills.length > 0) {
        setProfileForm(prev => ({
          ...prev,
          skills: [...prev.skills, ...skills]
        }))
        setNewSkill('')
      }
    }
  }

  const removeSkill = (skill: string) => {
    setProfileForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const addTechnology = () => {
    if (newTechnology.trim()) {
      // Dividir por comas y limpiar cada tecnología
      const technologies = newTechnology
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0)
        .filter(tech => !projectForm.technologies.includes(tech)) // Evitar duplicados

      if (technologies.length > 0) {
        setProjectForm(prev => ({
          ...prev,
          technologies: [...prev.technologies, ...technologies]
        }))
        setNewTechnology('')
      }
    }
  }

  const removeTechnology = (tech: string) => {
    setProjectForm(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }

  const resetProjectForm = () => {
    setProjectForm({
      name: '',
      description: '',
      technologies: [],
      link: '',
      type: 'Proyecto Personal',
      status: 'En Desarrollo',
      isPublic: true,
      featured: false
    })
    setEditingProject(null)
  }

  const editProject = (project: Project) => {
    setProjectForm(project)
    setEditingProject(project._id || null)
    setShowProjectForm(true)
    setActiveTab('projects')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB')
        return
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const base64String = reader.result as string
        setNewImageBase64(base64String)
        setImagePreview(base64String)
        setError('')
      }
      reader.onerror = () => {
        setError('Error al leer la imagen')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpdate = async () => {
    if (!newImageBase64) return

    setUpdatingImage(true)
    setError('')

    try {
      const response = await fetch('/api/profile/image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: newImageBase64 })
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(prev => prev ? { ...prev, imageBase64: data.imageBase64 } : null)
        setNewImageBase64('')
        setImagePreview('')
        setSuccess('Imagen actualizada exitosamente')
        setTimeout(() => setSuccess(''), 3000)
        
        // Reset file input
        const fileInput = document.getElementById('profile-image-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al actualizar la imagen')
      }
    } catch (error) {
      console.error('Error updating image:', error)
      setError('Error de conexión al actualizar imagen')
    } finally {
      setUpdatingImage(false)
    }
  }

  const cancelImageUpdate = () => {
    setNewImageBase64('')
    setImagePreview('')
    const fileInput = document.getElementById('profile-image-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  // Función para mejorar biografía con IA
  const handleImproveBio = async () => {
    if (!profileForm.bio.trim()) {
      setError('Escribe primero tu biografía para poder mejorarla')
      return
    }

    setImprovingBio(true)
    setError('')

    try {
      const response = await fetch('/api/profile/improve-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: profileForm.bio,
          userInfo: {
            carrera: userData?.carrera,
            trimestre: profileForm.trimestre,
            division: profileForm.division,
            skills: profileForm.skills
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setImprovedBio(data.improvedBio)
        setShowImprovedBio(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al mejorar la biografía')
      }
    } catch (error) {
      console.error('Error improving bio:', error)
      setError('Error de conexión al mejorar biografía')
    } finally {
      setImprovingBio(false)
    }
  }

  // Función para aceptar la biografía mejorada
  const acceptImprovedBio = () => {
    setProfileForm(prev => ({ ...prev, bio: improvedBio }))
    setShowImprovedBio(false)
    setImprovedBio('')
    setSuccess('Biografía actualizada con IA')
    setTimeout(() => setSuccess(''), 3000)
  }

  // Función para rechazar la biografía mejorada
  const rejectImprovedBio = () => {
    setShowImprovedBio(false)
    setImprovedBio('')
  }

  // Función para mejorar descripción de proyecto con IA
  const handleImproveProjectDescription = async () => {
    if (!projectForm.description.trim()) {
      setError('Escribe primero la descripción del proyecto para poder mejorarla')
      return
    }

    setImprovingProjectDescription(true)
    setError('')

    try {
      const response = await fetch('/api/profile/improve-project-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: projectForm.description,
          projectInfo: {
            name: projectForm.name,
            type: projectForm.type,
            status: projectForm.status,
            technologies: projectForm.technologies
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setImprovedProjectDescription(data.improvedDescription)
        setShowImprovedProjectDescription(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al mejorar la descripción del proyecto')
      }
    } catch (error) {
      console.error('Error improving project description:', error)
      setError('Error de conexión al mejorar descripción del proyecto')
    } finally {
      setImprovingProjectDescription(false)
    }
  }

  // Función para aceptar la descripción de proyecto mejorada
  const acceptImprovedProjectDescription = () => {
    setProjectForm(prev => ({ ...prev, description: improvedProjectDescription }))
    setShowImprovedProjectDescription(false)
    setImprovedProjectDescription('')
    setSuccess('Descripción del proyecto actualizada con IA')
    setTimeout(() => setSuccess(''), 3000)
  }

  // Función para rechazar la descripción de proyecto mejorada
  const rejectImprovedProjectDescription = () => {
    setShowImprovedProjectDescription(false)
    setImprovedProjectDescription('')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4h4v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">DMAS - Perfil Profesional</h1>
                <p className="text-sm text-gray-600">Bienvenido, {userData?.name}</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-gray-900">DMAS</h1>
                <p className="text-xs text-gray-600 truncate max-w-[120px]">{userData?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                href="/"
                className="text-gray-600 hover:text-orange-600 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                Ver Estudiantes
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal para mostrar biografía mejorada */}
      {showImprovedBio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg sm:max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 mr-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Biografía Mejorada con IA</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Revisa y decide si quieres usar esta versión</p>
                  </div>
                </div>
                <button
                  onClick={rejectImprovedBio}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Biografía original */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Biografía Original
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{profileForm.bio}</p>
                    <div className="text-right text-xs text-gray-500 mt-2">
                      {profileForm.bio.length} caracteres
                    </div>
                  </div>
                </div>

                {/* Biografía mejorada */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mr-2"></span>
                    Biografía Mejorada por IA
                  </h4>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-gray-800 text-sm leading-relaxed font-medium">{improvedBio}</p>
                    <div className="text-right text-xs text-purple-600 mt-2">
                      {improvedBio.length} caracteres
                    </div>
                  </div>
                </div>

                {/* Mejoras detectadas */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mejoras Aplicadas
                  </h5>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Tono más profesional y estructurado</li>
                    <li>• Enfoque en fortalezas técnicas y académicas</li>
                    <li>• Lenguaje optimizado para reclutadores</li>
                    <li>• Mejor presentación de objetivos profesionales</li>
                  </ul>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={rejectImprovedBio}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  Mantener Original
                </button>
                <button
                  onClick={acceptImprovedBio}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Usar Biografía Mejorada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar descripción de proyecto mejorada */}
      {showImprovedProjectDescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg sm:max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 mr-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Descripción Mejorada con IA</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Revisa y decide si quieres usar esta versión</p>
                  </div>
                </div>
                <button
                  onClick={rejectImprovedProjectDescription}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Descripción original */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Descripción Original
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{projectForm.description}</p>
                    <div className="text-right text-xs text-gray-500 mt-2">
                      {projectForm.description.length} caracteres
                    </div>
                  </div>
                </div>

                {/* Descripción mejorada */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mr-2"></span>
                    Descripción Mejorada por IA
                  </h4>
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-4">
                    <p className="text-gray-800 text-sm leading-relaxed font-medium">{improvedProjectDescription}</p>
                    <div className="text-right text-xs text-green-600 mt-2">
                      {improvedProjectDescription.length} caracteres
                    </div>
                  </div>
                </div>

                {/* Mejoras detectadas */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-teal-800 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mejoras Aplicadas
                  </h5>
                  <ul className="text-xs text-teal-700 space-y-1">
                    <li>• Tono más técnico y profesional</li>
                    <li>• Mejor estructura y claridad</li>
                    <li>• Enfoque en competencias demostradas</li>
                    <li>• Descripción del valor e impacto del proyecto</li>
                  </ul>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={rejectImprovedProjectDescription}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  Mantener Original
                </button>
                <button
                  onClick={acceptImprovedProjectDescription}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Usar Descripción Mejorada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Información Personal</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'projects'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Proyectos ({projects.length})</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Messages */}
          {activeTab === 'projects' && (error || success) && (
            <div className="p-6 border-b border-gray-200">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-green-700 font-medium">{success}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-8">
                {/* User Basic Info */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Image */}
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Foto de Perfil</label>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Vista previa"
                                className="w-full h-full object-cover"
                              />
                            ) : userData?.imageBase64 ? (
                              <img
                                src={userData.imageBase64}
                                alt="Foto de perfil"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-200 to-orange-300">
                                <svg className="w-16 h-16 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {(imagePreview || updatingImage) && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                              {updatingImage ? (
                                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <div className="text-white text-xs font-medium">Vista previa</div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full max-w-xs space-y-3">
                          <div className="relative">
                            <input
                              id="profile-image-input"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <button
                              type="button"
                              className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Seleccionar Imagen
                            </button>
                          </div>
                          
                          <p className="text-xs text-gray-500 text-center leading-relaxed">
                            Formatos: JPG, PNG, GIF<br/>
                            Tamaño máximo: 5MB<br/>
                            Recomendado: 400x400px
                          </p>
                          
                          {newImageBase64 && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                type="button"
                                onClick={handleImageUpdate}
                                disabled={updatingImage}
                                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                {updatingImage ? 'Guardando...' : 'Guardar Imagen'}
                              </button>
                              <button
                                type="button"
                                onClick={cancelImageUpdate}
                                disabled={updatingImage}
                                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                        <input
                          type="text"
                          value={userData?.name || ''}
                          disabled
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Esta información se obtiene de tu cuenta de Google</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Matrícula</label>
                          <input
                            type="text"
                            value={userData?.matricula || ''}
                            disabled
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Carrera</label>
                          <input
                            type="text"
                            value={userData?.carrera || ''}
                            disabled
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                        <input
                          type="email"
                          value={userData?.email || ''}
                          disabled
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Esta información se obtiene de tu cuenta de Google</p>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Academic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Académica</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">División</label>
                      <input
                        type="text"
                        value={profileForm.division}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, division: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="División de Ciencias Naturales e Ingeniería"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trimestre Actual</label>
                      <select
                        value={profileForm.trimestre}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, trimestre: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="" className="text-gray-500">Selecciona tu trimestre</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1} className="text-gray-900">{i + 1}° Trimestre</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="CDMX, México"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn (opcional)</label>
                      <input
                        type="url"
                        value={profileForm.linkedin}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, linkedin: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="https://linkedin.com/in/tu-perfil"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GitHub (opcional)</label>
                      <input
                        type="url"
                        value={profileForm.github}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, github: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="https://github.com/tu-usuario"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CV (opcional)</label>
                      <input
                        type="url"
                        value={profileForm.cvLink}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvLink: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="https://drive.google.com/tu-cv.pdf"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tesina (opcional)</label>
                      <input
                        type="url"
                        value={profileForm.tesinaLink}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, tesinaLink: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="https://drive.google.com/tu-tesina.pdf"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Puedes usar Google Drive, Dropbox, GitHub o cualquier otro servicio de almacenamiento
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio con mejora IA */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Biografía Profesional</label>
                    <button
                      type="button"
                      onClick={handleImproveBio}
                      disabled={improvingBio || !profileForm.bio.trim()}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {improvingBio ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Mejorando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span>Mejorar con IA</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 350)
                      setProfileForm(prev => ({ ...prev, bio: value }))
                    }}
                    rows={4}
                    maxLength={350}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    placeholder="Escribe una breve descripción sobre ti, tus intereses y objetivos profesionales..."
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Tip: Escribe tu biografía y usa el botón "Mejorar con IA" para una versión más profesional
                    </p>
                    <div className="text-sm text-gray-500">
                      {profileForm.bio.length}/350 caracteres
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Habilidades Técnicas</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profileForm.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-200 hover:bg-orange-300 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Ej: JavaScript, React, Python, Node.js (separadas por comas)"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Puedes agregar múltiples habilidades separándolas con comas
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {saving ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Guardando...</span>
                      </div>
                    ) : (
                      hasProfile ? 'Actualizar Perfil' : 'Crear Perfil'
                    )}
                  </button>
                </div>
                {/* Success or Error Message */}
                <div id="profile-message" className="mt-4">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-red-700 font-medium">{error}</p>
                      </div>
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-green-700 font-medium">{success}</p>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                {/* Projects Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Mis Proyectos</h3>
                  <button
                    onClick={() => setShowProjectForm(!showProjectForm)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
                  >
                    {showProjectForm ? 'Cancelar' : 'Nuevo Proyecto'}
                  </button>
                </div>

                {/* Project Form */}
                {showProjectForm && (
                  <form onSubmit={handleProjectSubmit} className="bg-gray-50 rounded-2xl p-6 space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Proyecto</label>
                        <input
                          type="text"
                          value={projectForm.name}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Proyecto</label>
                        <select
                          value={projectForm.type}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, type: e.target.value }))
                          }
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                          <option value="Proyecto Terminal" className="text-gray-900">Proyecto Terminal</option>
                          <option value="Proyecto Personal" className="text-gray-900">Proyecto Personal</option>
                          <option value="Proyecto Académico" className="text-gray-900">Proyecto Académico</option>
                          <option value="Proyecto Profesional" className="text-gray-900">Proyecto Profesional</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                        <select
                          value={projectForm.status}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, status: e.target.value }))
                          }
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                          <option value="En Desarrollo" className="text-gray-900">En Desarrollo</option>
                          <option value="Completado" className="text-gray-900">Completado</option>
                          <option value="En Pausa" className="text-gray-900">En Pausa</option>
                          <option value="Cancelado" className="text-gray-900">Cancelado</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <button
                          type="button"
                          onClick={handleImproveProjectDescription}
                          disabled={improvingProjectDescription || !projectForm.description.trim()}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {improvingProjectDescription ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Mejorando...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <span>Mejorar con IA</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        value={projectForm.description}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 350)
                          setProjectForm(prev => ({ ...prev, description: value }))
                        }}
                        rows={4}
                        maxLength={350}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                        placeholder="Describe detalladamente tu proyecto, sus objetivos, funcionalidades y tecnologías utilizadas..."
                        required
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          Tip: Escribe la descripción y usa el botón "Mejorar con IA" para una versión más técnica
                        </p>
                        <div className="text-sm text-gray-500">
                          {projectForm.description.length}/350 caracteres
                        </div>
                      </div>
                    </div>

                    {/* Technologies */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tecnologías</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {projectForm.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeTechnology(tech)}
                              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newTechnology}
                          onChange={(e) => setNewTechnology(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Ej: React, Node.js, MongoDB, TypeScript (separadas por comas)"
                        />
                        <button
                          type="button"
                          onClick={addTechnology}
                          className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                        >
                          Agregar
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Puedes agregar múltiples tecnologías separándolas con comas
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enlace del Proyecto (opcional)</label>
                      <input
                        type="url"
                        value={projectForm.link}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, link: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="https://github.com/usuario/proyecto"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-blue-900 mb-3">Configuración de Visibilidad</h5>
                        <div className="space-y-3">
                          <label className="flex items-start">
                            <input
                              type="checkbox"
                              checked={projectForm.isPublic}
                              onChange={(e) => setProjectForm(prev => ({ ...prev, isPublic: e.target.checked }))
                              }
                              className="mr-3 mt-0.5 rounded text-orange-500 focus:ring-orange-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700">Proyecto público</span>
                              <p className="text-xs text-gray-500 mt-1">
                                Permite que otros usuarios vean este proyecto en tu perfil público
                              </p>
                            </div>
                          </label>
                          
                          <label className="flex items-start">
                            <input
                              type="checkbox"
                              checked={projectForm.featured}
                              onChange={(e) => setProjectForm(prev => ({ ...prev, featured: e.target.checked }))
                              }
                              className="mr-3 mt-0.5 rounded text-orange-500 focus:ring-orange-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700">Proyecto destacado</span>
                              <p className="text-xs text-gray-500 mt-1">
                                Marca este proyecto como destacado para que aparezca de forma prominente en tu perfil
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          resetProjectForm()
                          setShowProjectForm(false)
                        }}
                        className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Guardando...' : editingProject ? 'Actualizar' : 'Crear Proyecto'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Projects List */}
                <div className="grid gap-6">
                  {projects.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-lg font-medium mb-2">No tienes proyectos aún</p>
                      <p>Agrega tu primer proyecto para mostrar tu experiencia</p>
                    </div>
                  ) : (
                    projects.map((project) => (
                    <div key={project._id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              project.status === 'Completado' ? 'bg-green-100 text-green-800' :
                              project.status === 'En Desarrollo' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {project.type}
                            </span>
                            {project.featured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                ⭐ Destacado
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                          <button
                            onClick={() => editProject(project)}
                            className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id!)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 break-words">
                        {project.description}
                      </p>
                      
                      {project.technologies.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Tecnologías:</h4>
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {project.link && (
                        <div className="pt-4 border-t border-gray-100">
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 break-all"
                          >
                            <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="truncate">Ver proyecto</span>
                          </a>
                        </div>
                      )}
                    </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}