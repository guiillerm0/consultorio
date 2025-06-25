'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

const especialidades = [
  { label: 'Cardiología', icon: '/icons/corazon.png' },
  { label: 'Dentista', icon: '/icons/dentista.png' },
  { label: 'Pediatría', icon: '/icons/pediatria.png' },
  { label: 'Dermatología', icon: '/icons/dermatologia.png' },
  { label: 'Ginecología', icon: '/icons/especulo.png' },
  { label: 'Neurología', icon: '/icons/neurologia.png' },
  { label: 'Ortopedia', icon: '/icons/ortopedia.png' },
  { label: 'Oftalmología', icon: '/icons/optometria.png' },
  { label: 'Psiquiatría', icon: '/icons/psiquiatria.png' },
  { label: 'Urgencias', icon: '/icons/ambulancia.png' },
  { label: 'Hospitalización', icon: '/icons/hospital.png' },
  { label: 'Laboratorio Clínico', icon: '/icons/clinico.png' },
  { label: 'Consulta General', icon: '/icons/consulta.png' },
]

export default function CategoriasPage() {
  const router = useRouter()

  const handleCategoriaClick = (especialidad: string) => {
    router.push(`/dates/create?especialidad=${encodeURIComponent(especialidad)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-10">
      <button
        onClick={() => router.back()}
        className="text-indigo-600 hover:underline mb-6 text-sm"
      >
        &larr; Volver
      </button>

      <h1 className="text-2xl font-bold mb-6 text-indigo-700 drop-shadow-sm">Especialidades del Hospital</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {especialidades.map((item) => (
          <button
            key={item.label}
            onClick={() => handleCategoriaClick(item.label)}
            className="bg-white/80 p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-indigo-300 group cursor-pointer border border-transparent hover:border-indigo-200"
            style={{ minHeight: 160 }}
          >
            <Image src={item.icon} alt={item.label} width={50} height={50} className="group-hover:scale-110 transition-transform" />
            <h3 className="mt-4 text-md font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">{item.label}</h3>
          </button>
        ))}
      </div>
    </div>
  )
}
