import { API_URL } from '../../config/api'
import { apiDelete, apiGet, apiPost, apiPut } from '../../services/api'
import { jsonResponse } from '../testUtils'

describe('api service', () => {
  it('sends JSON requests with credentials included', async () => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse({ id: 1 }))

    const result = await apiPost('/api/proveedores', { rut: '1-9' })
    const [, options] = window.fetch.calls.mostRecent().args

    expect(result).toEqual({ id: 1 })
    expect(window.fetch).toHaveBeenCalledWith(`${API_URL}/api/proveedores`, jasmine.any(Object))
    expect(options.credentials).toBe('include')
    expect(options.method).toBe('POST')
    expect(options.headers.Accept).toBe('application/json')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.body).toBe(JSON.stringify({ rut: '1-9' }))
  })

  it('does not add Content-Type to GET requests without a body', async () => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse([{ id: 1 }]))

    await apiGet('/api/proveedores')
    const [, options] = window.fetch.calls.mostRecent().args

    expect(options.headers['Content-Type']).toBeUndefined()
  })

  it('returns null for non JSON successful responses', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      ok: true,
      status: 204,
      headers: new Headers({}),
      json: () => Promise.reject(new Error('No body')),
    }))

    await expectAsync(apiDelete('/api/proveedores/1')).toBeResolvedTo(null)
  })

  it('throws backend error details for failed responses', async () => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse({
      mensaje: 'Proveedor duplicado',
      status: 409,
      path: '/api/proveedores',
      errores: { rut: 'Ya existe' },
    }, { ok: false, status: 409 }))

    await expectAsync(apiPut('/api/proveedores/1', { rut: '1-9' })).toBeRejectedWith(jasmine.objectContaining({
      message: 'Proveedor duplicado',
      status: 409,
      path: '/api/proveedores',
      errores: { rut: 'Ya existe' },
    }))
  })

  it('wraps network failures with endpoint context', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.reject(new Error('offline')))

    await expectAsync(apiGet('/api/proveedores')).toBeRejectedWith(jasmine.objectContaining({
      message: jasmine.stringMatching('/api/proveedores'),
      path: '/api/proveedores',
    }))
  })
})
