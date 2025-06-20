import User from '../../../models/User'
import dbConnect from '../../../lib/database'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  try {
    await dbConnect()
    
    // Obtener token de las cookies
    const token = req.cookies.token
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' })
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Buscar usuario
    const user = await User.findById(decoded.userId).select('-password -privateKey')
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    
    res.status(200).json(user)
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    console.error('Verify auth error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}