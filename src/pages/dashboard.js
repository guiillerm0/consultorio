import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/ui/Navbar'
import Sidebar from '../components/ui/Sidebar'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-6">Bienvenido, {user.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tarjetas de resumen */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-2">Tu Rol</h2>
              <p className="text-gray-600 capitalize">{user.role}</p>
            </div>
            
            {user.role === 'doctor' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-2">Clínica</h2>
                <p className="text-gray-600">
                  {user.clinic === 'family' ? 'Medicina Familiar' : 'Alta Especialidad'}
                </p>
                {user.specialty && (
                  <p className="text-gray-600 mt-1">Especialidad: {user.specialty}</p>
                )}
              </div>
            )}
            
            {user.role === 'pharmacist' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-2">Farmacia</h2>
                <p className="text-gray-600">{user.pharmacy}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}