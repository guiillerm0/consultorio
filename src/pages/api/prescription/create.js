import Prescription from '../../../models/Prescription';
import User from '../../../models/User';
import dbConnect from '../../../lib/database';
import { signPrescription, encryptMedications } from '../../../lib/cryptography';
import { checkRole } from '../../../lib/roles';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { doctorId, patientId, medications, pharmacistId, pharmacy } = req.body;

    // Verificar doctor
    const doctor = await User.findById(doctorId).select('+privateKey');
    if (!doctor || !checkRole(doctor, 'doctor')) {
      return res.status(403).json({ message: 'Only doctors can create prescriptions' });
    }

    // Verificar paciente
    const patient = await User.findById(patientId);
    if (!patient || !checkRole(patient, 'patient')) {
      return res.status(400).json({ message: 'Invalid patient' });
    }

    // Si se asigna farmacéutico, verificar que exista y sea farmacéutico
    let pharmacist = null;
    if (pharmacistId) {
      pharmacist = await User.findById(pharmacistId);
      if (!pharmacist || !checkRole(pharmacist, 'pharmacist')) {
        return res.status(400).json({ message: 'Invalid pharmacist' });
      }
    }

    // Fecha fija para evitar discrepancias
    const issueDate = new Date();

    // Objeto que será firmado
    const prescriptionData = {
      patientId: patient._id.toString(),
      doctorId: doctor._id.toString(),
      issueDate,
      medications
    };

    // Depuración
    console.log('🔐 Firmando con:');
    console.log('prescriptionData:', JSON.stringify(prescriptionData));

    // Firmar
    const signature = await signPrescription(doctor.privateKey, prescriptionData);

    //Cifrar medicamentos

    console.log('🔐 Cifrando medicamentos:', medications);

    const { encryptedMedications, aesKey, iv, authTag } = await encryptMedications(medications);

    console.log('🔐 Clave AES:', aesKey);
    console.log('🔐 IV:', iv.toString('hex'));
    console.log('🔐 Auth Tag:', authTag.toString('hex'));


    // Guardar receta
    const prescription = new Prescription({
      ...prescriptionData,
      doctorSignature: signature,
      encryptedMedications,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      aesKeys: {
        doctor: {
          encryptedKey: aesKey
        },
        patient: {
          encryptedKey: aesKey
        },
        pharmacist: {
          encryptedKey: aesKey
        }
      },
      pharmacistId: pharmacist ? pharmacist._id : undefined,
      pharmacy: pharmacy || (pharmacist ? pharmacist.pharmacy : undefined)
    });

    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
