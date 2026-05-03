import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const res = await axios.post(`${API}/api/password/forgot`, { email })
      setMessage(res.data.message)
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
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Forgot Password</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send you a reset link</p>
        </div>

        {message && <p className="text-green-600 text-center mb-4 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-center mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="Enter your email"
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm"
            required />
          <button type="submit" disabled={loading}
            className="bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6 cursor-pointer"
          onClick={() => navigate('/login')}>
          ← Back to Login
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword