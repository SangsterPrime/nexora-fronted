import AppLayout from '../../layouts/AppLayout'
import DashboardPreview from '../../components/organisms/DashboardPreview'
import SystemStatusSection from '../../components/organisms/SystemStatusSection'

const summary = [
  ['Solicitudes', '5'],
  ['Proveedores', '20'],
  ['Cotizaciones', '20'],
  ['Pipelines', 'Activos'],
]

function Dashboard() {
  return (
    <AppLayout
      title="Dashboard interno"
      description="Vista inicial para monitorear el flujo operativo de NEXORA y validar el estado del backend."
    >
      <section className="app-dashboard__summary" aria-label="Resumen operativo">
        {summary.map(([label, value]) => (
          <article className="app-dashboard__summary-card" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>
      <DashboardPreview />
      <SystemStatusSection />
    </AppLayout>
  )
}

export default Dashboard
