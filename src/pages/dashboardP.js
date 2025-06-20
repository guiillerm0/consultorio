import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Image from 'next/image'

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user.role !== 'patient') {
        // Redirigir dependiendo del rol
        if (user.role === 'doctor') router.push('/doctor')
        else if (user.role === 'pharmacist') router.push('/farmaceutico')
        else router.push('/')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user.role !== 'patient') {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <div className="flex">
        <main className="flex-1 p-10">
          <h1 className="text-2xl font-semibold mb-8 text-black">Bienvenido, {user.name}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Categorías */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-black">Categories</h2>
                <button className="text-sm text-blue-600 font-medium">Show All</button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Consultation', icon: '/icons/consulta.png' },
                  { label: 'Dentist', icon: '/icons/dentista.png' },
                  { label: 'Cardiologist', icon: '/icons/corazon.png' },
                  { label: 'Hospital', icon: '/icons/hospital..png' },
                  { label: 'Emergency', icon: '/icons/ambulancia.png' },
                  { label: 'Laboratory', icon: '/icons/clinical.png' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white p-4 rounded-lg shadow flex flex-col items-center hover:shadow-md transition"
                  >
                    <Image src={item.icon} alt={item.label} width={40} height={40} />
                    <span className="mt-2 text-sm text-gray-700 text-center">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Doctors */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-black">Top doctors</h2>
              <div className="space-y-4">
                {[
                  {
                    name: 'dr. Olivia Wilson',
                    specialty: 'Consultant - Physiotherapy',
                    image: '/doctors/doctora.jpg',
                  },
                  {
                    name: 'dr. Jonathan Patterson',
                    specialty: 'Consultant - Internal Medicine',
                    image: '/doctors/doctor.jpg',
                  },
                ].map((doctor) => (
                  <div
                    key={doctor.name}
                    className="bg-white p-4 rounded-lg shadow flex items-center gap-4"
                  >
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{doctor.name}</p>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
