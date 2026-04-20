import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function DonorRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '',
    blood_type: '', date_of_birth: '', gender: '', address: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const res = await axios.post('https://blood-bank-eqyr.onrender.com/api/donors/register', form)
      setMessage(res.data.message)
      setTimeout(() => navigate('/donor/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">Donor Registration</h2>

        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="full_name" placeholder="Full Name" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" required />
          <input name="phone" placeholder="Phone Number" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" />
          <select name="blood_type" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" required>
            <option value="">Select Blood Type</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
          <input name="date_of_birth" type="date" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" required />
          <select name="gender" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input name="address" placeholder="Address" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" />
          <button type="submit"
            className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700">
            Register
          </button>
          <p className="text-center text-gray-500">Already have an account?
            <span onClick={() => navigate('/donor/login')}
              className="text-red-600 cursor-pointer ml-1">Login</span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default DonorRegister