import '../../styles/organisms/OperationalFlowSection.css'

const flowSteps = [
  ['01', 'Solicitud'],
  ['02', 'Cotización'],
  ['03', 'Negociación'],
  ['04', 'Orden'],
  ['05', 'Pipeline'],
  ['06', 'KPI'],
]

function OperationalFlowSection() {
  return (
    <section className="flow-section" id="flujo">
      <div className="container">
        <div className="row align-items-end g-4 mb-4 mb-lg-5">
          <div className="col-12 col-lg-7">
            <p className="flow-section__eyebrow">Cómo opera</p>
            <h2 className="flow-section__title">Del requerimiento al indicador.</h2>
          </div>
          <div className="col-12 col-lg-5">
            <p className="flow-section__intro">
              El flujo mantiene a compras, operación y dirección alineados desde que nace una necesidad hasta que el resultado se mide.
            </p>
          </div>
        </div>

        <div className="flow-section__track">
          {flowSteps.map(([number, label]) => (
            <article className="flow-section__step" key={label}>
              <span className="flow-section__step-number">{number}</span>
              <h3>{label}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OperationalFlowSection
