import User from '../../../models/User';
import Appointment from '../../../models/Appointment';
import dbConnect from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    // Conectar a la base de datos
    await dbConnect();

    const { doctorId, patientId, date, reason, notes } = req.body;

    // Validar campos requeridos
    if (!doctorId || !patientId || !date || !reason) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }

    // Validar formato de fecha
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate)) {
      return res.status(400).json({ success: false, message: 'Formato de fecha inválido' });
    }

    // Validar que la fecha sea futura
    if (appointmentDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'La fecha de la cita debe ser en el futuro' });
    }

    // Verificar disponibilidad (que no haya otra cita a la misma hora con el mismo doctor)
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: {
        $gte: new Date(appointmentDate.getTime() - 30 * 60000), // 30 minutos antes
        $lte: new Date(appointmentDate.getTime() + 30 * 60000)  // 30 minutos después
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        success: false, 
        message: 'El doctor ya tiene una cita programada en ese horario' 
      });
    }

    // Crear la cita
    const appointment = new Appointment({
      doctorId,
      patientId,
      date: appointmentDate,
      reason,
      notes: notes || '',
      status: 'scheduled'
    });

    await appointment.save();

    return res.status(201).json({ 
      success: true, 
      message: 'Cita creada exitosamente',
      appointmentId: appointment._id
    });

  } catch (error) {
    console.error('Error al crear cita:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}