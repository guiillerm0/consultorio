import Prescription from '../../../models/Prescription'
import dbConnect from '../../../lib/database'

export default async function handler(req, res) {
  const { id } = req.query
  await dbConnect()

  if (req.method === 'GET') {
    try {
      const prescription = await Prescription.findById(id)
        .populate('patientId', 'name email')
        .populate('doctorId', 'name email publicKey')
        .populate('pharmacistId', 'name email publicKey')

      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' })
      }

      res.status(200).json(prescription)
    } catch (error) {
      console.error('Error fetching prescription:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}