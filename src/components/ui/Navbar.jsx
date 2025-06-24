import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  // Links comunes para todos los usuarios autenticados
  const commonLinks = [
    { href: "/dashboardP", name: "Inicio" },
  ];

  // Links específicos por rol
  const roleBasedLinks = {
    patient: [
      { href: "/prescriptions", name: "Recetas" },
      { href: "/dates", name: "Mis Citas" },
    ],
    doctor: [
      { href: "/prescriptions", name: "Recetas" },
    ],
    pharmacist : [
      { href: "/prescriptions", name: "recetas" },
    ],
  };

  // Obtener los links según el rol del usuario
  const getUserLinks = () => {
    if (!user?.role) return commonLinks;
    return [...commonLinks, ...(roleBasedLinks[user.role] || [])];
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Consultorio Digital
              </Link>
            </div>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {getUserLinks().map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500 text-sm">
                    {user?.name} ({user?.role})
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}