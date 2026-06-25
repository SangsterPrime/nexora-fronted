import { useCallback, useState } from 'react'
import useApiResource from '../../hooks/useApiResource'
import {
  getMetrics,
  getMlHealth,
  getPredictions,
  scoreModel,
  trainModel,
} from '../../services/mlApi'
import '../../styles/organisms/IaPipelineSection.css'

/* ── Métricas que se muestran como tarjetas ──────────────────────────────── */
const METRIC_CARDS = [
  { key: 'accuracy', label: 'Accuracy', keys: ['accuracy', 'acc'], accent: 'green' },
  { key: 'recall', label: 'Recall', keys: ['recall', 'sensitivity', 'tpr'], accent: 'cyan' },
  { key: 'precision', label: 'Precision', keys: ['precision', 'ppv'], accent: 'cyan' },
  { key: 'f1', label: 'F1 Score', keys: ['f1', 'f1Score', 'f1_score', 'fScore'], accent: 'green' },
  { key: 'rocAuc', label: 'ROC-AUC', keys: ['rocAuc', 'roc_auc', 'auc', 'rocauc'], accent: 'violet' },
  { key: 'gini', label: 'Gini', keys: ['gini', 'giniCoefficient', 'gini_coefficient'], accent: 'magenta' },
]

/* ── Helpers de parseo defensivo ─────────────────────────────────────────── */

function getErrorMessage(error) {
  if (!error) {
    return ''
  }

  if (error.status >= 500) {
    return 'Servicio de IA no disponible. Verifica que el backend exponga /api/ml/* y que el pipeline Python esté arriba.'
  }

  if (error.status === 404) {
    return 'Los endpoints /api/ml/* aún no están publicados por el backend (HTTP 404).'
  }

  if (error.status) {
    return `${error.message || 'No fue posible completar la operación.'} (HTTP ${error.status})`
  }

  return error.message || 'No se pudo conectar con el servicio de IA.'
}

function pickNumber(source, keys) {
  if (!source || typeof source !== 'object') {
    return null
  }

  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value
    }
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
      return Number(value)
    }
  }

  return null
}

function getMetricsRoot(data) {
  if (!data || typeof data !== 'object') {
    return {}
  }

  // Permite { metrics: {...} } o las métricas en la raíz.
  return data.metrics && typeof data.metrics === 'object' ? data.metrics : data
}

function formatMetric(value) {
  if (value === null || value === undefined) {
    return '—'
  }

  // Las métricas suelen venir en rango 0–1; las normalizamos a porcentaje.
  const percent = Math.abs(value) <= 1 ? value * 100 : value
  return `${percent.toFixed(2)}%`
}

function getConfusionMatrix(data) {
  const root = getMetricsRoot(data)
  const raw = root.confusionMatrix || root.confusion_matrix || root.matrix

  if (Array.isArray(raw) && raw.length === 2 && Array.isArray(raw[0]) && Array.isArray(raw[1])) {
    const [tn, fp] = raw[0]
    const [fn, tp] = raw[1]
    return { tn: Number(tn), fp: Number(fp), fn: Number(fn), tp: Number(tp) }
  }

  const tn = pickNumber(root, ['tn', 'trueNegatives', 'true_negatives'])
  const fp = pickNumber(root, ['fp', 'falsePositives', 'false_positives'])
  const fn = pickNumber(root, ['fn', 'falseNegatives', 'false_negatives'])
  const tp = pickNumber(root, ['tp', 'truePositives', 'true_positives'])

  if ([tn, fp, fn, tp].some((cell) => cell === null)) {
    return null
  }

  return { tn, fp, fn, tp }
}

