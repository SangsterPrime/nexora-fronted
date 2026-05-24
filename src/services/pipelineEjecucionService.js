import { apiGet } from './api'

export function listPipelineEjecuciones() {
  return apiGet('/api/pipeline-ejecuciones')
}
