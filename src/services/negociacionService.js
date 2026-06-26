import { apiGet } from './api'

export function listNegociaciones() {
  return apiGet('/api/negociaciones')
}