function getHealthInfo(data) {
  if (!data || typeof data !== 'object') {
    return { online: false, status: 'DESCONOCIDO', detail: '' }
  }

  const rawStatus = data.status || data.estado || data.state || (data.up ? 'UP' : '')
  const status = String(rawStatus || 'DESCONOCIDO').toUpperCase()
  const online = ['UP', 'OK', 'HEALTHY', 'READY', 'ONLINE', 'TRUE'].includes(status)
  const detail = data.model || data.modelVersion || data.version || data.message || data.mensaje || ''

  return { online, status: status || 'DESCONOCIDO', detail }
}

function getLastRunInfo(metricsData) {
  const root = getMetricsRoot(metricsData)
  const timestamp =
    root.lastRun || root.last_run || root.lastTrainedAt || root.trainedAt || root.updatedAt || root.timestamp
  const version = root.modelVersion || root.model_version || root.version
  const samples = pickNumber(root, ['samples', 'rows', 'nSamples', 'datasetSize'])

  return { timestamp: timestamp || null, version: version || null, samples }
}

function formatDateTime(value) {
  if (!value) {
    return '—'
  }

  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return String(value)
    }
    return date.toLocaleString('es-CL')
  } catch {
    return String(value)
  }
}

function getPredictionRows(data) {
  if (Array.isArray(data)) {
    return data
  }
  if (Array.isArray(data?.content)) {
    return data.content
  }
  if (Array.isArray(data?.predictions)) {
    return data.predictions
  }
  if (Array.isArray(data?.results)) {
    return data.results
  }
  return []
}

function getPredictionId(row, index) {
  return row?.id ?? row?.clienteId ?? row?.cliente_id ?? row?.entityId ?? index + 1
}

function getScore(row) {
  return pickNumber(row, ['score', 'scoreModel', 'puntaje', 'riskScore'])
}

function getProbability(row) {
  return pickNumber(row, ['probability', 'probabilidad', 'proba', 'prob', 'confidence'])
}

function getLabel(row) {
  const value = row?.prediction ?? row?.label ?? row?.clase ?? row?.resultado ?? row?.target
  if (value === null || value === undefined || value === '') {
    return null
  }
  return String(value)
}

function isPositiveLabel(label) {
  if (label === null) {
    return false
  }
  const normalized = label.toUpperCase()
  return ['1', 'TRUE', 'SI', 'SÍ', 'YES', 'POSITIVO', 'APROBADO', 'BUENO', 'GOOD'].includes(normalized)
}

/* ── Componente ──────────────────────────────────────────────────────────── */

