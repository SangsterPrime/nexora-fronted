const RAW_API_URL = import.meta.env.VITE_API_URL ?? ''
const API_URL = RAW_API_URL.replace(/\/$/, '')

export const API_BASE_URL = API_URL
export { API_URL }
export default API_URL
