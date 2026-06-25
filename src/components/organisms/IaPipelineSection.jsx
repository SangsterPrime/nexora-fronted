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

/* Mensajes para el modo Cron Job (no son errores críticos de la UI). */
const CRON_TRAIN_MESSAGE =
  'El entrenamiento se ejecuta por Render Cron Job. Para forzar una corrida, usa Trigger Run en Render.'
const CRON_SCORE_MESSAGE =
  'El scoring batch se ejecuta por Render Cron Job y escribe los resultados en Neon. Para forzar una corrida, usa Trigger Run en Render.'

const CRON_MODES = ['CRON', 'CRON_JOB', 'CRONJOB', 'SCHEDULED', 'BATCH']
const API_MODES = ['API', 'LIVE', 'ONLINE', 'REALTIME', 'REAL_TIME']

/* ── Helpers de parseo defensivo ─────────────────────────────────────────── */

function getErrorMessage(error) {
  if (!error) {
    return ''
  }

  if (error.status >= 500) {
    return 'Servicio de IA no disponible. Verifica que el backend exponga /api/ml/* y que Neon tenga resultados.'
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

/** Detecta el modo de integración (CRON / API) desde el payload de /health. */
function getMode(data) {
  if (!data || typeof data !== 'object') {
    return null
  }

  const raw = String(data.mode || data.modo || data.runMode || data.integrationMode || '').toUpperCase()
  if (CRON_MODES.includes(raw)) {
    return 'CRON'
  }
  if (API_MODES.includes(raw)) {
    return 'API'
  }
  if (data.cron === true || data.scheduled === true) {
    return 'CRON'
  }
  return null
}

/**
 * Determina si una respuesta de /train o /score indica modo Cron Job
 * (el backend no ejecutó la corrida en vivo: la agenda el cron de Render).
 */
function isCronResponse(payload, status) {
  if (status === 202 || status === 409) {
    return true
  }
  if (!payload || typeof payload !== 'object') {
    return false
  }
  const mode = String(payload.mode || payload.modo || '').toUpperCase()
  if (CRON_MODES.includes(mode)) {
    return true
  }
  return payload.scheduled === true || payload.cron === true || payload.triggered === false
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return null
  }
  if (seconds < 60) {
    return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)} s`
  }
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  return `${minutes}m ${rest}s`
}

function getDurationLabel(root) {
  const seconds = pickNumber(root, ['durationSeconds', 'duration_seconds', 'durationSec', 'elapsedSeconds', 'trainingTime'])
  if (seconds !== null) {
    return formatDuration(seconds)
  }
  const ms = pickNumber(root, ['durationMs', 'duration_ms', 'elapsedMs'])
  if (ms !== null) {
    return formatDuration(ms / 1000)
  }
  const generic = pickNumber(root, ['duration', 'elapsed'])
  if (generic !== null) {
    // Heurística: valores grandes probablemente vienen en milisegundos.
    return formatDuration(generic > 1000 ? generic / 1000 : generic)
  }
  const raw = root.duration || root.elapsed
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw
  }
  return null
}

function getLastRunInfo(metricsData) {
  const root = getMetricsRoot(metricsData)
  const timestamp =
    root.lastRun || root.last_run || root.lastTrainedAt || root.trainedAt || root.executedAt || root.updatedAt || root.timestamp
  const version = root.modelVersion || root.model_version || root.version
  const model = root.model || root.modelName || root.model_name || root.selectedModel || root.modelo || root.algorithm
  const samples = pickNumber(root, ['samples', 'rows', 'nSamples', 'datasetSize'])
  const duration = getDurationLabel(root)
  const source = root.source || root.dataSource || root.origin || 'Neon PostgreSQL'

  return { timestamp: timestamp || null, version: version || null, model: model || null, samples, duration, source }
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
  const [actionInfo, setActionInfo] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [training, setTraining] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [refreshingMetrics, setRefreshingMetrics] = useState(false)
  const [refreshingPredictions, setRefreshingPredictions] = useState(false)
  const [cronDetected, setCronDetected] = useState(false)

  const busy = verifying || training || scoring || refreshingMetrics || refreshingPredictions
  const healthInfo = getHealthInfo(health.data)
  const matrix = getConfusionMatrix(metrics.data)
  const lastRun = getLastRunInfo(metrics.data)
  const predictionRows = getPredictionRows(predictions.data)
  const metricsRoot = getMetricsRoot(metrics.data)
  const metricsLoading = metrics.loading
  const metricsError = metrics.error

  const predictionsTotal = typeof predictions.data?.totalElements === 'number'
    ? predictions.data.totalElements
    : predictionRows.length
  const metricsAvailable = METRIC_CARDS.some((card) => pickNumber(metricsRoot, card.keys) !== null) || Boolean(matrix)

  // El modo viene de /health; si /train o /score reportan cron, lo recordamos.
  const mode = cronDetected ? 'CRON' : getMode(health.data)
  const modeLabel = mode === 'CRON' ? 'Cron Job / Render' : mode === 'API' ? 'API / En vivo' : 'Por confirmar'
  const modeSub = mode === 'CRON'
    ? 'Entrenamiento y scoring programados'
    : mode === 'API'
      ? 'Entrenamiento y scoring en vivo'
      : 'Verifica el servicio IA'

  function resetMessages() {
    setActionError('')
    setActionInfo('')
    setActionMessage('')
  }

  async function handleVerify() {
    resetMessages()
    setVerifying(true)
    try {
      const result = await health.refetch()
      const info = getHealthInfo(result)
      const detectedMode = getMode(result)
      if (detectedMode === 'CRON') {
        setCronDetected(true)
      }
      setActionMessage(
        info.online
          ? `Servicio de IA operativo${
              detectedMode === 'CRON'
                ? ' en modo Cron Job / Render.'
                : detectedMode === 'API'
                  ? ' en modo API / en vivo.'
                  : '.'
            }`
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
      const result = await trainModel()
      if (isCronResponse(result)) {
        setCronDetected(true)
        setActionInfo(CRON_TRAIN_MESSAGE)
      } else {
        await Promise.allSettled([metrics.refetch(), health.refetch()])
        setActionMessage('Entrenamiento ejecutado. Métricas actualizadas desde Neon (/api/ml/metrics).')
      }
    } catch (error) {
      // 202/409 → modo Cron Job: mensaje amigable, no error crítico.
      if (isCronResponse(error.payload, error.status)) {
        setCronDetected(true)
        setActionInfo(CRON_TRAIN_MESSAGE)
      } else {
        setActionError(getErrorMessage(error))
      }
    } finally {
      setTraining(false)
    }
  }

  async function handleScore() {
    resetMessages()
    setScoring(true)
    try {
      const result = await scoreModel()
      if (isCronResponse(result)) {
        setCronDetected(true)
        setActionInfo(CRON_SCORE_MESSAGE)
      } else {
        await Promise.allSettled([predictions.refetch(), metrics.refetch()])
        setActionMessage('Scoring ejecutado. Predicciones actualizadas desde Neon (/api/ml/predictions).')
      }
    } catch (error) {
      // 202/409 → el scoring batch corre en el cron, no en vivo.
      if (isCronResponse(error.payload, error.status)) {
        setCronDetected(true)
        setActionInfo(CRON_SCORE_MESSAGE)
      } else {
        setActionError(getErrorMessage(error))
      }
    } finally {
      setScoring(false)
    }
  }

  async function handleRefreshMetrics() {
    resetMessages()
    setRefreshingMetrics(true)
    try {
      await Promise.allSettled([metrics.refetch(), health.refetch()])
      setActionMessage('Métricas y estado del servicio sincronizados desde Neon.')
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setRefreshingMetrics(false)
    }
  }

  async function handleRefreshPredictions() {
    resetMessages()
    setRefreshingPredictions(true)
    try {
      await predictions.refetch()
      setActionMessage('Predicciones sincronizadas desde Neon (/api/ml/predictions).')
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setRefreshingPredictions(false)
    }
  }

  return (
    <section className="ia-pipeline" id="ia-pipeline">
      <div className="container">
        <div className="ia-pipeline__shell">
          {/* ── Cabecera ──────────────────────────────────────────────── */}
          <div className="row align-items-end g-4 mb-4">
            <div className="col-12 col-lg-7">
              <p className="ia-pipeline__eyebrow">Evaluación Parcial 3 · Pipeline de IA</p>
              <h2 className="ia-pipeline__title">Pipeline IA</h2>
              <div className="ia-pipeline__header-tags">
                <code className="ia-pipeline__endpoint">/api/ml/*</code>
                {mode === 'CRON' && (
                  <span className="ia-pipeline__mode-pill">Modo Cron Job / Render</span>
                )}
              </div>
              <p className="ia-pipeline__api-note">
                Arquitectura final: <strong>EntrenamientoAI</strong> corre como Render Cron Job, escribe
                resultados en <strong>Neon PostgreSQL</strong> y el backend Spring Boot los expone vía
                {' '}<strong>/api/ml/*</strong>. El frontend <strong>nunca</strong> llama a Python directamente:
                solo lee el estado, las métricas y las predicciones del backend.
              </p>
            </div>
            <div className="col-12 col-lg-5 text-lg-end">
              <p className="ia-pipeline__intro">
                Verifica el servicio, revisa las métricas y predicciones publicadas en Neon. En modo Cron Job,
                entrenar y scorear se agendan en Render; aquí se monitorea el resultado.
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
                  {training ? 'Enviando...' : 'Entrenar modelo'}
                </button>
                <button
                  className="ia-pipeline__ghost-action"
                  type="button"
                  onClick={() => { handleScore().catch(() => {}) }}
                  disabled={busy}
                >
                  {scoring ? 'Enviando...' : 'Ejecutar scoring'}
                </button>
                <button
                  className="ia-pipeline__ghost-action"
                  type="button"
                  onClick={() => { handleRefreshPredictions().catch(() => {}) }}
                  disabled={busy}
                >
                  {refreshingPredictions ? 'Actualizando...' : 'Actualizar predicciones'}
                </button>
                <button
                  className="ia-pipeline__primary-action"
                  type="button"
                  onClick={() => { handleRefreshMetrics().catch(() => {}) }}
                  disabled={busy}
                >
                  {refreshingMetrics ? 'Actualizando...' : 'Actualizar métricas'}
                </button>
              </div>
            </div>
          </div>

          {actionError && <div className="ia-pipeline__alert">{actionError}</div>}
          {actionInfo && <div className="ia-pipeline__info">{actionInfo}</div>}
          {actionMessage && <div className="ia-pipeline__success">{actionMessage}</div>}

          {/* ── Resumen de integración (modo / última ejecución / datos) ── */}
          <div className="ia-pipeline__integration" aria-label="Arquitectura de integración">
            <article className="ia-pipeline__integration-card ia-pipeline__integration-card--mode">
              <span className="ia-pipeline__card-eyebrow">Modo de integración</span>
              <strong>{modeLabel}</strong>
              <span className="ia-pipeline__integration-sub">{modeSub}</span>
            </article>
            <article className="ia-pipeline__integration-card">
              <span className="ia-pipeline__card-eyebrow">Última ejecución detectada</span>
              <strong>{health.loading || metricsLoading ? '···' : formatDateTime(lastRun.timestamp)}</strong>
              <span className="ia-pipeline__integration-sub">Fuente: Neon PostgreSQL</span>
            </article>
            <article className="ia-pipeline__integration-card">
              <span className="ia-pipeline__card-eyebrow">Métricas desde Neon</span>
              <strong>{metricsLoading ? '···' : metricsAvailable ? 'Disponibles' : 'Sin datos'}</strong>
              <span className="ia-pipeline__integration-sub">
                {lastRun.version ? `Modelo ${lastRun.version}` : 'GET /api/ml/metrics'}
              </span>
            </article>
            <article className="ia-pipeline__integration-card">
              <span className="ia-pipeline__card-eyebrow">Predicciones disponibles</span>
              <strong>{predictions.loading ? '···' : predictionsTotal}</strong>
              <span className="ia-pipeline__integration-sub">GET /api/ml/predictions</span>
            </article>
          </div>

          {/* ── Estado servicio + última ejecución detallada ──────────── */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-lg-5">
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
                      : healthInfo.detail || 'Backend conectado a Neon, exponiendo los resultados del pipeline.'}
                </p>
                <code className="ia-pipeline__card-endpoint">GET /api/ml/health</code>
              </article>
            </div>

            <div className="col-12 col-lg-7">
              <article className="ia-pipeline__status-card">
                <span className="ia-pipeline__card-eyebrow">Última ejecución del pipeline</span>
                <strong className="ia-pipeline__last-run-time">
                  {metricsLoading ? '···' : formatDateTime(lastRun.timestamp)}
                </strong>
                <div className="ia-pipeline__last-run-meta">
                  <span>Modelo: <strong>{lastRun.model || lastRun.version || '—'}</strong></span>
                  <span>Duración: <strong>{lastRun.duration || '—'}</strong></span>
                  <span>Muestras: <strong>{lastRun.samples ?? '—'}</strong></span>
                  <span>Fuente: <strong>{lastRun.source || 'Neon PostgreSQL'}</strong></span>
                </div>
                <code className="ia-pipeline__card-endpoint">GET /api/ml/metrics · Neon</code>
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
                    <p>Sin matriz de confusión en Neon todavía. La genera la próxima corrida del Cron Job.</p>
                  </div>
                )}
              </article>
            </div>

            <div className="col-12 col-lg-7">
              <article className="ia-pipeline__panel ia-pipeline__panel--legend">
                <span className="ia-pipeline__card-eyebrow">Flujo de la arquitectura</span>
                <ul className="ia-pipeline__legend-list">
                  <li><strong>Render Cron Job</strong> ejecuta <code>EntrenamientoAI</code> de forma programada.</li>
                  <li>Escribe métricas y predicciones en <strong>Neon PostgreSQL</strong>.</li>
                  <li>El <strong>backend</strong> Spring Boot expone esos resultados en <code>/api/ml/*</code>.</li>
                  <li>El <strong>frontend</strong> solo lee: <code>/health</code>, <code>/metrics</code>, <code>/predictions</code>.</li>
                </ul>
                <p className="ia-pipeline__legend-note">
                  Entrenar / scorear en modo Cron responden 202/409: la corrida la agenda Render (Trigger Run).
                  Sesión por cookie; sin tokens en el navegador.
                </p>
              </article>
            </div>
          </div>

          {/* ── Tabla de predicciones ─────────────────────────────────── */}
          <article className="ia-pipeline__table-card">
            <div className="ia-pipeline__table-header">
              <div>
                <strong>{predictions.loading ? 'Cargando resultados' : `${predictionsTotal} resultados`}</strong>
                <span>{predictions.loading ? 'Consultando /api/ml/predictions...' : 'Predicciones publicadas en Neon'}</span>
              </div>
              <button
                className="ia-pipeline__ghost-action"
                type="button"
                onClick={() => { handleRefreshPredictions().catch(() => {}) }}
                disabled={busy}
              >
                {refreshingPredictions ? 'Actualizando...' : 'Actualizar predicciones'}
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
                <p>Aún no hay resultados en Neon. El scoring batch los genera en la próxima corrida del Render Cron Job.</p>
                <button
                  className="ia-pipeline__primary-action"
                  type="button"
                  onClick={() => { handleRefreshPredictions().catch(() => {}) }}
                  disabled={busy}
                >
                  {refreshingPredictions ? 'Actualizando...' : 'Actualizar predicciones'}
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
