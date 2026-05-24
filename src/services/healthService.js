import { apiGet } from './api'

export function checkHealth() {
  return apiGet('/api/health')
}
