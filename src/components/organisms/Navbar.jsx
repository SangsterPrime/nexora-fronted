import Logo from '../atoms/Logo'
import '../../styles/organisms/Navbar.css'

const navLinks = [
  ['Inicio', '#inicio'],
  ['Problema', '#problema'],
  ['Solución', '#solucion'],
  ['Para quién', '#para-quien'],
  ['Módulos', '#modulos'],
  ['Demo', '#demo'],
  ['Arquitectura', '#arquitectura'],
]

function Navbar() {
  return (
    <nav className="navbar navbar-expand-md nexora-navbar">
      <div className="container">
        <a className="navbar-brand nexora-navbar__brand" href="#inicio" aria-label="NEXORA home">
          <Logo />
        </a>
        <div className="nexora-navbar__links ms-md-auto">
          {navLinks.map(([label, href]) => (
            <a className="nexora-navbar__link" href={href} key={label}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
