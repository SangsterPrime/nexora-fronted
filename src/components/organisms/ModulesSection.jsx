import '../../styles/organisms/ModulesSection.css'

const modules = [
  {
    title: 'Proveedores',
    text: 'Unifica datos, contactos, reputación y cumplimiento para trabajar con proveedores confiables y visibles.',
    endpoint: '/api/proveedores',
  },
  {
    title: 'Solicitudes',
    text: 'Convierte requerimientos internos en flujos claros, priorizados y fáciles de seguir por el equipo.',
    endpoint: '/api/solicitudes-compra',
  },
  {
    title: 'Cotizaciones',
    text: 'Compara ofertas con criterios consistentes para decidir mejor, más rápido y con respaldo.',
    endpoint: '/api/cotizaciones',
  },
  {
    title: 'Negociaciones',
    text: 'Mantiene historial de conversaciones, contraofertas y decisiones para no perder contexto comercial.',
    endpoint: '/api/negociaciones',
  },
  {
    title: 'Órdenes',
    text: 'Ordena la emisión de compras desde cotizaciones aprobadas, con menos pasos manuales y más control.',
    endpoint: '/api/ordenes-compra',
  },
  {
    title: 'Pipelines',
    text: 'Automatiza etapas del abastecimiento y habilita operación medible a través de pipelines.',
    endpoint: '/api/pipelines',
  },
]

function ModulesSection() {
  return (
    <section className="modules-section" id="modulos">
      <div className="container">
        <div className="row justify-content-between align-items-end g-4 mb-4 mb-lg-5">
          <div className="col-12 col-lg-7">
            <p className="modules-section__eyebrow">Plataforma SaaS</p>
            <h2 className="modules-section__title">Todo el abastecimiento en un solo sistema.</h2>
          </div>
          <div className="col-12 col-lg-4">
            <p className="modules-section__intro">
              NEXORA organiza los módulos críticos del ciclo de compra para que operación, finanzas y dirección trabajen con la misma información.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {modules.map((module, index) => (
            <div className="col-12 col-md-6 col-xl-4" key={module.title}>
              <article className="card modules-section__card h-100">
                <div className="card-body">
                  <span className="modules-section__number">0{index + 1}</span>
                  <h3 className="modules-section__card-title">{module.title}</h3>
                  <p className="modules-section__card-text">{module.text}</p>
                  <code className="modules-section__endpoint">{module.endpoint}</code>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ModulesSection
