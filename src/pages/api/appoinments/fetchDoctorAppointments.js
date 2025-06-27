import Appointment from "../../../models/Appointment";
import dbConnect from '../../../lib/database';

export default async function handler(req, res) {

  // Permitir tanto GET como POST para compatibilidad
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {

    await dbConnect();

    let query = {};

    const {doctorId} = req.query; 
    
    // Manejar tanto POST como GET
    if (req.method === 'POST') {
      const { userId, role } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, message: 'ID de usuario requerido' });
      }
      
      // Determinar consulta según el rol
      switch (role) {
        case 'patient':
          query = { patientId: userId };
          break;
        case 'doctor':
          query = { doctorId: userId };
          break;
        case 'admin':
          // Admin puede ver todas las citas
          break;
        default:
          return res.status(403).json({ success: false, message: 'Rol no autorizado' });
      }
    } else {
      // Para compatibilidad con el método GET existente
      const { doctorId } = req.query;
      if (!doctorId) {
        return res.status(400).json({ message: 'Se requiere el ID del doctor' });
      }
      query = { doctorId };
    }

    // Consultar citas
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email clinic specialty')
      .sort({ date: -1 }); // Ordenar por fecha, más recientes primero

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Fetch doctor appointments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}