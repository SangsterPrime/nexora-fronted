import { useCallback, useState } from 'react'
import useApiResource from '../../hooks/useApiResource'
import { getClientesScoreados, getMetrics, getPredictions } from '../../services/mlApi'
import { listPipelineEjecuciones } from '../../services/pipelineEjecucionService'
import { listProveedores } from '../../services/proveedorService'
import { listSolicitudes } from '../../services/solicitudCompraService'
import { listOrdenesCompra } from '../../services/ordenCompraService'
import { listKpiResultados } from '../../services/kpiService'
import '../../styles/organisms/ResultadosSection.css'

const TABS = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'predicciones', label: 'Predicciones IA' },
  { key: 'ml', label: 'Métricas ML' },
  { key: 'kpis', label: 'KPIs' },
  { key: 'pipelines', label: 'Ejecuciones' },
]

const SEGMENTOS = ['ALTO', 'MEDIO', 'BAJO']

function pct(n) {
  if (n == null) return '—'
  return `${(Number(n) * 100).toFixed(1)}%`
}

function fmt(n, d = 2) {
  return n == null ? '—' : Number(n).toFixed(d)
}

function SegmentoBadge({ value }) {
  const v = (value || '').toUpperCase()
  return <span className={`res__badge res__badge--${v.toLowerCase()}`}>{v || '—'}</span>
}

function StatusBadge({ value }) {
  const v = (value || '').toLowerCase()
  return <span className={`res__badge res__badge--status-${v}`}>{value || '—'}</span>
}

function StatCard({ label, value, sub, accent }) {
  return (
    <article className={`res__stat res__stat--${accent || 'default'}`}>
      <strong>{value ?? '—'}</strong>
      <span>{label}</span>
      {sub && <small>{sub}</small>}
    </article>
  )
}

function MetricBar({ label, value, color = 'amber' }) {
  const w = value != null ? Math.min(100, Math.abs(value) * 100) : 0
  return (
    <div className="res__mbar">
      <span className="res__mbar-label">{label}</span>
      <div className="res__mbar-track">
        <div className={`res__mbar-fill res__mbar-fill--${color}`} style={{ width: `${w}%` }} />
      </div>
      <span className={`res__mbar-val res__mbar-val--${color}`}>
        {value != null ? `${(Math.abs(value) * 100).toFixed(1)}%` : '—'}
      </span>
    </div>
  )
}

function SectionError({ msg }) {
  return <div className="res__error"><strong>No disponible.</strong> {msg}</div>
}

function Loading({ label }) {
  return <div className="res__loading">Cargando {label}…</div>
}

// ── TAB: RESUMEN ─────────────────────────────────────────────────────────────

