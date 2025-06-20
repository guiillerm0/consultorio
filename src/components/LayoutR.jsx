// components/Layout.jsx
import Navbar from './ui/Navbar'
import Sidebar from './ui/Sidebar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">

      <div className="flex">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}