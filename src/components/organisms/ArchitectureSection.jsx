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

const trustItems = [
  'MVP funcional conectado a backend Spring Boot',
  'CRUD real de proveedores',
  'API documentable con Swagger',
  'Preparado para escalar módulos',
]

const nextPhaseModules = [
  '/app',
  '/app/proveedores',
  '/app/solicitudes',
  '/app/cotizaciones',
  '/app/pipelines',
]

function ArchitectureSection() {
  return (
    <section className="architecture-section" id="arquitectura">
      <div className="container">
        <div className="row justify-content-between align-items-end g-4 mb-4 mb-lg-5">
          <div className="col-12 col-lg-7">
            <p className="architecture-section__eyebrow">ARQUITECTURA</p>
            <h2 className="architecture-section__title">ARQUITECTURA PREPARADA PARA CRECER.</h2>
          </div>
          <div className="col-12 col-lg-4">
            <p className="architecture-section__intro">
              NEXORA separa frontend, backend y base de datos para facilitar mantenimiento, despliegue y evolución del producto.
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

        <div className="architecture-section__trust" aria-label="Evidencia técnica de confianza">
          {trustItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="architecture-section__roadmap" aria-label="Estructura preparada para fase dos">
          <div>
            <p className="architecture-section__roadmap-label">Fase 2 preparada</p>
            <h3>Landing pública hoy. Aplicación interna después.</h3>
          </div>
          <div className="architecture-section__roadmap-list">
            {nextPhaseModules.map((modulePath) => (
              <code key={modulePath}>{modulePath}</code>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ArchitectureSection
