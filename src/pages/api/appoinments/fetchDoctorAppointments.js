import Appointment from "../../../models/Appointment";
import dbConnect from "../../../lib/database";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Fetch doctor appointments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}