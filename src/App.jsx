import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/app/Dashboard'
import Proveedores from './pages/app/Proveedores'
import Solicitudes from './pages/app/Solicitudes'
import Cotizaciones from './pages/app/Cotizaciones'
import Pipelines from './pages/app/Pipelines'
import Ia from './pages/app/Ia'
import Resultados from './pages/app/Resultados'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/app/proveedores" element={<ProtectedRoute><Proveedores /></ProtectedRoute>} />
          <Route path="/app/solicitudes" element={<ProtectedRoute><Solicitudes /></ProtectedRoute>} />
          <Route path="/app/cotizaciones" element={<ProtectedRoute><Cotizaciones /></ProtectedRoute>} />
          <Route path="/app/pipelines" element={<Navigate to="/app/resultados" replace />} />
          <Route path="/app/ia" element={<Navigate to="/app/resultados" replace />} />
          <Route path="/app/resultados" element={<ProtectedRoute><Resultados /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
