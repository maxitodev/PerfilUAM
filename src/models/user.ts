import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  password: { type: String, required: true },
  imageBase64: { 
    type: String, 
    required: false,
    select: false // Por defecto no se incluye en las consultas para optimizar rendimiento
  },
  matricula: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    validate: {
      validator: function(v: string) {
        return /^\d{10}$/.test(v);
      },
      message: 'La matrícula debe tener exactamente 10 dígitos'
    }
  },
  carrera: { 
    type: String, 
    required: true,
    enum: ['Ingeniería en Computación', 'Matemáticas Aplicadas'],
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
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
  if (!this.isModified('password')) return next()
  this.password = await bcryptjs.hash(this.password, 12)
  next()
})

// Método para verificar contraseña
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcryptjs.compare(candidatePassword, this.password);
}

// Método para obtener datos públicos del usuario
UserSchema.methods.getPublicData = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.imageBase64;
  return userObject;
}

// Método para obtener datos con imagen
UserSchema.methods.getDataWithImage = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
}

export default mongoose.models.User || mongoose.model("User", UserSchema)