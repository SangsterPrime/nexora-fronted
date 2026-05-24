import AppLayout from '../../layouts/AppLayout'
import ProveedoresSection from '../../components/organisms/ProveedoresSection'

function Proveedores() {
  return (
    <AppLayout
      title="Proveedores"
      description="Módulo conectado al backend real para registrar, editar, consultar y eliminar proveedores."
    >
      <ProveedoresSection />
    </AppLayout>
  )
}

export default Proveedores
