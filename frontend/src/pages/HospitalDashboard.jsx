import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChangePassword from '../components/ChangePassword'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

function HospitalDashboard() {
  const navigate = useNavigate()
  const [hospital, setHospital] = useState(null)
  const [requests, setRequests] = useState([])
  const [form, setForm] = useState({ blood_type: '', quantity_needed: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('hospitalData')
    if (!data) { navigate('/hospital/login'); return }
    setHospital(JSON.parse(data))
  }, [])

  useEffect(() => {
    if (!hospital) return
    setLoading(true)
    axios.get(`${API}/api/requests/hospital/${hospital.id}`)
      .then(res => setRequests(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false))
  }, [hospital])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)
    try {
      await axios.post(`${API}/api/requests/create`, {
        hospital_id: hospital.id,
        blood_type: form.blood_type,
        quantity_needed: form.quantity_needed
      })
      setMessage('✅ Request posted! Donors are being notified.')
      setForm({ blood_type: '', quantity_needed: '' })
      const res = await axios.get(`${API}/api/requests/hospital/${hospital.id}`)
      setRequests(res.data)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to post request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return
    try {
      await axios.delete(`${API}/api/requests/${id}`)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) { console.log(err) }
  }

  const handleLogout = () => {
    localStorage.removeItem('hospitalToken')
    localStorage.removeItem('hospitalData')
    navigate('/')
  }

  if (!hospital) return null

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const fulfilledCount = requests.filter(r => r.status === 'fulfilled').length

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🏥 Hospital Dashboard</h1>
          <button onClick={handleLogout}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">
            Logout
          </button>
        </div>

        {/* Welcome */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome, {hospital.name} 👋</h2>
          <p className="text-gray-500 text-sm">Email: {hospital.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-3xl font-extrabold text-orange-500">{pendingCount}</p>
            <p className="text-gray-500 text-sm mt-1">Active Requests</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-3xl font-extrabold text-green-600">{fulfilledCount}</p>
            <p className="text-gray-500 text-sm mt-1">Fulfilled Requests</p>
          </div>
        </div>

        {/* Post Request */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🩸 Post Blood Request</h2>
          {message && (
            <p className={`mb-4 text-sm font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <select name="blood_type" value={form.blood_type}
              onChange={e => setForm({...form, blood_type: e.target.value})}
              className="border rounded-lg p-3 focus:outline-none" required>
              <option value="">Select Blood Type</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
            <input type="number" placeholder="Units needed" min="1"
              value={form.quantity_needed}
              onChange={e => setForm({...form, quantity_needed: e.target.value})}
              className="border rounded-lg p-3 focus:outline-none" required />
            <button type="submit" disabled={submitting}
              className="bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Posting...
                </>
              ) : 'Post Request'}
            </button>
          </form>
        </div>

        {/* Active Requests */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">📋 Your Requests</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-3">📭</p>
              <p className="text-gray-400 text-sm">No requests yet. Post your first blood request above.</p>
            </div>
          ) : (
            requests.map(r => (
              <div key={r.id} className="flex justify-between items-center border-b py-3 last:border-0">
                <div>
                  <p className="font-bold text-red-600 text-lg">{r.blood_type}</p>
                  <p className="text-gray-500 text-sm">{r.quantity_needed} units still needed</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    {r.status}
                  </span>
                </div>
                <button onClick={() => handleDelete(r.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🔑 Change Password</h2>
          <ChangePassword
            onSubmit={async (oldPass, newPass) => {
              const hospitalData = JSON.parse(localStorage.getItem('hospitalData'))
              return await axios.put(`${API}/api/hospitals/change-password`, {
                hospital_id: hospitalData.id,
                old_password: oldPass,
                new_password: newPass
              })
            }}
          />
        </div>

      </div>
    </div>
  )
}

export default HospitalDashboard