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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/90 shadow-2xl overflow-hidden rounded-2xl border border-blue-100">
          <div className="px-6 py-6 border-b border-blue-100 flex justify-between items-center">
            <h3 className="text-2xl font-extrabold text-blue-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
              Receta Médica
            </h3>
            <span className={`px-3 py-1 text-xs font-bold rounded-full shadow ${
              prescription.isFilled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {prescription.isFilled ? 'SURTIDA' : 'PENDIENTE'}
            </span>
          </div>
          <div className="px-6 py-4 border-b border-blue-100">
            <p className="text-blue-700 text-base font-medium">
              Emitida el <span className="font-normal">{new Date(prescription.issueDate).toLocaleDateString()}</span>
            </p>
          </div>
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-bold text-blue-700 flex items-center gap-1 mb-1">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Paciente
                </h4>
                <p className="text-base text-blue-900 font-semibold">
                  {prescription.patientId?.name || 'Desconocido'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-700 flex items-center gap-1 mb-1">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 7v-7" /></svg>
                  Médico
                </h4>
                <p className="text-base text-blue-900 font-semibold">
                  {prescription.doctorId?.name || 'Desconocido'}
                </p>
                <p className="mt-1 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow ${
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
                    <h4 className="text-sm font-bold text-blue-700 flex items-center gap-1 mb-1">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 10v4m8-8h-4m-4 0H4" /></svg>
                      Farmacéutico
                    </h4>
                    <p className="text-base text-blue-900 font-semibold">
                      {prescription.pharmacistId?.name || 'Desconocido'}
                    </p>
                    <p className="mt-1 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow ${
                        pharmacySignatureValid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Firma {pharmacySignatureValid ? 'válida' : 'inválida'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-700 flex items-center gap-1 mb-1">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Fecha de surtido
                    </h4>
                    <p className="text-base text-blue-900 font-semibold">
                      {new Date(prescription.filledDate).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="mt-10">
              <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m7-7v14" /></svg>
                Medicamentos
              </h4>
              <div className="border border-blue-100 rounded-xl divide-y divide-blue-100 bg-white/80 shadow">
                {prescription.medications.map((med, index) => (
                  <div key={index} className="p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-700 font-semibold">Nombre</p>
                      <p className="text-base text-blue-900 font-bold">{med.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-semibold">Dosis</p>
                      <p className="text-base text-blue-900 font-bold">{med.dosage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-semibold">Frecuencia</p>
                      <p className="text-base text-blue-900 font-bold">{med.frequency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-semibold">Duración</p>
                      <p className="text-base text-blue-900 font-bold">{med.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 py-6 border-t border-blue-100 flex justify-between bg-blue-50/50">
            <Link
              href="/prescriptions"
              className="inline-flex items-center px-6 py-2 border border-blue-300 shadow font-bold rounded-lg text-blue-700 bg-white hover:bg-blue-100 transition gap-2"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
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
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-bold rounded-lg shadow text-white bg-green-600 hover:bg-green-700 transition gap-2"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Verificar y Surtir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}