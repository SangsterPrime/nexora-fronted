import AppLayout from '../../layouts/AppLayout'

function Pipelines() {
  return (
    <AppLayout
      title="Pipelines"
      description="Módulo preparado para automatizar etapas del abastecimiento y auditar ejecuciones."
    >
      <article className="app-page-card">
        <h2>Pipelines</h2>
        <p>Automatización, auditoría y ejecución de procesos operativos.</p>
        <code>/api/pipelines</code>
      </article>
    </AppLayout>
  )
}

export default Pipelines
