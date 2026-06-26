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

// ── Métricas con descripción en español ──────────────────────────────────────
const METRIC_CARDS = [
  {
    key: 'accuracy', label: 'Accuracy', keys: ['accuracy', 'acc'], accent: 'green',
    desc: 'De cada 100 clientes evaluados, cuántos el modelo clasificó correctamente.',
    goodThreshold: 0.80,
  },
  {
    key: 'recall', label: 'Recall ★', keys: ['recall', 'sensitivity', 'tpr'], accent: 'cyan',
    desc: 'De los clientes que SÍ van a abandonar, cuántos detectó el modelo. Métrica más importante para retención.',
    goodThreshold: 0.75,
    star: true,
  },
  {
    key: 'precision', label: 'Precision', keys: ['precision', 'ppv'], accent: 'cyan',
    desc: 'De los marcados como "riesgo", cuántos realmente abandonarían. Evita falsas alarmas.',
    goodThreshold: 0.70,
  },
  {
    key: 'f1', label: 'F1-Score', keys: ['f1', 'f1Score', 'f1_score', 'fScore'], accent: 'green',
    desc: 'Promedio entre Recall y Precision. Equilibra ambas métricas cuando los datos son desbalanceados.',
    goodThreshold: 0.72,
  },
  {
    key: 'rocAuc', label: 'ROC-AUC', keys: ['rocAuc', 'roc_auc', 'auc', 'rocauc'], accent: 'violet',
    desc: 'Capacidad del modelo de separar clases. 0.5 = azar, 1.0 = perfecto. Sobre 0.80 es muy bueno.',
    goodThreshold: 0.80,
  },
  {
    key: 'gini', label: 'Gini', keys: ['gini', 'giniCoefficient', 'gini_coefficient'], accent: 'magenta',
    desc: 'Concentración predictiva = 2 × ROC-AUC − 1. Sobre 0.60 indica un modelo robusto.',
    goodThreshold: 0.60,
  },
]

const CRON_TRAIN_MESSAGE = 'El entrenamiento se ejecuta por Render Cron Job. Para forzar una corrida, usa Trigger Run en Render.'
const CRON_SCORE_MESSAGE = 'El scoring batch se ejecuta por Render Cron Job y escribe los resultados en Neon. Para forzar una corrida, usa Trigger Run en Render.'
const CRON_MODES = ['CRON', 'CRON_JOB', 'CRONJOB', 'SCHEDULED', 'BATCH']
const API_MODES  = ['API', 'LIVE', 'ONLINE', 'REALTIME', 'REAL_TIME']

// ── Helpers de parseo ────────────────────────────────────────────────────────

function getErrorMessage(error) {
  if (!error) return ''
  if (error.status >= 500) return 'Servicio de IA no disponible. Verifica que el backend exponga /api/ml/* y que Neon tenga resultados.'
  if (error.status === 404) return 'Los endpoints /api/ml/* aún no están publicados por el backend (HTTP 404).'
  if (error.status) return `${error.message || 'No fue posible completar la operación.'} (HTTP ${error.status})`
  return error.message || 'No se pudo conectar con el servicio de IA.'
}

function pickNumber(source, keys) {
  if (!source || typeof source !== 'object') return null
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'number' && !Number.isNaN(value)) return value
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value)
  }
  return null
}

function getMetricsRoot(data) {
  if (!data || typeof data !== 'object') return {}
  return data.metrics && typeof data.metrics === 'object' ? data.metrics : data
}

function formatMetric(value) {
  if (value === null || value === undefined) return '—'
  const percent = Math.abs(value) <= 1 ? value * 100 : value
  return `${percent.toFixed(1)}%`
}

function getMetricLevel(value, threshold) {
  if (value === null) return 'unknown'
  const pct = Math.abs(value) <= 1 ? value : value / 100
  if (pct >= threshold) return 'good'
  if (pct >= threshold * 0.85) return 'ok'
  return 'low'
}

