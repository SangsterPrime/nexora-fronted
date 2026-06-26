import { apiDelete, apiGet, apiPost, apiPut } from './api'

function buildQuery(params) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  return query.toString()
}

export function listProveedores({ page = 0, size = 20, estado } = {}) {
  const query = buildQuery({ page, size, estado })
  return apiGet(`/api/proveedores?${query}`)
}

export function createProveedor(data) {
  return apiPost('/api/proveedores', data)
}

export function updateProveedor(id, data) {
  return apiPut(`/api/proveedores/${id}`, data)
}

export function deleteProveedor(id) {
  return apiDelete(`/api/proveedores/${id}`)
}
