import Appointment from '../../../models/Appointment';
import dbConnect from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    // Cancelar la cita
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: 'cancelled' },
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
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
