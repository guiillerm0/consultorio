import { useAuth } from '../../hooks/useAuth'
import Navbar from '../../components/ui/Navbar'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css' // Importa el estilo predeterminado

export default function DoctorDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user.role !== 'doctor') {
        router.push('/')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user.role !== 'doctor') {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  // Simulación de pacientes del doctor
  const pacientes = [
    { nombre: 'Juan Pérez', motivo: 'Dolor de cabeza', fecha: '2025-06-21' },
    { nombre: 'Laura García', motivo: 'Revisión anual', fecha: '2025-06-20' },
    { nombre: 'Carlos Ruiz', motivo: 'Presión alta', fecha: '2025-06-21' },
  ]

  // Filtrar pacientes por fecha seleccionada
  const pacientesDelDia = pacientes.filter(
    (p) => new Date(p.fecha).toDateString() === selectedDate.toDateString()
  )

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <div className="flex">
        <main className="flex-1 p-10">
          <h1 className="text-2xl font-semibold mb-8 text-black">Bienvenido, Dr. {user.name}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendario funcional */}
            <div className="bg-white p-6 rounded-lg shadow text-black">
              <h2 className="text-lg font-semibold mb-4 text-black">Calendario de Citas</h2>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="w-full"
              />
              <p className="mt-4 text-sm text-black ">
                Fecha seleccionada: {selectedDate.toDateString()}
              </p>
            </div>

            {/* Lista de pacientes para la fecha seleccionada */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-black">Pacientes para el día</h2>
              {pacientesDelDia.length === 0 ? (
                <p className="text-gray-600">No hay pacientes asignados para esta fecha.</p>
              ) : (
                <div className="space-y-4">
                  {pacientesDelDia.map((paciente, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{paciente.nombre}</p>
                        <p className="text-sm text-gray-600">Motivo: {paciente.motivo}</p>
                      </div>
                      <button className="text-blue-600 text-sm hover:underline">Ver detalles</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
