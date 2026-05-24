import '../../styles/organisms/BenefitsSection.css'

const benefits = [
  {
    title: 'Trazabilidad completa',
    text: 'Cada solicitud, cotización y decisión queda asociada a un flujo consultable para auditoría y seguimiento.',
    stat: '100% trazabilidad del flujo',
  },
  {
    title: 'Comparación inteligente de cotizaciones',
    text: 'Ordena ofertas por criterios comerciales y operativos para decidir con menos fricción y más contexto.',
    stat: '-30% tiempo de revisión',
  },
  {
    title: 'Gestión centralizada de proveedores',
    text: 'Consolida datos, estado, reputación y cumplimiento en un único módulo conectado al backend real.',
    stat: '+40% visibilidad operativa',
  },
  {
    title: 'Métricas KPI para tomar decisiones',
    text: 'Convierte actividad operativa en indicadores claros para medir carga, tiempos, riesgo y ejecución.',
    stat: '24/7 lectura ejecutiva',
  },
]

function BenefitsSection() {
  return (
    <section className="benefits-section" id="beneficios">
      <div className="container">
        <div className="row justify-content-between align-items-end g-4 mb-4 mb-lg-5">
          <div className="col-12 col-lg-7">
            <p className="benefits-section__eyebrow">Impacto operativo</p>
            <h2 className="benefits-section__title">
              MENOS FRICCIÓN.
              <span>MÁS CONTROL.</span>
            </h2>
          </div>
          <div className="col-12 col-lg-4">
            <p className="benefits-section__intro">
              Diseñado para equipos que necesitan ordenar compras, proveedores y decisiones sin perder velocidad.
            </p>
          </div>
        </div>

        <div className="row g-3 g-lg-4">
          {benefits.map((benefit) => (
            <div className="col-12 col-md-6" key={benefit.title}>
              <article className="benefits-section__card h-100">
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
                <div className="benefits-section__stat">
                  <strong>{benefit.stat}</strong>
                  <span>demo metric</span>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BenefitsSection
