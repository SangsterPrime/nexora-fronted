import { apiGet } from './api'

export function listPipelines() {
  return apiGet('/api/pipelines')
}
