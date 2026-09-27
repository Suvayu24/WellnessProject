import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, clearAuth, getStoredAuth, storeAuth } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const storedAuth = getStoredAuth()
  const [token, setToken] = useState(storedAuth.token)
  const [user, setUser] = useState(storedAuth.user)
  const [loading, setLoading] = useState(Boolean(storedAuth.token))

  useEffect(() => {
    const refreshUser = async () => {
      if (!storedAuth.token) {
        setLoading(false)
        return
      }

      try {
        const data = await apiFetch('/auth/me')
        const nextAuth = { token: storedAuth.token, user: data.user }
        storeAuth(nextAuth)
        setToken(nextAuth.token)
        setUser(nextAuth.user)
      } catch {
        clearAuth()
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    refreshUser()
  }, [])

  const signIn = async (mode, form) => {
    const data = await apiFetch(`/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify(form),
    })

    storeAuth(data)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    clearAuth()
    setToken(null)
    setUser(null)
  }

  const updateUser = (nextUser) => {
    const nextAuth = { token, user: nextUser }
    storeAuth(nextAuth)
    setUser(nextUser)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      signIn,
      logout,
      updateUser,
    }),
    [token, user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
