import User from '../../../models/User'
import dbConnect from '../../../lib/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await dbConnect()
    
    const { email, password } = req.body
    
    // Validar datos
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    
    // Buscar usuario
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Crear token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
    
    // Configurar cookie HTTP-only
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`)
    
    // No devolver la contraseña ni la clave privada en la respuesta
    const userResponse = user.toObject()
    delete userResponse.password
    delete userResponse.privateKey
    
    res.status(200).json(userResponse)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}