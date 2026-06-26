import { API_URL } from '../../config/api'
import {
  createSolicitud,
  deleteSolicitud,
  listSolicitudes,
  updateSolicitud,
} from '../../services/solicitudCompraService'
import { jsonResponse } from '../testUtils'

describe('solicitudCompraService', () => {
  beforeEach(() => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse({ id: 1 }))
  })

  it('builds list endpoint with default pagination params', async () => {
    await listSolicitudes()

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/solicitudes-compra?page=0&size=20`,
      jasmine.any(Object),
    )
  })

  it('builds list endpoint with custom pagination and estado filter', async () => {
    await listSolicitudes({ page: 2, size: 5, estado: 'PENDIENTE' })

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/solicitudes-compra?page=2&size=5&estado=PENDIENTE`,
      jasmine.any(Object),
    )
  })

  it('builds list endpoint with usuarioSolicitanteId filter', async () => {
    await listSolicitudes({ page: 0, size: 10, usuarioSolicitanteId: 42 })

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/solicitudes-compra?page=0&size=10&usuarioSolicitanteId=42`,
      jasmine.any(Object),
    )
  })

  it('creates a purchase request with POST', async () => {
    await createSolicitud({ titulo: 'Compra de insumos', montoEstimado: 150000 })

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/solicitudes-compra`,
      jasmine.objectContaining({ method: 'POST' }),
    )
  })

  it('updates a purchase request by id with PUT', async () => {
    await updateSolicitud(7, { titulo: 'Compra actualizada', estado: 'APROBADA' })

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/solicitudes-compra/7`,
      jasmine.objectContaining({ method: 'PUT' }),
    )
  })

  it('deletes a purchase request by id with DELETE', async () => {
    await deleteSolicitud(7)

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/solicitudes-compra/7`,
      jasmine.objectContaining({ method: 'DELETE' }),
    )
  })
})
