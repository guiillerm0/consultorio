import User from '../../../models/User';
import dbConnect from '../../../lib/database';
import { generateKeyPair } from '../../../lib/cryptography';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { name, email, password, role, clinic, specialty, pharmacy } = req.body;
    
    // Validar datos
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Generar par de claves
    const { privateKey, publicKey } = await generateKeyPair();
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      publicKey,
      privateKey,
      ...(role === 'doctor' && { clinic, specialty }),
      ...(role === 'pharmacist' && { pharmacy })
    });
    
    await user.save();
    
    // No devolver la clave privada en la respuesta
    const userResponse = user.toObject();
    delete userResponse.privateKey;
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}