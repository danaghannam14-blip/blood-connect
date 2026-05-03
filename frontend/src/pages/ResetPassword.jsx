import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [form, setForm] = useState({ new_password: '', confirm_password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const res = await axios.post(`${API}/api/password/reset`, {
        token,
        new_password: form.new_password
      })
      setMessage(res.data.message)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🩸</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Reset Password</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your new password below</p>
        </div>

        {message && <p className="text-green-600 text-center mb-4 text-sm">{message} Redirecting to login...</p>}
        {error && <p className="text-red-600 text-center mb-4 text-sm">{error}</p>}

        {!message && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="password" placeholder="New password"
              value={form.new_password}
              onChange={e => setForm({...form, new_password: e.target.value})}
              className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm"
              required />
            <input type="password" placeholder="Confirm new password"
              value={form.confirm_password}
              onChange={e => setForm({...form, confirm_password: e.target.value})}
              className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm"
              required />
            <button type="submit" disabled={loading}
              className="bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword