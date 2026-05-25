import { screen } from '@testing-library/react'
import Landing from '../../pages/Landing'
import { authValue, renderWithAuth } from '../testUtils'

describe('Landing page', () => {
  it('renders the public landing content without requiring authentication', () => {
    renderWithAuth(<Landing />, {
      auth: authValue({ authenticated: false, user: null }),
      router: false,
    })

    expect(screen.getByText(/CONTROLA TUS COMPRAS/i)).not.toBeNull()
    expect(screen.getByText(/Centraliza solicitudes/i)).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Entrar a plataforma' }).getAttribute('href')).toBe('/login')
  })

  it('links authenticated users directly to the app', () => {
    renderWithAuth(<Landing />, { router: false })

    expect(screen.getByRole('link', { name: 'Entrar a plataforma' }).getAttribute('href')).toBe('/app')
  })
})
