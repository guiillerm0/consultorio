import Prescription from '../../../models/Prescription';
import User from '../../../models/User';
import dbConnect from '../../../lib/database';
import { signPrescription } from '../../../lib/cryptography';
import { checkRole } from '../../../lib/roles';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { doctorId, patientId, medications } = req.body;
    
    // Verificar doctor
    const doctor = await User.findById(doctorId).select('+privateKey');
    if (!doctor || !checkRole(doctor, 'doctor')) {
      return res.status(403).json({ message: 'Only doctors can create prescriptions' });
    }

    // Verificar paciente
    const patient = await User.findById(patientId);
    if (!patient || !checkRole(patient, 'patient')) {
      return res.status(400).json({ message: 'Invalid patient' });
    }

    // Fecha fija para evitar discrepancias
    const issueDate = new Date();

    // Objeto que será firmado
    const prescriptionData = {
      patientId: patient._id.toString(),
      doctorId: doctor._id.toString(),
      issueDate,
      medications
    };

    // Depuración
    console.log('🔐 Firmando con:');
    console.log('prescriptionData:', JSON.stringify(prescriptionData));

    // Firmar
    const signature = await signPrescription(doctor.privateKey, prescriptionData);

    // Guardar receta
    const prescription = new Prescription({
      ...prescriptionData,
      doctorSignature: signature
    });

    await prescription.save();
    
    res.status(201).json(prescription);
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
