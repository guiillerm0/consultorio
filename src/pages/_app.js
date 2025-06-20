import { AuthProvider } from '../context/AuthContext'
import '../styles/globals.css'
import Navbar from '../components/ui/Navbar'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  )
}

export default MyApp