import { getCurrentUser, getGoogleLoginUrl, loginWithGoogle, logout } from '../../services/authService'
import { jsonResponse } from '../testUtils'

describe('authService', () => {
  it('builds the Google OAuth URL through the same-origin proxy', () => {
    expect(getGoogleLoginUrl()).toBe('/oauth2/authorization/google')
  })

  it('redirects to Google OAuth without blocking an empty API_URL', () => {
    const locationObject = { href: '' }

    loginWithGoogle(locationObject)

    expect(locationObject.href).toBe('/oauth2/authorization/google')
  })

  it('gets the current user using the session cookie', async () => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse({ email: 'user@nexora.test' }))

    const user = await getCurrentUser()

    expect(user.email).toBe('user@nexora.test')
    expect(window.fetch).toHaveBeenCalledWith('/api/auth/me', jasmine.objectContaining({
      credentials: 'include',
    }))
  })

  it('logs out through the backend session endpoint', async () => {
    spyOn(window, 'fetch').and.returnValue(jsonResponse({ ok: true }))

    await logout()

    expect(window.fetch).toHaveBeenCalledWith('/api/auth/logout', jasmine.objectContaining({
      method: 'POST',
      credentials: 'include',
    }))
  })
})
