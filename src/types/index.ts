import { Document, Types } from 'mongoose'

export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  password: string
  imageBase64?: string
  matricula: string
  carrera: 'Ingeniería en Computación' | 'Matemáticas Aplicadas'
  isActive: boolean
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
  profile?: IProfile
  comparePassword(candidatePassword: string): Promise<boolean>
  getPublicData(): Omit<IUser, 'password' | 'imageBase64'>
}

export interface IProfile extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId | IUser
  division: string
  trimestre: string
  location: string
  linkedin?: string
  github?: string
  bio: string
  skills: string[]
  promedio: string
  graduationDate: Date
  isActive: boolean
  completionPercentage: number
  createdAt: Date
  updatedAt: Date
  projects?: IProject[]
}

export interface IProject extends Document {
  _id: Types.ObjectId
  profile: Types.ObjectId | IProfile
  name: string
  description: string
  technologies: string[]
  link?: string
  type: 'Proyecto Terminal' | 'Proyecto Personal' | 'Proyecto Académico' | 'Proyecto Profesional'
  status: 'En Desarrollo' | 'Completado' | 'En Pausa' | 'Cancelado'
  startDate: Date
  endDate?: Date
  isPublic: boolean
  featured: boolean
  collaborators: Array<{
    name: string
    role: string
    contact: string
  }>
  images: Array<{
    url: string
    description: string
  }>
  tags: string[]
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado'
  createdAt: Date
  updatedAt: Date
}

// Interfaces para el frontend (sin campos internos de MongoDB)
export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  link?: string
  type: string
  status: string
  startDate: string
  endDate?: string
  isPublic: boolean
  featured: boolean
  collaborators: Array<{
    name: string
    role: string
    contact: string
  }>
  images: Array<{
    url: string
    description: string
  }>
  tags: string[]
  difficulty: string
}

export interface Student {
  id: string
  name: string
  avatar: string
  carrera: string
  division: string
  trimestre: string
  location: string
  email: string
  linkedin?: string
  github?: string
  bio: string
  skills: string[]
  projects: Project[]
  promedio: string
  graduationDate: string
  completionPercentage: number
  isActive: boolean
}

export interface UserSession {
  id: string
  name: string
  email: string
  image?: string
}
