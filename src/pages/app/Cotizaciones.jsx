import AppLayout from '../../layouts/AppLayout'

function Cotizaciones() {
  return (
    <AppLayout
      title="Cotizaciones"
      description="Módulo preparado para comparar ofertas y apoyar decisiones de compra."
    >
      <article className="app-page-card">
        <h2>Cotizaciones</h2>
        <p>Comparación de ofertas por monto, plazo, riesgo y condiciones.</p>
        <code>/api/cotizaciones</code>
      </article>
    </AppLayout>
  )
}

export default Cotizaciones
