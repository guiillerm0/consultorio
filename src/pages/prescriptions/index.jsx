import { useAuth } from '../../hooks/useAuth'
import { usePrescriptions } from '../../hooks/usePrescriptions'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function PrescriptionList() {
  const { user } = useAuth()
  const { prescriptions, isLoading, error } = usePrescriptions()
  const router = useRouter()

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {user.role === 'doctor' ? 'Mis Recetas Emitidas' : 
             user.role === 'pharmacist' ? 'Recetas Pendientes' : 'Mis Recetas'}
          </h1>
          {user.role === 'doctor' && (
            <Link
              href="/prescriptions/create"
              className="btn-primary"
            >
              Crear Nueva Receta
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-600">No hay recetas para mostrar</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {prescriptions.map((prescription) => (
                <li key={prescription._id}>
                  <div 
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/prescriptions/${prescription._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-blue-600 truncate">
                        Receta #{prescription._id.substring(0, 8)}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {prescription.isFilled ? (
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Surtida
                          </p>
                        ) : (
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pendiente
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Paciente: {prescription.patientId?.name || 'Desconocido'}
                        </p>
                        {user.role === 'patient' && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Médico: {prescription.doctorId?.name || 'Desconocido'}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Fecha: {new Date(prescription.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}