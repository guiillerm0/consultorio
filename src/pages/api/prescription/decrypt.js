import Prescription from '../../../models/Prescription'
import { decryptMedications } from '../../../lib/cryptography'
import dbConnect from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  try {
    await dbConnect()
    const { prescriptionId, userRole = 'patient' } = req.body

    const prescription = await Prescription.findById(prescriptionId)

    console.log('🔐 Desencriptando receta:', prescriptionId
        , 'para el rol:', userRole
    )


    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' })
    }

    // Selecciona la clave AES según el rol
    const aesKey = prescription.aesKeys[userRole]?.encryptedKey
    if (!aesKey) {
      return res.status(403).json({ message: 'No access to this prescription' })
    }

    console.log('🔐 Clave AES:', aesKey)
    console.log('🔐 IV:', prescription.iv
        , 'Auth Tag:', prescription.authTag
    )
    console.log('🔐 Medicamentos cifrados:', prescription.encryptedMedications)

    const aesKeyBuffer = Buffer.from(aesKey, 'hex')

    const medications = await decryptMedications(
      prescription.encryptedMedications,
      aesKeyBuffer,
      Buffer.from(prescription.iv, 'hex'),
      Buffer.from(prescription.authTag, 'hex')
    )

    res.status(200).json({ medications })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}