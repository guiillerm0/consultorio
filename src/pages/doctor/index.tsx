import { useAuth } from '../../hooks/useAuth'
import Navbar from '../../components/ui/Navbar'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css' // Importa el estilo predeterminado

// Definir interfaces para los tipos
interface Patient {
  _id: string;
  name: string;
  email: string;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  speciality: string;
}

interface Appointment {
  _id: string;
  reason: string;
  notes?: string;
  date: string;
  patientId: Patient;
  doctorId: Doctor;
  createdAt: string;
  updatedAt: string;
}

export default function DoctorDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener las citas del doctor
  const fetchDoctorAppointments = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/appoinments/fetchAppointments?doctorId=${user._id}`);
      const data = await response.json();
      
      if (data.success) {
        setUpcomingAppointments(data.upcomingAppointments);
        setPastAppointments(data.pastAppointments);
      } else {
        setError('No se pudieron cargar las citas');
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role !== 'doctor') {
        router.push('/')
      } else {
        // Cargar citas cuando el usuario está autenticado como doctor
        fetchDoctorAppointments();
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== 'doctor') {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  // Filtrar citas por fecha seleccionada (todas las citas, tanto próximas como pasadas)
  const appointmentsForSelectedDate = [...upcomingAppointments, ...pastAppointments].filter(
    (appointment) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === selectedDate.toDateString();
    }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
   
      <div className="flex">
        <main className="flex-1 p-10">
          <h1 className="text-3xl font-extrabold mb-2 text-blue-900 drop-shadow-sm">Bienvenido Dr. {user.name}</h1>
          <p className="text-blue-700 mb-8 text-lg">
            Aquí puede gestionar todas sus citas y crear recetas para sus pacientes.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendario funcional */}
            <div className="bg-white/90 p-8 rounded-2xl shadow-2xl border border-blue-100 text-black">
              <h2 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Calendario de Citas
              </h2>
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                  }
                }}
                value={selectedDate}
                className="w-full rounded-lg border border-blue-200 shadow-sm"
              />
              <p className="mt-4 text-base text-blue-900 font-semibold">
                Fecha seleccionada: <span className="font-normal">{selectedDate.toLocaleDateString()}</span>
              </p>
              <div className="mt-4 flex flex-col gap-1">
                <p className="text-sm text-blue-700 font-medium">
                  Total de citas: <span className="font-bold">{upcomingAppointments.length + pastAppointments.length}</span>
                </p>
                <p className="text-sm text-green-700 font-medium">
                  Próximas: <span className="font-bold">{upcomingAppointments.length}</span>
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  Pasadas: <span className="font-bold">{pastAppointments.length}</span>
                </p>
              </div>
            </div>

            {/* Lista de citas para la fecha seleccionada */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 10v4m8-8h-4m-4 0H4" /></svg>
                Pacientes para el día
              </h2>
              {loading ? (
                <p className="text-blue-600 animate-pulse">Cargando citas...</p>
              ) : error ? (
                <p className="text-red-500 font-semibold">{error}</p>
              ) : appointmentsForSelectedDate.length === 0 ? (
                <p className="text-gray-600">No hay pacientes asignados para esta fecha.</p>
              ) : (
                <div className="space-y-4">
                  {appointmentsForSelectedDate.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="bg-white/90 p-5 rounded-xl shadow-md flex justify-between items-center border border-blue-100 hover:shadow-lg transition-shadow"
                    >
                      <div>
                        <p className="font-bold text-blue-900 text-lg">{appointment.patientId.name}</p>
                        <p className="text-sm text-blue-700">Motivo: <span className="font-medium">{appointment.reason}</span></p>
                        {appointment.notes && (
                          <p className="text-xs text-gray-500">Notas: {appointment.notes}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Hora: {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button 
                          onClick={() => router.push(`/prescriptions/create?patientId=${appointment.patientId._id}&patientName=${appointment.patientId.name}&patientEmail=${appointment.patientId.email}`)} 
                          className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-800 text-sm font-semibold shadow transition flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          Crear Receta
                        </button>
                        <button 
                          onClick={() => {
                            alert('Esta funcionalidad estará disponible próximamente');
                          }} 
                          className="px-4 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-500 hover:text-white text-xs font-semibold shadow transition flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          Cancelar Cita
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button 
                onClick={fetchDoctorAppointments}
                className="mt-6 px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-900 transition font-bold shadow flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5 9A7.001 7.001 0 0112 5c3.866 0 7 3.134 7 7 0 1.306-.417 2.518-1.127 3.5M12 19v2m0 0H9m3 0h3" /></svg>
                Actualizar citas
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
