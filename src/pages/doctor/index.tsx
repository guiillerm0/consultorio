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
    <div className="min-h-screen bg-[#f5f8ff]">
      <div className="flex">
        <main className="flex-1 p-10">
          <h1 className="text-2xl font-semibold mb-2 text-black">Bienvenido, Dr. {user.name}</h1>
          <p className="text-gray-600 mb-8">
            Aquí puede gestionar todas sus citas y crear recetas para sus pacientes.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendario funcional */}
            <div className="bg-white p-6 rounded-lg shadow text-black">
              <h2 className="text-lg font-semibold mb-4 text-black">Calendario de Citas</h2>              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                  }
                }}
                value={selectedDate}
                className="w-full"
              />
              <p className="mt-4 text-sm text-black ">
                Fecha seleccionada: {selectedDate.toDateString()}
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Total de citas: {upcomingAppointments.length + pastAppointments.length}
                </p>
                <p className="text-sm text-blue-600">
                  Próximas: {upcomingAppointments.length}
                </p>
                <p className="text-sm text-gray-500">
                  Pasadas: {pastAppointments.length}
                </p>
              </div>
            </div>

            {/* Lista de citas para la fecha seleccionada */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-black">Pacientes para el día</h2>
              {loading ? (
                <p className="text-gray-600">Cargando citas...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : appointmentsForSelectedDate.length === 0 ? (
                <p className="text-gray-600">No hay pacientes asignados para esta fecha.</p>
              ) : (
                <div className="space-y-4">
                  {appointmentsForSelectedDate.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{appointment.patientId.name}</p>
                        <p className="text-sm text-gray-600">Motivo: {appointment.reason}</p>
                        {appointment.notes && (
                          <p className="text-xs text-gray-500">Notas: {appointment.notes}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Hora: {new Date(appointment.date).toLocaleTimeString()}
                        </p>
                      </div>                      <div className="flex flex-col items-end gap-2">
                        <button 
                          onClick={() => router.push(`/prescriptions/create?patientId=${appointment.patientId._id}&patientName=${appointment.patientId.name}&patientEmail=${appointment.patientId.email}`)} 
                          className="text-blue-600 text-sm hover:underline">
                          Crear Receta
                        </button>
                        <button 
                          onClick={() => {
                            // Aquí se podría implementar la lógica para cancelar la cita
                            // Por ahora solo mostramos una alerta
                            alert('Esta funcionalidad estará disponible próximamente');
                          }} 
                          className="text-red-500 text-xs hover:underline">
                          Cancelar Cita
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={fetchDoctorAppointments}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Actualizar citas
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
