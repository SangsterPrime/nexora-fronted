import AppLayout from '../../layouts/AppLayout'
import ResultadosSection from '../../components/organisms/ResultadosSection'

function Resultados() {
  return (
    <AppLayout
      title="Resultados"
      description="Panel admin con KPIs, métricas ML, predicciones y ejecuciones de pipeline en tiempo real desde Neon PostgreSQL."
    >
      <ResultadosSection />
    </AppLayout>
  )
}

export default Resultados
