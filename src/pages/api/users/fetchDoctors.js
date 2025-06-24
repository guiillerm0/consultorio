import dbConnect from '../../../lib/database';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    // Conectar a la base de datos
    await dbConnect();

    // Buscar usuarios con rol de doctor
    const doctors = await User.find({ role: 'doctor' })
      .select('_id name email specialities') // Solo seleccionamos los campos necesarios
      .sort({ name: 1 }); // Ordenamos alfabéticamente por nombre

    return res.status(200).json(doctors);

  } catch (error) {
    console.error('Error al obtener doctores:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
