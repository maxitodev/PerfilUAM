import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) throw new Error("No Mongo URI found")

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return
  return mongoose.connect(MONGODB_URI)
}
export const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) return

  return mongoose.disconnect()
}