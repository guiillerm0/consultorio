import Prescription from '../../../models/Prescription';
import User from '../../../models/User';
import dbConnect from '../../../lib/database';
import { verifySignature, signPrescription } from '../../../lib/cryptography';
import { checkRole } from '../../../lib/roles';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { prescriptionId, pharmacistId } = req.body;

    // Verificar farmacéutico
    const pharmacist = await User.findById(pharmacistId).select('+privateKey');
    if (!pharmacist || !checkRole(pharmacist, 'pharmacist')) {
      return res.status(403).json({ message: 'Only pharmacists can verify prescriptions' });
    }

    // Obtener receta con todos los datos necesarios
    const prescription = await Prescription.findById(prescriptionId)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email publicKey')
      .lean();

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.isFilled) {
      return res.status(400).json({ message: 'Prescription already filled' });
    }

    // Preparar datos para verificación
    const prescriptionData = {
      patientId: prescription.patientId._id.toString(),
      doctorId: prescription.doctorId._id.toString(),
      issueDate: prescription.issueDate,
      medications: prescription.medications
    };

    console.log('Original prescription data:', JSON.stringify(prescriptionData, null, 2));
    console.log('Doctor public key:', prescription.doctorId.publicKey);
    console.log('Doctor signature:', prescription.doctorSignature);

    // Verificar firma del doctor
    const isDoctorSignatureValid = await verifySignature(
      prescription.doctorId.publicKey,
      prescription.doctorSignature,
      prescriptionData
    );

    if (!isDoctorSignatureValid) {
      console.error('Invalid doctor signature details:', {
        receivedData: prescriptionData,
        publicKey: prescription.doctorId.publicKey,
        signature: prescription.doctorSignature
      });
      return res.status(400).json({ 
        message: 'Invalid doctor signature',
        details: 'The prescription may have been altered or the signature is incorrect' 
      });
    }

    // Firmar como farmacéutico
    const verificationData = {
      ...prescriptionData,
      verifiedDate: new Date().toISOString()
    };

    const pharmacySignature = await signPrescription(
      pharmacist.privateKey,
      verificationData
    );

    // Actualizar receta
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      {
        pharmacistId,
        pharmacySignature,
        isFilled: true,
        filledDate: new Date()
      },
      { new: true }
    );

    res.status(200).json(updatedPrescription);
  } catch (error) {
    console.error('Verify prescription error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}