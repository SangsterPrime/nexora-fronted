import Logo from '../atoms/Logo'
import '../../styles/organisms/Footer.css'

const links = [
  ['Inicio', '#inicio'],
  ['Problema', '#problema'],
  ['Solución', '#solucion'],
  ['Para quién', '#para-quien'],
  ['Módulos', '#modulos'],
  ['Demo', '#demo'],
  ['Arquitectura', '#arquitectura'],
]

function Footer() {
  return (
    <footer className="nexora-footer">
      <div className="container">
        <div className="nexora-footer__inner">
          <a className="nexora-footer__brand" href="#inicio" aria-label="Volver al inicio">
            <Logo />
          </a>
          <nav className="nexora-footer__links" aria-label="Footer navigation">
            {links.map(([label, href]) => (
              <a href={href} key={label}>{label}</a>
            ))}
          </nav>
          <p>NEXORA Procurement OS · React + Spring Boot</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
