import mongoose from 'mongoose'

const ProfileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  division: { 
    type: String, 
    required: true,
    default: 'División de Ciencias Naturales e Ingeniería'
  },
  trimestre: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^(0[1-9]|1[0-2])$/.test(v) || /^[1-9]$/.test(v);
      },
      message: 'El trimestre debe ser un número del 1 al 12'
    }
  },
  location: { 
    type: String, 
    required: true,
    default: 'CDMX, México'
  },
  linkedin: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v: string) {
        return !v || /^https:\/\/(www\.)?linkedin\.com\/in\//.test(v);
      },
      message: 'URL de LinkedIn no válida'
    }
  },
  github: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v: string) {
        return !v || /^https:\/\/(www\.)?github\.com\//.test(v);
      },
      message: 'URL de GitHub no válida'
    }
  },
  tesinaLink: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'URL de tesina no válida'
    }
  },
  cvLink: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'URL de CV no válida'
    }
  },
  bio: { 
    type: String, 
    required: true,
    maxlength: [500, 'La biografía no puede exceder 500 caracteres']
  },
  skills: [{ 
    type: String, 
    required: true 
  }],
  promedio: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Permitir valores vacíos
        const num = parseFloat(v);
        return !isNaN(num) && num >= 6.0 && num <= 10.0;
      },
      message: 'El promedio debe estar entre 6.0 y 10.0'
    }
  },
  graduationDate: { 
    type: Date, 
    required: false 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
})

// Middleware para calcular el porcentaje de completitud del perfil
ProfileSchema.pre('save', function(next) {
  const requiredFields = ['division', 'trimestre', 'location', 'bio'];
  const optionalFields = ['linkedin', 'github', 'promedio', 'graduationDate', 'tesinaLink', 'cvLink'];
  
  let filledRequired = 0;
  let filledOptional = 0;
  
  // Contar campos requeridos completados
  requiredFields.forEach(field => {
    if ((this as any)[field]) filledRequired++;
  });
  
  // Contar campos opcionales completados
  optionalFields.forEach(field => {
    if ((this as any)[field]) filledOptional++;
  });
  
  // Contar skills (mínimo 1)
  if (this.skills && this.skills.length > 0) filledRequired++;
  
  // Calcular porcentaje (campos requeridos valen más)
  const totalRequired = requiredFields.length + 1; // +1 por skills
  const totalOptional = optionalFields.length;
  
  const requiredPercentage = (filledRequired / totalRequired) * 80; // 80% peso
  const optionalPercentage = (filledOptional / totalOptional) * 20; // 20% peso
  
  this.completionPercentage = Math.round(requiredPercentage + optionalPercentage);
  
  next();
});

// Índices para mejorar el rendimiento
ProfileSchema.index({ carrera: 1 });
ProfileSchema.index({ trimestre: 1 });
ProfileSchema.index({ isActive: 1 });
ProfileSchema.index({ completionPercentage: -1 });

export default mongoose.models.Profile || mongoose.model("Profile", ProfileSchema)
