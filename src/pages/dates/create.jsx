import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import Link from 'next/link'

export default function CreateAppointment() {
  const { user } = useAuth()
  const router = useRouter()
  const { doctorId,  } = router.query
  const {nombre} = router.query
  
  const [formData, setFormData] = useState({
    doctorId: doctorId || '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  })
  
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return
    
    // Solo los pacientes pueden crear citas
    if (user.role !== 'patient') {
      router.replace('/dates')
      return
    }
    
    // Si se proporciona doctorId en la URL, actualizar el formulario
    if (doctorId && doctorId !== formData.doctorId) {
      setFormData(prev => ({
        ...prev,
        doctorId
      }))
    }
      const fetchDoctors = async () => {
      setIsLoading(true)
      setError('')
      
      try {
        // Utilizar el nuevo endpoint específico para doctores
        const res = await fetch('/api/users/fetchDoctors')
        if (!res.ok) {
          throw new Error('Error al cargar los doctores')
        }
        
        const data = await res.json()
        setDoctors(data)
        
        // Si solo hay un doctor y no se seleccionó ninguno, seleccionarlo por defecto
        if (data.length === 1 && !formData.doctorId) {
          setFormData(prev => ({
            ...prev,
            doctorId: data[0]._id
          }))
        }
      } catch (err) {
        setError(err.message)
        console.error('Error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDoctors()
  }, [user, doctorId, router, formData.doctorId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validación básica
    if (!formData.doctorId || !formData.date || !formData.time || !formData.reason) {
      setError('Por favor complete todos los campos requeridos')
      return
    }
    
    // Combinar fecha y hora
    const appointmentDateTime = new Date(`${formData.date}T${formData.time}`)
    
    // Validar que la fecha sea en el futuro
    if (appointmentDateTime <= new Date()) {
      setError('La fecha de la cita debe ser en el futuro')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/appoinments/createAppointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: formData.doctorId,
          patientId: user._id,
          date: appointmentDateTime.toISOString(),
          reason: formData.reason,
          notes: formData.notes
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear la cita')
      }
      
      setSuccess(true)
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        router.push('/dates')
      }, 2000)
      
    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
          <p className="text-blue-600 font-medium">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dates"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Agendar Nueva Cita</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>¡Cita agendada correctamente! Redirigiendo...</p>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Detalles de la Cita
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Selección de doctor */}
              <div>
                <label htmlFor="doctorId" className="block text-sm text-black font-medium text-gray-700 mb-1">
                  Seleccionar Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  className="block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >                  <option value="">Seleccionar un doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.name} {
                        doctor.specialities && doctor.specialities.length > 0 
                          ? `- ${doctor.specialities[0]}` 
                          : doctor.speciality 
                            ? `- ${doctor.speciality}` 
                            : ''
                      }
                    </option>
                  ))}
                </select>
                
                {/* Información del doctor seleccionado */}
                {formData.doctorId && doctors.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                    {(() => {
                      const selectedDoctor = doctors.find(doc => doc._id === formData.doctorId);
                      return selectedDoctor ? (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Dr. {selectedDoctor.name}</p>
                            <p className="text-xs text-gray-500">{selectedDoctor.email}</p>
                            {selectedDoctor.specialities && selectedDoctor.specialities.length > 0 ? (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {selectedDoctor.specialities.map((spec, i) => (
                                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            ) : selectedDoctor.speciality ? (
                              <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {selectedDoctor.speciality}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
              
              {/* Fecha y hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm text-black font-medium text-gray-700 mb-1">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={handleChange}
                    className="block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm text-black font-medium text-gray-700 mb-1">
                    Hora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              {/* Motivo */}
              <div>
                <label htmlFor="reason" className="block text-sm text-black font-medium text-gray-700 mb-1">
                  Motivo de la Consulta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Ej. Consulta general, dolor de espalda, etc."
                  className="block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Notas adicionales */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Incluya cualquier información adicional que el doctor deba conocer"
                  className="block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Acciones */}
              <div className="flex justify-end space-x-3 border-t border-gray-100 pt-6">
                <Link 
                  href="/dates" 
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-black border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Agendando...
                    </div>
                  ) : (
                    'Agendar Cita'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
