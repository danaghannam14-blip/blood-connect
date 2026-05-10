import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChangePassword from '../components/ChangePassword'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

const URGENCY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
  urgent:   { label: 'Urgent',   bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  low:      { label: 'Low',      bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' }
}

function HospitalDashboard() {
  const navigate = useNavigate()
  const [hospital, setHospital] = useState(null)
  const [requests, setRequests] = useState([])
  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState({ blood_type: '', quantity_needed: '', urgency: 'urgent' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('requests')

  useEffect(() => {
    const data = localStorage.getItem('hospitalData')
    if (!data) { navigate('/hospital/login'); return }
    setHospital(JSON.parse(data))
  }, [])

  useEffect(() => {
    if (!hospital) return
    loadData()
  }, [hospital])

  const loadData = async () => {
    setLoading(true)
    try {
      const [reqRes, apptRes] = await Promise.all([
        axios.get(`${API}/api/requests/hospital/${hospital.id}`),
        axios.get(`${API}/api/appointments/hospital/${hospital.id}`)
      ])
      setRequests(reqRes.data)
      setAppointments(apptRes.data)
    } catch (err) { console.log(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)
    try {
      await axios.post(`${API}/api/requests/create`, {
        hospital_id: hospital.id,
        blood_type: form.blood_type,
        quantity_needed: form.quantity_needed,
        urgency: form.urgency
      })
      setMessage('✅ Request posted! Donors are being notified.')
      setForm({ blood_type: '', quantity_needed: '', urgency: 'urgent' })
      loadData()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to post request')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return
    try {
      await axios.delete(`${API}/api/requests/${id}`)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) { console.log(err) }
  }

  const handleConfirmDonation = async (id, donorName) => {
    if (!window.confirm(`Confirm that ${donorName} donated successfully?`)) return
    try {
      await axios.put(`${API}/api/appointments/confirm/${id}`)
      loadData()
    } catch (err) { console.log(err) }
  }

  const handleMissed = async (id) => {
    if (!window.confirm('Mark this appointment as missed?')) return
    try {
      await axios.put(`${API}/api/appointments/missed/${id}`)
      loadData()
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
  const todayAppts = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0]
    return a.appointment_date?.startsWith(today)
  })

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{hospital.name}</h1>
            <p className="text-gray-500 text-xs">{hospital.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 text-sm">
          Logout
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-extrabold text-orange-500">{pendingCount}</p>
            <p className="text-gray-500 text-xs mt-1">Active Requests</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-extrabold text-blue-600">{appointments.length}</p>
            <p className="text-gray-500 text-xs mt-1">Appointments</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-extrabold text-green-600">{fulfilledCount}</p>
            <p className="text-gray-500 text-xs mt-1">Fulfilled</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['requests', 'appointments', 'post'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${activeTab === t ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>
              {t === 'post' ? '+ Post Request' : t === 'appointments' ? `📅 Appointments ${appointments.length > 0 ? `(${appointments.length})` : ''}` : '🩸 Requests'}
            </button>
          ))}
        </div>

        {/* POST REQUEST TAB */}
        {activeTab === 'post' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🩸 Post Blood Request</h2>
            {message && (
              <p className={`mb-4 text-sm font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Blood Type</label>
                <select value={form.blood_type} onChange={e => setForm({...form, blood_type: e.target.value})}
                  className="w-full border rounded-xl p-3 focus:outline-none text-sm" required>
                  <option value="">Select Blood Type</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Units Needed</label>
                <input type="number" placeholder="e.g. 3" min="1"
                  value={form.quantity_needed}
                  onChange={e => setForm({...form, quantity_needed: e.target.value})}
                  className="w-full border rounded-xl p-3 focus:outline-none text-sm" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-2 block">Urgency Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(URGENCY_CONFIG).map(([key, val]) => (
                    <button key={key} type="button"
                      onClick={() => setForm({...form, urgency: key})}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all
                        ${form.urgency === key ? `${val.bg} ${val.text} ${val.border} border-2` : 'bg-white border-gray-200 text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${val.dot} mx-auto mb-1`}></div>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Posting...</>
                ) : 'Post Request & Notify Donors'}
              </button>
            </form>
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🩸 Your Blood Requests</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">📭</p>
                <p className="text-gray-400 text-sm">No requests yet.</p>
                <button onClick={() => setActiveTab('post')} className="mt-3 text-red-600 text-sm font-semibold">
                  + Post your first request
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {requests.map(r => {
                  const urgency = URGENCY_CONFIG[r.urgency] || URGENCY_CONFIG.urgent
                  return (
                    <div key={r.id} className={`border-2 ${urgency.border} rounded-xl p-4 ${urgency.bg}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-extrabold text-red-600">{r.blood_type}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgency.bg} ${urgency.text} border ${urgency.border}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${urgency.dot} mr-1`}></span>
                              {urgency.label}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{r.quantity_needed} units needed</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block
                            ${r.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            {r.status}
                          </span>
                        </div>
                        <button onClick={() => handleDelete(r.id)}
                          className="text-red-500 text-xs font-semibold hover:text-red-700 bg-white px-3 py-1.5 rounded-lg border border-red-200">
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">📅 Donor Appointments</h2>
            <p className="text-xs text-gray-400 mb-4">Confirm donations when donors arrive, or mark as missed if they don't show up.</p>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-3">📅</p>
                <p className="text-gray-400 text-sm">No upcoming appointments yet.</p>
                <p className="text-gray-400 text-xs mt-1">Donors will book appointments after you post a blood request.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {appointments.map(a => {
                  const apptDate = new Date(a.appointment_date).toLocaleDateString('en-GB')
                  const isToday = new Date(a.appointment_date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
                  return (
                    <div key={a.id} className={`border rounded-xl p-4 ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-800">{a.donor_name}</p>
                            {isToday && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Today</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Blood Type: <span className="text-red-600 font-bold">{a.donor_blood_type}</span></p>
                          {a.donor_phone && <p className="text-xs text-gray-500">📞 {a.donor_phone}</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            📅 {apptDate} at {(() => {
                              const [h, m] = a.appointment_time.split(':')
                              const hour = parseInt(h)
                              const ampm = hour >= 12 ? 'PM' : 'AM'
                              const displayH = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                              return `${displayH}:${m} ${ampm}`
                            })()}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                          Scheduled
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleConfirmDonation(a.id, a.donor_name)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-green-700">
                          ✅ Confirm Donation
                        </button>
                        <button onClick={() => handleMissed(a.id)}
                          className="flex-1 bg-gray-200 text-gray-600 py-2 rounded-lg text-xs font-semibold hover:bg-gray-300">
                          ❌ Donor Didn't Show
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6">
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