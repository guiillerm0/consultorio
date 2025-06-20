import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export function usePrescriptions() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPrescriptions = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      let url = '/api/prescriptions'
      
      if (user?.role === 'patient') {
        url += '?patientId=' + user._id
      } else if (user?.role === 'doctor') {
        url += '?doctorId=' + user._id
      } else if (user?.role === 'pharmacist') {
        url += '?status=pending'
      }
      
      const res = await fetch(url)
      
      if (!res.ok) {
        throw new Error('Failed to fetch prescriptions')
      }
      
      const data = await res.json()
      setPrescriptions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPrescriptions()
    }
  }, [user])

  const createPrescription = async (prescriptionData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/prescriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...prescriptionData,
          doctorId: user._id
        })
      })
      
      if (!res.ok) {
        throw new Error('Failed to create prescription')
      }
      
      const newPrescription = await res.json()
      setPrescriptions(prev => [...prev, newPrescription])
      return newPrescription
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPrescription = async (prescriptionId) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/prescriptions/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prescriptionId,
          pharmacistId: user._id
        })
      })
      
      if (!res.ok) {
        throw new Error('Failed to verify prescription')
      }
      
      const updatedPrescription = await res.json()
      setPrescriptions(prev => 
        prev.map(p => p._id === updatedPrescription._id ? updatedPrescription : p)
      )
      return updatedPrescription
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    prescriptions,
    isLoading,
    error,
    fetchPrescriptions,
    createPrescription,
    verifyPrescription
  }
}