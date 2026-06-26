import { API_BASE_URL, API_URL } from '../../config/api'

describe('API config', () => {
  it('allows an empty API base URL for Vercel same-origin rewrites', () => {
    expect(API_URL).toBe('')
    expect(API_BASE_URL).toBe('')
  })

  it('keeps non-empty API URLs normalized and without placeholders', () => {
    if (API_BASE_URL) {
      expect(API_BASE_URL.endsWith('/')).toBeFalse()
    }

    expect(API_BASE_URL).not.toContain('tu-backend-render')
    expect(API_BASE_URL).not.toContain('TU-BACKEND')
    expect(API_BASE_URL).not.toContain('URL-REAL-DEL-BACKEND')
  })
})
