import { apiGet, apiPost } from './api'
import { API_BASE_URL } from '../config/api'

const GOOGLE_AUTH_PATH = '/oauth2/authorization/google'

export function getCurrentUser() {
  return apiGet('/api/auth/me')
}

export function logout() {
  return apiPost('/api/auth/logout')
}

export function loginWithGoogle() {
  window.location.href = `${API_BASE_URL}${GOOGLE_AUTH_PATH}`
}
