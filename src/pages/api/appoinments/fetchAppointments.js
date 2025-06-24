import Appointment from "../../../models/Appointment";
import dbConnect from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    await dbConnect();
    
    // Obtener el ID del doctor de la consulta
    const { doctorId } = req.query;

    // Validar que se proporcionó un ID de doctor
    if (!doctorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere el ID del doctor'
      });
    }

    // Buscar todas las citas del doctor
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email') // Incluir información básica del paciente
      .populate('doctorId', 'name email speciality') // Incluir información básica del doctor
      .sort({ date: -1 }); // Ordenar por fecha, más recientes primero

    // Opcional: Agrupar citas por estado o fecha
    const today = new Date();
    
    // Separar citas en próximas y pasadas
    const upcomingAppointments = appointments.filter(
      app => new Date(app.date) >= today
    );
    
    const pastAppointments = appointments.filter(
      app => new Date(app.date) < today
    );

    return res.status(200).json({
      success: true,
      upcomingAppointments,
      pastAppointments,
      totalAppointments: appointments.length
    });

  } catch (error) {
    console.error('Error al obtener citas del doctor:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor'
    });
  }
}
