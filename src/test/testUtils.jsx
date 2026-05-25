import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export const authenticatedUser = {
  nombre: 'María Compras',
  email: 'maria@nexora.test',
}

export function authValue(overrides = {}) {
  return {
    authenticated: true,
    loading: false,
    error: null,
    user: authenticatedUser,
    refreshUser: jasmine.createSpy('refreshUser'),
    logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve()),
    ...overrides,
  }
}

export function renderWithAuth(ui, { auth = authValue(), route = '/', router = true } = {}) {
  const tree = <AuthContext.Provider value={auth}>{ui}</AuthContext.Provider>

  if (!router) {
    return render(tree)
  }

  return render(
    <MemoryRouter initialEntries={[route]}>
      {tree}
    </MemoryRouter>,
  )
}

export function jsonResponse(payload, { ok = true, status = 200 } = {}) {
  return Promise.resolve({
    ok,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(payload),
  })
}
