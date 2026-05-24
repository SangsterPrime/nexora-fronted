import '../../styles/organisms/ArchitectureSection.css'

const architectureCards = [
  {
    label: 'Frontend',
    title: 'React + Vite + Bootstrap',
    text: 'Interfaz modular, rápida y responsive para operar el ciclo de abastecimiento desde una experiencia premium.',
  },
  {
    label: 'Backend',
    title: 'Java 21 + Spring Boot + JPA + PostgreSQL',
    text: 'API de dominio preparada para usuarios, proveedores, compras, cotizaciones, órdenes y pipelines.',
  },
  {
    label: 'API',
    title: 'REST + Swagger/OpenAPI + Actuator',
    text: 'Contratos HTTP claros, documentación técnica y base para health checks operativos.',
  },
]

function ArchitectureSection() {
  return (
    <section className="architecture-section" id="arquitectura">
      <div className="container">
        <div className="row justify-content-between align-items-end g-4 mb-4 mb-lg-5">
          <div className="col-12 col-lg-7">
            <p className="architecture-section__eyebrow">Arquitectura</p>
            <h2 className="architecture-section__title">Stack listo para MVP real.</h2>
          </div>
          <div className="col-12 col-lg-4">
            <p className="architecture-section__intro">
              Separación clara entre UI, API REST y persistencia para crecer hacia autenticación, dashboards y automatizaciones reales.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {architectureCards.map((card) => (
            <div className="col-12 col-lg-4" key={card.label}>
              <article className="architecture-section__card h-100">
                <span>{card.label}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ArchitectureSection
