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

  useEffect(() => {
    const data = localStorage.getItem('hospitalData')
    if (!data) { navigate('/hospital/login'); return }
    setHospital(JSON.parse(data))
  }, [])

  useEffect(() => {
    if (!hospital) return
    axios.get(`${API}/api/requests/hospital/${hospital.id}`)
      .then(res => setRequests(res.data))
      .catch(err => console.log(err))
  }, [hospital])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      await axios.post(`${API}/api/requests/create`, {
        hospital_id: hospital.id,
        blood_type: form.blood_type,
        quantity_needed: form.quantity_needed
      })
      setMessage('Request posted successfully!')
      setForm({ blood_type: '', quantity_needed: '' })
      const res = await axios.get(`${API}/api/requests/hospital/${hospital.id}`)
      setRequests(res.data)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to post request')
    }
  }

  const handleFulfill = async (id) => {
    try {
      await axios.put(`${API}/api/requests/fulfill/${id}`)
      const res = await axios.get(`${API}/api/requests/hospital/${hospital.id}`)
      setRequests(res.data)
    } catch (err) { console.log(err) }
  }

  const handleLogout = () => {
    localStorage.removeItem('hospitalToken')
    localStorage.removeItem('hospitalData')
    navigate('/')
  }

  if (!hospital) return null

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🏥 Hospital Dashboard</h1>
          <button onClick={handleLogout}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome, {hospital.name} 👋</h2>
          <p className="text-gray-500">Email: {hospital.email}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🩸 Post Blood Request</h2>
          {message && <p className="text-green-600 mb-4">{message}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <select name="blood_type" value={form.blood_type}
              onChange={e => setForm({...form, blood_type: e.target.value})}
              className="border rounded-lg p-3 focus:outline-none" required>
              <option value="">Select Blood Type</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
            <input type="number" placeholder="Units needed"
              value={form.quantity_needed}
              onChange={e => setForm({...form, quantity_needed: e.target.value})}
              className="border rounded-lg p-3 focus:outline-none" required />
            <button type="submit"
              className="bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900">
              Post Request
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">📋 Active Requests</h2>
          {requests.length === 0
            ? <p className="text-gray-400">No requests yet.</p>
            : requests.map(r => (
              <div key={r.id} className="flex justify-between items-center border-b py-3 last:border-0">
                <div>
                  <p className="font-bold text-red-600">{r.blood_type}</p>
                  <p className="text-gray-500 text-sm">{r.quantity_needed} units needed</p>
                  <p className="text-xs text-gray-400">Status: {r.status}</p>
                </div>
                {r.status === 'pending' && (
                  <button onClick={() => handleFulfill(r.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">
                    Mark Fulfilled
                  </button>
                )}
              </div>
            ))
          }
        </div>

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