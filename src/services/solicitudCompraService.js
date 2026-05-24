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

export function listSolicitudes({ page = 0, size = 20, estado, usuarioSolicitanteId } = {}) {
  const query = buildQuery({ page, size, estado, usuarioSolicitanteId })
  return apiGet(`/api/solicitudes-compra?${query}`)
}
