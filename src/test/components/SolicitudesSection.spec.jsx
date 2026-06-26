import { fireEvent, screen, waitFor } from '@testing-library/react'
import SolicitudesSection from '../../components/organisms/SolicitudesSection'
import { jsonResponse, renderWithAuth } from '../testUtils'

const emptyList = { content: [], totalElements: 0 }

describe('SolicitudesSection', () => {
  beforeEach(() => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse(emptyList))
  })

  it('renders the Solicitudes de compra section title', () => {
    renderWithAuth(<SolicitudesSection />)

    expect(screen.getByRole('heading', { level: 2, name: 'Solicitudes de compra' })).not.toBeNull()
  })

  it('shows the API endpoint reference in the header', () => {
    renderWithAuth(<SolicitudesSection />)

    expect(screen.getByText('/api/solicitudes-compra')).not.toBeNull()
  })

  it('opens the form modal when Nueva solicitud button is clicked', () => {
    renderWithAuth(<SolicitudesSection />)

    fireEvent.click(screen.getByRole('button', { name: 'Nueva solicitud' }))

    expect(screen.getByRole('dialog')).not.toBeNull()
    expect(screen.getByLabelText('Título *')).not.toBeNull()
    expect(screen.getByLabelText('Monto estimado (CLP) *')).not.toBeNull()
  })

  it('calls createSolicitud (POST) when a new solicitud is submitted', async () => {
    renderWithAuth(<SolicitudesSection />)

    fireEvent.click(screen.getByRole('button', { name: 'Nueva solicitud' }))
    fireEvent.change(screen.getByLabelText('Título *'), { target: { value: 'Compra de insumos test' } })
    fireEvent.change(screen.getByLabelText('Monto estimado (CLP) *'), { target: { value: '80000' } })
    fireEvent.click(screen.getByText('Guardar solicitud'))

    await waitFor(() => {
      expect(
        window.fetch.calls.allArgs().some(([, opts]) => opts?.method === 'POST'),
      ).toBeTrue()
    })
  })

  it('shows SOLICITUD_COMPRA_CREADA success message after successful create', async () => {
    renderWithAuth(<SolicitudesSection />)

    fireEvent.click(screen.getByRole('button', { name: 'Nueva solicitud' }))
    fireEvent.change(screen.getByLabelText('Título *'), { target: { value: 'Compra de insumos test' } })
    fireEvent.change(screen.getByLabelText('Monto estimado (CLP) *'), { target: { value: '80000' } })
    fireEvent.click(screen.getByText('Guardar solicitud'))

    // The success div contains unique text "Solicitud creada correctamente" and
    // references the n8n event — check the unique prefix to avoid matching the
    // <strong> elements in api-note and empty-state that also contain the event name.
    await waitFor(() => {
      expect(screen.getByText(/Solicitud creada correctamente/)).not.toBeNull()
    })
  })

  it('shows validation error when titulo is empty on submit', () => {
    renderWithAuth(<SolicitudesSection />)

    fireEvent.click(screen.getByRole('button', { name: 'Nueva solicitud' }))
    fireEvent.click(screen.getByText('Guardar solicitud'))

    expect(screen.getByText('El título es requerido.')).not.toBeNull()
  })

  it('shows providers returned by the mocked backend', async () => {
    window.fetch.and.returnValue(jsonResponse({
      content: [
        {
          id: 10,
          titulo: 'Solicitud demo',
          categoria: 'TI',
          montoEstimado: 250000,
          estado: 'PENDIENTE',
          fechaRequerida: null,
          usuarioSolicitanteId: 3,
        },
      ],
      totalElements: 1,
    }))

    renderWithAuth(<SolicitudesSection />)

    await waitFor(() => {
      expect(screen.getByText('Solicitud demo')).not.toBeNull()
    })

    expect(screen.getByText('TI')).not.toBeNull()
    expect(screen.getByText('PENDIENTE')).not.toBeNull()
  })

  it('shows ALTA PRIORIDAD badge for solicitudes with montoEstimado >= 500000', async () => {
    window.fetch.and.returnValue(jsonResponse({
      content: [
        {
          id: 20,
          titulo: 'Compra de servidores',
          categoria: 'Infraestructura',
          montoEstimado: 1200000,
          estado: 'PENDIENTE',
        },
      ],
      totalElements: 1,
    }))

    renderWithAuth(<SolicitudesSection />)

    await waitFor(() => {
      expect(screen.getByText('Compra de servidores')).not.toBeNull()
    })

    expect(screen.getByText(/ALTA PRIORIDAD/)).not.toBeNull()
  })
})
