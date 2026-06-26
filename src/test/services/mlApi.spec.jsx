import { API_URL } from '../../config/api'
import {
  getMetrics,
  getMlHealth,
  getPredictions,
  scoreModel,
  trainModel,
} from '../../services/mlApi'
import { jsonResponse } from '../testUtils'

describe('mlApi', () => {
  beforeEach(() => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse({ status: 'UP' }))
  })

  it('reads ML service health from /api/ml/health', async () => {
    await getMlHealth()

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/ml/health`,
      jasmine.any(Object),
    )
  })

  it('reads metrics from /api/ml/metrics', async () => {
    await getMetrics()

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/ml/metrics`,
      jasmine.any(Object),
    )
  })

  it('reads predictions from /api/ml/predictions', async () => {
    await getPredictions()

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/ml/predictions`,
      jasmine.any(Object),
    )
  })

  it('triggers training with POST /api/ml/train', async () => {
    await trainModel()

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/ml/train`,
      jasmine.objectContaining({ method: 'POST' }),
    )
  })

  it('triggers scoring with POST /api/ml/score', async () => {
    await scoreModel()

    expect(window.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/ml/score`,
      jasmine.objectContaining({ method: 'POST' }),
    )
  })
})
