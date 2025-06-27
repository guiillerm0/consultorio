import Appointment from '../../../models/Appointment';
import dbConnect from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await dbConnect();
    const { doctorId, date } = req.body;
    if (!doctorId || !date) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }
    // Obtener todas las citas de ese doctor para ese día
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(23,59,59,999);
    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    });
    // Devolver solo los horarios ocupados
    const busyTimes = appointments.map(app => app.date.toISOString());
    res.status(200).json({ busyTimes });
  } catch (err) {
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
}
