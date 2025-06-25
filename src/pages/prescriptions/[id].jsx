import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import { useEffect, useState } from 'react'
import { verifySignature } from '../../lib/cryptography'
import Link from 'next/link'

export default function PrescriptionDetail() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [prescription, setPrescription] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [doctorSignatureValid, setDoctorSignatureValid] = useState(false)
  const [pharmacySignatureValid, setPharmacySignatureValid] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchPrescription = async () => {
      setIsLoading(true)
      setError('')
      
      try {
        const res = await fetch(`/api/prescription/${id}`)
        if (!res.ok) {
          throw new Error('Failed to fetch prescription')
        }
        
        const data = await res.json()
        setPrescription(data)
        
        // Verificar firma del doctor
        const doctorPrescriptionData = {
          patientId: data.patientId._id,
          doctorId: data.doctorId._id,
          issueDate: data.issueDate,
          medications: data.medications
        }
        
        const isDoctorValid = await verifySignature(
          data.doctorId.publicKey,
          data.doctorSignature,
          doctorPrescriptionData
        )
        setDoctorSignatureValid(isDoctorValid)
        
        // Verificar firma de la farmacia si existe
        if (data.pharmacySignature && data.pharmacistId) {
          const pharmacyPrescriptionData = {
            ...doctorPrescriptionData,
            verifiedDate: data.filledDate
          }
          
          const isPharmacyValid = await verifySignature(
            data.pharmacistId.publicKey,
            data.pharmacySignature,
            pharmacyPrescriptionData
          )
          setPharmacySignatureValid(isPharmacyValid)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPrescription()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-red-600">{error || 'Receta no encontrada'}</p>
          <Link href="/prescriptions" className="mt-4 inline-block btn-primary">
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Receta Médica
              </h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                prescription.isFilled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {prescription.isFilled ? 'SURTIDA' : 'PENDIENTE'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Emitida el {new Date(prescription.issueDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Paciente</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {prescription.patientId?.name || 'Desconocido'}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Médico</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {prescription.doctorId?.name || 'Desconocido'}
                </p>
                <p className="mt-1 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doctorSignatureValid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Firma {doctorSignatureValid ? 'válida' : 'inválida'}
                  </span>
                </p>
              </div>
              
              {prescription.isFilled && (
                <>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Farmacéutico</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {prescription.pharmacistId?.name || 'Desconocido'}
                    </p>
                    <p className="mt-1 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pharmacySignatureValid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Firma {pharmacySignatureValid ? 'válida' : 'inválida'}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Fecha de surtido</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(prescription.filledDate).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Medicamentos</h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {prescription.medications.map((med, index) => (
                  <div key={index} className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Nombre</p>
                        <p className="text-sm text-black font-medium">{med.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Dosis</p>
                        <p className="text-sm text-black font-medium">{med.dosage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Frecuencia</p>
                        <p className="text-sm text-black font-medium">{med.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duración</p>
                        <p className="text-sm text-black font-medium">{med.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="px-4 py-4 sm:px-6 border-t border-gray-200 flex justify-between">
            <Link
              href="/prescriptions"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Volver
            </Link>
            
            {user?.role === 'pharmacist' && !prescription.isFilled && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/prescription/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        prescriptionId: prescription._id,
                        pharmacistId: user._id
                      })
                    })
                    
                    if (res.ok) {
                      router.reload()
                    } else {
                      throw new Error('Failed to verify prescription')
                    }
                  } catch (err) {
                    setError(err.message)
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Verificar y Surtir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}