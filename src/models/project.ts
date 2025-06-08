import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
  profile: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Profile', 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [100, 'El nombre del proyecto no puede exceder 100 caracteres']
  },
  description: { 
    type: String, 
    required: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  technologies: [{ 
    type: String, 
    required: true,
    trim: true
  }],
  link: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Debe ser una URL válida'
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['Proyecto Terminal', 'Proyecto Personal', 'Proyecto Académico', 'Proyecto Profesional'],
    default: 'Proyecto Personal'
  },
  status: {
    type: String,
    required: true,
    enum: ['En Desarrollo', 'Completado', 'En Pausa', 'Cancelado'],
    default: 'En Desarrollo'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    name: String,
    role: String,
    contact: String
  }],
  images: [{
    url: String,
    description: String
  }],
  tags: [String]
}, {
  timestamps: true
})

// Índices para mejorar el rendimiento
ProjectSchema.index({ profile: 1 });
ProjectSchema.index({ type: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ isPublic: 1 });
ProjectSchema.index({ featured: -1 });
ProjectSchema.index({ technologies: 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ createdAt: -1 });

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema)