function getConfusionMatrix(data) {
  const root = getMetricsRoot(data)
  const raw = root.confusionMatrix || root.confusion_matrix || root.matriz_confusion || root.matrizConfusion || root.matrix
  if (Array.isArray(raw) && raw.length === 2 && Array.isArray(raw[0]) && Array.isArray(raw[1])) {
    const [tn, fp] = raw[0]
    const [fn, tp] = raw[1]
    return { tn: Number(tn), fp: Number(fp), fn: Number(fn), tp: Number(tp) }
  }
  const matrixRoot = raw && typeof raw === 'object' ? raw : root
  const tn = pickNumber(matrixRoot, ['tn', 'trueNegatives', 'true_negatives'])
  const fp = pickNumber(matrixRoot, ['fp', 'falsePositives', 'false_positives'])
  const fn = pickNumber(matrixRoot, ['fn', 'falseNegatives', 'false_negatives'])
  const tp = pickNumber(matrixRoot, ['tp', 'truePositives', 'true_positives'])
  if ([tn, fp, fn, tp].some((c) => c === null)) return null
  return { tn, fp, fn, tp }
}

function getHealthInfo(data) {
  if (!data || typeof data !== 'object') return { online: false, status: 'DESCONOCIDO', detail: '' }
  const rawStatus = data.status || data.estado || data.state || (data.up ? 'UP' : '')
  const status = String(rawStatus || 'DESCONOCIDO').toUpperCase()
  const online = ['UP', 'OK', 'HEALTHY', 'READY', 'ONLINE', 'TRUE'].includes(status)
  const detail = data.model || data.modelVersion || data.version || data.message || data.mensaje || ''
  return { online, status: status || 'DESCONOCIDO', detail }
}

function getMode(data) {
  if (!data || typeof data !== 'object') return null
  const raw = String(data.mode || data.modo || data.runMode || data.integrationMode || '').toUpperCase()
  if (CRON_MODES.includes(raw)) return 'CRON'
  if (API_MODES.includes(raw)) return 'API'
  if (data.cron === true || data.scheduled === true) return 'CRON'
  return null
}

