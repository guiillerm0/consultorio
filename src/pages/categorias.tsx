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

  return (
    <div className="min-h-screen bg-[#f5f8ff] p-10">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:underline mb-6 text-sm"
      >
        
      </button>

      <h1 className="text-2xl font-bold mb-6 text-gray-800">Especialidades del Hospital</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {especialidades.map((item) => (
          <div
            key={item.label}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition flex flex-col items-center text-center"
          >
            <Image src={item.icon} alt={item.label} width={50} height={50} />
            <h3 className="mt-4 text-md font-medium text-gray-700">{item.label}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}
