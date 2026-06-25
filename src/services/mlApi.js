import { apiGet, apiPost } from './api'

/**
 * Cliente del módulo de IA / Machine Learning de NEXORA.
 *
 * Arquitectura final (Evaluación Parcial 3):
 *   EntrenamientoAI (Render Cron Job) → Neon PostgreSQL → backend Spring Boot → frontend
 *
 * El frontend NUNCA llama directamente al servicio Python. Todo pasa por el
 * backend, que expone los resultados publicados en Neon vía `/api/ml/*`. La
 * autenticación viaja por cookie de sesión (`credentials: 'include'` en
 * `api.js`), por lo que aquí no se guarda ni se envía ningún token o secreto.
 *
 * En modo Cron, el backend puede responder 202/409 a `train`/`score` indicando
 * que la corrida se agenda en Render (no se ejecuta en vivo). La vista trata
 * esas respuestas como informativas, no como error crítico.
 */

const ML_BASE = '/api/ml'

/** Estado y modo del servicio de IA (CRON / API, modelo, versión, etc.). */
export function getMlHealth() {
  return apiGet(`${ML_BASE}/health`)
}

/** Solicita entrenamiento. En modo Cron el backend responde 202/409. `params` opcional. */
export function trainModel(params = {}) {
  return apiPost(`${ML_BASE}/train`, params)
}

/** Solicita scoring. En modo Cron el batch corre en el cron. `payload` opcional. */
export function scoreModel(payload = {}) {
  return apiPost(`${ML_BASE}/score`, payload)
}

/** Métricas del último entrenamiento publicadas en Neon (accuracy, matriz...). */
export function getMetrics() {
  return apiGet(`${ML_BASE}/metrics`)
}

/** Predicciones / resultados scoreados publicados en Neon. */
export function getPredictions() {
  return apiGet(`${ML_BASE}/predictions`)
}
