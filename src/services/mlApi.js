import { apiGet, apiPost } from './api'

/**
 * Cliente del módulo de IA / Machine Learning de NEXORA.
 *
 * El frontend NUNCA llama directamente al servicio Python de entrenamiento.
 * Todo pasa por el backend Spring Boot, que expone los endpoints `/api/ml/*`
 * y reenvía internamente al pipeline de IA. La autenticación viaja por
 * cookie de sesión (`credentials: 'include'` en `api.js`), por lo que aquí
 * no se guarda ni se envía ningún token o secreto.
 */

const ML_BASE = '/api/ml'

/** Estado del servicio de IA (modelo cargado, versión, etc.). */
export function getMlHealth() {
  return apiGet(`${ML_BASE}/health`)
}

/** Dispara el entrenamiento del modelo. `params` es opcional. */
export function trainModel(params = {}) {
  return apiPost(`${ML_BASE}/train`, params)
}

/** Ejecuta el scoring sobre el dataset configurado. `payload` es opcional. */
export function scoreModel(payload = {}) {
  return apiPost(`${ML_BASE}/score`, payload)
}

/** Métricas del último entrenamiento (accuracy, recall, matriz de confusión...). */
export function getMetrics() {
  return apiGet(`${ML_BASE}/metrics`)
}

/** Resultados scoreados / predicciones del modelo. */
export function getPredictions() {
  return apiGet(`${ML_BASE}/predictions`)
}
