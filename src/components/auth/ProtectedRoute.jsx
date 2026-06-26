import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/auth/ProtectedRoute.css'

function ProtectedRoute({ children }) {
  const { authenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="protected-route-loading__card">
          <span />
          <p>Validando sesión</p>
          <strong>Conectando con NEXORA</strong>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
