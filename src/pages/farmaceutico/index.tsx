import { useAuth } from '../../hooks/useAuth'
import Navbar from '../../components/ui/Navbar'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function PharmacistDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user.role !== 'pharmacist') {
        router.push('/')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user.role !== 'pharmacist') {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  // Simulación de recetas pendientes
  const recetas = [
    {
      paciente: 'Ana Torres',
      medicamento: 'Paracetamol 500mg',
      fecha: '2025-06-19',
      estatus: 'Pendiente',
    },
    {
      paciente: 'Luis Fernández',
      medicamento: 'Amoxicilina 250mg',
      fecha: '2025-06-20',
      estatus: 'Entregado',
    },
    {
      paciente: 'María López',
      medicamento: 'Ibuprofeno 400mg',
      fecha: '2025-06-21',
      estatus: 'Pendiente',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <div className="flex">
        <main className="flex-1 p-10">
          <h1 className="text-2xl font-semibold mb-8 text-black">Bienvenido, {user.name}</h1>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-black">Recetas por Surtir</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Paciente</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Medicamento</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Estatus</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recetas.map((r, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 text-sm text-gray-800">{r.paciente}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{r.medicamento}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{r.fecha}</td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            r.estatus === 'Pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {r.estatus}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {r.estatus === 'Pendiente' && (
                          <button className="text-sm text-blue-600 hover:underline">Marcar como entregado</button>
                        )}
                        {r.estatus === 'Entregado' && (
                          <span className="text-sm text-gray-500 italic">Completado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
