import Prescription from '../../../models/Prescription';
import User from '../../../models/User';
import dbConnect from '../../../lib/database';
import { signPrescription } from '../../../lib/cryptography';
import { checkRole } from '../../../lib/roles';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  

}