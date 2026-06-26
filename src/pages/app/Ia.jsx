import AppLayout from '../../layouts/AppLayout'
import IaPipelineSection from '../../components/organisms/IaPipelineSection'

function Ia() {
  return (
    <AppLayout
      title="Pipeline IA"
      description="Integración del frontend con el backend y el módulo de IA: estado del servicio, entrenamiento, scoring y métricas de rendimiento del modelo."
    >
      <IaPipelineSection />
    </AppLayout>
  )
}

export default Ia
