export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

function createApiError(response, payload) {
  const message = payload?.mensaje || payload?.message || `API error ${response.status}`
  const error = new Error(message)
  error.status = payload?.status || response.status
  error.path = payload?.path
  error.errores = payload?.errores
  error.payload = payload
  return error
}

async function apiRequest(path, options = {}) {
  const { headers, ...fetchOptions } = options

  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers: {
        Accept: 'application/json',
        ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
    })
  } catch (requestError) {
    const error = new Error(`No se pudo conectar con ${path}. Verifica que Spring Boot esté ejecutándose.`)
    error.cause = requestError
    error.path = path
    throw error
  }

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw createApiError(response, payload)
  }

  return payload
}

export function apiGet(path) {
  return apiRequest(path)
}

export function apiPost(path, data) {
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function apiPut(path, data) {
  return apiRequest(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function apiDelete(path) {
  return apiRequest(path, {
    method: 'DELETE',
  })
}
