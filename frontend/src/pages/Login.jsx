import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Check if it's a bloodconnect admin email
    if (form.identifier.endsWith('@bloodconnect.com')) {
      try {
        const res = await axios.post(`${API}/api/admin/login`, {
          email: form.identifier,
          password: form.password
        })
        localStorage.setItem('adminData', JSON.stringify(res.data.admin))
        navigate('/admin')
        return
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
        setLoading(false)
        return
      }
    }

    // Try donor login
    try {
      const res = await axios.post(`${API}/api/donors/login`, {
        email: form.identifier,
        password: form.password
      })
      localStorage.setItem('donorToken', res.data.token)
      localStorage.setItem('donorData', JSON.stringify(res.data.donor))
      navigate('/donor/dashboard')
      setLoading(false)
      return
    } catch {}

    // Try hospital login
    try {
      const res = await axios.post(`${API}/api/hospitals/login`, {
        email: form.identifier,
        password: form.password
      })
      localStorage.setItem('hospitalToken', res.data.token)
      localStorage.setItem('hospitalData', JSON.stringify(res.data.hospital))
      navigate('/hospital/dashboard')
      setLoading(false)
      return
    } catch {}

    setError('Invalid credentials. Please try again.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <span className="text-4xl">🩸</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Welcome to BloodConnect</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {error && <p className="text-red-600 text-center mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 font-medium mb-1 block">Email or Username</label>
            <input
              placeholder="Enter your email or username"
              value={form.identifier}
              onChange={e => setForm({...form, identifier: e.target.value})}
              className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm"
              required />
          </div>
          <div>
            <label className="text-sm text-gray-600 font-medium mb-1 block">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm"
              required />
          </div>
          <button type="submit" disabled={loading}
            className="bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{' '}
          <span onClick={() => navigate('/donor/register')}
            className="text-red-600 cursor-pointer font-medium">
            Register as Donor
          </span>
        </p>

        <div className="mt-4 text-center">
          <button onClick={() => navigate('/emergency')}
            className="text-red-600 text-sm font-medium hover:underline">
            🚨 Emergency? Find nearest hospital
          </button>
        </div>

      </div>
    </div>
  )
}

export default Login