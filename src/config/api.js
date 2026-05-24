const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

if (!API_URL) {
  console.warn('VITE_API_URL no está configurada. El login OAuth no funcionará.')
}

export const API_BASE_URL = API_URL || ''
export { API_URL }
export default API_URL
