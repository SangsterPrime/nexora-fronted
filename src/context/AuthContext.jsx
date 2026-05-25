/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, logout as requestLogout } from '../services/authService'

export const AuthContext = createContext(null)

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refreshUser = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
          return currentUser
        } catch (requestError) {
          if ((requestError?.status === 401 || requestError?.status === 403) && attempt === 0) {
            await wait(500)
            continue
          }

          throw requestError
        }
      }
    } catch (requestError) {
      setUser(null)

      if (requestError?.status && requestError.status !== 401 && requestError.status !== 403) {
        setError(requestError)
      }

      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setError(null)

    try {
      await requestLogout()
    } finally {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshUser()
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [refreshUser])

  const value = useMemo(() => ({
    user,
    loading,
    error,
    authenticated: Boolean(user),
    refreshUser,
    logout,
  }), [error, loading, logout, refreshUser, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
