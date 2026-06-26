import { screen, waitFor } from '@testing-library/react'
import Cotizaciones from '../../pages/app/Cotizaciones'
import Dashboard from '../../pages/app/Dashboard'
import Ia from '../../pages/app/Ia'
import Pipelines from '../../pages/app/Pipelines'
import Proveedores from '../../pages/app/Proveedores'
import Solicitudes from '../../pages/app/Solicitudes'
import { jsonResponse, renderWithAuth } from '../testUtils'

describe('private app pages', () => {
  it('renders the dashboard shell', () => {
    renderWithAuth(<Dashboard />)

    expect(screen.getByRole('heading', { name: 'Dashboard interno' })).not.toBeNull()
    expect(screen.getByLabelText('Resumen operativo')).not.toBeNull()
    expect(screen.getAllByText('Pipelines').length).toBeGreaterThan(0)
  })

  it('renders Solicitudes section with real component', () => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse({ content: [], totalElements: 0 }))
    renderWithAuth(<Solicitudes />)

    expect(screen.getByRole('heading', { name: 'Solicitudes de compra', level: 1 })).not.toBeNull()
    expect(screen.getByText('/api/solicitudes-compra')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Nueva solicitud' })).not.toBeNull()
  })

  it('renders Cotizaciones placeholder content', () => {
    renderWithAuth(<Cotizaciones />)

    expect(screen.getByRole('heading', { name: 'Cotizaciones', level: 1 })).not.toBeNull()
    expect(screen.getByText('/api/cotizaciones')).not.toBeNull()
  })

  it('renders Pipelines placeholder content', () => {
    renderWithAuth(<Pipelines />)

    expect(screen.getByRole('heading', { name: 'Pipelines', level: 1 })).not.toBeNull()
    expect(screen.getByText('/api/pipelines')).not.toBeNull()
  })

  it('renders Pipeline IA section with ML actions', () => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse({ status: 'UP' }))
    renderWithAuth(<Ia />)

    expect(screen.getByRole('heading', { name: 'Pipeline IA', level: 1 })).not.toBeNull()
    expect(screen.getAllByText('/api/ml/*').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Verificar servicio IA' })).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Entrenar modelo' })).not.toBeNull()
  })

  it('renders providers returned by the mocked backend', async () => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse({
      content: [{
        id: 1,
        rut: '76.111.222-3',
        razonSocial: 'Acme SpA',
        nombreContacto: 'Ana Pérez',
        email: 'ana@acme.test',
        reputacionScore: 91,
        cumplimientoScore: 88,
        estado: 'ACTIVO',
      }],
      totalElements: 1,
    }))

    renderWithAuth(<Proveedores />)

    await waitFor(() => {
      expect(screen.getByText('Acme SpA')).not.toBeNull()
    })
    expect(screen.getByText('76.111.222-3')).not.toBeNull()
    expect(screen.getByText('ana@acme.test')).not.toBeNull()
  })
})
