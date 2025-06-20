import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, default: Date.now },
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true }
  }],
  doctorSignature: { type: String, required: true },
  pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pharmacySignature: { type: String },
  isFilled: { type: Boolean, default: false },
  filledDate: { type: Date }
}, { timestamps: true });

export default mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);