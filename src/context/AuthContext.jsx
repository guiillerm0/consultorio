import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ROLES } from '../lib/roles'

// Create and export the context
export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/auth/verify')
        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
        return { success: true }
      } else {
        const errorData = await res.json()
        return { success: false, message: errorData.message }
      }
    } catch (error) {
      return { success: false, message: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isDoctor: user?.role === ROLES.DOCTOR,
    isPharmacist: user?.role === ROLES.PHARMACIST,
    isPatient: user?.role === ROLES.PATIENT,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Export the custom hook directly from here
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}