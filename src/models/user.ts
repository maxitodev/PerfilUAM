import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v: string) {
        return v.endsWith('@cua.uam.mx');
      },
      message: 'Solo se permiten correos institucionales @cua.uam.mx'
    }
  },
  password: { type: String, required: false }, // Opcional para usuarios OAuth
  imageBase64: { 
    type: String, 
    required: false,
    select: false // Por defecto no se incluye en las consultas para optimizar rendimiento
  },
  // Campo para rastrear el origen de la imagen
  imageSource: {
    type: String,
    enum: ['user_upload', 'google_oauth', 'none'],
    default: 'none'
  },
  matricula: { 
    type: String, 
    required: false, // Opcional para usuarios OAuth
    unique: true,
    sparse: true, // Permite múltiples documentos con valor null
    validate: {
      validator: function(v: string) {
        return !v || /^\d{10}$/.test(v);
      },
      message: 'La matrícula debe tener exactamente 10 dígitos'
    }
  },
  carrera: { 
    type: String, 
    required: false, // Opcional para usuarios OAuth
    enum: ['Ingeniería en Computación', 'Matemáticas Aplicadas']
  },
  // Campos específicos para OAuth
  provider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials'
  },
  providerId: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Campos para recuperación de contraseña
  resetPasswordToken: {
    type: String,
    required: false
  },
  resetPasswordExpiry: {
    type: Date,
    required: false
  },
  lastPasswordChange: {
    type: Date,
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual para obtener el perfil del usuario
UserSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Hash password antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcryptjs.hash(this.password, 12)
  next()
})

// Método para verificar contraseña
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  if (!this.password) return false; // Usuarios OAuth no tienen contraseña
  return await bcryptjs.compare(candidatePassword, this.password);
}

// Método para obtener datos públicos del usuario
UserSchema.methods.getPublicData = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.imageBase64;
  return userObject;
}

// Método para verificar si tiene imagen propia (subida por el usuario)
UserSchema.methods.hasUserUploadedImage = function() {
  return this.imageBase64 && this.imageSource === 'user_upload';
}

// Método para actualizar imagen preservando el origen
UserSchema.methods.updateImageSafely = function(imageBase64: string, source: string = 'user_upload') {
  this.imageBase64 = imageBase64;
  this.imageSource = source;
  return this.save();
}

// Método para obtener datos con imagen - versión mejorada
UserSchema.methods.getDataWithImage = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpiry;
  // Mantener imageBase64 y imageSource para manejo de imágenes
  return userObject;
}

// Índices para mejorar el rendimiento
UserSchema.index({ carrera: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ provider: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema)