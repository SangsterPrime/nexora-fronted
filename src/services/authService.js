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

export function loginWithGoogle(locationObject = window.location) {
  if (!API_URL) {
    console.warn('VITE_API_URL no está configurada. El login OAuth no funcionará.')
    return
  }

  locationObject.href = getGoogleLoginUrl()
}
