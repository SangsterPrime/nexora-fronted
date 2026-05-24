import { useCallback } from 'react'
import useApiResource from '../../hooks/useApiResource'
import { API_BASE_URL } from '../../services/api'
import { checkHealth } from '../../services/healthService'
import '../../styles/organisms/SystemStatusSection.css'

function SystemStatusSection() {
  const requestHealth = useCallback(() => checkHealth(), [])
  const { data, loading, error, refetch } = useApiResource(requestHealth)
  const apiBaseUrl = API_BASE_URL || `${window.location.origin} → proxy /api`
  const status = loading ? 'CONSULTANDO' : data?.status === 'UP' ? 'EN LÍNEA' : 'DESCONECTADO'
  const statusVariant = loading ? 'loading' : data?.status === 'UP' ? 'online' : 'offline'
  const responseLabel = loading ? 'Consultando /api/health...' : data?.status || error?.message || 'Sin respuesta del backend'
  const statusRows = [
    ['Base API', apiBaseUrl],
    ['Verificación', 'GET /api/health'],
    ['Swagger', '/swagger-ui.html'],
    ['Respuesta', responseLabel],
  ]

  return (
    <section className="system-status-section" id="estado">
      <div className="container">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-12 col-lg-5">
            <p className="system-status-section__eyebrow">Bloque técnico</p>
            <h2 className="system-status-section__title">Estado del sistema</h2>
            <p className="system-status-section__intro">
              Para demostraciones técnicas, el frontend consulta Spring Boot local y muestra si el endpoint de salud está disponible.
            </p>
          </div>
          <div className="col-12 col-lg-7">
            <div className="system-status-section__terminal">
              <div className="system-status-section__bar">
                <span />
                <span />
                <span />
                <strong>NEXORA API</strong>
              </div>
              <div className="system-status-section__body">
                <div className={`system-status-section__badge system-status-section__badge--${statusVariant}`}>
                  <span /> {status}
                </div>
                {statusRows.map(([label, value]) => (
                  <div className="system-status-section__line" key={label}>
                    <span className="system-status-section__label">{label}:</span>
                    <code>{value}</code>
                  </div>
                ))}
                <button
                  className="system-status-section__refresh"
                  type="button"
                  onClick={() => {
                    refetch().catch(() => {})
                  }}
                  disabled={loading}
                >
                  {loading ? 'Consultando...' : 'Reintentar verificación'}
                </button>
                <p className="system-status-section__note">
                  Base API preparada en <code>src/services/api.js</code>. El estado cambia a EN LÍNEA solo cuando Spring Boot responde <code>{'{ status: "UP" }'}</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SystemStatusSection
