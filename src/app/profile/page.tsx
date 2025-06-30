'use client'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Estados separados para mensajes específicos
  const [basicInfoError, setBasicInfoError] = useState('')
  const [basicInfoSuccess, setBasicInfoSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  
  // Estado para información básica editable
  const [basicInfoForm, setBasicInfoForm] = useState({
    name: '',
    matricula: '',
    carrera: ''
  })
  
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
  const [updatingImage, setUpdatingImage] = useState(false)

  // Agregar estados para la mejora de biografía con IA
  const [improvingBio, setImprovingBio] = useState(false)
  const [improvedBio, setImprovedBio] = useState('')
  const [showImprovedBio, setShowImprovedBio] = useState(false)

  // Agregar estados para la mejora de descripción de proyecto con IA
  const [improvingProjectDescription, setImprovingProjectDescription] = useState(false)
  const [improvedProjectDescription, setImprovedProjectDescription] = useState('')
  const [showImprovedProjectDescription, setShowImprovedProjectDescription] = useState(false)

  // Estado para controlar el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleAuth = async () => {
      if (status === 'loading') {
        return // Mantener loading true mientras NextAuth está cargando
      }
      
      if (status === 'unauthenticated') {
        setIsInitializing(false)
        setLoading(false)
        setIsRedirecting(true)
        
        // Pequeño delay antes de redireccionar para mostrar mensaje
        setTimeout(() => {
          router.push('/login')
        }, 500)
        return
      }
      
      if (status === 'authenticated') {
        try {
          await fetchUserData()
        } catch (error) {
          console.error('Error during authentication:', error)
          setError('Error al cargar el perfil')
          setLoading(false)
        } finally {
          setIsInitializing(false)
        }
      }
    }

    handleAuth()
  }, [status, router])

  // Effect para detectar el parámetro tab en la URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['profile', 'projects'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Effect para cerrar el menú móvil al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isMobileMenuOpen && !target.closest('header')) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Effect para cerrar el menú móvil cuando se presiona Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isMobileMenuOpen])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
        setHasProfile(data.hasProfile)
        
        // Inicializar formulario de información básica
        setBasicInfoForm({
          name: data.user?.name || '',
          matricula: data.user?.matricula || '',
          carrera: data.user?.carrera || ''
        })
        
        if (data.hasProfile) {
          setProfileForm(data.profile)
          setProjects(data.projects || [])
        }
        
        // Pequeño delay para asegurar una transición suave
        await new Promise(resolve => setTimeout(resolve, 300))
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
    setProfileError('')
    setProfileSuccess('')

    try {
      const url = hasProfile ? '/api/profile' : '/api/profile'
      const method = hasProfile ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      })

      if (response.ok) {
        setHasProfile(true)
        setProfileSuccess(hasProfile ? 'Perfil actualizado exitosamente' : 'Perfil creado exitosamente')
        setTimeout(() => setProfileSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setProfileError(errorData.error || 'Error al guardar el perfil')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setProfileError('Error de conexión al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleBasicInfoUpdate = async () => {
    setSaving(true)
    setBasicInfoError('')
    setBasicInfoSuccess('')

    try {
      const response = await fetch('/api/profile/basic-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicInfoForm)
      })

      if (response.ok) {
        const data = await response.json()
        // Preservar la imagen existente al actualizar información básica
        setUserData(prev => ({
          ...data.user,
          imageBase64: prev?.imageBase64 || data.user.imageBase64
        }))
        setBasicInfoSuccess('Información básica actualizada exitosamente')
        setTimeout(() => setBasicInfoSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setBasicInfoError(errorData.error || 'Error al actualizar la información básica')
      }
    } catch (error) {
      console.error('Error updating basic info:', error)
      setBasicInfoError('Error de conexión al actualizar información básica')
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 10MB antes de compresión)
      if (file.size > 10 * 1024 * 1024) {
        setError('La imagen debe ser menor a 10MB')
        return
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen')
        return
      }

      setError('')
      setUpdatingImage(true)
      
      try {
        // Comprimir imagen
        const compressionResult = await compressImage(file, 400, 0.85)
        let finalCompressionResult = compressionResult
        
        // Verificar tamaño final (máximo 2MB después de compresión)
        if (compressionResult.compressedSize > 2 * 1024 * 1024) {
          // Si aún es muy grande, comprimir más
          finalCompressionResult = await compressImage(file, 300, 0.7)
        }
        
        // Guardar imagen automáticamente
        const response = await fetch('/api/profile/image', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: finalCompressionResult.dataUrl })
        })

        if (response.ok) {
          setSuccess('Imagen actualizada exitosamente - Recargando página...')
          
          // Reset file input
          const fileInput = document.getElementById('profile-image-input') as HTMLInputElement
          if (fileInput) fileInput.value = ''
          
          // Recargar la página después de un breve delay para mostrar el mensaje de éxito
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Error al actualizar la imagen')
        }
        
      } catch {
        setError('Error al procesar la imagen. Intenta con otra imagen.')
      } finally {
        setUpdatingImage(false)
      }
    }
  }

  // Función para comprimir imagen usando canvas
  // Función para comprimir imagen de forma profesional
  const compressImage = async (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<{
    dataUrl: string
    originalSize: number
    compressedSize: number
    compressionRatio: number
  }> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = document.createElement('img') as HTMLImageElement

      img.onload = () => {
        // Calcular dimensiones manteniendo proporción
        let { width, height } = img
        
        // Redimensionar si es necesario
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height
            height = maxWidth
          }
        }

        canvas.width = width
        canvas.height = height

        // Configurar alta calidad de renderizado
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convertir a base64 con compresión
          try {
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
            
            // Verificar que la compresión fue efectiva
            const originalSize = file.size
            const compressedSize = Math.round((compressedDataUrl.length * 3) / 4) // Aproximar tamaño base64
            const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100)
            

            
            resolve({
              dataUrl: compressedDataUrl,
              originalSize,
              compressedSize,
              compressionRatio
            })
          } catch {
            reject(new Error('Error al comprimir la imagen'))
          }
        } else {
          reject(new Error('No se pudo obtener el contexto del canvas'))
        }
      }

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'))
      }

      // Crear URL temporal para la imagen
      const imageUrl = URL.createObjectURL(file)
      img.src = imageUrl
      
      // Limpiar URL temporal después de cargar
      const originalOnload = img.onload
      img.onload = () => {
        URL.revokeObjectURL(imageUrl)
        if (originalOnload) originalOnload.call(img, new Event('load'))
      }
    })
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

  if (status === 'loading' || loading || isInitializing || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-orange-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-blue-200/20 rounded-full blur-lg animate-pulse animation-delay-300"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-200/20 rounded-full blur-xl animate-pulse animation-delay-700"></div>
          <div className="absolute bottom-32 right-1/3 w-12 h-12 bg-green-200/30 rounded-full blur-lg animate-pulse animation-delay-500"></div>
        </div>

        <div className="text-center z-10 max-w-md mx-auto px-6">
          {/* Logo animado */}
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
              <svg className="w-10 h-10 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4h4v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
              </svg>
            </div>
            {/* Anillo de carga alrededor del logo */}
            <div className="absolute inset-0 w-24 h-24 mx-auto -top-2 -left-2">
              <div className="w-full h-full border-4 border-orange-200/50 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            {/* Segundo anillo para efecto más dinámico */}
            <div className="absolute inset-0 w-28 h-28 mx-auto -top-4 -left-4">
              <div className="w-full h-full border-2 border-orange-300/30 border-b-orange-400 rounded-full animate-spin reverse-spin"></div>
            </div>
          </div>

          {/* Título con animación */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              DMAS - Perfil Profesional
            </h1>
            
            {/* Mensaje dinámico de carga */}
            <div className="space-y-3">
              <p className="text-lg text-gray-600 font-medium">
                {status === 'loading' && '🔐 Verificando autenticación...'}
                {status === 'authenticated' && isInitializing && '🚀 Iniciando sesión...'}
                {status === 'authenticated' && !isInitializing && loading && '👤 Cargando tu perfil...'}
                {isRedirecting && '🔄 Redirigiendo al login...'}
              </p>
              
              {/* Barra de progreso animada mejorada */}
              <div className="relative w-full bg-gray-200 rounded-full h-3 mx-auto max-w-xs overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 h-full rounded-full transform origin-left animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent h-full rounded-full animate-bounce"></div>
              </div>
              
              {/* Texto adicional */}
              <p className="text-sm text-gray-500 italic">
                {isRedirecting ? '🔐 Te llevamos al login' : '✨ Preparando tu experiencia personalizada'}
              </p>
            </div>
          </div>

          {/* Indicadores de carga modernos */}
          <div className="flex justify-center items-center space-x-3 mt-8">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-bounce shadow-lg"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-gradient-to-r from-orange-600 to-red-500 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>

          {/* Mensaje de espera adicional para casos de carga lenta */}
          {loading && !isRedirecting && (
            <div className="mt-6 animate-fade-in">
              <p className="text-xs text-gray-400">
                Si esto toma mucho tiempo, verifica tu conexión a internet
              </p>
            </div>
          )}

          {/* Mensaje de error si hay algún problema */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
              >
                Recargar página
              </button>
            </div>
          )}
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
            {/* Logo y título */}
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
            
            {/* Navigation for desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 px-4 py-2 rounded-lg transition-colors group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Ver Estudiantes</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>

            {/* Hamburger button for mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300"
                aria-expanded="false"
              >
                <span className="sr-only">Abrir menú principal</span>
                {/* Hamburger icon */}
                <svg
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} w-6 h-6`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* Close icon */}
                <svg
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} w-6 h-6`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar from right */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4h4v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">DMAS</h2>
                <p className="text-xs sm:text-sm text-gray-600">Menú Principal</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-all duration-200"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Profile info */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-md flex-shrink-0">
                {userData?.imageBase64 ? (
                  <Image
                    src={userData.imageBase64}
                    alt="Foto de perfil"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-200 to-orange-300">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{userData?.name}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{userData?.email}</p>
                <p className="text-xs sm:text-sm text-orange-600 font-medium truncate">{userData?.carrera}</p>
              </div>
            </div>
          </div>

          {/* Navigation menu */}
          <div className="flex-1 p-4 sm:p-6 space-y-2 sm:space-y-3 overflow-y-auto">
            <Link 
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 sm:space-x-4 text-gray-700 hover:text-orange-600 hover:bg-orange-50 p-3 sm:p-4 rounded-xl transition-all duration-300 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-orange-100 group-hover:to-orange-200 transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors text-sm sm:text-base">Ver Estudiantes</div>
                <div className="text-xs sm:text-sm text-gray-500 truncate">Explorar perfiles de la comunidad</div>
              </div>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-orange-500 transition-all duration-300 transform group-hover:translate-x-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-200 my-3 sm:my-4"></div>

            {/* Tab navigation dentro del sidebar */}
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 sm:px-4">Mi Perfil</p>
              
              <button
                onClick={() => {
                  setActiveTab('profile')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl transition-all duration-300 group ${
                  activeTab === 'profile'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-orange-200 text-orange-700'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-orange-200 group-hover:text-orange-600'
                }`}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-sm sm:text-base">Información Personal</div>
                  <div className="text-xs sm:text-sm opacity-70 truncate">Datos y biografía</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('projects')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl transition-all duration-300 group ${
                  activeTab === 'projects'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  activeTab === 'projects'
                    ? 'bg-orange-200 text-orange-700'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-orange-200 group-hover:text-orange-600'
                }`}>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-sm sm:text-base">Proyectos</div>
                  <div className="text-xs sm:text-sm opacity-70 truncate">{projects.length} proyectos</div>
                </div>
                {projects.length > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">
                    {projects.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Footer del sidebar */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                signOut({ callbackUrl: '/' })
              }}
              className="w-full flex items-center space-x-3 sm:space-x-4 text-red-600 hover:text-red-700 hover:bg-red-50 p-3 sm:p-4 rounded-xl transition-all duration-300 group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-100 to-red-200 rounded-lg flex items-center justify-center group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300 flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors text-sm sm:text-base">Cerrar Sesión</div>
                <div className="text-xs sm:text-sm text-gray-500 truncate">Salir de forma segura</div>
              </div>
            </button>
          </div>
        </div>
      </div>

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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={rejectImprovedBio}
                  className="px-4 py-3 sm:px-6 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm sm:text-base"
                >
                  Mantener Original
                </button>
                <button
                  onClick={acceptImprovedBio}
                  className="px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={rejectImprovedProjectDescription}
                  className="px-4 py-3 sm:px-6 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm sm:text-base"
                >
                  Mantener Original
                </button>
                <button
                  onClick={acceptImprovedProjectDescription}
                  className="px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                  Usar Descripción Mejorada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-3 sm:px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">Información Personal</span>
                  <span className="sm:hidden">Perfil</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'projects'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="hidden sm:inline">Proyectos ({projects.length})</span>
                  <span className="sm:hidden">Proyectos</span>
                  {projects.length > 0 && (
                    <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                      {projects.length}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>

          {/* Messages */}
          {activeTab === 'projects' && (error || success) && (
            <div className="p-4 sm:p-6 border-b border-gray-200">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-xl mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
                  </div>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-green-700 font-medium text-sm sm:text-base">{success}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6 sm:space-y-8">
                {/* User Basic Info */}
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Información Básica</h3>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                    {/* Profile Image */}
                    <div className="xl:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Foto de Perfil</label>
                      <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                        <div className="relative">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                            {userData?.imageBase64 ? (
                              <Image
                                src={userData.imageBase64}
                                alt="Foto de perfil"
                                width={128}
                                height={128}
                                className="w-full h-full object-cover"
                                unoptimized={true}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-200 to-orange-300">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {updatingImage && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                                <div className="text-white text-xs font-medium">Guardando...</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full max-w-xs space-y-2 sm:space-y-3">
                          <div className="relative">
                            <input
                              id="profile-image-input"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              disabled={updatingImage}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <button
                              type="button"
                              disabled={updatingImage}
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                              {updatingImage ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Procesando...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <span className="hidden sm:inline">{userData?.imageBase64 ? 'Cambiar Imagen' : 'Subir Imagen'}</span>
                                  <span className="sm:hidden">{userData?.imageBase64 ? 'Cambiar' : 'Subir'}</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          <p className="text-xs text-gray-500 text-center">
                            JPG, PNG, GIF • Máximo 10MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="xl:col-span-2 space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900">Información Personal</h4>
                        <button
                          type="button"
                          onClick={handleBasicInfoUpdate}
                          disabled={saving}
                          className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors self-start sm:self-auto"
                        >
                          {saving ? 'Guardando...' : 'Actualizar Info'}
                        </button>
                      </div>

                      {/* Mensajes de éxito/error para información básica */}
                      {(basicInfoError || basicInfoSuccess) && (
                        <div className="mt-3 sm:mt-4">
                          {basicInfoError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-700 text-xs sm:text-sm font-medium">{basicInfoError}</p>
                              </div>
                            </div>
                          )}
                          {basicInfoSuccess && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-green-700 text-xs sm:text-sm font-medium">{basicInfoSuccess}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                        <input
                          type="text"
                          value={basicInfoForm.name}
                          onChange={(e) => setBasicInfoForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                          placeholder="Tu nombre completo"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Matrícula</label>
                          <input
                            type="text"
                            value={basicInfoForm.matricula}
                            onChange={(e) => setBasicInfoForm(prev => ({ ...prev, matricula: e.target.value }))}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                            placeholder="1234567890"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            title="La matrícula debe tener exactamente 10 dígitos"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">10 dígitos numéricos</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Carrera</label>
                          <select
                            value={basicInfoForm.carrera}
                            onChange={(e) => setBasicInfoForm(prev => ({ ...prev, carrera: e.target.value }))}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                            required
                          >
                            <option value="">Selecciona tu carrera</option>
                            <option value="Ingeniería en Computación">Ingeniería en Computación</option>
                            <option value="Matemáticas Aplicadas">Matemáticas Aplicadas</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                        <input
                          type="email"
                          value={userData?.email || ''}
                          disabled
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 cursor-not-allowed text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1">Esta información se obtiene de tu cuenta de Google y no se puede modificar</p>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Academic Info */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Información Académica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">División</label>
                      <input
                        type="text"
                        value={profileForm.division}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, division: e.target.value }))
                        }
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
                        placeholder="División de Ciencias Naturales e Ingeniería"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trimestre Actual</label>
                      <select
                        value={profileForm.trimestre}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, trimestre: e.target.value }))
                        }
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
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
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Información de Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))
                        }
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
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
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
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
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
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
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
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
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2 sm:gap-0">
                    <label className="block text-sm font-medium text-gray-700">Biografía Profesional</label>
                    <button
                      type="button"
                      onClick={handleImproveBio}
                      disabled={improvingBio || !profileForm.bio.trim()}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none self-start sm:self-auto"
                    >
                      {improvingBio ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Mejorando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="hidden sm:inline">Mejorar con IA</span>
                          <span className="sm:hidden">IA</span>
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
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                    placeholder="Escribe una breve descripción sobre ti, tus intereses y objetivos profesionales..."
                    required
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-1 sm:gap-0">
                    <p className="text-xs text-gray-500">
                      Tip: Escribe tu biografía y usa el botón &ldquo;Mejorar con IA&rdquo; para una versión más profesional
                    </p>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {profileForm.bio.length}/350 caracteres
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Habilidades Técnicas</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                    {profileForm.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-orange-100 text-orange-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 sm:ml-2 inline-flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-200 hover:bg-orange-300 transition-colors"
                        >
                          <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="Ej: JavaScript, React, Python, Node.js (separadas por comas)"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors text-sm sm:text-base font-medium"
                    >
                      Agregar
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Puedes agregar múltiples habilidades separándolas con comas
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 sm:pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                  >
                    {saving ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Guardando...</span>
                      </div>
                    ) : (
                      hasProfile ? 'Actualizar Perfil' : 'Crear Perfil'
                    )}
                  </button>
                </div>

                {/* Mensajes de éxito/error para el perfil */}
                {(profileError || profileSuccess) && (
                  <div className="mt-3 sm:mt-4">
                    {profileError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-red-700 text-xs sm:text-sm font-medium">{profileError}</p>
                        </div>
                      </div>
                    )}
                    {profileSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-green-700 text-xs sm:text-sm font-medium">{profileSuccess}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Projects Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Mis Proyectos</h3>
                  <button
                    onClick={() => setShowProjectForm(!showProjectForm)}
                    className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors text-sm sm:text-base font-medium"
                  >
                    {showProjectForm ? 'Cancelar' : 'Nuevo Proyecto'}
                  </button>
                </div>

                {/* Project Form */}
                {showProjectForm && (
                  <form onSubmit={handleProjectSubmit} className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                      {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Proyecto</label>
                        <input
                          type="text"
                          value={projectForm.name}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
                          placeholder="Ej: Sistema de Gestión Universitaria"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Proyecto</label>
                        <select
                          value={projectForm.type}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, type: e.target.value }))
                          }
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
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
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
                        >
                          <option value="En Desarrollo" className="text-gray-900">En Desarrollo</option>
                          <option value="Completado" className="text-gray-900">Completado</option>
                          <option value="En Pausa" className="text-gray-900">En Pausa</option>
                          <option value="Cancelado" className="text-gray-900">Cancelado</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2 sm:gap-0">
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <button
                          type="button"
                          onClick={handleImproveProjectDescription}
                          disabled={improvingProjectDescription || !projectForm.description.trim()}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none self-start sm:self-auto"
                        >
                          {improvingProjectDescription ? (
                            <>
                              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Mejorando...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <span className="hidden sm:inline">Mejorar con IA</span>
                              <span className="sm:hidden">IA</span>
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
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                        placeholder="Describe detalladamente tu proyecto, sus objetivos, funcionalidades y tecnologías utilizadas..."
                        required
                      />
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-1 sm:gap-0">
                        <p className="text-xs text-gray-500">
                          Tip: Escribe la descripción y usa el botón &ldquo;Mejorar con IA&rdquo; para una versión más técnica
                        </p>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {projectForm.description.length}/350 caracteres
                        </div>
                      </div>
                    </div>

                    {/* Technologies */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tecnologías</label>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                        {projectForm.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeTechnology(tech)}
                              className="ml-1 sm:ml-2 inline-flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-200 hover:bg-blue-300 transition-colors"
                            >
                              <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                          placeholder="Ej: React, Node.js, MongoDB, TypeScript (separadas por comas)"
                        />
                        <button
                          type="button"
                          onClick={addTechnology}
                          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors text-sm sm:text-base font-medium"
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
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
                        placeholder="https://github.com/usuario/proyecto"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
                        <h5 className="text-sm font-semibold text-blue-900 mb-2 sm:mb-3">Configuración de Visibilidad</h5>
                        <div className="space-y-2 sm:space-y-3">
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

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          resetProjectForm()
                          setShowProjectForm(false)
                        }}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl transition-colors text-sm sm:text-base font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl transition-colors text-sm sm:text-base font-medium"
                      >
                        {saving ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Guardando...</span>
                          </div>
                        ) : (
                          editingProject ? 'Actualizar' : 'Crear Proyecto'
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Projects List */}
                <div className="grid gap-4 sm:gap-6">
                  {projects.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No tienes proyectos aún</p>
                      <p className="text-sm sm:text-base">Agrega tu primer proyecto para mostrar tu experiencia</p>
                    </div>
                  ) : (
                    projects.map((project) => (
                    <div key={project._id} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{project.name}</h3>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
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
                        
                        <div className="flex flex-row lg:flex-col gap-2 shrink-0 self-start">
                          <button
                            onClick={() => editProject(project)}
                            className="flex-1 lg:flex-none px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id!)}
                            className="flex-1 lg:flex-none px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-center"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed break-words">
                        {project.description}
                      </p>
                      
                      {project.technologies.length > 0 && (
                        <div className="mb-3 sm:mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Tecnologías:</h4>
                          <div className="flex flex-wrap gap-1 sm:gap-1.5">
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
                        <div className="pt-3 sm:pt-4 border-t border-gray-100">
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline break-all"
                          >
                            <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="max-w-full truncate">Ver proyecto</span>
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