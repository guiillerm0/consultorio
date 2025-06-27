import mongoose from 'mongoose';
import { type } from 'os';

const PrescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, default: Date.now },
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String }
  }],
  encryptedMedications: { type: String },
  iv: { type: String, required: true },
  authTag: { type: String, required: true },
  aesKeys: {
    doctor: {
      encryptedKey: { type: String }, // clave AES cifrada con contraseña del doctor
      salt: { type: String },         // salt para derivar la clave con PBKDF2
    },
    patient: {
      encryptedKey: { type: String },
      salt: { type: String },
    },
    pharmacist: {
      encryptedKey: { type: String },
      salt: { type: String },
    },
  },
  doctorSignature: { type: String, required: true },
  pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pharmacy: { type: String },
  pharmacySignature: { type: String },

  isFilled: { type: Boolean, default: false },
  filledDate: { type: Date }
}, { timestamps: true });

export default mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
