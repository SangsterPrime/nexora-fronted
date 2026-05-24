import AppLayout from '../../layouts/AppLayout'

function Solicitudes() {
  return (
    <AppLayout
      title="Solicitudes de compra"
      description="Módulo preparado para gestionar requerimientos internos y seguimiento operativo."
    >
      <article className="app-page-card">
        <h2>Solicitudes de compra</h2>
        <p>Gestión de requerimientos internos desde la creación hasta su seguimiento.</p>
        <code>/api/solicitudes-compra</code>
      </article>
    </AppLayout>
  )
}

export default Solicitudes
