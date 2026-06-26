import { useCallback, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import useApiResource from '../../hooks/useApiResource'
import { getClientesScoreados, getMetrics } from '../../services/mlApi'
import { listPipelineEjecuciones } from '../../services/pipelineEjecucionService'
import { listProveedores } from '../../services/proveedorService'
import { listSolicitudes } from '../../services/solicitudCompraService'
import { listOrdenesCompra } from '../../services/ordenCompraService'
import { listKpiResultados } from '../../services/kpiService'
import '../../styles/organisms/ResultadosSection.css'

// ── Constantes de color ───────────────────────────────────────────────────────

const C = {
  alto: '#f87171',
  medio: '#fbbf24',
  bajo: '#4ade80',
  blue: '#818cf8',
  cyan: '#22d3ee',
  purple: '#c084fc',
  muted: 'rgba(245,245,240,0.38)',
}

const TOOLTIP_STYLE = {
  background: 'rgba(8,10,13,0.97)',
  border: '1px solid rgba(245,245,240,0.12)',
  borderRadius: '0.55rem',
  padding: '0.55rem 0.85rem',
  color: '#f5f5f0',
  fontSize: '0.79rem',
  boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
}

const AXIS_PROPS = {
  tick: { fill: C.muted, fontSize: 11 },
  axisLine: { stroke: 'rgba(245,245,240,0.08)' },
  tickLine: false,
}

const GRID_PROPS = { stroke: 'rgba(245,245,240,0.05)', strokeDasharray: '3 3' }

const TABS = [
  { key: 'resumen',      label: 'Resumen general' },
  { key: 'predicciones', label: 'Predicciones IA' },
  { key: 'ml',           label: 'Métricas ML' },
  { key: 'kpis',         label: 'KPIs' },
  { key: 'pipelines',    label: 'Pipelines' },
]

const SEGMENTOS = ['ALTO', 'MEDIO', 'BAJO']

// ── Utilidades ────────────────────────────────────────────────────────────────

function pct(n) { return n == null ? '—' : `${(Number(n) * 100).toFixed(1)}%` }
function fmt(n, d = 2) { return n == null ? '—' : Number(n).toFixed(d) }

function arr(resource) {
  if (Array.isArray(resource)) return resource
  if (Array.isArray(resource?.content)) return resource.content
  return []
}

// ── Átomos de UI ─────────────────────────────────────────────────────────────

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

function InfoBox({ title, children }) {
  return (
    <div className="res__info-box">
      <span className="res__info-icon">ⓘ</span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  )
}

function SectionError({ msg }) {
  return <div className="res__error"><strong>No disponible.</strong> {msg}</div>
}

function Loading({ label }) {
  return <div className="res__loading">Cargando {label}…</div>
}

// ── Glosario de métricas ─────────────────────────────────────────────────────

const METRIC_GLOSSARY = [
  {
    term: 'Accuracy (exactitud)',
    color: C.blue,
    def: 'De todos los clientes evaluados, ¿cuántos clasificó correctamente el modelo? Por ejemplo, 85% significa que 85 de cada 100 predicciones fueron acertadas.',
  },
  {
    term: 'Recall (sensibilidad)',
    color: C.bajo,
    def: 'De los clientes que SÍ van a abandonar, ¿cuántos detectó el modelo? Es la métrica más importante en retención: un Recall alto significa que casi no se "pierden" clientes en riesgo real.',
  },
  {
    term: 'Precision (precisión)',
    color: C.cyan,
    def: 'De los clientes marcados como "abandono", ¿cuántos realmente abandonarían? Un Precision alto evita llamar por retención a clientes que seguirían igual.',
  },
  {
    term: 'F1-Score',
    color: C.medio,
    def: 'Promedio armónico entre Recall y Precision. Equilibra ambas métricas: útil cuando hay más clientes que NO abandonan (desbalance de clases).',
  },
  {
    term: 'ROC-AUC',
    color: C.medio,
    def: 'Área bajo la curva ROC. Mide qué tan bien separa el modelo las dos clases (abandona vs no abandona) independientemente del umbral elegido. 1.0 = perfecto, 0.5 = azar.',
  },
  {
    term: 'Gini',
    color: C.purple,
    def: 'Derivado del ROC-AUC: Gini = 2 × ROC-AUC − 1. Mide la concentración predictiva del modelo. Valores sobre 0.6 se consideran buenos en modelos de churn.',
  },
]

function MetricGlossary() {
  return (
    <div className="res__card" style={{ marginTop: '1.5rem' }}>
      <h3 className="res__card-title">¿Qué significa cada métrica?</h3>
      <div className="res__glossary-grid">
        {METRIC_GLOSSARY.map(({ term, color, def }) => (
          <div key={term} className="res__glossary-item">
            <span className="res__glossary-dot" style={{ background: color }} />
            <div>
              <strong>{term}</strong>
              <p>{def}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── TAB: RESUMEN ─────────────────────────────────────────────────────────────

function TabResumen({ provData, solData, ordData, ejecData, scoreadosData, mlData }) {
  const provs     = arr(provData)
  const sols      = arr(solData)
  const ords      = arr(ordData)
  const ejecs     = arr(ejecData)
  const scoreados = arr(scoreadosData)

  const alto  = scoreados.filter(c => c.segmentoRiesgo === 'ALTO').length
  const medio = scoreados.filter(c => c.segmentoRiesgo === 'MEDIO').length
  const bajo  = scoreados.filter(c => c.segmentoRiesgo === 'BAJO').length
  const total = scoreados.length

  const exitosas   = ejecs.filter(e => ['EXITOSO','EXITOSA','COMPLETADO','COMPLETADA'].includes(e.estado)).length
  const ordEmitidas = ords.filter(o => ['EMITIDA','COMPLETADA'].includes(o.estado)).length
  const provActivos = provs.filter(p => p.estado === 'ACTIVO').length

  // Gráfico general — panorama completo del sistema en una sola barra
  const resumenData = [
    { name: 'Proveedores activos', valor: provActivos,   fill: C.bajo   },
    { name: 'Solicitudes totales', valor: sols.length,   fill: C.cyan   },
    { name: 'Órdenes emitidas',    valor: ordEmitidas,   fill: C.medio  },
    { name: 'Pipelines exitosos',  valor: exitosas,      fill: C.blue   },
    { name: 'Clientes evaluados',  valor: total,         fill: C.purple },
    { name: 'Riesgo ALTO',         valor: alto,          fill: C.alto   },
  ].filter(d => d.valor > 0)

  const riskPieData = [
    { name: 'ALTO (≥60%)',    value: alto,  fill: C.alto  },
    { name: 'MEDIO (35-60%)', value: medio, fill: C.medio },
    { name: 'BAJO (<35%)',    value: bajo,  fill: C.bajo  },
  ].filter(d => d.value > 0)

  const estadoSols  = ['PENDIENTE','EN_PROCESO','APROBADA','RECHAZADA','COMPLETADA']
    .map(e => ({ name: e, value: sols.filter(s => s.estado === e).length })).filter(d => d.value > 0)
  const estadoProvs = ['ACTIVO','INACTIVO','SUSPENDIDO']
    .map(e => ({ name: e, value: provs.filter(p => p.estado === e).length })).filter(d => d.value > 0)
  const barColorProv = { ACTIVO: C.bajo, INACTIVO: 'rgba(245,245,240,0.2)', SUSPENDIDO: C.alto }

  return (
    <div>
      {/* KPIs rápidos */}
      <div className="res__stat-grid">
        <StatCard label="Proveedores activos"  value={provActivos}    sub={`de ${provs.length} registrados`}   accent="green"  />
        <StatCard label="Solicitudes"           value={sols.length}    sub={`${sols.filter(s=>s.estado==='PENDIENTE').length} pendientes`} accent="cyan" />
        <StatCard label="Órdenes emitidas"      value={ordEmitidas}    sub={`de ${ords.length} totales`}        accent="amber"  />
        <StatCard label="Pipelines exitosos"    value={exitosas}       sub={`de ${ejecs.length} ejecuciones`}   accent="blue"   />
        {total > 0 && <StatCard label="Clientes evaluados por IA" value={total} sub={`${alto} en riesgo ALTO`} accent="purple" />}
      </div>

      {/* Gráfico panorama general */}
      {resumenData.length > 0 && (
        <div className="res__card" style={{ marginTop: '1.4rem' }}>
          <h3 className="res__card-title">Panorama general del sistema</h3>
          <p className="res__chart-note">
            Visión consolidada: operaciones de compra + resultados del modelo de IA en un solo vistazo.
            Las barras más altas indican mayor actividad o volumen en esa área.
          </p>
          <div className="res__chart-wrap res__chart-wrap--md">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resumenData} margin={{ bottom: 0, left: 0 }}>
                <CartesianGrid {...GRID_PROPS} vertical={false} />
                <XAxis dataKey="name" {...AXIS_PROPS} interval={0} tick={{ fill: C.muted, fontSize: 10 }} />
                <YAxis {...AXIS_PROPS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [v, n]} />
                <Bar dataKey="valor" radius={[5, 5, 0, 0]} name="Cantidad">
                  {resumenData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Riesgo de abandono */}
      {total > 0 && (
        <>
          <h3 className="res__subtitle" style={{ marginTop: '1.8rem' }}>
            Riesgo de abandono de clientes — {total} evaluados por IA
          </h3>
          <InfoBox title="¿Qué es el riesgo de abandono y para qué sirve?">
            El modelo Random Forest analizó el historial de {total} clientes (reclamos, antigüedad, uso de datos, etc.)
            y calculó la probabilidad de que cada uno abandone el servicio.
            El resultado permite al equipo comercial <strong>priorizar acciones</strong>: llamar primero a los ALTO,
            ofrecer descuentos a los MEDIO, y solo monitorear a los BAJO — en vez de contactar a todos por igual.
          </InfoBox>
          <div className="res__two-col" style={{ alignItems: 'stretch', marginBottom: '1.5rem' }}>
            <div className="res__card">
              <h3 className="res__card-title">Distribución por segmento</h3>
              <div className="res__chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskPieData} cx="50%" cy="48%" innerRadius="45%" outerRadius="70%" paddingAngle={3} dataKey="value">
                      {riskPieData.map((entry, i) => <Cell key={i} fill={entry.fill} stroke="transparent" />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [`${v} clientes (${total ? ((v/total)*100).toFixed(1) : 0}%)`, n]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem', color: C.muted }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="res__risk-grid res__risk-grid--col">
              <article className="res__risk-card res__risk-card--alto">
                <strong>{alto}</strong>
                <span>Riesgo ALTO</span>
                <small>Prob. ≥ 60% · Acción: contacto prioritario inmediato</small>
                <div className="res__risk-bar" style={{ width: `${total ? (alto/total)*100 : 0}%` }} />
              </article>
              <article className="res__risk-card res__risk-card--medio">
                <strong>{medio}</strong>
                <span>Riesgo MEDIO</span>
                <small>Prob. 35–60% · Acción: campaña de fidelización</small>
                <div className="res__risk-bar" style={{ width: `${total ? (medio/total)*100 : 0}%` }} />
              </article>
              <article className="res__risk-card res__risk-card--bajo">
                <strong>{bajo}</strong>
                <span>Riesgo BAJO</span>
                <small>Prob. {'<'} 35% · Acción: monitoreo estándar</small>
                <div className="res__risk-bar" style={{ width: `${total ? (bajo/total)*100 : 0}%` }} />
              </article>
            </div>
          </div>
        </>
      )}

      {/* Operaciones */}
      <div className="res__two-col">
        <div className="res__card">
          <h3 className="res__card-title">Proveedores por estado</h3>
          {estadoProvs.length > 0 ? (
            <div className="res__chart-wrap res__chart-wrap--sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estadoProvs} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid {...GRID_PROPS} horizontal={false} />
                  <XAxis type="number" {...AXIS_PROPS} />
                  <YAxis type="category" dataKey="name" {...AXIS_PROPS} width={90} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Proveedores">
                    {estadoProvs.map((d, i) => <Cell key={i} fill={barColorProv[d.name] || C.blue} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="res__empty">Sin proveedores registrados.</p>}
        </div>
        <div className="res__card">
          <h3 className="res__card-title">Solicitudes por estado</h3>
          {estadoSols.length > 0 ? (
            <div className="res__chart-wrap res__chart-wrap--sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estadoSols} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid {...GRID_PROPS} horizontal={false} />
                  <XAxis type="number" {...AXIS_PROPS} />
                  <YAxis type="category" dataKey="name" {...AXIS_PROPS} width={90} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill={C.cyan} radius={[0, 4, 4, 0]} name="Solicitudes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="res__empty">Sin solicitudes registradas.</p>}
        </div>
      </div>
    </div>
  )
}

// ── TAB: PREDICCIONES ────────────────────────────────────────────────────────

const HIST_BUCKETS = [
  { lo: 0,   hi: 0.1,  label: '0-10%' },
  { lo: 0.1, hi: 0.2,  label: '10-20%' },
  { lo: 0.2, hi: 0.35, label: '20-35%' },
  { lo: 0.35,hi: 0.5,  label: '35-50%' },
  { lo: 0.5, hi: 0.6,  label: '50-60%' },
  { lo: 0.6, hi: 0.75, label: '60-75%' },
  { lo: 0.75,hi: 1.01, label: '75-100%' },
]

function histColor(hi) {
  if (hi <= 0.35) return C.bajo
  if (hi <= 0.6)  return C.medio
  return C.alto
}

const PRED_PAGE = 15

function TabPredicciones({ scoreadosData, scoreadosError, scoreadosLoading }) {
  const [filtro, setFiltro]     = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina]     = useState(0)
  if (scoreadosLoading) return <Loading label="predicciones" />
  if (scoreadosError) return <SectionError msg="No se pudo obtener /api/ml/clientes-scoreados. Ejecuta el pipeline IA para poblar clientes_scoreados en Neon." />

  const scoreados = arr(scoreadosData)

  if (scoreados.length === 0) {
    return (
      <div className="res__empty-state">
        <p className="res__empty-title">Sin predicciones todavía</p>
        <p className="res__empty-desc">
          Ejecuta el pipeline de EntrenamientoAI (Render Cron Job) para poblar la tabla{' '}
          <code>clientes_scoreados</code> en Neon. El modelo Random Forest scoreará cada cliente
          automáticamente y los resultados aparecerán aquí.
        </p>
      </div>
    )
  }

  const alto  = scoreados.filter(c => c.segmentoRiesgo === 'ALTO').length
  const medio = scoreados.filter(c => c.segmentoRiesgo === 'MEDIO').length
  const bajo  = scoreados.filter(c => c.segmentoRiesgo === 'BAJO').length
  const total = scoreados.length

  const histData = HIST_BUCKETS.map(b => ({
    name: b.label,
    clientes: scoreados.filter(c => c.probAbandono >= b.lo && c.probAbandono < b.hi).length,
    fill: histColor(b.hi),
  }))

  const pieData = [
    { name: 'ALTO',  value: alto,  fill: C.alto },
    { name: 'MEDIO', value: medio, fill: C.medio },
    { name: 'BAJO',  value: bajo,  fill: C.bajo },
  ]

  const filtrados = scoreados
    .filter(c => filtro === 'TODOS' || c.segmentoRiesgo === filtro)
    .filter(c => {
      if (!busqueda.trim()) return true
      const q = busqueda.toLowerCase()
      return (
        String(c.id ?? '').includes(q) ||
        (c.accionRetencion || '').toLowerCase().includes(q) ||
        String(c.reclamos ?? '').includes(q)
      )
    })
  const predTotalPages = Math.ceil(filtrados.length / PRED_PAGE)
  const predPage = Math.min(pagina, Math.max(0, predTotalPages - 1))
  const filtradosPage = filtrados.slice(predPage * PRED_PAGE, (predPage + 1) * PRED_PAGE)

  return (
    <div>
      {/* Banner de propósito */}
      <div className="res__purpose-banner">
        <div className="res__purpose-icon">🎯</div>
        <div>
          <strong>¿Para qué sirven estas predicciones?</strong>
          <p>
            El modelo Random Forest analizó <strong>{total} clientes</strong> y calculó la probabilidad de que cada uno abandone el servicio.
            El objetivo es que el equipo comercial pueda <strong>actuar antes de que el cliente se vaya</strong>:
            contactar urgente a los de riesgo ALTO, ofrecer beneficios a los MEDIO, y solo observar a los BAJO.
            Sin IA, este análisis tomaría semanas y se haría de forma subjetiva.
          </p>
        </div>
      </div>

      <div className="res__stat-grid" style={{ marginBottom: '1.2rem' }}>
        <StatCard label="Total evaluados" value={total} sub="clientes analizados por el modelo" accent="blue" />
        <StatCard label="Riesgo ALTO" value={alto} sub={`${((alto/total)*100).toFixed(1)}% — contactar hoy`} accent="danger" />
        <StatCard label="Riesgo MEDIO" value={medio} sub={`${((medio/total)*100).toFixed(1)}% — fidelizar`} accent="amber" />
        <StatCard label="Riesgo BAJO" value={bajo} sub={`${((bajo/total)*100).toFixed(1)}% — monitorear`} accent="green" />
      </div>

      <InfoBox title="¿Qué significa la columna 'Prob. abandono'?">
        Es el porcentaje de certeza del modelo: un cliente con 78% tiene 78 de cada 100 probabilidades
        de irse según su historial. La <strong>columna Acción recomendada</strong> ya traduce esa probabilidad
        en una acción concreta (llamada, descuento, programa de lealtad, etc.).
      </InfoBox>

      <div className="res__two-col" style={{ marginBottom: '1.5rem' }}>
        <div className="res__card">
          <h3 className="res__card-title">Distribución por segmento</h3>
          <div className="res__chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="48%" innerRadius="40%" outerRadius="68%" paddingAngle={3} dataKey="value">
                  {pieData.map((d, i) => <Cell key={i} fill={d.fill} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [`${v} clientes`, n]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem', color: C.muted }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="res__card">
          <h3 className="res__card-title">Histograma: Probabilidad de abandono</h3>
          <p className="res__chart-note">¿Cuántos clientes caen en cada rango de riesgo?</p>
          <div className="res__chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histData} margin={{ bottom: 0 }}>
                <CartesianGrid {...GRID_PROPS} vertical={false} />
                <XAxis dataKey="name" {...AXIS_PROPS} />
                <YAxis {...AXIS_PROPS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} clientes`, 'Cantidad']} />
                <Bar dataKey="clientes" radius={[4, 4, 0, 0]} name="Clientes">
                  {histData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="res__card">
        <div className="res__card-header">
          <div>
            <h3 className="res__card-title" style={{ marginBottom: 0 }}>Clientes scoreados — Random Forest (optimizado)</h3>
            <p className="res__chart-note" style={{ margin: '0.2rem 0 0' }}>
              Columnas: edad · años como cliente · reclamos (predictor nº 1) · uso de datos · plan premium · probabilidad de abandono · segmento · acción recomendada
            </p>
          </div>
        </div>
        <div className="res__filtros" style={{ marginTop: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['TODOS', ...SEGMENTOS].map(seg => (
            <button
              key={seg}
              type="button"
              className={`res__filtro-btn ${filtro === seg ? `res__filtro-btn--${seg.toLowerCase()}` : ''}`}
              onClick={() => { setFiltro(seg); setPagina(0) }}
            >
              {seg === 'TODOS' ? `Todos (${total})` : `${seg} (${scoreados.filter(c => c.segmentoRiesgo === seg).length})`}
            </button>
          ))}
          <input
            type="search"
            placeholder="Buscar por ID, acción o reclamos…"
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(0) }}
            className="res__search-input"
          />
        </div>
        <div className="table-responsive" style={{ marginTop: '0.8rem' }}>
          {filtrados.length === 0 ? (
            <p className="res__empty" style={{ padding: '1.5rem 0' }}>Sin resultados para los filtros seleccionados.</p>
          ) : (
            <table className="table res__table align-middle mb-0">
              <thead>
                <tr>
                  <th title="Número de fila">#</th>
                  <th title="Edad en años del cliente">Edad</th>
                  <th title="Antigüedad como cliente (años)">Años cliente</th>
                  <th title="Cantidad de reclamos hechos — predictor más importante (32%)">Reclamos ⚠</th>
                  <th title="Consumo de datos del último mes (GB)">Datos (GB)</th>
                  <th title="¿Tiene plan premium? Más lealtad">Plan premium</th>
                  <th title="Probabilidad de que abandone el servicio (0-100%)">Prob. abandono</th>
                  <th title="Segmento de riesgo asignado por el modelo">Segmento</th>
                  <th title="Acción de retención recomendada por el sistema">Acción recomendada</th>
                </tr>
              </thead>
              <tbody>
                {filtradosPage.map((c, i) => (
                  <tr key={c.id ?? i}>
                    <td className="res__muted">{predPage * PRED_PAGE + i + 1}</td>
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
          )}
        </div>

        {/* Paginación */}
        {predTotalPages > 1 && (
          <div className="res__pagination">
            <button
              type="button"
              className="res__page-btn"
              disabled={predPage === 0}
              onClick={() => setPagina(p => Math.max(0, p - 1))}
            >
              ← Anterior
            </button>
            <span className="res__page-info">
              Página {predPage + 1} de {predTotalPages} — {filtrados.length} clientes
            </span>
            <button
              type="button"
              className="res__page-btn"
              disabled={predPage >= predTotalPages - 1}
              onClick={() => setPagina(p => Math.min(predTotalPages - 1, p + 1))}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── TAB: MÉTRICAS ML ──────────────────────────────────────────────────────────

function TabMl({ mlData, mlError, mlLoading }) {
  if (mlLoading) return <Loading label="métricas ML" />
  if (mlError)   return <SectionError msg="No se pudo conectar con /api/ml/metrics. Verifica que NEXORA_ML_ENABLED=true." />
  if (!mlData)   return <p className="res__empty">Sin métricas disponibles todavía.</p>

  const { accuracy, precision, recall, f1, rocAuc, gini, matrizConfusion,
    modeloSeleccionado, importanciaVariables, metricasPorModelo } = mlData

  const importancias = importanciaVariables
    ? Object.entries(importanciaVariables).sort((a, b) => b[1] - a[1])
    : []

  const modelos = metricasPorModelo ? Object.entries(metricasPorModelo) : []

  const impChartData = importancias.map(([feat, imp]) => ({
    name: feat.replace('_', ' '),
    valor: Math.round(imp * 1000) / 10,
  }))

  const modelChartData = modelos.map(([nombre, m]) => ({
    name: nombre.split(' ').slice(0, 2).join(' '),
    fullName: nombre,
    Recall: m.recall != null ? +(m.recall * 100).toFixed(1) : 0,
    'F1-Score': m.f1 != null ? +(m.f1 * 100).toFixed(1) : 0,
    'ROC-AUC': m.rocAuc != null ? +(m.rocAuc * 100).toFixed(1) : 0,
  }))

  return (
    <div>
      {modeloSeleccionado && (
        <div className="res__modelo-selected">
          <span className="res__label">Modelo seleccionado</span>
          <strong>{modeloSeleccionado}</strong>
          <small>Criterio de selección: máximo Recall · desempate por F1</small>
        </div>
      )}

      <InfoBox title="¿Por qué se eligió este modelo?">
        En churn de telecomunicaciones es más costoso <em>no detectar</em> un cliente que abandona (falso negativo)
        que contactar a uno que no lo haría (falso positivo). Por eso el criterio de selección prioriza el
        <strong> Recall</strong>, que mide la capacidad del modelo de "no perder" clientes en riesgo real.
      </InfoBox>

      <div className="res__two-col">
        {/* Métricas del modelo ganador */}
        <div className="res__card">
          <h3 className="res__card-title">Rendimiento del modelo ganador</h3>
          <MetricBar label="Accuracy"  value={accuracy}  color="blue" />
          <MetricBar label="Precision" value={precision} color="cyan" />
          <MetricBar label="Recall"    value={recall}    color="green" />
          <MetricBar label="F1-Score"  value={f1}        color="amber" />
          <MetricBar label="ROC-AUC"   value={rocAuc}    color="amber" />
          <MetricBar label="Gini"      value={gini}      color="purple" />

          {matrizConfusion && matrizConfusion.length > 0 && (
            <div className="res__confusion">
              <p className="res__card-title" style={{ marginTop: '1.2rem' }}>Matriz de confusión</p>
              <p className="res__chart-note" style={{ marginBottom: '0.6rem' }}>
                Muestra aciertos (diagonal verde) y errores (rojo) del modelo en datos de prueba.
              </p>
              <div className="res__conf-grid">
                <span />
                <span className="res__conf-head">Pred. No abandona</span>
                <span className="res__conf-head">Pred. Abandona</span>
                {matrizConfusion.map((row, i) => (
                  <>
                    <span key={`h${i}`} className="res__conf-head">{i === 0 ? 'Real: No abandona' : 'Real: Abandona'}</span>
                    {row.map((cell, j) => (
                      <div key={`${i}${j}`} className={`res__conf-cell ${i === j ? 'res__conf-cell--ok' : 'res__conf-cell--err'}`}>
                        {cell}
                      </div>
                    ))}
                  </>
                ))}
              </div>
              <p className="res__conf-note">
                VP={matrizConfusion[1]?.[1] ?? '?'} (bien detectados) ·
                FN={matrizConfusion[1]?.[0] ?? '?'} (perdidos) ·
                FP={matrizConfusion[0]?.[1] ?? '?'} (falsas alarmas) ·
                VN={matrizConfusion[0]?.[0] ?? '?'} (bien descartados)
              </p>
            </div>
          )}
        </div>

        {/* Feature importances + resumen */}
        <div>
          {impChartData.length > 0 && (
            <div className="res__card" style={{ marginBottom: '1rem' }}>
              <h3 className="res__card-title">¿Qué variables influyen más en el abandono?</h3>
              <p className="res__chart-note">Importancia relativa calculada por el Random Forest</p>
              <div className="res__chart-wrap res__chart-wrap--md">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impChartData} layout="vertical" margin={{ left: 8, right: 32 }}>
                    <CartesianGrid {...GRID_PROPS} horizontal={false} />
                    <XAxis type="number" {...AXIS_PROPS} tickFormatter={v => `${v}%`} domain={[0, 'dataMax + 5']} />
                    <YAxis type="category" dataKey="name" {...AXIS_PROPS} width={110} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Importancia']} />
                    <Bar dataKey="valor" fill={C.purple} radius={[0, 4, 4, 0]} name="Importancia" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="res__note">
                <strong>Reclamos</strong> es el predictor más fuerte: a más reclamos, mayor probabilidad de que el cliente se vaya.
                Seguido de <strong>años como cliente</strong> y <strong>edad</strong>.
              </p>
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

      {/* Comparación de modelos — tabla + gráfico */}
      {modelos.length > 0 && (
        <div className="res__card" style={{ marginTop: '1.5rem' }}>
          <h3 className="res__card-title">Comparación de modelos entrenados</h3>
          <p className="res__chart-note">El modelo con mayor Recall es el seleccionado. Las barras muestran Recall / F1 / ROC-AUC en %.</p>

          {modelChartData.length > 0 && (
            <div className="res__chart-wrap res__chart-wrap--md" style={{ marginBottom: '1.2rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelChartData} margin={{ bottom: 0 }}>
                  <CartesianGrid {...GRID_PROPS} vertical={false} />
                  <XAxis dataKey="name" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => `${v}%`} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem', color: C.muted }} />
                  <Bar dataKey="Recall"    fill={C.bajo}   radius={[3,3,0,0]} />
                  <Bar dataKey="F1-Score"  fill={C.medio}  radius={[3,3,0,0]} />
                  <Bar dataKey="ROC-AUC"   fill={C.blue}   radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="table-responsive">
            <table className="table res__table align-middle mb-0">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th title="Exactitud general">Accuracy</th>
                  <th title="¿Cuántos del total predijo bien?">Precision</th>
                  <th title="¿Cuántos que SÍ abandonan detectó?">Recall ★</th>
                  <th title="Promedio Precision-Recall">F1</th>
                  <th title="Separación entre clases (0.5=azar, 1=perfecto)">ROC-AUC</th>
                  <th title="Concentración predictiva (2×AUC−1)">Gini</th>
                </tr>
              </thead>
              <tbody>
                {modelos.map(([nombre, m]) => (
                  <tr key={nombre} className={nombre === modeloSeleccionado ? 'res__row--winner' : ''}>
                    <td>
                      {nombre}
                      {nombre === modeloSeleccionado && <span className="res__winner-tag">Seleccionado</span>}
                    </td>
                    <td>{pct(m.accuracy)}</td>
                    <td>{pct(m.precision)}</td>
                    <td><strong>{pct(m.recall)}</strong></td>
                    <td>{pct(m.f1)}</td>
                    <td>{pct(m.rocAuc)}</td>
                    <td>{pct(m.gini)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MetricGlossary />
    </div>
  )
}

// ── TAB: KPIs ─────────────────────────────────────────────────────────────────

const KPI_META = {
  AHORRO:                 { label: 'Ahorro ($)',               color: C.bajo,   def: 'Ahorro económico generado por el pipeline vs proceso manual. Se calcula restando el costo de retención del costo estimado de pérdida de cliente.' },
  TIEMPO_CICLO:           { label: 'Tiempo ciclo (días)',       color: C.cyan,   def: 'Días transcurridos desde que se detecta riesgo hasta que se ejecuta la acción de retención. Menor es mejor.' },
  COTIZACIONES_RECIBIDAS: { label: 'Cotizaciones recibidas',   color: C.medio,  def: 'Total de cotizaciones ingresadas en el período, indicador del volumen de demanda de compras.' },
  ORDENES_EMITIDAS:       { label: 'Órdenes emitidas',         color: C.blue,   def: 'Órdenes de compra formalizadas. Una orden emitida significa que la solicitud fue aprobada y ejecutada.' },
  ML_ACCURACY:            { label: 'ML Accuracy',              color: C.blue,   def: 'Exactitud global del modelo IA en el último entrenamiento.' },
  ML_PRECISION:           { label: 'ML Precisión',             color: C.cyan,   def: 'Precisión del modelo: de los que marcó como "abandona", cuántos realmente lo hacen.' },
  ML_RECALL:              { label: 'ML Recall',                color: C.bajo,   def: 'Recall del modelo: de los que SÍ abandonan, cuántos detecta correctamente.' },
  ML_F1:                  { label: 'ML F1-Score',              color: C.medio,  def: 'F1 balanceado entre Recall y Precision del modelo entrenado.' },
  ML_ROC_AUC:             { label: 'ML ROC-AUC',               color: C.purple, def: 'Área bajo la curva ROC del modelo: mide capacidad discriminativa general.' },
  ML_GINI:                { label: 'ML Gini',                  color: C.purple, def: 'Índice de Gini del modelo (2×AUC−1). Mide concentración predictiva.' },
}

function TabKpis({ kpiData, kpiError, kpiLoading }) {
  if (kpiLoading) return <Loading label="KPIs" />
  if (kpiError)   return <SectionError msg="No se pudo conectar con /api/kpi-resultados." />

  const kpis = Array.isArray(kpiData) ? kpiData : []
  if (kpis.length === 0) {
    return (
      <div className="res__empty-state">
        <p className="res__empty-title">Sin KPIs registrados</p>
        <p className="res__empty-desc">Los KPIs se generan automáticamente al ejecutar pipelines de compra o al entrenar el modelo IA desde modo API.</p>
      </div>
    )
  }

  const byTipo = {}
  kpis.forEach(k => {
    if (!byTipo[k.tipo] || k.calculadoEn > byTipo[k.tipo].calculadoEn) byTipo[k.tipo] = k
  })

  const kpiSummaryData = Object.entries(byTipo)
    .filter(([t]) => !t.startsWith('ML_'))
    .map(([tipo, k]) => ({
      name: KPI_META[tipo]?.label.split('(')[0].trim() || tipo,
      valor: Number(k.valor),
      fill: KPI_META[tipo]?.color || C.blue,
    }))

  return (
    <div>
      <InfoBox title="¿Qué son los KPIs de negocio?">
        Los KPIs (Key Performance Indicators) son indicadores clave que miden el desempeño del proceso de compras y del modelo de IA.
        Se calculan automáticamente cada vez que un pipeline se ejecuta. Los KPIs <strong>ML_*</strong> corresponden al último entrenamiento del modelo.
      </InfoBox>

      <div className="res__stat-grid">
        {['AHORRO','TIEMPO_CICLO','COTIZACIONES_RECIBIDAS','ORDENES_EMITIDAS'].map(tipo => {
          const k = byTipo[tipo]
          return <StatCard key={tipo} label={KPI_META[tipo]?.label || tipo} value={k ? fmt(k.valor) : '—'} sub={k ? `Período ${k.periodo}` : 'Sin datos'} accent="cyan" />
        })}
      </div>

      {kpiSummaryData.length > 0 && (
        <div className="res__card" style={{ marginTop: '1.5rem' }}>
          <h3 className="res__card-title">KPIs de negocio — último valor por tipo</h3>
          <div className="res__chart-wrap res__chart-wrap--sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpiSummaryData} margin={{ bottom: 0, left: 8 }}>
                <CartesianGrid {...GRID_PROPS} vertical={false} />
                <XAxis dataKey="name" {...AXIS_PROPS} />
                <YAxis {...AXIS_PROPS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [v, 'Valor']} />
                <Bar dataKey="valor" radius={[4,4,0,0]} name="Valor">
                  {kpiSummaryData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="res__card" style={{ marginTop: '1.5rem' }}>
        <h3 className="res__card-title">¿Qué significa cada KPI?</h3>
        <div className="res__glossary-grid">
          {Object.entries(KPI_META).filter(([t]) => byTipo[t]).map(([tipo, meta]) => (
            <div key={tipo} className="res__glossary-item">
              <span className="res__glossary-dot" style={{ background: meta.color }} />
              <div>
                <strong>{meta.label}</strong>
                <p>{meta.def}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="res__card" style={{ marginTop: '1.5rem' }}>
        <h3 className="res__card-title">Historial completo de KPIs</h3>
        <div className="table-responsive">
          <table className="table res__table align-middle mb-0">
            <thead>
              <tr><th>Tipo</th><th title="¿Qué mide?">Descripción</th><th>Valor</th><th>Período</th><th>Pipeline</th><th>Calculado</th></tr>
            </thead>
            <tbody>
              {kpis.map(k => (
                <tr key={k.id}>
                  <td><span className="res__tag">{k.tipo}</span></td>
                  <td className="res__muted" style={{ fontSize: '0.74rem', maxWidth: 200 }}>{KPI_META[k.tipo]?.def?.substring(0, 80) || '—'}…</td>
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
  if (ejecError)   return <SectionError msg="No se pudo conectar con /api/pipeline-ejecuciones." />

  const ejecs = Array.isArray(ejecData) ? ejecData : []
  if (ejecs.length === 0) return <p className="res__empty">Sin ejecuciones registradas.</p>

  const estados = {}
  ejecs.forEach(e => { estados[e.estado] = (estados[e.estado] || 0) + 1 })
  const pieData = Object.entries(estados).map(([k, v]) => ({
    name: k, value: v,
    fill: (['EXITOSO','EXITOSA','COMPLETADO','COMPLETADA'].includes(k)) ? C.bajo
        : (['EN_EJECUCION','EN_PROCESO','PENDIENTE'].includes(k)) ? C.medio
        : C.alto
  }))

  const exitosas = ejecs.filter(e => ['EXITOSO','EXITOSA','COMPLETADO','COMPLETADA'].includes(e.estado)).length
  const avgDur = ejecs.filter(e => e.duracionMs).reduce((s, e) => s + e.duracionMs, 0) / (ejecs.filter(e => e.duracionMs).length || 1)

  return (
    <div>
      <div className="res__stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="Total ejecuciones" value={ejecs.length} sub="pipeline runs" accent="blue" />
        <StatCard label="Exitosas" value={exitosas} sub={`${ejecs.length ? ((exitosas/ejecs.length)*100).toFixed(0) : 0}% de éxito`} accent="green" />
        <StatCard label="Duración media" value={`${(avgDur/1000).toFixed(1)}s`} sub="segundos por ejecución" accent="cyan" />
        <StatCard label="Con errores" value={ejecs.filter(e => (e.erroresEncontrados || 0) > 0).length} sub="runs con errores" accent="danger" />
      </div>

      <div className="res__two-col" style={{ marginBottom: '1.5rem' }}>
        <div className="res__card">
          <h3 className="res__card-title">Estado de las ejecuciones</h3>
          <div className="res__chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="48%" innerRadius="40%" outerRadius="68%" paddingAngle={3} dataKey="value">
                  {pieData.map((d, i) => <Cell key={i} fill={d.fill} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [`${v} ejecuciones`, n]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem', color: C.muted }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="res__card">
          <h3 className="res__card-title">¿Qué es una ejecución de pipeline?</h3>
          <div className="res__glossary-grid res__glossary-grid--single">
            <div className="res__glossary-item"><span className="res__glossary-dot" style={{ background: C.bajo }} /><div><strong>EXITOSO / COMPLETADO</strong><p>El pipeline corrió sin errores y procesó todos los registros correctamente.</p></div></div>
            <div className="res__glossary-item"><span className="res__glossary-dot" style={{ background: C.medio }} /><div><strong>EN_EJECUCION / PENDIENTE</strong><p>El pipeline está corriendo o esperando ser ejecutado. No se puede lanzar otro hasta que termine.</p></div></div>
            <div className="res__glossary-item"><span className="res__glossary-dot" style={{ background: C.alto }} /><div><strong>FALLIDO / ERROR</strong><p>Ocurrió un error durante la ejecución. Revisa el campo Errores y los logs de Render.</p></div></div>
            <div className="res__glossary-item"><span className="res__glossary-dot" style={{ background: C.muted }} /><div><strong>Registros procesados</strong><p>Cantidad de filas (clientes, solicitudes, etc.) que el pipeline procesó en esa ejecución.</p></div></div>
          </div>
        </div>
      </div>

      <div className="res__card">
        <div className="res__card-header">
          <h3 className="res__card-title">Historial de pipeline runs</h3>
          <span className="res__muted">{ejecs.length} registros</span>
        </div>
        <div className="table-responsive">
          <table className="table res__table align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th title="Nombre del pipeline ejecutado">Pipeline</th>
                <th title="¿Terminó bien?">Estado</th>
                <th title="Filas procesadas">Registros</th>
                <th title="Filas con error">Errores</th>
                <th title="Tiempo total del run">Duración</th>
                <th title="Cuándo se inició">Iniciado</th>
              </tr>
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
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

function ResultadosSection() {
  const [tab, setTab] = useState('resumen')

  const rProv     = useCallback(() => listProveedores({ page: 0, size: 100 }), [])
  const rSol      = useCallback(() => listSolicitudes({ page: 0, size: 100 }), [])
  const rOrd      = useCallback(() => listOrdenesCompra({ page: 0, size: 100 }), [])
  const rKpi      = useCallback(() => listKpiResultados(), [])
  const rMl       = useCallback(() => getMetrics(), [])
  const rScoreados= useCallback(() => getClientesScoreados(), [])
  const rEjec     = useCallback(() => listPipelineEjecuciones(), [])

  const { data: provData }                                                   = useApiResource(rProv)
  const { data: solData }                                                    = useApiResource(rSol)
  const { data: ordData }                                                    = useApiResource(rOrd)
  const { data: kpiData,       error: kpiError,       loading: kpiLoading } = useApiResource(rKpi)
  const { data: mlData,        error: mlError,        loading: mlLoading }  = useApiResource(rMl)
  const { data: scoreadosData, error: scoreadosError, loading: scoreadosLoading } = useApiResource(rScoreados)
  const { data: ejecData,      error: ejecError,      loading: ejecLoading }= useApiResource(rEjec)

  return (
    <section className="resultados-section">
      <div className="container">
        <div className="resultados-section__shell">
          <div className="resultados-section__head">
            <p className="resultados-section__eyebrow">Admin · Panel integrado</p>
            <h2 className="resultados-section__title">Resultados</h2>
            <p className="resultados-section__desc">
              Predicciones del modelo Random Forest · KPIs de negocio · métricas de entrenamiento · pipeline runs — todo desde Neon PostgreSQL.
              Cada sección incluye una <strong>explicación</strong> de lo que significa cada dato.
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
            {tab === 'resumen'      && <TabResumen provData={provData} solData={solData} ordData={ordData} ejecData={ejecData} scoreadosData={scoreadosData} mlData={mlData} />}
            {tab === 'predicciones' && <TabPredicciones scoreadosData={scoreadosData} scoreadosError={scoreadosError} scoreadosLoading={scoreadosLoading} />}
            {tab === 'ml'           && <TabMl mlData={mlData} mlError={mlError} mlLoading={mlLoading} />}
            {tab === 'kpis'         && <TabKpis kpiData={kpiData} kpiError={kpiError} kpiLoading={kpiLoading} />}
            {tab === 'pipelines'    && <TabEjecuciones ejecData={ejecData} ejecError={ejecError} ejecLoading={ejecLoading} />}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResultadosSection
