import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000'

function Admin() {
  const [authed, setAuthed] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [donors, setDonors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [requests, setRequests] = useState([])
  const [tab, setTab] = useState('donors')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post(`${API}/api/admin/login`, form)
      setAuthed(true)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  const loadData = async () => {
    const [d, h, r] = await Promise.all([
      axios.get(`${API}/api/admin/donors`),
      axios.get(`${API}/api/admin/hospitals`),
      axios.get(`${API}/api/admin/requests`)
    ])
    setDonors(d.data)
    setHospitals(h.data)
    setRequests(r.data)
  }

  const deleteDonor = async (id) => {
    if (!window.confirm('Delete this donor?')) return
    await axios.delete(`${API}/api/admin/donors/${id}`)
    setDonors(donors.filter(d => d.id !== id))
  }

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return
    await axios.delete(`${API}/api/admin/requests/${id}`)
    setRequests(requests.filter(r => r.id !== id))
  }

  if (!authed) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔐 Admin Access</h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input placeholder="Username" value={form.username}
            onChange={e => setForm({...form, username: e.target.value})}
            className="border rounded-lg p-3 focus:outline-none" required />
          <input type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            className="border rounded-lg p-3 focus:outline-none" required />
          <button type="submit"
            className="bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900">
            Login
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🛠️ Admin Panel</h1>
          <button onClick={() => setAuthed(false)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">
            Logout
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          {['donors', 'hospitals', 'requests'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize ${tab === t ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'donors' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">👥 Donors ({donors.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Blood Type</th>
                    <th className="pb-2 pr-4">Eligible</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map(d => (
                    <tr key={d.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{d.full_name}</td>
                      <td className="py-2 pr-4">{d.email}</td>
                      <td className="py-2 pr-4 text-red-600 font-bold">{d.blood_type}</td>
                      <td className="py-2 pr-4">{d.is_eligible ? '✅' : '❌'}</td>
                      <td className="py-2">
                        <button onClick={() => deleteDonor(d.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'hospitals' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🏥 Hospitals ({hospitals.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map(h => (
                    <tr key={h.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{h.name}</td>
                      <td className="py-2 pr-4">{h.email}</td>
                      <td className="py-2">{h.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🩸 Blood Requests ({requests.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Hospital</th>
                    <th className="pb-2 pr-4">Blood Type</th>
                    <th className="pb-2 pr-4">Units</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{r.hospital_name}</td>
                      <td className="py-2 pr-4 text-red-600 font-bold">{r.blood_type}</td>
                      <td className="py-2 pr-4">{r.quantity_needed}</td>
                      <td className="py-2 pr-4">{r.status}</td>
                      <td className="py-2">
                        <button onClick={() => deleteRequest(r.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin