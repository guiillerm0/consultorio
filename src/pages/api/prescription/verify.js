import Prescription from '../../../models/Prescription';
import User from '../../../models/User';
import dbConnect from '../../../lib/database';
import { verifySignature } from '../../../lib/cryptography';
import { checkRole } from '../../../lib/roles';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { prescriptionId, pharmacistId } = req.body;
    
    // Verificar que el usuario es un farmacéutico
    const pharmacist = await User.findById(pharmacistId);
    if (!pharmacist || !checkRole(pharmacist, 'pharmacist')) {
      return res.status(403).json({ message: 'Only pharmacists can verify prescriptions' });
    }
    
    // Obtener la receta
    const prescription = await Prescription.findById(prescriptionId)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email publicKey');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    if (prescription.isFilled) {
      return res.status(400).json({ message: 'Prescription already filled' });
    }
    
    // Verificar la firma del doctor
    const prescriptionData = {
      patientId: prescription.patientId._id,
      doctorId: prescription.doctorId._id,
      issueDate: prescription.issueDate,
      medications: prescription.medications
    };
    
    const isDoctorSignatureValid = await verifySignature(
      prescription.doctorId.publicKey,
      prescription.doctorSignature,
      prescriptionData
    );
    
    if (!isDoctorSignatureValid) {
      return res.status(400).json({ message: 'Invalid doctor signature' });
    }
    
    // Firmar como farmacéutico
    const pharmacySignature = await signPrescription(
      pharmacist.privateKey,
      { ...prescriptionData, verifiedDate: new Date() }
    );
    
    // Actualizar la receta como surtida
    prescription.pharmacistId = pharmacistId;
    prescription.pharmacySignature = pharmacySignature;
    prescription.isFilled = true;
    prescription.filledDate = new Date();
    
    await prescription.save();
    
    res.status(200).json(prescription);
  } catch (error) {
    console.error('Verify prescription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}