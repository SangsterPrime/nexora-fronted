import AppLayout from '../../layouts/AppLayout'
import SolicitudesSection from '../../components/organisms/SolicitudesSection'

function Solicitudes() {
  return (
    <AppLayout
      title="Solicitudes de compra"
      description="Módulo conectado al backend real para crear, editar y gestionar solicitudes de compra con automatización n8n."
    >
      <SolicitudesSection />
    </AppLayout>
  )
}

export default Solicitudes
