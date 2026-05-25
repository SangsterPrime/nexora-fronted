import { apiGet, apiPost } from './api'
import { API_URL } from '../config/api'

export function getGoogleLoginUrl() {
  return `${API_URL}/oauth2/authorization/google`
}

export function getCurrentUser() {
  return apiGet('/api/auth/me')
}

export function logout() {
  return apiPost('/api/auth/logout')
}

export function loginWithGoogle(locationObject = window.location, fallbackLocation = window.location) {
  const targetLocation = locationObject?.href === undefined ? fallbackLocation : locationObject
  targetLocation.href = getGoogleLoginUrl()
}