function isCronResponse(payload, status) {
  if (status === 202 || status === 409) return true
  if (!payload || typeof payload !== 'object') return false
  const mode = String(payload.mode || payload.modo || '').toUpperCase()
  if (CRON_MODES.includes(mode)) return true
  return payload.scheduled === true || payload.cron === true || payload.triggered === false
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return null
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)} s`
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  return `${minutes}m ${rest}s`
}

function getDurationLabel(root) {
  const seconds = pickNumber(root, ['durationSeconds', 'duration_seconds', 'durationSec', 'elapsedSeconds', 'trainingTime'])
  if (seconds !== null) return formatDuration(seconds)
  const ms = pickNumber(root, ['durationMs', 'duration_ms', 'elapsedMs'])
  if (ms !== null) return formatDuration(ms / 1000)
  const generic = pickNumber(root, ['duration', 'elapsed'])
  if (generic !== null) return formatDuration(generic > 1000 ? generic / 1000 : generic)
  const raw = root.duration || root.elapsed
  if (typeof raw === 'string' && raw.trim() !== '') return raw
  return null
}

function getLastRunInfo(metricsData, healthData) {
  const root = getMetricsRoot(metricsData)
  const healthRoot = healthData && typeof healthData === 'object' ? healthData : {}
  const timestamp = root.timestamp || root.lastRun || root.last_run || root.lastTrainedAt ||
    root.trainedAt || root.executedAt || root.updatedAt ||
    healthRoot.ultimaEjecucion || healthRoot.ultima_ejecucion || healthRoot.lastRun || healthRoot.timestamp
  const version = root.modelVersion || root.model_version || root.version
  const model = root.modelo || root.model || root.modelName || root.model_name || root.modeloSeleccionado || root.selectedModel || root.algorithm
  const samples = pickNumber(root, ['samples', 'rows', 'nSamples', 'datasetSize'])
  const duration = getDurationLabel(root)
  const source = root.fuente || root.source || root.dataSource || root.origin || 'Neon PostgreSQL'
  return { timestamp: timestamp || null, version: version || null, model: model || null, samples, duration, source }
}

function formatDateTime(value) {
  if (!value) return '—'
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
  } catch { return String(value) }
}

function getPredictionRows(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.predicciones)) return data.predicciones
  if (Array.isArray(data?.predictions)) return data.predictions
  if (Array.isArray(data?.results)) return data.results
  return []
}

function getPredictionId(row, index) {
  return row?.id ?? row?.clienteId ?? row?.cliente_id ?? row?.entityId ?? index + 1
}
function getScore(row) { return pickNumber(row, ['score', 'scoreModel', 'puntaje', 'riskScore']) }
function getProbability(row) { return pickNumber(row, ['probability', 'probabilidad', 'proba', 'prob', 'confidence']) }
function getLabel(row) {
  const value = row?.prediction ?? row?.label ?? row?.clase ?? row?.resultado ?? row?.target
  return value === null || value === undefined || value === '' ? null : String(value)
}
function isPositiveLabel(label) {
  if (!label) return false
  return ['1', 'TRUE', 'SI', 'SÍ', 'YES', 'POSITIVO', 'APROBADO', 'BUENO', 'GOOD'].includes(label.toUpperCase())
}

// ── Componente ────────────────────────────────────────────────────────────────

function IaPipelineSection() {
  const requestHealth      = useCallback(() => getMlHealth(), [])
  const requestMetrics     = useCallback(() => getMetrics(), [])
  const requestPredictions = useCallback(() => getPredictions(), [])

  const health      = useApiResource(requestHealth)
  const metrics     = useApiResource(requestMetrics)
  const predictions = useApiResource(requestPredictions)

  const [actionError,   setActionError]   = useState('')
  const [actionInfo,    setActionInfo]    = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [verifying,           setVerifying]           = useState(false)
  const [training,            setTraining]            = useState(false)
  const [scoring,             setScoring]             = useState(false)
  const [refreshingMetrics,   setRefreshingMetrics]   = useState(false)
  const [refreshingPreds,     setRefreshingPreds]     = useState(false)
  const [cronDetected,        setCronDetected]        = useState(false)

  const busy = verifying || training || scoring || refreshingMetrics || refreshingPreds

  const healthInfo    = getHealthInfo(health.data)
  const matrix        = getConfusionMatrix(metrics.data)
  const lastRun       = getLastRunInfo(metrics.data, health.data)
  const predRows      = getPredictionRows(predictions.data)
  const metricsRoot   = getMetricsRoot(metrics.data)
  const metricsAvail  = METRIC_CARDS.some(c => pickNumber(metricsRoot, c.keys) !== null) || Boolean(matrix)
  const predsTotal    = (pickNumber(predictions.data, ['totalElements', 'total']) ?? predRows.length)

  const mode      = cronDetected ? 'CRON' : getMode(health.data)
  const modeLabel = mode === 'CRON' ? 'Cron Job / Render' : mode === 'API' ? 'API en vivo' : 'Por confirmar'

  function resetMessages() { setActionError(''); setActionInfo(''); setActionMessage('') }

  async function handleVerify() {
    resetMessages(); setVerifying(true)
    try {
      const result = await health.refetch()
      const info = getHealthInfo(result)
      if (getMode(result) === 'CRON') setCronDetected(true)
      setActionMessage(info.online ? 'Servicio de IA operativo y conectado a Neon.' : `Servicio respondió: "${info.status}".`)
    } catch (e) { setActionError(getErrorMessage(e)) }
    finally { setVerifying(false) }
  }

  async function handleTrain() {
    resetMessages(); setTraining(true)
    try {
      const result = await trainModel()
      if (isCronResponse(result)) { setCronDetected(true); setActionInfo(CRON_TRAIN_MESSAGE) }
      else { await Promise.allSettled([metrics.refetch(), health.refetch()]); setActionMessage('Entrenamiento ejecutado. Métricas actualizadas.') }
    } catch (e) {
      if (isCronResponse(e.payload, e.status)) { setCronDetected(true); setActionInfo(CRON_TRAIN_MESSAGE) }
      else setActionError(getErrorMessage(e))
    } finally { setTraining(false) }
  }

  async function handleScore() {
    resetMessages(); setScoring(true)
    try {
      const result = await scoreModel()
      if (isCronResponse(result)) { setCronDetected(true); setActionInfo(CRON_SCORE_MESSAGE) }
      else { await Promise.allSettled([predictions.refetch(), metrics.refetch()]); setActionMessage('Scoring ejecutado. Predicciones actualizadas.') }
    } catch (e) {
      if (isCronResponse(e.payload, e.status)) { setCronDetected(true); setActionInfo(CRON_SCORE_MESSAGE) }
      else setActionError(getErrorMessage(e))
    } finally { setScoring(false) }
  }

  async function handleRefreshMetrics() {
    resetMessages(); setRefreshingMetrics(true)
    try { await Promise.allSettled([metrics.refetch(), health.refetch()]); setActionMessage('Métricas y estado sincronizados.') }
    catch (e) { setActionError(getErrorMessage(e)) }
    finally { setRefreshingMetrics(false) }
  }

  async function handleRefreshPreds() {
    resetMessages(); setRefreshingPreds(true)
    try { await predictions.refetch(); setActionMessage('Predicciones sincronizadas desde Neon.') }
    catch (e) { setActionError(getErrorMessage(e)) }
    finally { setRefreshingPreds(false) }
  }

  return (
    <section className="ia-pipeline" id="ia-pipeline">
      <div className="container">
        <div className="ia-pipeline__shell">

          {/* ── Cabecera ──────────────────────────────────────────────────── */}
          <div className="ia-pipeline__header">
            <div>
              <p className="ia-pipeline__eyebrow">Evaluación Parcial 3 · Pipeline de IA</p>
              <h2 className="ia-pipeline__title">Pipeline IA</h2>
              <p className="ia-pipeline__api-note">
                El modelo <strong>Random Forest</strong> corre en <strong>Render Cron Job</strong>,
                escribe resultados en <strong>Neon PostgreSQL</strong> y el backend los expone aquí.
                Esta pantalla muestra qué tan bien funciona el modelo y cuántos clientes están en riesgo de abandono.
              </p>
            </div>

            {/* Botones en dos grupos claros */}
            <div className="ia-pipeline__actions-panel">
              <div className="ia-pipeline__action-group">
                <p className="ia-pipeline__action-group-label">Control del servicio</p>
                <div className="ia-pipeline__action-row">
                  <button className="ia-pipeline__btn ia-pipeline__btn--ghost" type="button" onClick={() => handleVerify().catch(() => {})} disabled={busy}>
                    {verifying ? '⏳ Verificando…' : '🔌 Verificar conexión'}
                  </button>
                  <button className="ia-pipeline__btn ia-pipeline__btn--ghost" type="button" onClick={() => handleTrain().catch(() => {})} disabled={busy}>
                    {training ? '⏳ Enviando…' : '🧠 Entrenar modelo'}
                  </button>
                  <button className="ia-pipeline__btn ia-pipeline__btn--ghost" type="button" onClick={() => handleScore().catch(() => {})} disabled={busy}>
                    {scoring ? '⏳ Enviando…' : '🎯 Ejecutar scoring'}
                  </button>
                </div>
              </div>
              <div className="ia-pipeline__action-group">
                <p className="ia-pipeline__action-group-label">Actualizar datos</p>
                <div className="ia-pipeline__action-row">
                  <button className="ia-pipeline__btn ia-pipeline__btn--primary" type="button" onClick={() => handleRefreshMetrics().catch(() => {})} disabled={busy}>
                    {refreshingMetrics ? '⏳ Actualizando…' : '📊 Actualizar métricas'}
                  </button>
                  <button className="ia-pipeline__btn ia-pipeline__btn--ghost" type="button" onClick={() => handleRefreshPreds().catch(() => {})} disabled={busy}>
                    {refreshingPreds ? '⏳ Actualizando…' : '🔄 Actualizar predicciones'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes de feedback */}
          {actionError   && <div className="ia-pipeline__alert">{actionError}</div>}
          {actionInfo    && <div className="ia-pipeline__info">{actionInfo}</div>}
          {actionMessage && <div className="ia-pipeline__success">{actionMessage}</div>}

          {/* ── 4 tarjetas de estado ─────────────────────────────────────── */}
          <div className="ia-pipeline__status-grid">
            <article className={`ia-pipeline__status-tile ia-pipeline__status-tile--${mode === 'CRON' ? 'cron' : 'default'}`}>
              <span className="ia-pipeline__tile-label">Modo de ejecución</span>
              <strong>{health.loading ? '···' : modeLabel}</strong>
              <p>{mode === 'CRON' ? 'El modelo corre automáticamente en Render según horario programado.' : mode === 'API' ? 'El modelo responde en tiempo real a cada petición.' : 'Verifica el servicio para detectar el modo.'}</p>
            </article>

            <article className="ia-pipeline__status-tile">
              <span className="ia-pipeline__tile-label">Último entrenamiento</span>
              <strong>{health.loading || metrics.loading ? '···' : formatDateTime(lastRun.timestamp)}</strong>
              <p>{lastRun.model ? `Modelo: ${lastRun.model}` : 'Fecha en que se entrenó el modelo por última vez.'}</p>
            </article>

            <article className={`ia-pipeline__status-tile ia-pipeline__status-tile--${metricsAvail ? 'ok' : 'warn'}`}>
              <span className="ia-pipeline__tile-label">Métricas del modelo</span>
              <strong>{metrics.loading ? '···' : metricsAvail ? '✓ Disponibles' : 'Sin datos'}</strong>
              <p>{metricsAvail ? 'Las métricas de rendimiento están publicadas en Neon y se muestran abajo.' : 'Ejecuta un entrenamiento para generar métricas.'}</p>
            </article>

            <article className={`ia-pipeline__status-tile ia-pipeline__status-tile--${predsTotal > 0 ? 'ok' : 'warn'}`}>
              <span className="ia-pipeline__tile-label">Clientes evaluados</span>
              <strong>{predictions.loading ? '···' : predsTotal}</strong>
              <p>{predsTotal > 0 ? `Clientes con predicción de abandono publicada en Neon.` : 'Ejecuta el scoring para generar predicciones.'}</p>
            </article>
          </div>

          {/* ── Estado del servicio ──────────────────────────────────────── */}
          <div className="ia-pipeline__service-row">
            <article className="ia-pipeline__service-card">
              <div className="ia-pipeline__service-head">
                <span className="ia-pipeline__card-eyebrow">Estado del servicio ML</span>
                <span className={`ia-pipeline__status-pill ia-pipeline__status-pill--${health.loading ? 'loading' : healthInfo.online ? 'online' : 'offline'}`}>
                  <span className="ia-pipeline__status-dot" />
                  {health.loading ? 'Verificando' : healthInfo.online ? 'Operativo' : 'No disponible'}
                </span>
              </div>
              <p className="ia-pipeline__service-desc">
                {health.loading ? 'Consultando el backend…'
                  : health.error ? getErrorMessage(health.error)
                  : healthInfo.detail || 'Backend conectado a Neon y exponiendo resultados del pipeline de IA.'}
              </p>
              <code className="ia-pipeline__card-endpoint">GET /api/ml/health</code>
            </article>

            <article className="ia-pipeline__service-card">
              <span className="ia-pipeline__card-eyebrow">Última ejecución del pipeline</span>
              <strong className="ia-pipeline__last-run-time">{metrics.loading ? '···' : formatDateTime(lastRun.timestamp)}</strong>
              <div className="ia-pipeline__run-meta">
                <span><em>Modelo:</em> {lastRun.model || '—'}</span>
                <span><em>Duración:</em> {lastRun.duration || '—'}</span>
                <span><em>Muestras:</em> {lastRun.samples ?? '—'}</span>
                <span><em>Fuente:</em> {lastRun.source}</span>
              </div>
            </article>
          </div>

          {/* ── Métricas del modelo ──────────────────────────────────────── */}
          <div className="ia-pipeline__metrics-header">
            <h3>Métricas de rendimiento del modelo</h3>
            <p>Estos números miden qué tan bien el modelo detecta clientes en riesgo. <strong>Recall</strong> es la métrica más crítica.</p>
          </div>

          {metrics.error && !metrics.loading && (
            <div className="ia-pipeline__alert">{getErrorMessage(metrics.error)}</div>
          )}

          <div className="ia-pipeline__metrics-grid">
            {METRIC_CARDS.map(card => {
              const value = metrics.loading ? null : pickNumber(metricsRoot, card.keys)
              const level = getMetricLevel(value, card.goodThreshold)
              const barWidth = value === null ? 0 : Math.min(Math.abs(value) <= 1 ? value * 100 : value, 100)
              return (
                <article key={card.key} className={`ia-pipeline__metric-card ia-pipeline__metric-card--${card.accent} ia-pipeline__metric-card--${level}`}>
                  {card.star && <span className="ia-pipeline__metric-star">★ Principal</span>}
                  <span className="ia-pipeline__metric-label">{card.label}</span>
                  <strong className="ia-pipeline__metric-value">{metrics.loading ? '···' : formatMetric(value)}</strong>
                  <span className="ia-pipeline__metric-bar">
                    <span className="ia-pipeline__metric-bar-fill" style={{ width: `${barWidth}%` }} />
                  </span>
                  <p className="ia-pipeline__metric-desc">{card.desc}</p>
                  {value !== null && (
                    <span className={`ia-pipeline__metric-level ia-pipeline__metric-level--${level}`}>
                      {level === 'good' ? '✓ Bueno' : level === 'ok' ? '~ Aceptable' : '↓ Bajo'}
                    </span>
                  )}
                </article>
              )
            })}
          </div>

          {/* ── Matriz de confusión + Arquitectura ──────────────────────── */}
          <div className="row g-3 mt-1 mb-3">
            <div className="col-12 col-lg-5">
              <article className="ia-pipeline__panel">
                <span className="ia-pipeline__card-eyebrow">Matriz de confusión — ¿qué significa?</span>
                <p className="ia-pipeline__panel-note">Muestra cómo clasificó el modelo a los clientes en los datos de prueba.</p>
                {metrics.loading ? <div className="ia-pipeline__loading">Cargando...</div>
                  : matrix ? (
                    <>
                      <div className="ia-pipeline__matrix">
                        <span className="ia-pipeline__matrix-corner" />
                        <span className="ia-pipeline__matrix-axis">Pred: NO abandona</span>
                        <span className="ia-pipeline__matrix-axis">Pred: SÍ abandona</span>
                        <span className="ia-pipeline__matrix-axis ia-pipeline__matrix-axis--row">Real: NO abandona</span>
                        <span className="ia-pipeline__matrix-cell ia-pipeline__matrix-cell--ok">
                          <small>✓ Correcto</small>{matrix.tn}
                        </span>
                        <span className="ia-pipeline__matrix-cell ia-pipeline__matrix-cell--bad">
                          <small>✗ Falsa alarma</small>{matrix.fp}
                        </span>
                        <span className="ia-pipeline__matrix-axis ia-pipeline__matrix-axis--row">Real: SÍ abandona</span>
                        <span className="ia-pipeline__matrix-cell ia-pipeline__matrix-cell--bad">
                          <small>✗ Perdido</small>{matrix.fn}
                        </span>
                        <span className="ia-pipeline__matrix-cell ia-pipeline__matrix-cell--ok">
                          <small>✓ Detectado</small>{matrix.tp}
                        </span>
                      </div>
                      <div className="ia-pipeline__matrix-legend">
                        <span className="ia-pipeline__matrix-legend-ok">✓ Correcto / Detectado = bien clasificados</span>
                        <span className="ia-pipeline__matrix-legend-bad">✗ Falsa alarma = llamamos a alguien que no iba a irse</span>
                        <span className="ia-pipeline__matrix-legend-bad">✗ Perdido = cliente que SÍ iba a irse y no lo detectamos</span>
                      </div>
                    </>
                  ) : (
                    <div className="ia-pipeline__empty"><p>Sin matriz disponible todavía. Se genera en la próxima corrida del Cron Job.</p></div>
                  )}
              </article>
            </div>

            <div className="col-12 col-lg-7">
              <article className="ia-pipeline__panel ia-pipeline__panel--steps">
                <span className="ia-pipeline__card-eyebrow">¿Cómo funciona el pipeline de IA?</span>
                <div className="ia-pipeline__steps">
                  <div className="ia-pipeline__step">
                    <span className="ia-pipeline__step-num">1</span>
                    <div>
                      <strong>Render Cron Job ejecuta EntrenamientoAI</strong>
                      <p>El script Python corre automáticamente según horario. Descarga los datos de clientes, entrena el modelo Random Forest y evalúa su rendimiento.</p>
                    </div>
                  </div>
                  <div className="ia-pipeline__step">
                    <span className="ia-pipeline__step-num">2</span>
                    <div>
                      <strong>Guarda resultados en Neon PostgreSQL</strong>
                      <p>Las métricas (Accuracy, Recall…), las predicciones por cliente (segmento ALTO/MEDIO/BAJO) y la importancia de variables quedan guardadas en la base de datos.</p>
                    </div>
                  </div>
                  <div className="ia-pipeline__step">
                    <span className="ia-pipeline__step-num">3</span>
                    <div>
                      <strong>Backend Spring Boot expone los datos</strong>
                      <p>El backend lee Neon y los sirve en <code>/api/ml/metrics</code>, <code>/api/ml/predictions</code> y <code>/api/ml/clientes-scoreados</code>.</p>
                    </div>
                  </div>
                  <div className="ia-pipeline__step">
                    <span className="ia-pipeline__step-num">4</span>
                    <div>
                      <strong>Este panel muestra los resultados</strong>
                      <p>El frontend nunca habla directamente con Python. Solo lee del backend, que actúa como intermediario seguro.</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>

          {/* ── Tabla de predicciones ─────────────────────────────────────── */}
          <article className="ia-pipeline__table-card">
            <div className="ia-pipeline__table-header">
              <div>
                <strong>{predictions.loading ? 'Cargando…' : `${predsTotal} predicciones`}</strong>
                <span>Resultados del modelo publicados en Neon — muestra los primeros 50</span>
              </div>
              <button className="ia-pipeline__btn ia-pipeline__btn--ghost" type="button" onClick={() => handleRefreshPreds().catch(() => {})} disabled={busy}>
                {refreshingPreds ? 'Actualizando…' : 'Actualizar'}
              </button>
            </div>

            {predictions.error && !predictions.loading && (
              <div className="ia-pipeline__error" style={{ margin: '1rem' }}><strong>No se pudieron cargar las predicciones.</strong><p>{getErrorMessage(predictions.error)}</p></div>
            )}
            {predictions.loading && <div className="ia-pipeline__loading" style={{ margin: '1rem' }}>Cargando predicciones…</div>}

            {!predictions.loading && !predictions.error && predRows.length === 0 && (
              <div className="ia-pipeline__empty" style={{ margin: '1rem' }}>
                <strong>Sin predicciones todavía</strong>
                <p>El scoring batch genera predicciones en la próxima corrida del Render Cron Job. Para obtener datos ricos por cliente (segmento, acción de retención) ve a la pestaña <strong>Predicciones IA</strong> en el panel de Resultados.</p>
              </div>
            )}

            {!predictions.loading && !predictions.error && predRows.length > 0 && (
              <div className="table-responsive">
                <table className="table ia-pipeline__table align-middle mb-0">
                  <thead>
                    <tr>
                      <th title="Identificador del cliente">ID</th>
                      <th title="Puntuación de riesgo del modelo (0=no riesgo, 1=máximo riesgo)">Score de riesgo</th>
                      <th title="Probabilidad de abandono expresada en % (0-100%)">Prob. abandono</th>
                      <th title="Resultado: 0 = no abandona, 1 = abandona">Predicción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predRows.slice(0, 50).map((row, index) => {
                      const id          = getPredictionId(row, index)
                      const score       = getScore(row)
                      const probability = getProbability(row)
                      const label       = getLabel(row)
                      const positive    = isPositiveLabel(label)
                      return (
                        <tr key={id}>
                          <td><code>{id}</code></td>
                          <td className="ia-pipeline__num">{score === null ? '—' : score.toFixed(4)}</td>
                          <td className="ia-pipeline__num">{probability === null ? '—' : formatMetric(probability)}</td>
                          <td>
                            {label === null ? '—' : (
                              <span className={`ia-pipeline__label-badge ia-pipeline__label-badge--${positive ? 'pos' : 'neg'}`}>
                                {positive ? '⚠ Abandona' : '✓ Se queda'}
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
