import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import { AuthContext } from '../../context/AuthContext'
import { authValue } from '../testUtils'

function renderProtected(auth) {
  return render(
    <MemoryRouter initialEntries={['/app/proveedores']}>
      <AuthContext.Provider value={auth}>
        <Routes>
          <Route path="/login" element={<div>Login destino</div>} />
          <Route path="/app/proveedores" element={<ProtectedRoute><div>Contenido privado</div></ProtectedRoute>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('shows a loading state while the session is being validated', () => {
    renderProtected(authValue({ authenticated: false, loading: true }))

    expect(screen.getByText('Validando sesión')).not.toBeNull()
    expect(screen.getByText('Conectando con NEXORA')).not.toBeNull()
  })

  it('renders private content for authenticated users', () => {
    renderProtected(authValue({ authenticated: true, loading: false }))

    expect(screen.getByText('Contenido privado')).not.toBeNull()
  })

  it('redirects unauthenticated users to login', () => {
    renderProtected(authValue({ authenticated: false, loading: false }))

    expect(screen.getByText('Login destino')).not.toBeNull()
  })
})
