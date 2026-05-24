import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/app/Dashboard'
import Proveedores from './pages/app/Proveedores'
import Solicitudes from './pages/app/Solicitudes'
import Cotizaciones from './pages/app/Cotizaciones'
import Pipelines from './pages/app/Pipelines'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/proveedores" element={<Proveedores />} />
        <Route path="/app/solicitudes" element={<Solicitudes />} />
        <Route path="/app/cotizaciones" element={<Cotizaciones />} />
        <Route path="/app/pipelines" element={<Pipelines />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
