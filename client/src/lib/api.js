const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const getStoredAuth = () => {
  const raw = localStorage.getItem('wellness_auth')
  if (!raw) return { token: null, user: null }

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem('wellness_auth')
    return { token: null, user: null }
  }
}

export const storeAuth = (auth) => {
  localStorage.setItem('wellness_auth', JSON.stringify(auth))
}

export const clearAuth = () => {
  localStorage.removeItem('wellness_auth')
}

export const apiFetch = async (path, options = {}) => {
  const { token } = getStoredAuth()
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const message = data?.error || data?.message || 'Something went wrong'
    throw new Error(message)
  }

  return data
}
