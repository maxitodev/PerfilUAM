import mongoose from 'mongoose'

const SessionSchema = new mongoose.Schema({
  sessionToken: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  expires: { 
    type: Date, 
    required: true 
  }
}, {
  timestamps: true
})

export default mongoose.models.Session || mongoose.model("Session", SessionSchema)
