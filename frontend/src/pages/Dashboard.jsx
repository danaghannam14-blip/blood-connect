import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

function Dashboard() {
  const navigate = useNavigate()
  const [donor, setDonor] = useState(null)
  const [inventory, setInventory] = useState([])
  const [history, setHistory] = useState([])
  const [notifications, setNotifications] = useState([])
  const [donationUnits, setDonationUnits] = useState({})

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
    axios.get(`${API}/api/donors/notifications/${donorData.id}`)
      .then(res => setNotifications(res.data))
      .catch(err => console.log(err))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('donorToken')
    localStorage.removeItem('donorData')
    navigate('/')
  }

  const markDonated = async (id, hospital_id, blood_type) => {
    const units = donationUnits[id] || 1
    try {
      await axios.put(`${API}/api/donors/notifications/${id}/donated`)
      await axios.post(`${API}/api/donors/donate`, {
        donor_id: donor.id,
        hospital_id,
        blood_type,
        units
      })
      setNotifications(prev => prev.map(n => n.id === id ? {...n, donated: true} : n))
      // Refresh inventory
      axios.get(`${API}/api/requests/compatible/${donor.blood_type}`)
        .then(res => setInventory(res.data))
    } catch (err) {
      console.log(err)
    }
  }

  const totalDonations = notifications.filter(n => n.donated).length + history.length

  const getNextDonationDate = () => {
    const allDonations = [...history, ...notifications.filter(n => n.donated)]
    if (allDonations.length === 0) return 'You can donate now!'
    const lastDate = new Date(allDonations[0]?.donated_at || allDonations[0]?.created_at)
    const nextDate = new Date(lastDate)
    nextDate.setMonth(nextDate.getMonth() + 3)
    return nextDate > new Date() ? nextDate.toLocaleDateString() : 'You can donate now!'
  }

  const getCanDonateTo = (bt) => {
    const map = {
      'O-': 'Everyone (Universal Donor! 🌟)',
      'O+': 'O+, A+, B+, AB+',
      'A-': 'A-, A+, AB-, AB+',
      'A+': 'A+, AB+',
      'B-': 'B-, B+, AB-, AB+',
      'B+': 'B+, AB+',
      'AB-': 'AB-, AB+',
      'AB+': 'AB+ only'
    }
    return map[bt] || bt
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

        {/* Welcome */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome, {donor.full_name} 👋</h2>
          <p className="text-gray-500">Blood Type: <span className="text-red-600 font-bold">{donor.blood_type}</span></p>
          <p className="text-gray-500">Email: {donor.email}</p>
        </div>

        {/* Blood Type Info */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🩸 Your Blood Type Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">You can donate to</p>
              <p className="text-red-600 font-bold text-sm">{getCanDonateTo(donor.blood_type)}</p>
            </div>
            
            <div className="bg-red-50 rounded-xl p-4 col-span-2 text-center">
              <p className="text-4xl font-extrabold text-red-600">{totalDonations * 3}</p>
              <p className="text-gray-500 text-sm mt-1">❤️ Total Lives Saved</p>
              <p className="text-xs text-gray-400">Each donation saves up to 3 lives</p>
            </div>
          </div>
        </div>

        {/* Compatible Blood Requests */}
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

        {/* Donation History & Notifications */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">📋 Donation Requests & History</h2>

          {notifications.length === 0 && history.length === 0 ? (
            <p className="text-gray-400">No donation requests yet. You'll be notified when your blood type is needed!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Pending notifications */}
              {notifications.filter(n => !n.donated).map(n => (
                <div key={n.id} className="border-b py-3 last:border-0">
                  <div>
                    <p className="font-bold text-red-600">🩸 {n.blood_type} needed</p>
                    <p className="text-gray-600 text-sm font-medium">{n.hospital_name}</p>
                    <p className="text-xs text-gray-400">{n.hospital_address}</p>
                    <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-2 bg-red-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-2">💡 Max allowed: <strong>1 unit (450ml)</strong> per session. Next donation after 3 months.</p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="1"
                        max="2"
                        value={donationUnits[n.id] || 1}
                        onChange={e => setDonationUnits(prev => ({...prev, [n.id]: parseInt(e.target.value)}))}
                        className="border rounded-lg p-2 text-sm w-20 focus:outline-none"
                      />
                      <span className="text-xs text-gray-400">unit(s)</span>
                      <button
                        onClick={() => markDonated(n.id, n.hospital_id, n.blood_type)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-700">
                        ✅ I Donated
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Completed from notifications */}
              {notifications.filter(n => n.donated).map(n => (
               <div key={n.id} className="flex justify-between items-center border-b py-3 last:border-0 opacity-60">
                <div>
                    <p className="font-bold text-green-600">{n.blood_type}</p>
                    <p className="text-gray-500 text-sm">{n.hospital_name}</p>
                    <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-green-500 text-sm font-semibold">✅ Donated</span>
                </div>
              ))}

              {/* Manual donation history */}
              {history.map(h => (
               <div key={h.id} className="flex justify-between items-center border-b py-3 last:border-0"><div>
                    <p className="font-bold text-green-600">{h.blood_type}</p>
                    <p className="text-gray-500 text-sm">{h.hospital_name}</p>
                    <p className="text-xs text-gray-400">{new Date(h.donated_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-green-500 text-sm font-semibold">✅ Donated</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard