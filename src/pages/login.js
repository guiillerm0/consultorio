import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const result = await login(email, password)
    if (result.success) {
      router.push('/')
    } else {
      setError(result.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 py-12 px-4">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-xl p-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-indigo-700 mb-2 drop-shadow-sm">
            Iniciar sesión
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-2 text-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-4 py-2 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white/90 shadow-sm transition"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-4 py-2 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white/90 shadow-sm transition"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md transition"
            >
              Iniciar sesión
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
            ¿No tienes una cuenta? <span className="underline">Regístrate</span>
          </Link>
        </div>
      </div>
    </div>
  )
}