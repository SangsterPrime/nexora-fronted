import { useCallback, useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import useApiResource from '../../hooks/useApiResource'
import { listCotizaciones } from '../../services/cotizacionService'

const ESTADOS = ['RECIBIDA', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA']

const ESTADO_COLOR = {
  RECIBIDA:   { bg: 'rgba(129,140,248,0.15)', color: '#818cf8', label: 'Recibida'    },
  EN_REVISION:{ bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', label: 'En revisión' },
  ACEPTADA:   { bg: 'rgba(74,222,128,0.15)',  color: '#4ade80', label: 'Aceptada'    },
  RECHAZADA:  { bg: 'rgba(248,113,113,0.15)', color: '#f87171', label: 'Rechazada'   },
}

const PAGE_SIZE = 10

function badge(estado) {
  const s = ESTADO_COLOR[estado] || { bg: 'rgba(245,245,240,0.08)', color: 'rgba(245,245,240,0.5)', label: estado }
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.18rem 0.65rem',
      borderRadius: '999px',
      fontSize: '0.73rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      background: s.bg,
      color: s.color,
    }}>
      {s.label}
    </span>
  )
}

function fmtMonto(n) {
  if (n == null) return '—'
  return Number(n).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

function riskLevel(score) {
  if (score == null) return null
  const v = Number(score)
  if (v >= 0.7) return { label: 'Alto', color: '#f87171' }
  if (v >= 0.4) return { label: 'Medio', color: '#fbbf24' }
  return { label: 'Bajo', color: '#4ade80' }
}

function CotizacionesSection() {
  const [filtro, setFiltro] = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(0)

  const req = useCallback(() => listCotizaciones({ page: 0, size: 200 }), [])
  const { data, loading, error } = useApiResource(req)

  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.content)
      ? data.content
      : []

  const filtrados = items
    .filter(c => filtro === 'TODOS' || c.estado === filtro)
    .filter(c => {
      if (!busqueda.trim()) return true
      const q = busqueda.toLowerCase()
      return (
        (c.proveedorRazonSocial || '').toLowerCase().includes(q) ||
        (c.solicitudCompraTitulo || '').toLowerCase().includes(q) ||
        String(c.id || '').includes(q)
      )
    })

  const totalPages = Math.ceil(filtrados.length / PAGE_SIZE)
  const pagActual = Math.min(pagina, Math.max(0, totalPages - 1))
  const visibles = filtrados.slice(pagActual * PAGE_SIZE, (pagActual + 1) * PAGE_SIZE)

  const contar = (e) => items.filter(c => c.estado === e).length
  const montoTotal = items.filter(c => c.estado === 'ACEPTADA')
    .reduce((s, c) => s + Number(c.monto || 0), 0)

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(245,245,240,0.4)' }}>
      Cargando cotizaciones…
    </div>
  )

  if (error) return (
    <div style={{ padding: '2rem', color: '#f87171', background: 'rgba(248,113,113,0.08)', borderRadius: '0.8rem', border: '1px solid rgba(248,113,113,0.2)' }}>
      <strong>No se pudo cargar /api/cotizaciones.</strong> Verifica que el backend esté activo en Render.
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

      {/* Cards resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.9rem' }}>
        {[
          { label: 'Total',       value: items.length,    sub: 'cotizaciones registradas',  color: '#818cf8' },
          { label: 'Recibidas',   value: contar('RECIBIDA'),    sub: 'pendientes de revisión', color: '#818cf8' },
          { label: 'En revisión', value: contar('EN_REVISION'), sub: 'siendo evaluadas',        color: '#fbbf24' },
          { label: 'Aceptadas',   value: contar('ACEPTADA'),    sub: 'aprobadas para compra',  color: '#4ade80' },
          { label: 'Rechazadas',  value: contar('RECHAZADA'),   sub: 'descartadas',            color: '#f87171' },
          { label: 'Monto aceptado', value: items.length === 0 ? '—' : fmtMonto(montoTotal), sub: 'suma de cotizaciones aceptadas', color: '#4ade80' },
        ].map(card => (
          <article key={card.label} style={{
            padding: '1rem 1.1rem',
            borderRadius: '0.85rem',
            border: '1px solid rgba(245,245,240,0.08)',
            background: 'rgba(255,255,255,0.03)',
          }}>
            <strong style={{ display: 'block', fontSize: '1.4rem', color: card.color, fontWeight: 800 }}>
              {card.value}
            </strong>
            <span style={{ display: 'block', fontSize: '0.79rem', color: 'rgba(245,245,240,0.7)', marginTop: '0.2rem' }}>
              {card.label}
            </span>
            <small style={{ fontSize: '0.7rem', color: 'rgba(245,245,240,0.35)' }}>{card.sub}</small>
          </article>
        ))}
      </div>

      {/* Explicación */}
      <div style={{
        padding: '0.9rem 1.1rem',
        borderRadius: '0.75rem',
        background: 'rgba(129,140,248,0.06)',
        border: '1px solid rgba(129,140,248,0.15)',
        fontSize: '0.8rem',
        color: 'rgba(245,245,240,0.55)',
        lineHeight: 1.7,
      }}>
        <strong style={{ color: 'rgba(245,245,240,0.85)' }}>¿Qué es una cotización?</strong>{' '}
        Es la propuesta de precio que envía un proveedor en respuesta a una solicitud de compra.
        El campo <strong style={{ color: 'rgba(245,245,240,0.7)' }}>Risk Score</strong> mide el riesgo del proveedor
        (0 = sin riesgo, 1 = riesgo máximo). Solo las cotizaciones <strong style={{ color: '#4ade80' }}>ACEPTADAS</strong> generan una orden de compra.
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {['TODOS', ...ESTADOS].map(e => (
          <button
            key={e}
            type="button"
            onClick={() => { setFiltro(e); setPagina(0) }}
            style={{
              padding: '0.3rem 0.85rem',
              borderRadius: '999px',
              border: '1px solid',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              borderColor: filtro === e ? (ESTADO_COLOR[e]?.color || '#818cf8') : 'rgba(245,245,240,0.12)',
              background: filtro === e ? (ESTADO_COLOR[e]?.bg || 'rgba(129,140,248,0.15)') : 'transparent',
              color: filtro === e ? (ESTADO_COLOR[e]?.color || '#818cf8') : 'rgba(245,245,240,0.5)',
            }}
          >
            {e === 'TODOS' ? `Todos (${items.length})` : `${ESTADO_COLOR[e]?.label || e} (${contar(e)})`}
          </button>
        ))}
        <input
          type="search"
          placeholder="Buscar por proveedor, solicitud o ID…"
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(0) }}
          style={{
            marginLeft: 'auto',
            padding: '0.3rem 0.85rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(245,245,240,0.12)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(245,245,240,0.8)',
            fontSize: '0.78rem',
            outline: 'none',
            width: '220px',
          }}
        />
      </div>

      {/* Tabla */}
      {items.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(245,245,240,0.35)', fontSize: '0.85rem' }}>
          No hay cotizaciones registradas aún. Se crean automáticamente cuando un proveedor responde a una solicitud de compra.
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', borderRadius: '0.85rem', border: '1px solid rgba(245,245,240,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(245,245,240,0.08)' }}>
                  {['#','Proveedor','Solicitud','Monto','Plazo (días)','Risk Score','Estado','Creada'].map(h => (
                    <th key={h} style={{ padding: '0.65rem 0.9rem', textAlign: 'left', color: 'rgba(245,245,240,0.4)', fontWeight: 600, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibles.map((c, i) => {
                  const risk = riskLevel(c.riskScore)
                  return (
                    <tr
                      key={c.id ?? i}
                      style={{
                        borderBottom: '1px solid rgba(245,245,240,0.05)',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.6rem 0.9rem', color: 'rgba(245,245,240,0.35)' }}>
                        <code style={{ fontSize: '0.7rem' }}>#{c.id}</code>
                      </td>
                      <td style={{ padding: '0.6rem 0.9rem', color: 'rgba(245,245,240,0.85)', fontWeight: 500 }}>
                        {c.proveedorRazonSocial || `Proveedor #${c.proveedorId}`}
                      </td>
                      <td style={{ padding: '0.6rem 0.9rem', color: 'rgba(245,245,240,0.6)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.solicitudCompraTitulo || `Solicitud #${c.solicitudCompraId}`}
                      </td>
                      <td style={{ padding: '0.6rem 0.9rem', color: '#4ade80', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {fmtMonto(c.monto)}
                      </td>
                      <td style={{ padding: '0.6rem 0.9rem', color: 'rgba(245,245,240,0.7)', textAlign: 'center' }}>
                        {c.plazoEntregaDias ?? '—'}
                      </td>
                      <td style={{ padding: '0.6rem 0.9rem' }}>
                        {risk ? (
                          <span style={{ color: risk.color, fontWeight: 700 }}>
                            {Number(c.riskScore).toFixed(2)} <small style={{ fontWeight: 400, opacity: 0.7 }}>({risk.label})</small>
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '0.6rem 0.9rem' }}>{badge(c.estado)}</td>
                      <td style={{ padding: '0.6rem 0.9rem', color: 'rgba(245,245,240,0.35)', whiteSpace: 'nowrap' }}>
                        {fmtDate(c.creadoEn)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center', marginTop: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setPagina(p => Math.max(0, p - 1))}
                disabled={pagActual === 0}
                style={{
                  padding: '0.3rem 0.8rem', borderRadius: '0.4rem', border: '1px solid rgba(245,245,240,0.12)',
                  background: 'transparent', color: pagActual === 0 ? 'rgba(245,245,240,0.2)' : 'rgba(245,245,240,0.7)',
                  cursor: pagActual === 0 ? 'default' : 'pointer', fontSize: '0.8rem',
                }}
              >
                ← Anterior
              </button>
              <span style={{ fontSize: '0.78rem', color: 'rgba(245,245,240,0.4)' }}>
                Página {pagActual + 1} de {totalPages} — {filtrados.length} cotizaciones
              </span>
              <button
                type="button"
                onClick={() => setPagina(p => Math.min(totalPages - 1, p + 1))}
                disabled={pagActual >= totalPages - 1}
                style={{
                  padding: '0.3rem 0.8rem', borderRadius: '0.4rem', border: '1px solid rgba(245,245,240,0.12)',
                  background: 'transparent', color: pagActual >= totalPages - 1 ? 'rgba(245,245,240,0.2)' : 'rgba(245,245,240,0.7)',
                  cursor: pagActual >= totalPages - 1 ? 'default' : 'pointer', fontSize: '0.8rem',
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Cotizaciones() {
  return (
    <AppLayout
      title="Cotizaciones"
      description="Propuestas de precio recibidas de proveedores para cada solicitud de compra."
    >
      <CotizacionesSection />
    </AppLayout>
  )
}

export default Cotizaciones
