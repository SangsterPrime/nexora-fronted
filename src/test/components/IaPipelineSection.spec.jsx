import { fireEvent, screen, waitFor } from '@testing-library/react'
import IaPipelineSection from '../../components/organisms/IaPipelineSection'
import { jsonResponse, renderWithAuth } from '../testUtils'

const cronMetrics = {
  accuracy: 0.92,
  recall: 0.88,
  precision: 0.9,
  f1: 0.89,
  rocAuc: 0.95,
  gini: 0.9,
  confusionMatrix: [[120, 8], [10, 95]],
  lastRun: '2026-06-20T10:00:00Z',
  model: 'XGBoost',
  modelVersion: 'v1',
  durationSeconds: 42,
  samples: 233,
}

/**
 * Construye un fetch falso que responde por endpoint /api/ml/*.
 * `overrides` permite cambiar la respuesta de train/score por test.
 */
function mockMlFetch({ healthMode = 'CRON', train, score } = {}) {
  spyOn(window, 'fetch').and.callFake((url) => {
    if (url.includes('/api/ml/health')) {
      return jsonResponse({ status: 'UP', mode: healthMode, model: 'XGBoost' })
    }
    if (url.includes('/api/ml/metrics')) {
      return jsonResponse(cronMetrics)
    }
    if (url.includes('/api/ml/predictions')) {
      return jsonResponse({ content: [], totalElements: 0 })
    }
    if (url.includes('/api/ml/train')) {
      return train ? train() : jsonResponse({ mode: 'CRON' }, { ok: false, status: 409 })
    }
    if (url.includes('/api/ml/score')) {
      return score ? score() : jsonResponse({ mode: 'CRON' }, { ok: false, status: 409 })
    }
    return jsonResponse({})
  })
}

describe('IaPipelineSection (modo Cron Job)', () => {
  it('muestra el badge "Modo Cron Job / Render" cuando /health reporta modo CRON', async () => {
    mockMlFetch({ healthMode: 'CRON' })
    renderWithAuth(<IaPipelineSection />)

    await waitFor(() => {
      expect(screen.getByText('Modo Cron Job / Render')).not.toBeNull()
    })
  })

  it('muestra la última ejecución con modelo y fuente Neon PostgreSQL', async () => {
    mockMlFetch({ healthMode: 'CRON' })
    renderWithAuth(<IaPipelineSection />)

    await waitFor(() => {
      expect(screen.getAllByText('XGBoost').length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText(/Neon PostgreSQL/).length).toBeGreaterThan(0)
    expect(screen.getByText('42 s')).not.toBeNull()
  })

  it('al entrenar en modo CRON (409) muestra mensaje amigable y no error crítico', async () => {
    mockMlFetch({ healthMode: 'CRON' })
    renderWithAuth(<IaPipelineSection />)

    await waitFor(() => {
      expect(screen.getByText('Modo Cron Job / Render')).not.toBeNull()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Entrenar modelo' }))

    await waitFor(() => {
      expect(
        screen.getByText(/El entrenamiento se ejecuta por Render Cron Job/),
      ).not.toBeNull()
    })
    // No debe tratarse como error HTTP.
    expect(screen.queryByText(/HTTP 409/)).toBeNull()
  })

  it('al entrenar con 202 (aceptado, no ejecutado) también muestra mensaje de Cron', async () => {
    mockMlFetch({
      healthMode: 'CRON',
      train: () => jsonResponse({ mode: 'CRON', triggered: false }, { ok: true, status: 202 }),
    })
    renderWithAuth(<IaPipelineSection />)

    fireEvent.click(screen.getByRole('button', { name: 'Entrenar modelo' }))

    await waitFor(() => {
      expect(screen.getByText(/El entrenamiento se ejecuta por Render Cron Job/)).not.toBeNull()
    })
  })

  it('al ejecutar scoring en modo CRON (409) explica que el scoring batch corre en el cron', async () => {
    mockMlFetch({ healthMode: 'CRON' })
    renderWithAuth(<IaPipelineSection />)

    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar scoring' }))

    await waitFor(() => {
      expect(screen.getByText(/El scoring batch se ejecuta por Render Cron Job/)).not.toBeNull()
    })
    expect(screen.queryByText(/HTTP 409/)).toBeNull()
  })

  it('mantiene los botones de actualización de métricas y predicciones', async () => {
    mockMlFetch({ healthMode: 'CRON' })
    renderWithAuth(<IaPipelineSection />)

    expect(screen.getByRole('button', { name: 'Verificar servicio IA' })).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Actualizar métricas' })).not.toBeNull()
    expect(screen.getAllByRole('button', { name: 'Actualizar predicciones' }).length).toBeGreaterThan(0)
  })
})
