import { useAuth } from '../../hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Sidebar() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) return null

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-1">
            <Link
              href="/dashboard"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${router.pathname === '/dashboard' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              Dashboard
            </Link>
            
            {user.role === 'doctor' && (
              <Link
                href="/prescriptions/create"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${router.pathname === '/prescriptions/create' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Crear Receta
              </Link>
            )}
            
            {user.role === 'pharmacist' && (
              <Link
                href="/prescriptions/verify"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${router.pathname === '/prescriptions/verify' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                Verificar Recetas
              </Link>
            )}
            
            <Link
              href="/prescriptions"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${router.pathname === '/prescriptions' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              Mis Recetas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}