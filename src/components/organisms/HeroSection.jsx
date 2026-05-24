import Button from '../atoms/Button'
import Navbar from './Navbar'
import HeroVideo from '../particles/HeroVideo'
import DataParticles from '../particles/DataParticles'
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
      <DataParticles />
      <Scanlines />
      <Noise />

      <Navbar />

      <div className="container hero-section__container">
        <div className="row min-vh-100 align-items-center">
          <div className="col-12 col-lg-7 col-xl-6">
            <div className="hero-section__content">
              <p className="hero-section__eyebrow">— NEXORA PROCUREMENT OS</p>
              <h1 className="hero-section__title" data-text="CONTROL YOUR PROCUREMENT FLOW.">
                CONTROL YOUR
                <span>PROCUREMENT FLOW.</span>
              </h1>
              <p className="hero-section__description">
                Centraliza solicitudes, proveedores, cotizaciones y órdenes de compra en una sola plataforma diseñada para reducir caos operativo, mejorar trazabilidad y acelerar decisiones.
              </p>
              <div className="hero-section__actions d-flex flex-column flex-sm-row gap-3">
                <Button variant="primary" href="#demo">Solicitar demo</Button>
                <Button variant="secondary" href="#solucion">Ver plataforma</Button>
              </div>
              <p className="hero-section__metadata">
                PROCUREMENT · SUPPLIERS · QUOTES · PIPELINES · KPI
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
