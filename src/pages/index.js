import { useAuth } from '../hooks/useAuth'
import Link from 'next/link'

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <main className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-black">Sistema de Recetas Médicas Digitales</h1>
        
        {isAuthenticated ? (
          <div className="text-center">
            <h2 className="text-2xl mb-4 text-black">Bienvenido, {user.name}</h2>
            <div className="flex justify-center gap-4">
              {user.role === 'doctor' && (
                <Link href="/prescriptions/create" className="btn-primary">
                 
                </Link>
              )}
              {user.role === 'pharmacist' && (
                <Link href="/prescriptions/verify" className="btn-primary">
                 
                </Link>
              )}
              <Link href="/prescriptions" className="btn-primary">
                
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl mb-6">Por favor inicia sesión para continuar</h2>
            <div className="flex justify-center gap-4">
              <Link href="/login" className="btn-primary">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="btn-primary">
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}