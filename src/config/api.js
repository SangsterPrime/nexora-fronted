const DEFAULT_API_URL = 'https://nexora-backend-nb85.onrender.com'
const RAW_API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL
const API_URL = RAW_API_URL.replace(/\/$/, '')

if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL no está configurada. Usando backend por defecto:', API_URL)
}

export const API_BASE_URL = API_URL
export { DEFAULT_API_URL }
export { API_URL }
export default API_URL
