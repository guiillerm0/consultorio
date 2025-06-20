import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    clinic: '',
    specialty: '',
    pharmacy: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar')
      }

      setSuccess('Registro exitoso. Redirigiendo...')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear una cuenta
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Nombre completo</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                id="role"
                name="role"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="patient">Paciente</option>
                <option value="doctor">Médico</option>
                <option value="pharmacist">Farmacéutico</option>
              </select>
            </div>
            
            {formData.role === 'doctor' && (
              <>
                <div>
                  <label htmlFor="clinic" className="block text-sm font-medium text-gray-700 mb-1">Clínica</label>
                  <select
                    id="clinic"
                    name="clinic"
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    value={formData.clinic}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione una clínica</option>
                    <option value="family">Medicina Familiar</option>
                    <option value="specialty">Alta Especialidad</option>
                  </select>
                </div>
                {formData.clinic === 'specialty' && (
                  <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                    <input
                      id="specialty"
                      name="specialty"
                      type="text"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Especialidad médica"
                      value={formData.specialty}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </>
            )}
            
            {formData.role === 'pharmacist' && (
              <div>
                <label htmlFor="pharmacy" className="block text-sm font-medium text-gray-700 mb-1">Farmacia</label>
                <input
                  id="pharmacy"
                  name="pharmacy"
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Nombre de la farmacia"
                  value={formData.pharmacy}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Registrarse
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            ¿Ya tienes una cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}