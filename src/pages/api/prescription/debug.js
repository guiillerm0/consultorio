import Prescription from '../../../models/Prescription';
import dbConnect from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Obtener todas las recetas
    const prescriptions = await Prescription.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });
    
    // Información de debug
    const debugInfo = {
      totalPrescriptions: prescriptions.length,
      prescriptions: prescriptions.map(p => ({
        _id: p._id.toString(),
        patientName: p.patientId?.name || 'Unknown',
        doctorName: p.doctorId?.name || 'Unknown',
        medicationCount: p.medications?.length || 0,
        createdAt: p.createdAt,
        hasSignature: !!p.doctorSignature
      })),
      lastPrescriptionId: prescriptions.length > 0 ? prescriptions[0]._id.toString() : null
    };
    
    res.status(200).json(debugInfo);
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
