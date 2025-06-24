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
  publicKey: { type: String, required: true },      // hex
  privateKey: { type: String, required: true, select: false }, // hex
  clinic: { type: String },
  specialty: { type: String },
  pharmacy: { type: String }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
