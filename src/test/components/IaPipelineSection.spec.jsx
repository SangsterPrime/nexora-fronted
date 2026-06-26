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
function mockMlFetch({ healthMode = 'CRON', health, metrics = cronMetrics, predictions, train, score } = {}) {
  spyOn(window, 'fetch').and.callFake((url) => {
    if (url.includes('/api/ml/health')) {
      return jsonResponse(health || { status: 'UP', mode: healthMode, model: 'XGBoost' })
    }
    if (url.includes('/api/ml/metrics')) {
      return jsonResponse(metrics)
    }
    if (url.includes('/api/ml/predictions')) {
      return jsonResponse(predictions || { content: [], totalElements: 0 })
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

  it('lee predicciones y total desde la respuesta real del backend', async () => {
    mockMlFetch({
      healthMode: 'CRON',
      predictions: {
        status: 'OK',
        total: 2,
        predicciones: [
          { id: 'P-1', score: 0.8123, probabilidad: 0.81, resultado: 'APROBADO' },
          { id: 'P-2', score: 0.4012, probabilidad: 0.4, resultado: 'RECHAZADO' },
        ],
      },
    })
    renderWithAuth(<IaPipelineSection />)

    await waitFor(() => {
      expect(screen.getByText('2 resultados')).not.toBeNull()
    })
    expect(screen.getByText('P-1')).not.toBeNull()
    expect(screen.getByText('0.8123')).not.toBeNull()
    expect(screen.getByText('81.00%')).not.toBeNull()
    expect(screen.getByText('APROBADO')).not.toBeNull()
  })

  it('lee la matriz de confusión desde matriz_confusion', async () => {
    mockMlFetch({
      healthMode: 'CRON',
      metrics: {
        accuracy: 0.92,
        recall: 0.88,
        precision: 0.9,
        f1: 0.89,
        roc_auc: 0.95,
        gini: 0.9,
        matriz_confusion: [[120, 8], [10, 95]],
        timestamp: '2026-06-20T10:00:00Z',
        modelo: 'XGBoost',
      },
    })
    const { container } = renderWithAuth(<IaPipelineSection />)

    await waitFor(() => {
      expect(screen.getByText('95.00%')).not.toBeNull()
    })
    expect(container.querySelector('.ia-pipeline__matrix')).not.toBeNull()
    const cells = Array.from(container.querySelectorAll('.ia-pipeline__matrix-cell'))
      .map((cell) => cell.textContent)
    expect(cells).toContain('TN120')
    expect(cells).toContain('FP8')
    expect(cells).toContain('FN10')
    expect(cells).toContain('TP95')
  })

  it('usa ultimaEjecucion de /health cuando metrics no trae timestamp', async () => {
    mockMlFetch({
      health: { status: 'UP', mode: 'CRON', model: 'XGBoost', ultimaEjecucion: '2026-06-25T11:22:33Z' },
      metrics: {
        accuracy: 0.92,
        recall: 0.88,
        precision: 0.9,
        f1: 0.89,
        roc_auc: 0.95,
        gini: 0.9,
        matriz_confusion: [[120, 8], [10, 95]],
        modeloSeleccionado: 'XGBoost Cron',
        fuente: 'Neon PostgreSQL',
      },
    })
    renderWithAuth(<IaPipelineSection />)

    await waitFor(() => {
      expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0)
    })
    expect(screen.getByText('XGBoost Cron')).not.toBeNull()
  })
})
