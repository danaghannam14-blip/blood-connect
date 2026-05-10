import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API = 'https://blood-bank-eqyr.onrender.com'

function DonorRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '',
    blood_type: '', date_of_birth: '', gender: '', address: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [idFile, setIdFile] = useState(null)
  const [idStatus, setIdStatus] = useState(null)
  const [idMessage, setIdMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxWidth = 1200
          const scale = Math.min(1, maxWidth / img.width)
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleScanId = async () => {
    if (!idFile) { setIdMessage('Please select your ID photo first.'); return }
    setIdStatus('scanning')
    setIdMessage('')
    try {
      const compressed = await compressImage(idFile)
      const formData = new FormData()
      formData.append('id_photo', compressed, 'id.jpg')
      const res = await axios.post(`${API}/api/idcheck/scan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.eligible) {
        setIdStatus('verified')
        setIdMessage(`✅ Age verified! You are ${res.data.age} years old.`)
        setForm(prev => ({ ...prev, date_of_birth: res.data.date_of_birth }))
      } else {
        setIdStatus('failed')
        setIdMessage(`❌ ${res.data.message}`)
      }
    } catch (err) {
      setIdStatus('failed')
      setIdMessage(err.response?.data?.message || 'Could not scan ID. Please try a clearer photo.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (idStatus !== 'verified') {
      setError('Please upload and verify your ID before registering.')
      return
    }
    setMessage('')
    setError('')
    setSubmitting(true)
    try {
      const res = await axios.post(`${API}/api/donors/register`, form)
      setMessage(res.data.message)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-4xl">🩸</span>
          <h2 className="text-2xl font-bold text-red-600 mt-2">Donor Registration</h2>
          <p className="text-gray-400 text-sm mt-1">Create your BloodConnect account</p>
        </div>

        {message && <p className="text-green-600 text-center mb-4 text-sm font-medium">{message}</p>}
        {error && <p className="text-red-600 text-center mb-4 text-sm font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Full Name */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Full Name</label>
            <input name="full_name" placeholder="Your full name" onChange={handleChange}
              className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm" required />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Email</label>
            <input name="email" type="email" placeholder="you@example.com" onChange={handleChange}
              className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm" required />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Password</label>
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'}
                placeholder="Create a password" onChange={handleChange}
                className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Phone Number</label>
            <input name="phone" placeholder="+961 xx xxx xxx" onChange={handleChange}
              className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm" />
          </div>

          {/* Blood Type & Gender side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Blood Type</label>
              <select name="blood_type" onChange={handleChange}
                className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm" required>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Gender</label>
              <select name="gender" onChange={handleChange}
                className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm" required>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Address</label>
            <input name="address" placeholder="City, Region" onChange={handleChange}
              className="w-full border rounded-xl p-3 focus:outline-none focus:border-red-400 text-sm" />
          </div>

          {/* ID Upload Section */}
          <div className="border-2 border-dashed border-red-200 rounded-xl p-4 bg-red-50">
            <p className="text-sm font-semibold text-gray-700 mb-1">🪪 Lebanese ID Verification</p>
            <p className="text-xs text-gray-400 mb-3">We scan your ID to confirm you are 18+. Date of birth is filled automatically.</p>

            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-red-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-red-50 transition mb-3">
              <span className="text-2xl mb-1">📷</span>
              {idFile ? (
                <p className="text-xs text-red-600 font-semibold px-2 text-center">{idFile.name}</p>
              ) : (
                <>
                  <p className="text-xs font-semibold text-gray-600">Tap to upload ID photo</p>
                  <p className="text-xs text-gray-400">JPG, PNG supported</p>
                </>
              )}
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { setIdFile(e.target.files[0]); setIdStatus(null); setIdMessage('') }} />
            </label>

            <button type="button" onClick={handleScanId}
              disabled={idStatus === 'scanning'}
              className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
              {idStatus === 'scanning' ? '🔍 Scanning...' : 'Scan ID'}
            </button>

            {idMessage && (
              <p className={`mt-2 text-xs font-medium ${idStatus === 'verified' ? 'text-green-600' : 'text-red-600'}`}>
                {idMessage}
              </p>
            )}
          </div>

          {/* Date of birth after scan */}
          {form.date_of_birth && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium">
              📅 Date of Birth: {form.date_of_birth}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className="bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 mt-1 flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Registering...
              </>
            ) : 'Create Account'}
          </button>

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')}
              className="text-red-600 cursor-pointer font-medium">Login</span>
          </p>

        </form>
      </div>
    </div>
  )
}

export default DonorRegister