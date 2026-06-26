import { apiGet } from './api'

export function listKpiResultados() {
  return apiGet('/api/kpi-resultados')
}
