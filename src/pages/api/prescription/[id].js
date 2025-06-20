import Prescription from '../../../models/Prescription'
import dbConnect from '../../../lib/database'

export default async function handler(req, res) {
  const { id } = req.query
  
  // Debug logging
  console.log('=== PRESCRIPTION FETCH DEBUG ===')
  console.log('Received ID:', id)
  console.log('ID type:', typeof id)
  console.log('ID length:', id?.length)
  console.log('Request method:', req.method)
  console.log('================================')
  
  await dbConnect()

  if (req.method === 'GET') {
    try {
      // Validar que el ID esté presente
      if (!id) {
        console.log('ERROR: No ID provided')
        return res.status(400).json({ message: 'Prescription ID is required' })
      }

      // Validar formato de ObjectId
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        console.log('ERROR: Invalid ObjectId format:', id)
        return res.status(400).json({ message: 'Invalid prescription ID format' })
      }

      console.log('Searching for prescription with ID:', id)
      
      const prescription = await Prescription.findById(id)
        .populate('patientId', 'name email')
        .populate('doctorId', 'name email publicKey')
        .populate('pharmacistId', 'name email publicKey')

      console.log('Query result:', prescription ? 'FOUND' : 'NOT FOUND')
      
      if (!prescription) {
        console.log('ERROR: Prescription not found in database')
        
        // Verificar si existen recetas en la base de datos
        const totalPrescriptions = await Prescription.countDocuments()
        console.log('Total prescriptions in database:', totalPrescriptions)
        
        // Mostrar algunas recetas existentes para debug
        const existingPrescriptions = await Prescription.find().limit(5).select('_id')
        console.log('Existing prescription IDs:', existingPrescriptions.map(p => p._id.toString()))
        
        return res.status(404).json({ message: 'Prescription not found' })
      }

      console.log('SUCCESS: Prescription found and returning data')
      res.status(200).json(prescription)
    } catch (error) {
      console.error('Error fetching prescription:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      res.status(500).json({ message: 'Internal server error', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}