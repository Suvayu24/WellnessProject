import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password }
      await signIn(mode, payload)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3D4A5] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-[#EEBD89] border border-[#d9a870] rounded-2xl p-7 shadow-[0_16px_44px_rgba(60,30,0,0.12)]">
        <div className="mb-7">
          <div className="w-12 h-12 rounded-full bg-[#0f766e] flex items-center justify-center text-white text-lg font-medium mb-4">
            W
          </div>
          <h1 className="text-2xl font-medium text-[#3b1f00]">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-[#7a4a10] mt-1">
            {isRegister ? 'Save your progress and lecture notes.' : 'Continue learning from where you stopped.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-[#3b1f00] mb-1" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#d9a870] bg-white/45 px-3 py-2.5 text-[#3b1f00] placeholder-[#7a4a10] focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#3b1f00] mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#d9a870] bg-white/45 px-3 py-2.5 text-[#3b1f00] placeholder-[#7a4a10] focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3b1f00] mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#d9a870] bg-white/45 px-3 py-2.5 text-[#3b1f00] placeholder-[#7a4a10] focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            disabled={submitting}
            className="w-full bg-[#0f766e] hover:bg-[#085044] disabled:opacity-70 text-white font-medium py-3 px-4 rounded-lg transition-all"
          >
            {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>

        <div className="text-sm text-[#7a4a10] mt-5">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <Link className="text-[#0f766e] font-medium hover:underline" to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Login' : 'Create account'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
