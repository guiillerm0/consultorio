// pages/prescriptions/create.jsx
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'
import Layout from '../../components/LayoutR'

export default function CreatePrescription() {
  const { user } = useAuth()
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }])
  const [patientEmail, setPatientEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Buscar paciente por email
      const patientRes = await fetch('/api/auth/find-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: patientEmail })
      })

      if (!patientRes.ok) throw new Error('Paciente no encontrado')
      const patient = await patientRes.json()

      // Crear receta
      const res = await fetch('/api/prescriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: user._id,
          patientId: patient._id,
          medications: medications.filter(m => m.name && m.dosage && m.frequency && m.duration)
        })
      })

      if (!res.ok) throw new Error('Error al crear receta')
      
      setSuccess('Receta creada exitosamente')
      setPatientEmail('')
      setMedications([{ name: '', dosage: '', frequency: '', duration: '' }])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Crear Nueva Receta</h2>
        {/* Formulario de creación de recetas */}
      </div>
    </Layout>
  )
}