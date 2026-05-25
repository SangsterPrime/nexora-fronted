import { API_BASE_URL, API_URL, DEFAULT_API_URL } from '../../config/api'

describe('API config', () => {
  it('uses the Render backend fallback without a trailing slash', () => {
    expect(DEFAULT_API_URL).toBe('https://nexora-backend-nb85.onrender.com')
    expect(API_URL).toBe(DEFAULT_API_URL)
    expect(API_BASE_URL).toBe(DEFAULT_API_URL)
    expect(API_BASE_URL.endsWith('/')).toBeFalse()
  })
})
