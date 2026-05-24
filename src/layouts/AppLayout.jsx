import { NavLink } from 'react-router-dom'
import Logo from '../components/atoms/Logo'
import '../styles/layouts/AppLayout.css'

const appLinks = [
  ['Dashboard', '/app', true],
  ['Proveedores', '/app/proveedores'],
  ['Solicitudes', '/app/solicitudes'],
  ['Cotizaciones', '/app/cotizaciones'],
  ['Pipelines', '/app/pipelines'],
]

function AppLayout({ children, eyebrow = 'NEXORA APP', title, description }) {
  return (
    <div className="app-layout">
      <aside className="app-layout__sidebar">
        <a className="app-layout__brand" href="/" aria-label="Volver al sitio público">
          <Logo />
          <span>Procurement OS</span>
        </a>
        <div className="app-layout__demo-badge">Modo demo · sin autenticación</div>
        <nav className="app-layout__nav" aria-label="Navegación interna">
          {appLinks.map(([label, to, end]) => (
            <NavLink className="app-layout__nav-link" end={end} key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
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
