import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { AuthContext } from '../../context/AuthContext'
import { authValue } from '../testUtils'

function renderLayout(auth = authValue()) {
  return render(
    <MemoryRouter initialEntries={['/app']}>
      <AuthContext.Provider value={auth}>
        <Routes>
          <Route
            path="/app"
            element={(
              <AppLayout title="Panel de prueba" description="Descripción interna">
                <p>Contenido del layout</p>
              </AppLayout>
            )}
          />
          <Route path="/" element={<div>Sitio público</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('AppLayout', () => {
  it('renders private navigation and current user details', () => {
    renderLayout()

    expect(screen.getByRole('heading', { name: 'Panel de prueba' })).not.toBeNull()
    expect(screen.getByText('Contenido del layout')).not.toBeNull()
    expect(screen.getByText('María Compras')).not.toBeNull()
    expect(screen.getByText('maria@nexora.test')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('/app')
    expect(screen.getByRole('link', { name: 'Proveedores' }).getAttribute('href')).toBe('/app/proveedores')
  })

  it('toggles the mobile sidebar state', () => {
    renderLayout()
    const menuButton = screen.getByRole('button', { name: /menú/i })

    expect(menuButton.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(menuButton)

    expect(menuButton.getAttribute('aria-expanded')).toBe('true')
  })

  it('logs out and navigates back to the public site', async () => {
    const logout = jasmine.createSpy('logout').and.returnValue(Promise.resolve())
    renderLayout(authValue({ logout }))

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    await waitFor(() => {
      expect(logout).toHaveBeenCalled()
      expect(screen.getByText('Sitio público')).not.toBeNull()
    })
  })
})
