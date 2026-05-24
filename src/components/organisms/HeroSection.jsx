import Button from '../atoms/Button'
import Navbar from './Navbar'
import HeroVideo from '../particles/HeroVideo'
import Scanlines from '../particles/Scanlines'
import Noise from '../particles/Noise'
import '../../styles/organisms/HeroSection.css'

function HeroSection() {
  return (
    <section className="hero-section" id="inicio">
      <HeroVideo />
      <div className="hero-section__overlay" aria-hidden="true" />
      <div className="hero-section__glow" aria-hidden="true" />
      <div className="hero-section__vignette" aria-hidden="true" />
      <Scanlines />
      <Noise />

      <Navbar />

      <div className="container hero-section__container">
        <div className="row min-vh-100 align-items-center">
          <div className="col-12 col-lg-7 col-xl-6">
            <div className="hero-section__content">
              <p className="hero-section__eyebrow">— NEXORA PROCUREMENT OS</p>
              <h1 className="hero-section__title" data-text="AUTOMATE PROCUREMENT. CONTROL THE FLOW.">
                AUTOMATE PROCUREMENT.
                <span>CONTROL THE FLOW.</span>
              </h1>
              <p className="hero-section__description">
                Centraliza solicitudes de compra, compara cotizaciones, gestiona proveedores y automatiza pipelines operativos con trazabilidad, métricas y control en tiempo real.
              </p>
              <div className="hero-section__actions d-flex flex-column flex-sm-row gap-3">
                <Button variant="primary" href="#modulos">▸ Ver módulos</Button>
                <Button variant="secondary" href="#estado">Conectar API</Button>
              </div>
              <p className="hero-section__metadata">
                SPRING BOOT · REACT · POSTGRESQL · API REST · PIPELINES · KPI
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
