import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  // Links comunes para todos los usuarios autenticados
  const commonLinks = [
  ];

  // Links específicos por rol
  const roleBasedLinks = {
    patient: [
          { href: "/dashboardP", name: "Inicio" },
      { href: "/prescriptions", name: "Recetas" },
      { href: "/dates", name: "Mis Citas" },
    ],
    doctor: [
          { href: "/dashboardP", name: "Inicio" },
      { href: "/prescriptions", name: "Recetas" },
    ],
    pharmacist : [
      { href: "/prescriptions", name: "Recetas" },
    ],
  };

  // Obtener los links según el rol del usuario
  const getUserLinks = () => {
    if (!user?.role) return commonLinks;
    return [...commonLinks, ...(roleBasedLinks[user.role] || [])];
  };

  return (
    <nav className="bg-gradient-to-r from-blue-100 to-blue-300 border-b border-blue-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-blue-900 hover:text-blue-700 transition">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
              Consultorio
            </Link>
            {isAuthenticated && (
              <div className="hidden sm:flex sm:space-x-2 ml-4">
                {getUserLinks().map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-blue-800 hover:text-blue-900 px-2 py-1 rounded transition-colors text-base font-medium hover:bg-blue-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="hidden sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-blue-900 text-sm font-medium bg-blue-100 px-3 py-1 rounded-full">
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1 bg-white text-blue-700 rounded hover:bg-blue-200 text-sm font-medium border border-blue-200 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}