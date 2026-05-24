import { API_BASE_URL, apiGet, apiPost } from './api'

const GOOGLE_AUTH_PATH = '/oauth2/authorization/google'
const DEV_AUTH_BASE_URL = 'http://localhost:8080'

function getAuthBaseUrl() {
  return API_BASE_URL || DEV_AUTH_BASE_URL
}

export function getCurrentUser() {
  return apiGet('/api/auth/me')
}

export function logout() {
  return apiPost('/api/auth/logout')
}

export function loginWithGoogle() {
  const baseUrl = getAuthBaseUrl().replace(/\/$/, '')
  window.location.assign(`${baseUrl}${GOOGLE_AUTH_PATH}`)
}
