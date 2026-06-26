import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Logo from '../components/atoms/Logo'
import { useAuth } from '../context/AuthContext'
import '../styles/layouts/AppLayout.css'

const appLinks = [
  ['Dashboard', '/app', true],
  ['Proveedores', '/app/proveedores'],
  ['Solicitudes', '/app/solicitudes'],
  ['Cotizaciones', '/app/cotizaciones'],
  ['Resultados', '/app/resultados'],
]

function AppLayout({ children, eyebrow = 'NEXORA APP', title, description }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const displayName = user?.nombre || user?.name || user?.fullName || 'Usuario NEXORA'
  const email = user?.email || user?.correo || ''
  const photoUrl = user?.fotoUrl || user?.photoUrl || user?.picture || user?.avatarUrl

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className={`app-layout ${sidebarOpen ? 'app-layout--sidebar-open' : ''}`}>
      <button
        className="app-layout__menu-button"
        type="button"
        onClick={() => setSidebarOpen((isOpen) => !isOpen)}
        aria-controls="app-sidebar"
        aria-expanded={sidebarOpen}
      >
        <span className="app-layout__menu-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>Menú</span>
      </button>

      <button
        className="app-layout__scrim"
        type="button"
        onClick={closeSidebar}
        aria-label="Cerrar navegación"
      />

      <aside className="app-layout__sidebar" id="app-sidebar">
        <a className="app-layout__brand" href="/" aria-label="Volver al sitio público">
          <Logo />
          <span>Procurement OS</span>
        </a>
        <div className="app-layout__user-card">
          {photoUrl ? <img src={photoUrl} alt="" /> : <div className="app-layout__user-avatar">{displayName.charAt(0)}</div>}
          <div>
            <strong>{displayName}</strong>
            {email && <span>{email}</span>}
          </div>
        </div>
        <nav className="app-layout__nav" aria-label="Navegación interna">
          {appLinks.map(([label, to, end]) => (
            <NavLink className="app-layout__nav-link" end={end} key={to} to={to} onClick={closeSidebar}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="app-layout__logout" type="button" onClick={() => { handleLogout().catch(() => {}) }}>
          Cerrar sesión
        </button>
        <a className="app-layout__return" href="/">Volver al sitio</a>
      </aside>

      <div className="app-layout__main">
        <header className="app-layout__header">
          <div>
            <p>{eyebrow}</p>
            {title && <h1>{title}</h1>}
          </div>
          {description && <span>{description}</span>}
        </header>
        <main className="app-layout__content">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
