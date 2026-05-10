import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AppointmentBooker from '../components/AppointmentBooker'
const API = 'https://blood-bank-eqyr.onrender.com'

function Dashboard() {
  const navigate = useNavigate()
  const [donor, setDonor] = useState(null)
  const [inventory, setInventory] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const data = localStorage.getItem('donorData')
    if (!data) { navigate('/login'); return }
    const donorData = JSON.parse(data)
    if (!donorData.is_eligible) { navigate('/donor/chatbot'); return }
    setDonor(donorData)
    axios.get(`${API}/api/requests/compatible/${donorData.blood_type}`).then(res => setInventory(res.data)).catch(console.log)
    axios.get(`${API}/api/donors/notifications/${donorData.id}`).then(res => setNotifications(res.data)).catch(console.log)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('donorToken')
    localStorage.removeItem('donorData')
    navigate('/')
  }

  const markDonated = async (notifId, hospital_id, blood_type) => {
    try {
      // Mark this notification as donated
      await axios.put(`${API}/api/donors/notifications/${notifId}/donated`)

      // Record in donation_history and decrease blood request units
      await axios.post(`${API}/api/donors/donate`, {
        donor_id: donor.id, hospital_id, blood_type
      })

      const currentDonated = notifications.filter(n => n.donated).length

      if (currentDonated === 0) {
        // This was the 1st donation — create a 2nd notification slot
        const res = await axios.post(`${API}/api/donors/notifications/duplicate`, {
          donor_id: donor.id, hospital_id, blood_type
        })
        setNotifications(prev => [
          ...prev.map(n => n.id === notifId ? { ...n, donated: true } : n),
          res.data
        ])
      } else {
        // This was the 2nd donation — just mark it
        setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, donated: true } : n))
      }

      axios.get(`${API}/api/requests/compatible/${donor.blood_type}`).then(res => setInventory(res.data))
    } catch (err) { console.log(err) }
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

  const totalDonations = notifications.filter(n => n.donated).length
  const maxReached = totalDonations >= 2

  // Group notifications by hospital — one row per hospital
  const hospitalMap = {}
  notifications.forEach(n => {
    if (!hospitalMap[n.hospital_id]) {
      hospitalMap[n.hospital_id] = {
        hospital_id: n.hospital_id,
        hospital_name: n.hospital_name,
        hospital_address: n.hospital_address,
        blood_type: n.blood_type,
        created_at: n.created_at,
        donated_count: 0,
        pending_notif_id: null
      }
    }
    if (n.donated) {
      hospitalMap[n.hospital_id].donated_count++
    } else if (!hospitalMap[n.hospital_id].pending_notif_id) {
      hospitalMap[n.hospital_id].pending_notif_id = n.id
    }
  })
  const hospitalRows = Object.values(hospitalMap)

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">🩸 Donor Dashboard</h1>
          <button onClick={handleLogout} className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">Logout</button>
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
            <div className="bg-red-50 rounded-xl p-4 col-span-2">
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

        {/* Donation Requests & History */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">📋 Donation Requests & History</h2>

          {hospitalRows.length === 0 ? (
            <p className="text-gray-400 text-sm">No donation requests yet. You'll be notified when your blood type is needed!</p>
          ) : (
            <div className="flex flex-col gap-3">

              {hospitalRows.map(row => {
                const unitsDonatedHere = row.donated_count
                const canDonateHere = !!row.pending_notif_id && !maxReached

                return (
                  <div key={row.hospital_id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{row.hospital_name}</p>
                        <p className="text-xs text-gray-400">{row.hospital_address}</p>
                        <p className="text-xs text-gray-400">{new Date(row.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full border border-red-100">
                        {row.blood_type}
                      </span>
                    </div>

                    {/* Unit dots */}
                    <div className="flex items-center gap-2 mb-3">
                      {[1, 2].map(i => (
                        <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border
                          ${i <= unitsDonatedHere
                            ? 'bg-green-100 border-green-400 text-green-700'
                            : 'bg-white border-gray-300 text-gray-400'}`}>
                          {i <= unitsDonatedHere ? '✓' : i}
                        </div>
                      ))}
                      <span className="text-xs text-gray-400 ml-1">
                        {unitsDonatedHere === 0 && 'No donations yet for this hospital'}
                        {unitsDonatedHere === 1 && '1 unit donated here'}
                        {unitsDonatedHere >= 2 && '2 units donated here'}
                      </span>
                    </div>

                    {/* Donate button — visible until global max reached */}
                    {canDonateHere && (
                      <button
                        onClick={() => markDonated(row.pending_notif_id, row.hospital_id, row.blood_type)}
                        className="bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-red-700">
                        {unitsDonatedHere === 0 ? 'I donated here' : 'I donated a second unit here'}
                      </button>
                    )}

                    {/* Hospital fully done */}
                    {unitsDonatedHere >= 2 && (
                      <p className="text-green-600 text-xs font-semibold">✅ 2 units donated at this hospital — complete!</p>
                    )}

                    {/* Global max reached, hospital still had a slot */}
                    {!canDonateHere && unitsDonatedHere < 2 && row.pending_notif_id && maxReached && (
                      <p className="text-gray-400 text-xs mt-1">Global limit reached — rest before donating again.</p>
                    )}
                  </div>
                )
              })}

              {/* Rest tip — ONLY after 2nd donation */}
              {maxReached && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-1">
                  <p className="text-amber-800 font-semibold text-sm mb-1">You've given your all — now it's time to recharge. 🌿</p>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    Your body just did something incredible. Here's how to recover well:
                    💧 Drink extra water today · 🥩 Eat iron-rich foods (spinach, red meat, lentils) ·
                    😴 Get a full night's sleep · 🚫 Skip intense workouts for 24 hours.
                    Come back in 3 months — your blood will be ready to save lives again.
                  </p>
                </div>
              )}

            </div>
          )}
        </div>
{/* Appointment Booking */}
<div className="bg-white rounded-2xl shadow p-6 mb-6">
  <h2 className="text-xl font-semibold text-gray-700 mb-4">📅 Book a Donation Appointment</h2>
  <AppointmentBooker donor={donor} />
</div>
      </div>
    </div>
  )
}

export default Dashboard