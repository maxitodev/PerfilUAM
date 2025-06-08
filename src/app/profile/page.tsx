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
    if (newSkill.trim() && !profileForm.skills.includes(newSkill.trim())) {
      setProfileForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setProfileForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const addTechnology = () => {
    if (newTechnology.trim() && !projectForm.technologies.includes(newTechnology.trim())) {
      setProjectForm(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }))
      setNewTechnology('')
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
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4h4v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DMAS - Perfil Profesional</h1>
                <p className="text-sm text-gray-600">Bienvenido, {userData?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/students"
                className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-lg transition-colors"
              >
                Ver Estudiantes
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Banner */}
        {hasProfile && profile && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Completitud del Perfil</h2>
                <p className="text-orange-100">
                  Tu perfil está {profile.completionPercentage}% completo
                </p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${profile.completionPercentage * 0.88} 88`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{profile.completionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
          {(error || success) && (
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
                  
                  {/* Profile Image Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">Imagen de Perfil</label>
                    <div className="flex items-start space-x-6">
                      {/* Current Image */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="Vista previa de imagen de perfil" 
                              className="w-full h-full object-cover"
                            />
                          ) : userData?.imageBase64 ? (
                            <img 
                              src={userData.imageBase64} 
                              alt="Imagen de perfil actual" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                              <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Image Upload Controls */}
                      <div className="flex-1">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="profile-image-input" className="block text-sm font-medium text-gray-700 mb-2">
                              {userData?.imageBase64 || imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
                            </label>
                            <div className="relative">
                              <input
                                id="profile-image-input"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all cursor-pointer">
                                <div className="flex items-center justify-center space-x-3">
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-600">
                                    Seleccionar imagen
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG o WEBP hasta 5MB. Recomendado: 400x400px
                            </p>
                          </div>
                          
                          {/* Image Action Buttons */}
                          {imagePreview && (
                            <div className="flex space-x-3">
                              <button
                                type="button"
                                onClick={handleImageUpdate}
                                disabled={updatingImage}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingImage ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Guardando...</span>
                                  </div>
                                ) : (
                                  'Guardar imagen'
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={cancelImageUpdate}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <input
                        type="text"
                        value={userData?.name || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-gray-800 font-medium cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={userData?.email || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-gray-800 font-medium cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Matrícula</label>
                      <input
                        type="text"
                        value={userData?.matricula || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-gray-800 font-medium cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Carrera</label>
                      <input
                        type="text"
                        value={userData?.carrera || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-gray-800 font-medium cursor-not-allowed"
                      />
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

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biografía Profesional</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))
                    }
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    placeholder="Escribe una breve descripción sobre ti, tus intereses y objetivos profesionales..."
                    required
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {profileForm.bio.length}/500 caracteres
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
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Agregar habilidad (ej: JavaScript, Python, React...)"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      <textarea
                        value={projectForm.description}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))
                        }
                        rows={4}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                        required
                      />
                    </div>

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
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newTechnology}
                          onChange={(e) => setNewTechnology(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="Agregar tecnología"
                        />
                        <button
                          type="button"
                          onClick={addTechnology}
                          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                        >
                          Agregar
                        </button>
                      </div>
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
                      <div key={project._id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                              {project.featured && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                  Destacado
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                project.status === 'Completado' ? 'bg-green-100 text-green-800' :
                                project.status === 'En Desarrollo' ? 'bg-blue-100 text-blue-800' :
                                project.status === 'En Pausa' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {project.status}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{project.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.technologies.map((tech, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  {tech}
                                </span>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Tipo: {project.type}</span>
                              {project.link && (
                                <a 
                                  href={project.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  <span>Ver proyecto</span>
                                </a>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => editProject(project)}
                              className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => project._id && handleDeleteProject(project._id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
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