function IaPipelineSection() {
  const requestHealth = useCallback(() => getMlHealth(), [])
  const requestMetrics = useCallback(() => getMetrics(), [])
  const requestPredictions = useCallback(() => getPredictions(), [])

  const health = useApiResource(requestHealth)
  const metrics = useApiResource(requestMetrics)
  const predictions = useApiResource(requestPredictions)

  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [training, setTraining] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const busy = verifying || training || scoring || refreshing
  const healthInfo = getHealthInfo(health.data)
  const matrix = getConfusionMatrix(metrics.data)
  const lastRun = getLastRunInfo(metrics.data)
  const predictionRows = getPredictionRows(predictions.data)
  const metricsRoot = getMetricsRoot(metrics.data)

  function resetMessages() {
    setActionError('')
    setActionMessage('')
  }

  async function handleVerify() {
    resetMessages()
    setVerifying(true)
    try {
      const result = await health.refetch()
      const info = getHealthInfo(result)
      setActionMessage(
        info.online
          ? 'Servicio de IA operativo. Modelo disponible para entrenar y scorear.'
          : `Servicio de IA respondió con estado "${info.status}".`,
      )
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setVerifying(false)
    }
  }

  async function handleTrain() {
    resetMessages()
    setTraining(true)
    try {
      await trainModel()
      await Promise.allSettled([metrics.refetch(), health.refetch()])
      setActionMessage('Entrenamiento ejecutado. Métricas actualizadas desde /api/ml/metrics.')
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setTraining(false)
    }
  }

  async function handleScore() {
    resetMessages()
    setScoring(true)
    try {
      await scoreModel()
      await Promise.allSettled([predictions.refetch(), metrics.refetch()])
      setActionMessage('Scoring ejecutado. Resultados actualizados desde /api/ml/predictions.')
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setScoring(false)
    }
  }

  async function handleRefreshMetrics() {
    resetMessages()
    setRefreshing(true)
    try {
      await Promise.allSettled([metrics.refetch(), predictions.refetch(), health.refetch()])
      setActionMessage('Métricas, predicciones y estado del servicio sincronizados.')
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setRefreshing(false)
    }
  }

  const metricsLoading = metrics.loading
  const metricsError = metrics.error

  return (
    <section className="ia-pipeline" id="ia-pipeline">
      <div className="container">
        <div className="ia-pipeline__shell">
          {/* ── Cabecera ──────────────────────────────────────────────── */}
          <div className="row align-items-end g-4 mb-4">
            <div className="col-12 col-lg-7">
              <p className="ia-pipeline__eyebrow">Evaluación Parcial 3 · Pipeline de IA</p>
              <h2 className="ia-pipeline__title">Pipeline IA</h2>
              <code className="ia-pipeline__endpoint">/api/ml/*</code>
              <p className="ia-pipeline__api-note">
                Integración entre el frontend, el backend Spring Boot y el módulo de Machine Learning.
                El frontend <strong>nunca</strong> llama al servicio Python directamente: solo consume
                los endpoints <strong>/api/ml/health</strong>, <strong>/train</strong>, <strong>/score</strong>,
                {' '}<strong>/metrics</strong> y <strong>/predictions</strong> del backend.
              </p>
            </div>
            <div className="col-12 col-lg-5 text-lg-end">
              <p className="ia-pipeline__intro">
                Verifica el servicio, entrena el modelo, ejecuta el scoring y monitorea las métricas de
                rendimiento del clasificador en tiempo real.
              </p>
              <div className="ia-pipeline__header-actions">
                <button
                  className="ia-pipeline__ghost-action"
                  type="button"
                  onClick={() => { handleVerify().catch(() => {}) }}
                  disabled={busy}
                >
                  {verifying ? 'Verificando...' : 'Verificar servicio IA'}
                </button>
                <button
                  className="ia-pipeline__ghost-action"
                  type="button"
                  onClick={() => { handleTrain().catch(() => {}) }}
                  disabled={busy}
                >
                  {training ? 'Entrenando...' : 'Entrenar modelo'}
                </button>
                <button
                  className="ia-pipeline__ghost-action"
                  type="button"
                  onClick={() => { handleScore().catch(() => {}) }}
                  disabled={busy}
                >
                  {scoring ? 'Ejecutando...' : 'Ejecutar scoring'}
                </button>
                <button
                  className="ia-pipeline__primary-action"
                  type="button"
                  onClick={() => { handleRefreshMetrics().catch(() => {}) }}
                  disabled={busy}
                >
                  {refreshing ? 'Actualizando...' : 'Actualizar métricas'}
                </button>
              </div>
            </div>
          </div>

          {actionError && <div className="ia-pipeline__alert">{actionError}</div>}
          {actionMessage && <div className="ia-pipeline__success">{actionMessage}</div>}

          {/* ── Estado servicio + última ejecución ────────────────────── */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-lg-6">
              <article className="ia-pipeline__status-card">
                <div className="ia-pipeline__status-head">
                  <span className="ia-pipeline__card-eyebrow">Estado del servicio ML</span>
                  <span
                    className={`ia-pipeline__status-pill ia-pipeline__status-pill--${
                      health.loading ? 'loading' : healthInfo.online ? 'online' : 'offline'
                    }`}
                  >
                    <span className="ia-pipeline__status-dot" aria-hidden="true" />
                    {health.loading ? 'Consultando' : healthInfo.online ? 'Operativo' : healthInfo.status}
                  </span>
                </div>
                <p className="ia-pipeline__status-detail">
                  {health.loading
                    ? 'Consultando /api/ml/health...'
                    : health.error
                      ? getErrorMessage(health.error)
                      : healthInfo.detail || 'Servicio de inferencia conectado al backend.'}
                </p>
                <code className="ia-pipeline__card-endpoint">GET /api/ml/health</code>
              </article>
            </div>

            <div className="col-12 col-lg-6">
              <article className="ia-pipeline__status-card">
                <span className="ia-pipeline__card-eyebrow">Última ejecución del pipeline</span>
                <strong className="ia-pipeline__last-run-time">{formatDateTime(lastRun.timestamp)}</strong>
                <div className="ia-pipeline__last-run-meta">
                  <span>Versión: <strong>{lastRun.version || '—'}</strong></span>
                  <span>Muestras: <strong>{lastRun.samples ?? '—'}</strong></span>
                </div>
                <code className="ia-pipeline__card-endpoint">GET /api/ml/metrics</code>
              </article>
            </div>
          </div>

          {/* ── Tarjetas de métricas ──────────────────────────────────── */}
          {metricsError && !metricsLoading && (
            <div className="ia-pipeline__error">
              <strong>No se pudieron cargar las métricas.</strong>
              <p>{getErrorMessage(metricsError)}</p>
            </div>
          )}

          <div className="ia-pipeline__metrics-grid" aria-label="Métricas de rendimiento del modelo">
            {METRIC_CARDS.map((card) => {
              const value = metricsLoading ? null : pickNumber(metricsRoot, card.keys)
              return (
                <article
                  className={`ia-pipeline__metric-card ia-pipeline__metric-card--${card.accent}`}
                  key={card.key}
                >
                  <span className="ia-pipeline__metric-label">{card.label}</span>
                  <strong className="ia-pipeline__metric-value">
                    {metricsLoading ? '···' : formatMetric(value)}
                  </strong>
                  <span className="ia-pipeline__metric-bar" aria-hidden="true">
                    <span
                      className="ia-pipeline__metric-bar-fill"
                      style={{ width: value === null ? '0%' : `${Math.min(Math.abs(value) <= 1 ? value * 100 : value, 100)}%` }}
                    />
                  </span>
                </article>
              )
            })}
          </div>

          {/* ── Matriz de confusión + leyenda ─────────────────────────── */}
          <div className="row g-3 mt-1 mb-3">
            <div className="col-12 col-lg-5">
              <article className="ia-pipeline__panel">
                <span className="ia-pipeline__card-eyebrow">Matriz de confusión</span>
                {metricsLoading ? (
                  <div className="ia-pipeline__loading">Cargando matriz...</div>
                ) : matrix ? (
                  <div className="ia-pipeline__matrix">
                    <span className="ia-pipeline__matrix-corner" />
                    <span className="ia-pipeline__matrix-axis">Pred 0</span>
                    <span className="ia-pipeline__matrix-axis">Pred 1</span>

                    <span className="ia-pipeline__matrix-axis ia-pipeline__matrix-axis--row">Real 0</span>
                    <span className="ia-pipeline__matrix-cell ia-pipeline__matrix-cell--ok">
                      <small>TN</small>{matrix.tn}
                    </span>
                    <span className="ia-pipeline__matrix-cell ia-pipeline__matrix-cell--bad">
                      <small>FP</small>{matrix.fp}
                    </span>

                    <span className="ia-pipeline__matrix-axis ia-pipeline__matrix-axis--row">Real 1</span>
                    <span className="ia-pipeline__matrix-cell ia-pipeline__matrix-cell--bad">
                      <small>FN</small>{matrix.fn}
                    </span>
                    <span className="ia-pipeline__matrix-cell ia-pipeline__matrix-cell--ok">
                      <small>TP</small>{matrix.tp}
                    </span>
                  </div>
                ) : (
                  <div className="ia-pipeline__empty">
                    <p>Sin matriz de confusión disponible. Entrena el modelo para generarla.</p>
                  </div>
                )}
              </article>
            </div>

            <div className="col-12 col-lg-7">
              <article className="ia-pipeline__panel ia-pipeline__panel--legend">
                <span className="ia-pipeline__card-eyebrow">Lectura del pipeline</span>
                <ul className="ia-pipeline__legend-list">
                  <li><strong>Verificar servicio IA</strong> → consulta el estado del modelo (<code>/health</code>).</li>
                  <li><strong>Entrenar modelo</strong> → reentrena y recalcula métricas (<code>/train</code>).</li>
                  <li><strong>Ejecutar scoring</strong> → genera predicciones sobre el dataset (<code>/score</code>).</li>
                  <li><strong>Actualizar métricas</strong> → sincroniza métricas y resultados (<code>/metrics</code>, <code>/predictions</code>).</li>
                </ul>
                <p className="ia-pipeline__legend-note">
                  Sesión por cookie segura del backend. No se almacenan tokens ni secretos en el navegador.
                </p>
              </article>
            </div>
          </div>

          {/* ── Tabla de predicciones ─────────────────────────────────── */}
          <article className="ia-pipeline__table-card">
            <div className="ia-pipeline__table-header">
              <div>
                <strong>{predictions.loading ? 'Cargando resultados' : `${predictionRows.length} resultados`}</strong>
                <span>{predictions.loading ? 'Consultando /api/ml/predictions...' : 'Predicciones scoreadas por el modelo'}</span>
              </div>
              <button
                className="ia-pipeline__ghost-action"
                type="button"
                onClick={() => { handleScore().catch(() => {}) }}
                disabled={busy}
              >
                {scoring ? 'Ejecutando...' : 'Ejecutar scoring'}
              </button>
            </div>

            {predictions.error && !predictions.loading && (
              <div className="ia-pipeline__error">
                <strong>No se pudieron cargar las predicciones.</strong>
                <p>{getErrorMessage(predictions.error)}</p>
              </div>
            )}

            {predictions.loading && (
              <div className="ia-pipeline__loading">Cargando predicciones desde /api/ml/predictions...</div>
            )}

            {!predictions.loading && !predictions.error && predictionRows.length === 0 && (
              <div className="ia-pipeline__empty">
                <strong>Sin predicciones todavía.</strong>
                <p>Ejecuta el scoring para que el modelo genere resultados sobre el dataset configurado.</p>
                <button
                  className="ia-pipeline__primary-action"
                  type="button"
                  onClick={() => { handleScore().catch(() => {}) }}
                  disabled={busy}
                >
                  {scoring ? 'Ejecutando...' : 'Ejecutar scoring'}
                </button>
              </div>
            )}

            {!predictions.loading && !predictions.error && predictionRows.length > 0 && (
              <div className="table-responsive">
                <table className="table ia-pipeline__table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Score</th>
                      <th>Probabilidad</th>
                      <th>Predicción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionRows.slice(0, 50).map((row, index) => {
                      const id = getPredictionId(row, index)
                      const score = getScore(row)
                      const probability = getProbability(row)
                      const label = getLabel(row)
                      const positive = isPositiveLabel(label)

                      return (
                        <tr key={id}>
                          <td><code>{id}</code></td>
                          <td className="ia-pipeline__num">{score === null ? '—' : score.toFixed(4)}</td>
                          <td className="ia-pipeline__num">
                            {probability === null ? '—' : formatMetric(probability)}
                          </td>
                          <td>
                            {label === null ? (
                              '—'
                            ) : (
                              <span
                                className={`ia-pipeline__label-badge ia-pipeline__label-badge--${positive ? 'pos' : 'neg'}`}
                              >
                                {label}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}

export default IaPipelineSection
