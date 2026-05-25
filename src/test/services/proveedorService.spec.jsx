import { API_URL } from '../../config/api'
import { createProveedor, deleteProveedor, listProveedores, updateProveedor } from '../../services/proveedorService'
import { jsonResponse } from '../testUtils'

describe('proveedorService', () => {
  beforeEach(() => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse({ ok: true }))
  })

  it('lists providers with pagination and status query params', async () => {
    await listProveedores({ page: 2, size: 5, estado: 'ACTIVO' })

    expect(window.fetch).toHaveBeenCalledWith(`${API_URL}/api/proveedores?page=2&size=5&estado=ACTIVO`, jasmine.any(Object))
  })

  it('creates providers', async () => {
    await createProveedor({ rut: '1-9' })

    expect(window.fetch).toHaveBeenCalledWith(`${API_URL}/api/proveedores`, jasmine.objectContaining({ method: 'POST' }))
  })

  it('updates providers by id', async () => {
    await updateProveedor(7, { razonSocial: 'Acme' })

    expect(window.fetch).toHaveBeenCalledWith(`${API_URL}/api/proveedores/7`, jasmine.objectContaining({ method: 'PUT' }))
  })

  it('deletes providers by id', async () => {
    await deleteProveedor(7)

    expect(window.fetch).toHaveBeenCalledWith(`${API_URL}/api/proveedores/7`, jasmine.objectContaining({ method: 'DELETE' }))
  })
})
