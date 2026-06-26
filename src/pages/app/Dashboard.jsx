import { useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import AppLayout from '../../layouts/AppLayout'
import DashboardPreview from '../../components/organisms/DashboardPreview'
import SystemStatusSection from '../../components/organisms/SystemStatusSection'
import { useAuth } from '../../context/AuthContext'
import useApiResource from '../../hooks/useApiResource'
import { listSolicitudes } from '../../services/solicitudCompraService'
import { listProveedores } from '../../services/proveedorService'
import { listCotizaciones } from '../../services/cotizacionService'
import '../../styles/pages/Dashboard.css'

const TOOLTIP_STYLE = {
  background: 'rgba(8,10,13,0.97)',
  border: '1px solid rgba(245,245,240,0.12)',
  borderRadius: '0.55rem',
  padding: '0.55rem 0.85rem',
  color: '#f5f5f0',
  fontSize: '0.79rem',
}

const AXIS_PROPS = {
  tick: { fill: 'rgba(245,245,240,0.38)', fontSize: 11 },
  axisLine: { stroke: 'rgba(245,245,240,0.08)' },
  tickLine: false,
}

const GRID_PROPS = { stroke: 'rgba(245,245,240,0.05)', strokeDasharray: '3 3' }

const STATUS_COLOR = {
  PENDIENTE: '#818cf8',
  EN_PROCESO: '#fbbf24',
  APROBADA: '#4ade80',
  RECHAZADA: '#f87171',
  COMPLETADA: '#22d3ee',
  ACTIVO: '#4ade80',
  INACTIVO: 'rgba(245,245,240,0.25)',
  SUSPENDIDO: '#f87171',
}

function arr(resource) {
  if (Array.isArray(resource)) return resource
  if (Array.isArray(resource?.content)) return resource.content
  return []
}

function DashboardCharts({ solData, provData, cotData }) {
  const sols = arr(solData)
  const provs = arr(provData)
  const cots = arr(cotData)

  const solPie = ['PENDIENTE','EN_PROCESO','APROBADA','RECHAZADA','COMPLETADA']
    .map(e => ({ name: e, value: sols.filter(s => s.estado === e).length }))
    .filter(d => d.value > 0)

  const provBar = ['ACTIVO','INACTIVO','SUSPENDIDO']
    .map(e => ({ name: e, value: provs.filter(p => p.estado === e).length }))

  const cotTop = cots
    .filter(c => c.montoTotal || c.monto || c.montoEstimado)
    .slice(0, 8)
    .map((c, i) => ({
      name: c.proveedorNombre || c.proveedor || `Prov. ${i + 1}`,
      monto: Number(c.montoTotal || c.monto || c.montoEstimado || 0),
    }))

  if (sols.length === 0 && provs.length === 0 && cots.length === 0) return null

  return (
    <div className="db-charts">
      <div className="db-charts__grid">
        {solPie.length > 0 && (
          <div className="db-charts__card">
            <p className="db-charts__title">Solicitudes de compra por estado</p>
            <p className="db-charts__desc">
              Distribución de las {sols.length} solicitudes activas según su estado en el flujo de aprobación.
              <strong> PENDIENTE</strong> = esperando revisión · <strong>APROBADA</strong> = autorizada · <strong>RECHAZADA</strong> = descartada.
            </p>
            <div className="db-charts__wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={solPie} cx="50%" cy="48%" innerRadius="38%" outerRadius="65%" paddingAngle={3} dataKey="value">
                    {solPie.map((d, i) => <Cell key={i} fill={STATUS_COLOR[d.name] || '#818cf8'} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [`${v} solicitudes`, n]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', color: 'rgba(245,245,240,0.4)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {provBar.some(d => d.value > 0) && (
          <div className="db-charts__card">
            <p className="db-charts__title">Proveedores por estado</p>
            <p className="db-charts__desc">
              De los {provs.length} proveedores registrados, ¿cuántos están activos y disponibles para cotizar?
              <strong> ACTIVO</strong> = puede recibir solicitudes · <strong>SUSPENDIDO</strong> = bloqueado temporalmente.
            </p>
            <div className="db-charts__wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provBar} margin={{ bottom: 0 }}>
                  <CartesianGrid {...GRID_PROPS} vertical={false} />
                  <XAxis dataKey="name" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v} proveedores`, 'Cantidad']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Proveedores">
                    {provBar.map((d, i) => <Cell key={i} fill={STATUS_COLOR[d.name] || '#818cf8'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {cotTop.length > 0 && (
          <div className="db-charts__card db-charts__card--wide">
            <p className="db-charts__title">Cotizaciones recibidas — monto por proveedor</p>
            <p className="db-charts__desc">
              Top {cotTop.length} cotizaciones ordenadas por monto. Permite identificar qué proveedores ofrecen los precios más competitivos.
            </p>
            <div className="db-charts__wrap db-charts__wrap--tall">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cotTop} layout="vertical" margin={{ left: 8, right: 30 }}>
                  <CartesianGrid {...GRID_PROPS} horizontal={false} />
                  <XAxis type="number" {...AXIS_PROPS} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" {...AXIS_PROPS} width={90} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`$${Number(v).toLocaleString('es-CL')}`, 'Monto']} />
                  <Bar dataKey="monto" fill="#818cf8" radius={[0, 4, 4, 0]} name="Monto" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const displayName = user?.nombre || user?.name || user?.fullName || 'Usuario'
  const firstName = displayName.split(' ')[0]

  const rSol  = useCallback(() => listSolicitudes({ page: 0, size: 100 }), [])
  const rProv = useCallback(() => listProveedores({ page: 0, size: 100 }), [])
  const rCot  = useCallback(() => listCotizaciones({ page: 0, size: 20 }), [])

  const { data: solData }  = useApiResource(rSol)
  const { data: provData } = useApiResource(rProv)
  const { data: cotData }  = useApiResource(rCot)

  return (
    <AppLayout
      title={`Hola, ${firstName}`}
      description="Vista centralizada del flujo operativo de NEXORA — datos en vivo desde el backend."
    >
      <div className="db-welcome">
        <div className="db-welcome__body">
          <p className="db-welcome__greeting">Bienvenido de vuelta</p>
          <h2 className="db-welcome__name">{displayName}</h2>
          {user?.email && <p className="db-welcome__email">{user.email}</p>}
        </div>
        {(user?.fotoUrl || user?.photoUrl || user?.picture) && (
          <img className="db-welcome__avatar" src={user.fotoUrl || user.photoUrl || user.picture} alt={displayName} />
        )}
      </div>

      <DashboardCharts solData={solData} provData={provData} cotData={cotData} />
      <DashboardPreview />
      <SystemStatusSection />
    </AppLayout>
  )
}

export default Dashboard
