import { useAuth } from '../hooks/useAuth'
import Link from 'next/link'

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
        <span className="text-lg text-gray-600 animate-pulse">Cargando...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center items-center">
      <main className="w-full max-w-xl bg-white/80 rounded-2xl shadow-xl p-8 mt-12 mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 text-indigo-700 tracking-tight drop-shadow-md">
          Sistema de Recetas Médicas Digitales
        </h1>
        {isAuthenticated ? (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl mb-6 text-gray-800 font-semibold">
              Bienvenido {' '}
              <span className="text-black">{user.name}</span>
            </h2>
             </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl mb-8 text-gray-700 font-medium">
              Por favor inicia sesión para continuar
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/login"
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </main>
      <footer className="text-xs text-gray-400 mt-auto mb-4">
        &copy; {new Date().getFullYear()} Consultorio Digital
      </footer>
    </div>
  )
}