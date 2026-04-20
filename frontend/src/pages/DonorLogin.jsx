import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function DonorLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post('https://blood-bank-eqyr.onrender.com/api/donors/login', form)
      localStorage.setItem('donorToken', res.data.token)
      localStorage.setItem('donorData', JSON.stringify(res.data.donor))
      navigate('/donor/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">Donor Login</h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="email" type="email" placeholder="Email" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" required />
          <button type="submit"
            className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700">
            Login
          </button>
          <p className="text-center text-gray-500">Don't have an account?
            <span onClick={() => navigate('/donor/register')}
              className="text-red-600 cursor-pointer ml-1">Register</span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default DonorLogin