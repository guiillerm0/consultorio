import Appointment from '../../../models/Appointment';
import dbConnect from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { appointmentId, status } = req.body;
    
    if (!appointmentId || !status) {
      return res.status(400).json({ message: 'Appointment ID and status are required' });
    }

    // Validar que el status sea válido
    const validStatuses = ['scheduled', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Buscar y actualizar la cita
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    ).populate('patientId', 'name email')
     .populate('doctorId', 'name email speciality');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