function TabResumen({ provData, solData, ordData, ejecData, scoreadosData }) {
  const provs = Array.isArray(provData?.content) ? provData.content : (Array.isArray(provData) ? provData : [])
  const sols = Array.isArray(solData?.content) ? solData.content : (Array.isArray(solData) ? solData : [])
  const ords = Array.isArray(ordData?.content) ? ordData.content : (Array.isArray(ordData) ? ordData : [])
  const ejecs = Array.isArray(ejecData) ? ejecData : []
  const scoreados = Array.isArray(scoreadosData) ? scoreadosData : []

  const alto = scoreados.filter(c => c.segmentoRiesgo === 'ALTO').length
  const medio = scoreados.filter(c => c.segmentoRiesgo === 'MEDIO').length
  const bajo = scoreados.filter(c => c.segmentoRiesgo === 'BAJO').length

  return (
    <div>
      <div className="res__stat-grid">
        <StatCard label="Proveedores activos" value={provs.filter(p => p.estado === 'ACTIVO').length} sub={`de ${provs.length} registrados`} accent="green" />
        <StatCard label="Solicitudes" value={sols.length} sub={`${sols.filter(s => s.estado === 'PENDIENTE').length} pendientes`} accent="cyan" />
        <StatCard label="Órdenes emitidas" value={ords.filter(o => ['EMITIDA', 'COMPLETADA'].includes(o.estado)).length} sub={`de ${ords.length} totales`} accent="amber" />
        <StatCard label="Ejecuciones pipeline" value={ejecs.length} sub={`${ejecs.filter(e => ['EXITOSO', 'EXITOSA', 'COMPLETADO'].includes(e.estado)).length} exitosas`} accent="blue" />
      </div>

      {scoreados.length > 0 && (
        <>
          <h3 className="res__subtitle">Riesgo de abandono — {scoreados.length} clientes scoreados</h3>
          <div className="res__risk-grid">
            <article className="res__risk-card res__risk-card--alto">
              <strong>{alto}</strong>
              <span>Riesgo ALTO</span>
              <small>Prob. ≥ 60% · Contacto prioritario</small>
              <div className="res__risk-bar" style={{ width: `${scoreados.length ? (alto / scoreados.length) * 100 : 0}%` }} />
            </article>
            <article className="res__risk-card res__risk-card--medio">
              <strong>{medio}</strong>
              <span>Riesgo MEDIO</span>
              <small>Prob. 35–60% · Fidelización</small>
              <div className="res__risk-bar" style={{ width: `${scoreados.length ? (medio / scoreados.length) * 100 : 0}%` }} />
            </article>
            <article className="res__risk-card res__risk-card--bajo">
              <strong>{bajo}</strong>
              <span>Riesgo BAJO</span>
              <small>Prob. {'<'} 35% · Monitoreo estándar</small>
              <div className="res__risk-bar" style={{ width: `${scoreados.length ? (bajo / scoreados.length) * 100 : 0}%` }} />
            </article>
          </div>
        </>
      )}

      <div className="res__two-col" style={{ marginTop: '1.5rem' }}>
        <div className="res__card">
          <h3 className="res__card-title">Proveedores por estado</h3>
          <ul className="res__dist">
            {['ACTIVO', 'INACTIVO', 'SUSPENDIDO'].map(est => (
              <li key={est}>
                <StatusBadge value={est} />
                <span>{provs.filter(p => p.estado === est).length}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="res__card">
          <h3 className="res__card-title">Solicitudes por estado</h3>
          <ul className="res__dist">
            {['PENDIENTE', 'EN_PROCESO', 'APROBADA', 'RECHAZADA', 'COMPLETADA'].map(est => {
              const cnt = sols.filter(s => s.estado === est).length
              if (!cnt) return null
              return (
                <li key={est}>
                  <StatusBadge value={est} />
                  <span>{cnt}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ── TAB: PREDICCIONES ────────────────────────────────────────────────────────

function TabPredicciones({ scoreadosData, scoreadosError, scoreadosLoading }) {
  const [filtro, setFiltro] = useState('TODOS')

  if (scoreadosLoading) return <Loading label="predicciones" />
  if (scoreadosError) return <SectionError msg="No se pudo obtener /api/ml/clientes-scoreados. Asegúrate de que el pipeline IA haya corrido y la tabla clientes_scoreados exista en Neon." />

  const scoreados = Array.isArray(scoreadosData) ? scoreadosData : []

  if (scoreados.length === 0) {
    return (
      <div className="res__empty-state">
        <p className="res__empty-title">Sin predicciones todavía</p>
        <p className="res__empty-desc">
          Ejecuta el pipeline de EntrenamientoAI para poblar la tabla <code>clientes_scoreados</code> en Neon.
          El modelo Random Forest (optimizado) scoreará los 500 clientes automáticamente.
        </p>
      </div>
    )
  }

  const alto = scoreados.filter(c => c.segmentoRiesgo === 'ALTO').length
  const medio = scoreados.filter(c => c.segmentoRiesgo === 'MEDIO').length
  const bajo = scoreados.filter(c => c.segmentoRiesgo === 'BAJO').length

  const filtrados = filtro === 'TODOS' ? scoreados : scoreados.filter(c => c.segmentoRiesgo === filtro)

  return (
    <div>
      {/* Resumen de segmentos */}
      <div className="res__stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="Total scoreados" value={scoreados.length} sub="clientes evaluados" accent="blue" />
        <StatCard label="Riesgo ALTO" value={alto} sub={`${((alto / scoreados.length) * 100).toFixed(1)}% del total`} accent="danger" />
        <StatCard label="Riesgo MEDIO" value={medio} sub={`${((medio / scoreados.length) * 100).toFixed(1)}% del total`} accent="amber" />
        <StatCard label="Riesgo BAJO" value={bajo} sub={`${((bajo / scoreados.length) * 100).toFixed(1)}% del total`} accent="green" />
      </div>

      {/* Filtros */}
      <div className="res__filtros">
        {['TODOS', ...SEGMENTOS].map(seg => (
          <button
            key={seg}
            type="button"
            className={`res__filtro-btn ${filtro === seg ? `res__filtro-btn--${seg.toLowerCase()}` : ''}`}
            onClick={() => setFiltro(seg)}
          >
            {seg === 'TODOS' ? `Todos (${scoreados.length})` : `${seg} (${scoreados.filter(c => c.segmentoRiesgo === seg).length})`}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="res__card" style={{ marginTop: '1rem' }}>
        <div className="res__card-header">
          <h3 className="res__card-title">Clientes scoreados — modelo Random Forest (optimizado)</h3>
          <span className="res__muted">{filtrados.length} registros</span>
        </div>
        <div className="table-responsive">
          <table className="table res__table align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Edad</th>
                <th>Años cliente</th>
                <th>Reclamos</th>
                <th>Uso datos (GB)</th>
                <th>Plan premium</th>
                <th>Prob. abandono</th>
                <th>Segmento</th>
                <th>Acción de retención</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c, i) => (
                <tr key={c.id ?? i}>
                  <td className="res__muted">{i + 1}</td>
                  <td>{c.edad ?? '—'}</td>
                  <td>{c.anosCliente ?? '—'}</td>
                  <td>
                    <span className={c.reclamos > 2 ? 'res__danger' : ''}>{c.reclamos ?? '—'}</span>
                  </td>
                  <td>{c.usoDatosGb != null ? fmt(c.usoDatosGb, 1) : '—'}</td>
                  <td>{c.planPremium === 1 ? <span className="res__chip">Sí</span> : <span className="res__chip res__chip--off">No</span>}</td>
                  <td>
                    <div className="res__prob">
                      <div className="res__prob-bar">
                        <div
                          className={`res__prob-fill res__prob-fill--${(c.segmentoRiesgo || 'bajo').toLowerCase()}`}
                          style={{ width: `${c.probAbandono != null ? (c.probAbandono * 100).toFixed(0) : 0}%` }}
                        />
                      </div>
                      <span>{c.probAbandono != null ? `${(c.probAbandono * 100).toFixed(1)}%` : '—'}</span>
                    </div>
                  </td>
                  <td><SegmentoBadge value={c.segmentoRiesgo} /></td>
                  <td className="res__accion">{c.accionRetencion || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── TAB: MÉTRICAS ML ──────────────────────────────────────────────────────────

function TabMl({ mlData, mlError, mlLoading }) {
  if (mlLoading) return <Loading label="métricas ML" />
  if (mlError) return <SectionError msg="No se pudo conectar con /api/ml/metrics. Verifica que NEXORA_ML_ENABLED=true y el modo esté configurado." />
  if (!mlData) return <p className="res__empty">Sin métricas disponibles todavía.</p>

  const { accuracy, precision, recall, f1, rocAuc, gini, matrizConfusion,
    modeloSeleccionado, importanciaVariables, metricasPorModelo } = mlData

  const importancias = importanciaVariables ? Object.entries(importanciaVariables).sort((a, b) => b[1] - a[1]) : []
  const modelos = metricasPorModelo ? Object.entries(metricasPorModelo) : []

  return (
    <div>
      {modeloSeleccionado && (
        <div className="res__modelo-selected">
          <span className="res__label">Modelo seleccionado</span>
          <strong>{modeloSeleccionado}</strong>
          <small>Criterio: máximo Recall · desempate por F1</small>
        </div>
      )}

      <div className="res__two-col">
        {/* Métricas del modelo ganador */}
        <div className="res__card">
          <h3 className="res__card-title">Rendimiento del modelo</h3>
          <MetricBar label="Accuracy" value={accuracy} color="blue" />
          <MetricBar label="Precision" value={precision} color="cyan" />
          <MetricBar label="Recall" value={recall} color="green" />
          <MetricBar label="F1-Score" value={f1} color="amber" />
          <MetricBar label="ROC-AUC" value={rocAuc} color="amber" />
          <MetricBar label="Gini" value={gini} color="purple" />

          {matrizConfusion && matrizConfusion.length > 0 && (
            <div className="res__confusion">
              <p className="res__card-title" style={{ marginTop: '1.2rem' }}>Matriz de confusión</p>
              <div className="res__conf-grid">
                <span />
                <span className="res__conf-head">Pred. No</span>
                <span className="res__conf-head">Pred. Sí</span>
                {matrizConfusion.map((row, i) => (
                  <>
                    <span key={`h${i}`} className="res__conf-head">{i === 0 ? 'Real No' : 'Real Sí'}</span>
                    {row.map((cell, j) => (
                      <div key={`${i}${j}`} className={`res__conf-cell ${i === j ? 'res__conf-cell--ok' : 'res__conf-cell--err'}`}>
                        {cell}
                      </div>
                    ))}
                  </>
                ))}
              </div>
              <p className="res__conf-note">
                VP={matrizConfusion[1]?.[1] ?? '?'} · FP={matrizConfusion[0]?.[1] ?? '?'} · FN={matrizConfusion[1]?.[0] ?? '?'} · VN={matrizConfusion[0]?.[0] ?? '?'}
              </p>
            </div>
          )}
        </div>

        {/* Feature importances */}
        <div>
          {importancias.length > 0 && (
            <div className="res__card" style={{ marginBottom: '1rem' }}>
              <h3 className="res__card-title">Importancia de variables</h3>
              {importancias.map(([feat, imp]) => (
                <MetricBar key={feat} label={feat} value={imp} color="purple" />
              ))}
              <p className="res__note">La variable <strong>reclamos</strong> es el predictor más relevante de abandono.</p>
            </div>
          )}

          <div className="res__metric-summary">
            <div><label>Accuracy</label><strong>{pct(accuracy)}</strong></div>
            <div><label>F1-Score</label><strong>{pct(f1)}</strong></div>
            <div><label>ROC-AUC</label><strong>{pct(rocAuc)}</strong></div>
            <div><label>Gini</label><strong>{pct(gini)}</strong></div>
          </div>
        </div>
      </div>

      {/* Comparación de modelos */}
      {modelos.length > 0 && (
        <div className="res__card" style={{ marginTop: '1.5rem' }}>
          <h3 className="res__card-title">Comparación de modelos entrenados</h3>
          <div className="table-responsive">
            <table className="table res__table align-middle mb-0">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Accuracy</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1</th>
                  <th>ROC-AUC</th>
                  <th>Gini</th>
                </tr>
              </thead>
              <tbody>
                {modelos.map(([nombre, m]) => (
                  <tr key={nombre} className={nombre === modeloSeleccionado ? 'res__row--winner' : ''}>
                    <td>
                      {nombre}
                      {nombre === modeloSeleccionado && <span className="res__winner-tag">Seleccionado</span>}
                    </td>
                    <td>{m.accuracy != null ? pct(m.accuracy) : '—'}</td>
                    <td>{m.precision != null ? pct(m.precision) : '—'}</td>
                    <td><strong>{m.recall != null ? pct(m.recall) : '—'}</strong></td>
                    <td>{m.f1 != null ? pct(m.f1) : '—'}</td>
                    <td>{m.rocAuc != null ? pct(m.rocAuc) : '—'}</td>
                    <td>{m.gini != null ? pct(m.gini) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── TAB: KPIs ─────────────────────────────────────────────────────────────────

const KPI_LABEL = {
  AHORRO: 'Ahorro ($)', TIEMPO_CICLO: 'Tiempo ciclo (días)',
  COTIZACIONES_RECIBIDAS: 'Cotizaciones recibidas', ORDENES_EMITIDAS: 'Órdenes emitidas',
  ML_ACCURACY: 'ML Accuracy', ML_PRECISION: 'ML Precisión', ML_RECALL: 'ML Recall',
  ML_F1: 'ML F1-Score', ML_ROC_AUC: 'ML ROC-AUC', ML_GINI: 'ML Gini',
}

function TabKpis({ kpiData, kpiError, kpiLoading }) {
  if (kpiLoading) return <Loading label="KPIs" />
  if (kpiError) return <SectionError msg="No se pudo conectar con /api/kpi-resultados." />

  const kpis = Array.isArray(kpiData) ? kpiData : []
  if (kpis.length === 0) return <p className="res__empty">No hay KPIs registrados. Se generan al ejecutar pipelines ML desde el modo API.</p>

  const byTipo = {}
  kpis.forEach(k => {
    if (!byTipo[k.tipo] || k.calculadoEn > byTipo[k.tipo].calculadoEn) byTipo[k.tipo] = k
  })

  return (
    <div>
      <div className="res__stat-grid">
        {['AHORRO', 'TIEMPO_CICLO', 'COTIZACIONES_RECIBIDAS', 'ORDENES_EMITIDAS'].map(tipo => {
          const k = byTipo[tipo]
          return <StatCard key={tipo} label={KPI_LABEL[tipo] || tipo} value={k ? fmt(k.valor) : '—'} sub={k ? `Período ${k.periodo}` : 'Sin datos'} accent="cyan" />
        })}
      </div>
      <div className="res__card" style={{ marginTop: '1.5rem' }}>
        <h3 className="res__card-title">Historial completo</h3>
        <div className="table-responsive">
          <table className="table res__table align-middle mb-0">
            <thead>
              <tr><th>Tipo</th><th>Valor</th><th>Período</th><th>Pipeline</th><th>Calculado</th></tr>
            </thead>
            <tbody>
              {kpis.map(k => (
                <tr key={k.id}>
                  <td><span className="res__tag">{k.tipo}</span></td>
                  <td><strong>{fmt(k.valor)}</strong></td>
                  <td>{k.periodo || '—'}</td>
                  <td><code>#{k.pipelineEjecucionId}</code></td>
                  <td className="res__muted">{k.calculadoEn ? new Date(k.calculadoEn).toLocaleString('es-CL') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── TAB: EJECUCIONES ──────────────────────────────────────────────────────────

function TabEjecuciones({ ejecData, ejecError, ejecLoading }) {
  if (ejecLoading) return <Loading label="ejecuciones" />
  if (ejecError) return <SectionError msg="No se pudo conectar con /api/pipeline-ejecuciones." />

  const ejecs = Array.isArray(ejecData) ? ejecData : []
  if (ejecs.length === 0) return <p className="res__empty">Sin ejecuciones registradas.</p>

  return (
    <div className="res__card">
      <div className="res__card-header">
        <h3 className="res__card-title">Historial de pipeline runs</h3>
        <span className="res__muted">{ejecs.length} registros</span>
      </div>
      <div className="table-responsive">
        <table className="table res__table align-middle mb-0">
          <thead>
            <tr><th>ID</th><th>Pipeline</th><th>Estado</th><th>Registros</th><th>Errores</th><th>Duración</th><th>Iniciado</th></tr>
          </thead>
          <tbody>
            {ejecs.map(e => (
              <tr key={e.id}>
                <td><code>#{e.id}</code></td>
                <td>{e.pipelineNombre || `Pipeline #${e.pipelineId}`}</td>
                <td><StatusBadge value={e.estado} /></td>
                <td>{e.registrosProcesados ?? '—'}</td>
                <td className={e.erroresEncontrados > 0 ? 'res__danger' : ''}>{e.erroresEncontrados ?? '—'}</td>
                <td>{e.duracionMs != null ? `${(e.duracionMs / 1000).toFixed(2)}s` : '—'}</td>
                <td className="res__muted">{e.iniciadoEn ? new Date(e.iniciadoEn).toLocaleString('es-CL') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

function ResultadosSection() {
  const [tab, setTab] = useState('resumen')

  const rProv = useCallback(() => listProveedores({ page: 0, size: 100 }), [])
  const rSol = useCallback(() => listSolicitudes({ page: 0, size: 100 }), [])
  const rOrd = useCallback(() => listOrdenesCompra({ page: 0, size: 100 }), [])
  const rKpi = useCallback(() => listKpiResultados(), [])
  const rMl = useCallback(() => getMetrics(), [])
  const rScoreados = useCallback(() => getClientesScoreados(), [])
  const rEjec = useCallback(() => listPipelineEjecuciones(), [])

  const { data: provData } = useApiResource(rProv)
  const { data: solData } = useApiResource(rSol)
  const { data: ordData } = useApiResource(rOrd)
  const { data: kpiData, error: kpiError, loading: kpiLoading } = useApiResource(rKpi)
  const { data: mlData, error: mlError, loading: mlLoading } = useApiResource(rMl)
  const { data: scoreadosData, error: scoreadosError, loading: scoreadosLoading } = useApiResource(rScoreados)
  const { data: ejecData, error: ejecError, loading: ejecLoading } = useApiResource(rEjec)

  return (
    <section className="resultados-section">
      <div className="container">
        <div className="resultados-section__shell">
          <div className="resultados-section__head">
            <p className="resultados-section__eyebrow">Admin · Panel integrado</p>
            <h2 className="resultados-section__title">Resultados</h2>
            <p className="resultados-section__desc">
              Predicciones del modelo Random Forest · KPIs de negocio · métricas de entrenamiento · pipeline runs — todo desde Neon PostgreSQL.
            </p>
          </div>

          <nav className="resultados-section__tabs" aria-label="Secciones">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                className={`resultados-section__tab ${tab === t.key ? 'resultados-section__tab--active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="resultados-section__content">
            {tab === 'resumen' && <TabResumen provData={provData} solData={solData} ordData={ordData} ejecData={ejecData} scoreadosData={scoreadosData} />}
            {tab === 'predicciones' && <TabPredicciones scoreadosData={scoreadosData} scoreadosError={scoreadosError} scoreadosLoading={scoreadosLoading} />}
            {tab === 'ml' && <TabMl mlData={mlData} mlError={mlError} mlLoading={mlLoading} />}
            {tab === 'kpis' && <TabKpis kpiData={kpiData} kpiError={kpiError} kpiLoading={kpiLoading} />}
            {tab === 'pipelines' && <TabEjecuciones ejecData={ejecData} ejecError={ejecError} ejecLoading={ejecLoading} />}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResultadosSection
