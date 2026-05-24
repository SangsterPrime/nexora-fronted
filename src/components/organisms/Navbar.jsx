import Logo from '../atoms/Logo'
import '../../styles/organisms/Navbar.css'

const navLinks = [
  ['Inicio', '#inicio'],
  ['Flujo', '#flujo'],
  ['Módulos', '#modulos'],
  ['Arquitectura', '#arquitectura'],
  ['Estado', '#estado'],
]

function Navbar() {
  return (
    <nav className="navbar navbar-expand-md nexora-navbar">
      <div className="container">
        <a className="navbar-brand nexora-navbar__brand" href="#inicio" aria-label="NEXORA home">
          <Logo />
        </a>
        <div className="nexora-navbar__links d-none d-md-flex ms-auto">
          {navLinks.map(([label, href]) => (
            <a className="nexora-navbar__link" href={href} key={label}>
              {label}
            </a>
          ))}
        </div>
        <span className="nexora-navbar__status d-md-none ms-auto">ONLINE</span>
      </div>
    </nav>
  )
}

export default Navbar
