import Button from '../atoms/Button'
import '../../styles/organisms/FinalCTASection.css'

function FinalCTASection() {
  return (
    <section className="final-cta-section" id="contacto">
      <div className="container">
        <div className="final-cta-section__panel">
          <p className="final-cta-section__eyebrow">NEXORA</p>
          <h2 className="final-cta-section__title">¿LISTO PARA ORDENAR TU FLUJO DE COMPRAS?</h2>
          <p className="final-cta-section__text">
            NEXORA convierte procesos de abastecimiento dispersos en un sistema claro, medible y automatizable.
          </p>
          <div className="final-cta-section__actions d-flex flex-column flex-sm-row justify-content-center gap-3">
            <Button variant="primary" href="/app">Entrar a la plataforma</Button>
            <Button variant="secondary" href="#arquitectura">Ver arquitectura</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTASection
