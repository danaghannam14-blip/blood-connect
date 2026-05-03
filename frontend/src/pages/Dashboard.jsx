import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChangePassword from '../components/ChangePassword'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

function Dashboard() {
  const navigate = useNavigate()
  const [donor, setDonor] = useState(null)
  const [inventory, setInventory] = useState([])
  const [history, setHistory] = useState([])
  const [donateForm, setDonateForm] = useState({ hospital_id: '' })
  const [hospitals, setHospitals] = useState([])
  const [donateMessage, setDonateMessage] = useState('')
  const [showDonate, setShowDonate] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('donorData')
    if (!data) { navigate('/login'); return }
    const donorData = JSON.parse(data)

    if (!donorData.is_eligible) {
      navigate('/donor/chatbot')
      return
    }

    setDonor(donorData)

    axios.get(`${API}/api/requests/compatible/${donorData.blood_type}`)
      .then(res => setInventory(res.data))
      .catch(err => console.log(err))
    axios.get(`${API}/api/donors/history/${donorData.id}`)
      .then(res => setHistory(res.data))
      .catch(err => console.log(err))
    axios.get(`${API}/api/hospitals/all`)
      .then(res => setHospitals(res.data))
      .catch(err => console.log(err))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('donorToken')
    localStorage.removeItem('donorData')
    navigate('/')
  }

  const handleDonate = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API}/api/donors/donate`, {
        donor_id: donor.id,
        hospital_id: donateForm.hospital_id,
        blood_type: donor.blood_type
      })
      setDonateMessage('Donation recorded! Thank you 🩸')
      setShowDonate(false)
      const res = await axios.get(`${API}/api/donors/history/${donor.id}`)
      setHistory(res.data)
    } catch (err) {
      setDonateMessage('Failed to record donation')
    }
  }

  if (!donor) return null

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">🩸 Donor Dashboard</h1>
          <button onClick={handleLogout}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Welcome, {donor.full_name} 👋</h2>
          <p className="text-gray-500">Blood Type: <span className="text-red-600 font-bold">{donor.blood_type}</span></p>
          <p className="text-gray-500">Email: {donor.email}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🚨 Compatible Blood Requests</h2>
          <div className="grid grid-cols-3 gap-4">
            {inventory.length === 0
              ? <p className="text-gray-400 col-span-3">No urgent requests right now.</p>
              : inventory.map(item => (
                <div key={item.id} className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{item.blood_type}</p>
                  <p className="text-gray-500 text-sm">{item.quantity_needed} units needed</p>
                  <p className="text-xs text-gray-400">{item.hospital_name}</p>
                </div>
              ))
            }
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🩺 Health Screening</h2>
          <p className="text-gray-500 mb-4">Redo your health screening to update your eligibility status.</p>
          <button onClick={() => navigate('/donor/chatbot')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700">
            Start Health Screening
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🗺️ Find Nearby Hospitals</h2>
          <p className="text-gray-500 mb-4">See hospitals near you and what blood they need.</p>
          <button onClick={() => navigate('/donor/map')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            View Map
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">📋 Donation History</h2>
            <button onClick={() => setShowDonate(!showDonate)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
              + Record Donation
            </button>
          </div>

          {donateMessage && <p className="text-green-600 text-sm mb-4">{donateMessage}</p>}

          {showDonate && (
            <form onSubmit={handleDonate} className="flex flex-col gap-3 mb-6 bg-red-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 font-medium">You're a hero! 🦸 Tell us where you saved a life today — select the hospital you donated at to earn your place in history.</p>
              <select value={donateForm.hospital_id}
                onChange={e => setDonateForm({...donateForm, hospital_id: e.target.value})}
                className="border rounded-lg p-3 focus:outline-none text-sm" required>
                <option value="">Select Hospital</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              <button type="submit"
                className="bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 text-sm">
                Record Donation
              </button>
            </form>
          )}

          {history.length === 0
            ? <p className="text-gray-400">No donations recorded yet.</p>
            : history.map(h => (
              <div key={h.id} className="flex justify-between items-center border-b py-3 last:border-0">
                <div>
                  <p className="font-bold text-red-600">{h.blood_type}</p>
                  <p className="text-gray-500 text-sm">{h.hospital_name}</p>
                  <p className="text-xs text-gray-400">{new Date(h.donated_at).toLocaleDateString()}</p>
                </div>
                <span className="text-green-500 text-sm font-semibold">✅ Donated</span>
              </div>
            ))
          }
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🔑 Change Password</h2>
          <ChangePassword
            onSubmit={async (oldPass, newPass) => {
              const donorData = JSON.parse(localStorage.getItem('donorData'))
              return await axios.put(`${API}/api/donors/change-password`, {
                donor_id: donorData.id,
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

export default Dashboard