import Button from '../atoms/Button'
import '../../styles/organisms/SolutionSection.css'

const flow = ['Solicitud', 'Cotización', 'Negociación', 'Orden', 'Pipeline', 'KPI']

function SolutionSection() {
  return (
    <section className="solution-section" id="solucion">
      <div className="container">
        <div className="solution-section__shell">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-lg-5">
              <p className="solution-section__eyebrow">La solución</p>
              <h2 className="solution-section__title">NEXORA CENTRALIZA EL CICLO COMPLETO.</h2>
            </div>
            <div className="col-12 col-lg-7">
              <p className="solution-section__intro">
                Desde la solicitud inicial hasta la orden de compra, NEXORA organiza cada etapa del proceso y permite automatizar flujos mediante pipelines operativos.
              </p>
              <div className="solution-section__flow" aria-label="Flujo centralizado de abastecimiento">
                {flow.map((item, index) => (
                  <div className="solution-section__flow-item" key={item}>
                    <strong>{item}</strong>
                    {index < flow.length - 1 && <span aria-hidden="true">→</span>}
                  </div>
                ))}
              </div>
              <div className="solution-section__cta">
                <div>
                  <strong>Ordena compras, proveedores y decisiones en una sola plataforma.</strong>
                  <span>Una vista clara para controlar el flujo antes de que se convierta en caos.</span>
                </div>
                <div className="solution-section__actions d-flex flex-column flex-sm-row gap-3">
                  <Button variant="primary" href="#demo">Solicitar demo</Button>
                  <Button variant="secondary" href="#modulos">Ver módulos</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolutionSection
