import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function DatesIndex() {
  const { user } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  useEffect(() => {
    if (!user) return

    const fetchAppointments = async () => {
      setIsLoading(true)
      setError('')

      try {
        // Cargar citas existentes según el rol del usuario
        const appointmentsRes = await fetch('/api/appoinments/fetchDoctorAppointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId: user._id,
            role: user.role
          })
        })

        if (!appointmentsRes.ok) {
          throw new Error('Error al cargar las citas')
        }

        const appointmentsData = await appointmentsRes.json()
        // Si el backend devuelve un array directo:
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : appointmentsData.appointments || [])
      } catch (err) {
        setError(err.message)
        console.error('Error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  const handleCreateAppointment = (doctorId) => {
    router.push(`/dates/create?doctorId=${doctorId}`)
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
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.role === 'doctor' ? 'Mis Citas Médicas' : 
                     user.role === 'patient' ? 'Mis Consultas' : 'Gestión de Citas'}
                  </h1>
                </div>
              </div>
            </div>

            {/* Create appointment button (visible to patients) */}
            {user.role === 'patient' && (
              <Link href="/dates/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agendar Nueva Cita
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50 text-blue-700">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm">Total de Citas</p>
                <h3 className="font-bold text-xl text-gray-800">
                  {isLoading ? '-' : appointments.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50 text-green-700">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm">Citas Completadas</p>
                <h3 className="font-bold text-xl text-gray-800">
                  {isLoading ? '-' : appointments.filter(app => app.status === 'completed').length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-50 text-amber-700">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm">Próximas Citas</p>
                <h3 className="font-bold text-xl text-gray-800">
                  {isLoading ? '-' : appointments.filter(app => new Date(app.date) >= new Date() && app.status === 'scheduled').length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              </div>
              <p className="text-blue-600 font-medium">Cargando citas...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Appointments list */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Mis Citas Programadas
              </h2>

              {appointments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-50 flex items-center justify-center rounded-full mb-4">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No hay citas programadas</h3>
                  <p className="text-gray-500 mb-6">
                    {user.role === 'patient' 
                      ? 'Aún no has agendado ninguna cita médica' 
                      : 'No tienes citas programadas en este momento'}
                  </p>
                  
                  {user.role === 'patient' && (
                    <Link href="/dates/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Agendar mi primera cita
                    </Link>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          {user.role !== 'doctor' && (
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Doctor
                            </th>
                          )}
                          {user.role !== 'patient' && (
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Paciente
                            </th>
                          )}
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appointment) => (
                          <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-800">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {new Date(appointment.date).toLocaleDateString('es-ES', {
                                      weekday: 'long',
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(appointment.date).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            {user.role !== 'doctor' && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">Dr. {appointment.doctorId?.name || 'No asignado'}</div>
                                <div className="text-sm text-gray-500">
                                  {appointment.doctorId?.clinic === 'family'
                                    ? 'Medicina Familiar'
                                    : appointment.doctorId?.clinic === 'specialty' && appointment.doctorId?.specialty
                                      ? appointment.doctorId.specialty
                                      : 'Médico general'}
                                </div>
                              </td>
                            )}
                            
                            {user.role !== 'patient' && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{appointment.patientId?.name || 'No asignado'}</div>
                                <div className="text-sm text-gray-500">
                                  {appointment.patientId?.email || 'Sin información'}
                                </div>
                              </td>
                            )}
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              {appointment.status === 'completed' ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Completada
                                </span>
                              ) : appointment.status === 'cancelled' ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Cancelada
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Programada
                                </span>
                              )}
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              
                              {appointment.status === 'completed' ? (
                                <button
                                  className="text-blue-600 hover:text-blue-900"
                                  onClick={() => setSelectedAppointment(appointment)}
                                >
                                  Ver detalles
                                </button>
                              ) : new Date(appointment.date) > new Date() && appointment.status !== 'cancelled' ? (
                                <button 
                                  className="text-red-600 hover:text-red-900"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch('/api/appoinments/cancelAppointment', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ appointmentId: appointment._id })
                                      });
                                      if (!res.ok) {
                                        const errorData = await res.json();
                                        throw new Error(errorData.message || 'Error al cancelar la cita');
                                      }
                                      // Actualizar la lista de citas tras cancelar
                                      setAppointments(prev => prev.map(a => a._id === appointment._id ? { ...a, status: 'cancelled' } : a));
                                    } catch (err) {
                                      setError(err.message);
                                    }
                                  }}
                                >
                                  Cancelar
                                </button>
                              ) : null}
      {/* Modal de detalles de cita */}
      {selectedAppointment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative border-2 border-blue-200 animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 text-3xl font-bold focus:outline-none"
              onClick={() => setSelectedAppointment(null)}
              aria-label="Cerrar"
            >
              &times;
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-extrabold text-blue-800">Detalles de la cita</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-32 font-semibold text-gray-700">Paciente:</span>
                <span className="text-gray-900">{selectedAppointment.patientId?.name || 'Sin información'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 font-semibold text-gray-700">Doctor:</span>
                <span className="text-gray-900">{selectedAppointment.doctorId?.name || 'Sin información'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 font-semibold text-gray-700">Fecha:</span>
                <span className="text-gray-900">{new Date(selectedAppointment.date).toLocaleString('es-ES')}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 font-semibold text-gray-700">Motivo:</span>
                <span className="text-gray-900">{selectedAppointment.reason || 'Sin información'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 font-semibold text-gray-700">Notas:</span>
                <span className="text-gray-900">{selectedAppointment.notes || 'Sin información'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 font-semibold text-gray-700">Estado:</span>
                <span className={
                  selectedAppointment.status === 'completed'
                    ? 'text-green-700 font-bold'
                    : selectedAppointment.status === 'cancelled'
                    ? 'text-red-700 font-bold'
                    : 'text-gray-700 font-bold'
                }>
                  {selectedAppointment.status === 'completed' ? 'Completada' : selectedAppointment.status === 'cancelled' ? 'Cancelada' : 'Programada'}
                </span>
              </div>
              {/* Botón para ver receta asignada (igual que en doctor/index) */}
              <button
                className="inline-flex items-center px-4 py-2 border border-blue-500 text-blue-700 font-bold rounded-lg shadow hover:bg-blue-50 transition gap-2 mt-4"
                onClick={async () => {
                  try {
                    // Buscar la receta asociada a la cita (igual que en doctor/index)
                    const res = await fetch(`/api/prescription/fetchPrescriptions?patientId=${selectedAppointment.patientId?._id}&doctorId=${selectedAppointment.doctorId?._id}`);
                    if (!res.ok) throw new Error('No se pudo obtener la receta');
                    const prescriptions = await res.json();
                    if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
                      alert('No se encontró receta para esta cita');
                      return;
                    }
                    // Buscar receta por appointmentId o por fecha cercana
                    const prescription = prescriptions.find((p) => {
                      // Si tienes appointmentId en Prescription, descomenta la siguiente línea:
                      // return p.appointmentId === selectedAppointment._id;
                      // Si no, busca por fecha cercana a la cita (±1 día)
                      const appDate = new Date(selectedAppointment.date).getTime();
                      const presDate = new Date(p.issueDate).getTime();
                      return Math.abs(appDate - presDate) < 1000 * 60 * 60 * 24; // 1 día de diferencia
                    }) || prescriptions[0];
                    if (!prescription || !prescription._id) {
                      alert('No se encontró receta para esta cita');
                      return;
                    }
                    router.push(`/prescriptions/${prescription._id}`);
                  } catch (err) {
                    alert('No se pudo redirigir a la receta');
                  }
                }}
                title="Ver receta asignada"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
                Ver Receta Asignada
              </button>
            </div>
          </div>
        </div>
      ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
