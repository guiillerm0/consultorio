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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900 drop-shadow-sm">
            {user.role === 'doctor' ? 'Mis Recetas Emitidas' : 
             user.role === 'pharmacist' ? 'Recetas Pendientes' : 'Mis Recetas'}
          </h1>
          {user.role === 'doctor' && (
            <Link
              href="/prescriptions/create"
              className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-900 transition-colors font-bold shadow flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Crear Nueva Receta
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 font-semibold shadow">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white/90 p-8 rounded-2xl shadow-2xl text-center border border-blue-100">
            <p className="text-blue-700 text-lg">No hay recetas para mostrar</p>
          </div>
        ) : (
          <div className="bg-white/90 shadow-2xl border border-blue-100 rounded-2xl">
            <ul className="divide-y divide-blue-100">
              {prescriptions.map((prescription) => (
                <li key={prescription._id}>
                  <div 
                    className="px-6 py-6 hover:bg-blue-50 cursor-pointer transition rounded-2xl flex flex-col gap-2"
                    onClick={() => router.push(`/prescriptions/${prescription._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-blue-700 truncate">
                        Receta #{prescription._id.substring(0, 8)}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {prescription.isFilled ? (
                          <p className="px-3 py-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 shadow">
                            Surtida
                          </p>
                        ) : (
                          <p className="px-3 py-1 text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 shadow">
                            Pendiente
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-col md:flex-row md:justify-between gap-2">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <p className="flex items-center text-sm text-blue-900 font-medium">
                          <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Paciente: {prescription.patientId?.name || 'Desconocido'}
                        </p>
                        {user.role === 'patient' && (
                          <p className="flex items-center text-sm text-blue-900 font-medium">
                            <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 7v-7" /></svg>
                            Médico: {prescription.doctorId?.name || 'Desconocido'}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-blue-900 font-medium">
                        <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Fecha: {new Date(prescription.issueDate).toLocaleDateString()}
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