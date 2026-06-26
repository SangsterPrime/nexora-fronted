import '../../styles/organisms/ProblemSection.css'

const problems = [
  {
    title: 'Solicitudes dispersas',
    text: 'Requerimientos que avanzan por correos, chats o planillas sin una línea clara de seguimiento.',
  },
  {
    title: 'Proveedores sin control',
    text: 'Datos maestros incompletos, contactos duplicados y poca visibilidad sobre desempeño o cumplimiento.',
  },
  {
    title: 'Cotizaciones difíciles de comparar',
    text: 'Ofertas con formatos distintos que demoran la revisión y dejan decisiones comerciales poco trazables.',
  },
  {
    title: 'Falta de métricas y trazabilidad',
    text: 'Procesos que terminan sin historial consolidado, sin KPIs operativos y sin evidencia para auditar.',
  },
]

function ProblemSection() {
  return (
    <section className="problem-section" id="problema">
      <div className="container">
        <div className="row align-items-end g-4 mb-4 mb-lg-5">
          <div className="col-12 col-lg-7">
            <p className="problem-section__eyebrow">EL PROBLEMA</p>
            <h2 className="problem-section__title">
              EL PROBLEMA NO ES COMPRAR.
              <span>ES CONTROLAR EL CAOS.</span>
            </h2>
          </div>
          <div className="col-12 col-lg-5">
            <p className="problem-section__intro">
              En muchas organizaciones, las solicitudes se pierden entre correos, los proveedores viven en planillas, las cotizaciones son difíciles de comparar y las decisiones quedan sin trazabilidad.
            </p>
          </div>
        </div>

        <div className="row g-3 g-lg-4">
          {problems.map((problem, index) => (
            <div className="col-12 col-md-6 col-xl-3" key={problem.title}>
              <article className="problem-section__card h-100">
                <span>0{index + 1}</span>
                <h3>{problem.title}</h3>
                <p>{problem.text}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProblemSection
