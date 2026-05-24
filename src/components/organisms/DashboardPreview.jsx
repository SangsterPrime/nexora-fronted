import { useCallback } from 'react'
import useApiResource from '../../hooks/useApiResource'
import { listCotizaciones } from '../../services/cotizacionService'
import { listPipelines } from '../../services/pipelineService'
import { listProveedores } from '../../services/proveedorService'
import { listSolicitudes } from '../../services/solicitudCompraService'
import '../../styles/organisms/DashboardPreview.css'

const demoSolicitudes = [
  {
    id: 'REQ-1042',
    titulo: 'Renovación de licencias cloud',
    categoria: 'Tecnología',
    montoEstimado: 18400,
    estado: 'EN_REVISION',
  },
  {
    id: 'REQ-1037',
    titulo: 'Insumos operativos Q2',
    categoria: 'Operaciones',
    montoEstimado: 9200,
    estado: 'COTIZANDO',
  },
  {
    id: 'REQ-1029',
    titulo: 'Servicios de mantenimiento',
    categoria: 'Instalaciones',
    montoEstimado: 12850,
    estado: 'NEGOCIACION',
  },
]

const demoPipelines = [
  { id: 'PIPE-01', nombre: 'Aprobación de solicitud', tipo: 'Flujo operativo', activo: true },
  { id: 'PIPE-02', nombre: 'Comparación de cotizaciones', tipo: 'Evaluación', activo: true },
  { id: 'PIPE-03', nombre: 'Emisión de orden', tipo: 'Automatización', activo: false },
]

function getContent(resource) {
  if (Array.isArray(resource)) {
    return resource
  }

  if (Array.isArray(resource?.content)) {
    return resource.content
  }

  return []
}

function getTotal(resource) {
  if (typeof resource?.totalElements === 'number') {
    return resource.totalElements
  }

  return getContent(resource).length
}

function hasRealItems(resource, error) {
  return !error && getContent(resource).length > 0
}

function getResourceState(resource, error, loading) {
  if (loading) {
    return 'syncing'
  }

  return hasRealItems(resource, error) ? 'live' : 'demo'
}

