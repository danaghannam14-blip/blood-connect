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
  const [idStatus, setIdStatus] = useState(null) // null | 'scanning' | 'verified' | 'failed'
  const [idMessage, setIdMessage] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

 const handleScanId = async () => {
  if (!idFile) { setIdMessage('Please select your ID photo first.'); return }
  setIdStatus('scanning')
  setIdMessage('')
  try {
    // Compress image before sending
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (idStatus !== 'verified') {
      setError('Please upload and verify your ID before registering.')
      return
    }
    setMessage('')
    setError('')
    try {
      const res = await axios.post(`${API}/api/donors/register`, form)
      setMessage(res.data.message)
      setTimeout(() => navigate('/login'), 2000)
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
          <select name="gender" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input name="address" placeholder="Address" onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:border-red-400" />

    {/* ID Upload Section */}
<div className="border-2 border-dashed border-red-200 rounded-xl p-4 bg-red-50">
  <p className="text-sm font-semibold text-gray-700 mb-2">🪪 Upload Lebanese ID for Age Verification</p>
  <p className="text-xs text-gray-400 mb-3">We scan your ID to verify you are 18+. Your date of birth will be filled automatically.</p>
  
  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-red-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-red-50 transition mb-3">
    <div className="flex flex-col items-center justify-center">
      <span className="text-3xl mb-1">📷</span>
      {idFile ? (
        <p className="text-sm text-red-600 font-semibold">{idFile.name}</p>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-600">Click to upload ID photo</p>
          <p className="text-xs text-gray-400">JPG, PNG supported</p>
        </>
      )}
    </div>
    <input type="file" accept="image/*" className="hidden"
      onChange={e => { setIdFile(e.target.files[0]); setIdStatus(null); setIdMessage('') }} />
  </label>

  <button type="button" onClick={handleScanId}
    disabled={idStatus === 'scanning'}
    className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
    {idStatus === 'scanning' ? '🔍 Scanning ID...' : 'Scan ID'}
  </button>
  {idMessage && (
    <p className={`mt-2 text-sm ${idStatus === 'verified' ? 'text-green-600' : 'text-red-600'}`}>
      {idMessage}
    </p>
  )}
</div>

          {/* Date of birth shown after scan */}
          {form.date_of_birth && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              📅 Date of Birth: {form.date_of_birth}
            </div>
          )}

          <button type="submit"
            className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700">
            Register
          </button>
          <p className="text-center text-gray-500">Already have an account?
            <span onClick={() => navigate('/login')}
              className="text-red-600 cursor-pointer ml-1">Login</span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default DonorRegister