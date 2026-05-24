import { Navigate, useLocation } from 'react-router-dom'
import Logo from '../components/atoms/Logo'
import { useAuth } from '../context/AuthContext'
import { loginWithGoogle } from '../services/authService'
import '../styles/pages/Login.css'

function Login() {
  const { authenticated, loading, error } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/app'

  if (!loading && authenticated) {
    return <Navigate to={from} replace />
  }

  return (
    <main className="login-page">
      <section className="login-page__panel">
        <a className="login-page__brand" href="/" aria-label="Volver a NEXORA">
          <Logo />
        </a>
        <p className="login-page__eyebrow">Acceso seguro</p>
        <h1>Ingresa a NEXORA</h1>
        <p className="login-page__text">
          Accede a la plataforma NEXORA para gestionar proveedores, solicitudes, cotizaciones y procesos de abastecimiento.
        </p>
        {error && <div className="login-page__error">No fue posible validar la sesión actual. Puedes continuar con Google.</div>}
        <button className="login-page__google" type="button" onClick={loginWithGoogle} disabled={loading}>
          <span>G</span>
          {loading ? 'Validando sesión...' : 'Continuar con Google'}
        </button>
        <p className="login-page__note">
          La autenticación la gestiona el backend Spring Boot mediante Google OAuth2. NEXORA no guarda tokens en el navegador.
        </p>
      </section>
    </main>
  )
}

export default Login