function formatMoney(value) {
  const amount = Number(value || 0)

  if (!amount) {
    return '$0'
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getField(item, fields, fallback = '-') {
  const value = fields.map((field) => item?.[field]).find((fieldValue) => fieldValue !== undefined && fieldValue !== null && fieldValue !== '')
  return value ?? fallback
}

function DashboardPreview() {
  const requestSolicitudes = useCallback(() => listSolicitudes({ page: 0, size: 5 }), [])
  const requestProveedores = useCallback(() => listProveedores({ page: 0, size: 20 }), [])
  const requestCotizaciones = useCallback(() => listCotizaciones({ page: 0, size: 20 }), [])
  const requestPipelines = useCallback(() => listPipelines(), [])

  const solicitudes = useApiResource(requestSolicitudes)
  const proveedores = useApiResource(requestProveedores)
  const cotizaciones = useApiResource(requestCotizaciones)
  const pipelines = useApiResource(requestPipelines)

  const solicitudItems = hasRealItems(solicitudes.data, solicitudes.error) ? getContent(solicitudes.data) : demoSolicitudes
  const pipelineItems = hasRealItems(pipelines.data, pipelines.error) ? getContent(pipelines.data) : demoPipelines
  const isDemoSolicitudes = !hasRealItems(solicitudes.data, solicitudes.error)
  const isDemoPipelines = !hasRealItems(pipelines.data, pipelines.error)

  const kpis = [
    {
      label: 'Solicitudes activas',
      value: hasRealItems(solicitudes.data, solicitudes.error) ? getTotal(solicitudes.data) : demoSolicitudes.length,
      endpoint: '/api/solicitudes-compra',
      state: getResourceState(solicitudes.data, solicitudes.error, solicitudes.loading),
    },
    {
      label: 'Proveedores registrados',
      value: hasRealItems(proveedores.data, proveedores.error) ? getTotal(proveedores.data) : 24,
      endpoint: '/api/proveedores',
      state: getResourceState(proveedores.data, proveedores.error, proveedores.loading),
    },
    {
      label: 'Cotizaciones recibidas',
      value: hasRealItems(cotizaciones.data, cotizaciones.error) ? getTotal(cotizaciones.data) : 18,
      endpoint: '/api/cotizaciones',
      state: getResourceState(cotizaciones.data, cotizaciones.error, cotizaciones.loading),
    },
    {
      label: 'Pipelines activos',
      value: hasRealItems(pipelines.data, pipelines.error)
        ? getContent(pipelines.data).filter((pipeline) => pipeline.activo !== false).length
        : demoPipelines.filter((pipeline) => pipeline.activo).length,
      endpoint: '/api/pipelines',
      state: getResourceState(pipelines.data, pipelines.error, pipelines.loading),
    },
  ]

  return (
    <section className="dashboard-preview" id="demo">
      <div className="container">
        <div className="dashboard-preview__shell">
          <div className="row align-items-end g-4 mb-4 mb-lg-5">
            <div className="col-12 col-lg-7">
              <p className="dashboard-preview__eyebrow">Panel operativo</p>
              <h2 className="dashboard-preview__title">Panel operativo NEXORA</h2>
            </div>
            <div className="col-12 col-lg-5">
              <p className="dashboard-preview__intro">
                Una vista centralizada para monitorear solicitudes, proveedores, cotizaciones y procesos activos.
              </p>
              <p className="dashboard-preview__sync-note">
                Cuando el backend local no entrega registros, NEXORA mantiene <strong>datos de demostración</strong> claramente marcados.
              </p>
            </div>
          </div>

          <div className="row g-3 g-lg-4 mb-4">
            {kpis.map((kpi) => (
              <div className="col-12 col-sm-6 col-xl-3" key={kpi.label}>
                <article className="dashboard-preview__kpi h-100">
                  <div className={`dashboard-preview__state dashboard-preview__state--${kpi.state}`}>
                    <span /> {kpi.state === 'live' ? 'en vivo' : kpi.state === 'syncing' ? 'consultando' : 'demo'}
                  </div>
                  <strong>{kpi.value}</strong>
                  <p>{kpi.label}</p>
                  <code>{kpi.endpoint}</code>
                </article>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <article className="dashboard-preview__panel h-100">
                <div className="dashboard-preview__panel-header">
                  <h3>Últimas solicitudes de compra</h3>
                  {isDemoSolicitudes && <span>datos de demostración</span>}
                </div>
                <div className="table-responsive">
                  <table className="table dashboard-preview__table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Categoría</th>
                        <th>Monto estimado</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudItems.map((solicitud, index) => {
                        const id = getField(solicitud, ['id', 'codigo'], `REQ-${String(index + 1).padStart(4, '0')}`)
                        const titulo = getField(solicitud, ['titulo', 'nombre', 'descripcion'], 'Solicitud de compra')
                        const categoria = getField(solicitud, ['categoria', 'categoriaNombre', 'tipo'], 'General')
                        const monto = getField(solicitud, ['montoEstimado', 'monto', 'valorEstimado'], 0)
                        const estado = getField(solicitud, ['estado', 'status'], 'PENDIENTE')

                        return (
                          <tr key={`${id}-${index}`}>
                            <td><code>{id}</code></td>
                            <td>{titulo}</td>
                            <td>{categoria}</td>
                            <td>{formatMoney(monto)}</td>
                            <td><span className="dashboard-preview__pill">{estado}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>

            <div className="col-12 col-xl-4">
              <aside className="dashboard-preview__panel dashboard-preview__monitor h-100">
                <div className="dashboard-preview__panel-header">
                  <h3>Panel operativo</h3>
                  {isDemoPipelines && <span>datos de demostración</span>}
                </div>
                <div className="dashboard-preview__pipeline-list">
                  {pipelineItems.map((pipeline, index) => {
                    const id = getField(pipeline, ['id', 'codigo'], `PIPE-${index + 1}`)
                    const nombre = getField(pipeline, ['nombre', 'name'], 'Pipeline operativo')
                    const tipo = getField(pipeline, ['tipo', 'type'], 'Workflow')
                    const activo = pipeline?.activo ?? pipeline?.active ?? true

                    return (
                      <div className="dashboard-preview__pipeline" key={`${id}-${index}`}>
                        <div>
                          <strong>{nombre}</strong>
                          <span>{tipo}</span>
                        </div>
                        <em className={activo ? 'is-active' : 'is-inactive'}>{activo ? 'activo' : 'inactivo'}</em>
                      </div>
                    )
                  })}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardPreview
