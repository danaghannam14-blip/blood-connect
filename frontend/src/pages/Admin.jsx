import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

function Admin() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [donors, setDonors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [requests, setRequests] = useState([])
  const [tab, setTab] = useState('donors')

  useEffect(() => {
    const adminData = localStorage.getItem('adminData')
    if (adminData) {
      setAuthed(true)
      loadData()
    } else {
      navigate('/login')
    }
  }, [])

  const loadData = async () => {
    try {
      const [d, h, r] = await Promise.all([
        axios.get(`${API}/api/admin/donors`),
        axios.get(`${API}/api/admin/hospitals`),
        axios.get(`${API}/api/admin/requests`)
      ])
      setDonors(d.data)
      setHospitals(h.data)
      setRequests(r.data)
    } catch (err) {
      console.log(err)
    }
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

  const handleLogout = () => {
    localStorage.removeItem('adminData')
    navigate('/login')
  }

  if (!authed) return null

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <h1 className="text-3xl font-bold text-gray-800">BloodConnect Admin</h1>
          </div>
          <button onClick={handleLogout}
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