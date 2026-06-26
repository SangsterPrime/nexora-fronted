import '../../styles/organisms/TargetUsersSection.css'

const targetUsers = [
  {
    title: 'Equipos de compras',
    text: 'Centralizan solicitudes, cotizaciones y seguimiento para operar con menos fricción diaria.',
  },
  {
    title: 'Administración',
    text: 'Mantiene orden, responsables y trazabilidad sobre cada etapa del proceso de abastecimiento.',
  },
  {
    title: 'Finanzas',
    text: 'Accede a información clara para evaluar montos, prioridades, proveedores y decisiones de compra.',
  },
  {
    title: 'Operaciones',
    text: 'Conecta necesidades internas con compras ejecutables, medibles y alineadas con la demanda real.',
  },
  {
    title: 'Proveedores externos',
    text: 'Participan en procesos más claros, con estados definidos y mejor comunicación comercial.',
  },
]

function TargetUsersSection() {
  return (
    <section className="target-users-section" id="para-quien">
      <div className="container">
        <div className="row justify-content-between align-items-end g-4 mb-4 mb-lg-5">
          <div className="col-12 col-lg-7">
            <p className="target-users-section__eyebrow">PARA QUIÉN</p>
            <h2 className="target-users-section__title">DISEÑADO PARA EQUIPOS QUE NECESITAN CONTROL.</h2>
          </div>
          <div className="col-12 col-lg-4">
            <p className="target-users-section__intro">
              NEXORA está pensado para organizaciones que necesitan orden, visibilidad y control en su ciclo de abastecimiento.
            </p>
          </div>
        </div>

        <div className="target-users-section__grid">
          {targetUsers.map((user) => (
            <article className="target-users-section__card" key={user.title}>
              <h3>{user.title}</h3>
              <p>{user.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TargetUsersSection
