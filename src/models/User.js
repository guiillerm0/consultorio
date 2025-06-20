import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['patient', 'doctor', 'pharmacist']
  },
  publicKey: { type: String, required: true },
  privateKey: { type: String, required: true, select: false },
  clinic: { type: String }, // Para doctores
  specialty: { type: String }, // Para doctores especialistas
  pharmacy: { type: String } // Para farmacéuticos
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);