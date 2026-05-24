import '../../styles/organisms/ModulesSection.css'

const modules = [
  {
    title: 'Proveedores',
    text: 'Centraliza datos maestros, reputación, cumplimiento y estado operativo de cada proveedor.',
    endpoint: '/api/proveedores',
  },
  {
    title: 'Solicitudes',
    text: 'Registra requerimientos internos, prioridades, responsables y seguimiento del ciclo de compra.',
    endpoint: '/api/solicitudes-compra',
  },
  {
    title: 'Cotizaciones',
    text: 'Compara ofertas por monto, riesgo, plazo, condiciones comerciales y trazabilidad.',
    endpoint: '/api/cotizaciones',
  },
  {
    title: 'Negociaciones',
    text: 'Conserva historial de mensajes, contraofertas, decisiones y estados de negociación.',
    endpoint: '/api/negociaciones',
  },
  {
    title: 'Órdenes',
    text: 'Emite órdenes de compra basadas en cotizaciones ganadoras y reglas operativas.',
    endpoint: '/api/ordenes-compra',
  },
  {
    title: 'Pipelines',
    text: 'Orquesta automatizaciones, auditoría y ejecución de procesos del flujo de abastecimiento.',
    endpoint: '/api/pipelines',
  },
]

function ModulesSection() {
  return (
    <section className="modules-section" id="modulos">
      <div className="container">
        <div className="row justify-content-between align-items-end g-4 mb-4 mb-lg-5">
          <div className="col-12 col-lg-7">
            <p className="modules-section__eyebrow">Procurement OS</p>
            <h2 className="modules-section__title">Módulos principales</h2>
          </div>
          <div className="col-12 col-lg-4">
            <p className="modules-section__intro">
              Componentes del dominio conectados a una API REST preparada para operación, auditoría y crecimiento incremental.
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
