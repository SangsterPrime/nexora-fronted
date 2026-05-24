import { apiGet } from './api'

function buildQuery(params) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  return query.toString()
}

export function listOrdenesCompra({ page = 0, size = 20 } = {}) {
  const query = buildQuery({ page, size })
  return apiGet(`/api/ordenes-compra?${query}`)
}
