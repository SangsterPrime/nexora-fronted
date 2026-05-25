import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import Login from '../../pages/Login'
import { authValue } from '../testUtils'

function renderLogin(auth, props = {}, initialEntry = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthContext.Provider value={auth}>
        <Routes>
          <Route path="/login" element={<Login {...props} />} />
          <Route path="/app" element={<div>Dashboard destino</div>} />
          <Route path="/app/proveedores" element={<div>Proveedores destino</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('Login page', () => {
  it('renders the Google login action and explanatory copy', () => {
    renderLogin(authValue({ authenticated: false, loading: false }))

    expect(screen.getByRole('heading', { name: 'Ingresa a NEXORA' })).not.toBeNull()
    expect(screen.getByRole('button', { name: /continuar con google/i }).disabled).toBeFalse()
    expect(screen.getByText(/NEXORA no guarda tokens/i)).not.toBeNull()
  })

  it('calls the injected Google login handler without passing the click event', () => {
    const onLoginWithGoogle = jasmine.createSpy('onLoginWithGoogle')
    renderLogin(authValue({ authenticated: false, loading: false }), { onLoginWithGoogle })

    fireEvent.click(screen.getByRole('button', { name: /continuar con google/i }))

    expect(onLoginWithGoogle).toHaveBeenCalled()
    expect(onLoginWithGoogle.calls.mostRecent().args).toEqual([])
  })

  it('disables the login button while auth is loading', () => {
    renderLogin(authValue({ authenticated: false, loading: true }))

    expect(screen.getByRole('button', { name: /validando sesión/i }).disabled).toBeTrue()
  })

  it('redirects authenticated users back to the requested private page', () => {
    renderLogin(
      authValue({ authenticated: true, loading: false }),
      {},
      { pathname: '/login', state: { from: { pathname: '/app/proveedores' } } },
    )

    expect(screen.getByText('Proveedores destino')).not.toBeNull()
  })
})
