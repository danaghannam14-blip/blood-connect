import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AppointmentBooker from '../components/AppointmentBooker'

const API = 'https://blood-bank-eqyr.onrender.com'

const URGENCY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  urgent:   { label: 'Urgent',   bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  low:      { label: 'Low',      bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
}

function Dashboard() {
  const navigate = useNavigate()
  const [donor, setDonor] = useState(null)
  const [inventory, setInventory] = useState([])
  const [notifications, setNotifications] = useState([])
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    const data = localStorage.getItem('donorData')
    if (!data) { navigate('/login'); return }
    const donorData = JSON.parse(data)
     setDonor(donorData)
    axios.get(`${API}/api/requests/compatible/${donorData.blood_type}`).then(res => setInventory(res.data)).catch(console.log)
    axios.get(`${API}/api/donors/notifications/${donorData.id}`).then(res => setNotifications(res.data)).catch(console.log)
    axios.get(`${API}/api/appointments/donor/${donorData.id}`).then(res => setAppointments(res.data)).catch(console.log)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('donorToken')
    localStorage.removeItem('donorData')
    navigate('/')
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

  const getNextEligibleDate = () => {
    if (!donor?.last_donation_date) return null
    const last = new Date(donor.last_donation_date)
    const next = new Date(last)
    next.setDate(next.getDate() + 56)
    return next > new Date() ? next.toLocaleDateString('en-GB') : null
  }

  if (!donor) return null

  const totalDonations = notifications.filter(n => n.donated).length
  const maxReached = totalDonations >= 2
  const nextEligible = getNextEligibleDate()

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
    if (n.donated) hospitalMap[n.hospital_id].donated_count++
    else if (!hospitalMap[n.hospital_id].pending_notif_id) hospitalMap[n.hospital_id].pending_notif_id = n.id
  })
  const hospitalRows = Object.values(hospitalMap)

  const steps = [
    { id: 1, label: 'Health Screening', icon: '🩺', done: true },
    { id: 2, label: 'Hospital Matched', icon: '🏥', done: inventory.length > 0 },
    { id: 3, label: 'Appointment Booked', icon: '📅', done: appointments.some(a => a.status === 'scheduled' || a.status === 'completed') },
    { id: 4, label: 'Donation Complete', icon: '✅', done: totalDonations > 0 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">🩸 BloodConnect</h1>
            <p className="text-red-200 text-xs mt-0.5">Donor Portal</p>
          </div>
          <button onClick={handleLogout} className="bg-white text-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-50">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Welcome card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Welcome, {donor.full_name} 👋</h2>
            <p className="text-gray-500 text-sm">Blood Type: <span className="text-red-600 font-bold">{donor.blood_type}</span> · {donor.email}</p>
          </div>
          <div className="text-center bg-red-50 rounded-xl px-4 py-3">
            <p className="text-3xl font-extrabold text-red-600">{totalDonations * 3}</p>
            <p className="text-xs text-gray-500">Lives Saved</p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <p className="text-xs text-gray-500 font-medium mb-4">Your Donation Journey</p>
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2
                    ${step.done ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'}`}>
                    {step.icon}
                  </div>
                  <p className={`text-xs mt-1 text-center max-w-16 leading-tight
                    ${step.done ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 ${steps[i + 1].done ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Donor stats */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <p className="text-xs text-gray-500 font-medium mb-3">Your Profile</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Can donate to</p>
              <p className="text-red-600 font-bold text-sm">{getCanDonateTo(donor.blood_type)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Total donations</p>
              <p className="text-gray-800 font-bold text-sm">{totalDonations} unit{totalDonations !== 1 ? 's' : ''}</p>
            </div>
            {nextEligible ? (
              <div className="bg-orange-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-orange-500 mb-1">Next eligible donation date</p>
                <p className="text-orange-700 font-bold text-sm">📅 {nextEligible}</p>
              </div>
            ) : (
              <div className="bg-green-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-green-600 mb-1">Donation eligibility</p>
                <p className="text-green-700 font-bold text-sm">✅ You can donate now!</p>
              </div>
            )}
          </div>
        </div>

        {/* STEP 1 — Compatible requests */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
            <h2 className="text-base font-bold text-gray-800">Hospitals Requesting Your Blood Type</h2>
          </div>
          {inventory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">💤</p>
              <p className="text-gray-500 text-sm">No urgent requests for your blood type right now.</p>
              <p className="text-gray-400 text-xs mt-1">We'll notify you by email when a hospital needs you.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {inventory.map(item => {
                const urgency = URGENCY_CONFIG[item.urgency] || URGENCY_CONFIG.urgent
                return (
                  <div key={item.id} className={`border rounded-xl p-4 ${urgency.bg}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{item.hospital_name}</p>
                        <p className="text-xs text-gray-500">{item.hospital_address}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-red-600 text-white text-sm font-extrabold px-3 py-0.5 rounded-xl">
                          {item.blood_type}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgency.bg} ${urgency.text} flex items-center gap-1`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot} inline-block`}></span>
                          {urgency.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-red-600 font-medium">🩸 Needs {item.quantity_needed} units</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* STEP 2 — Book appointment */}
        {!maxReached && !nextEligible && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <h2 className="text-base font-bold text-gray-800">Book Your Donation Appointment</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4 ml-9">
              Choose a hospital from the list above and pick a time. After your appointment, the hospital will confirm your donation.
            </p>
            <AppointmentBooker donor={donor} onAppointmentsChange={setAppointments} />
          </div>
        )}

        {/* Next eligible — can't book yet */}
        {nextEligible && !maxReached && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <h2 className="text-base font-bold text-orange-700">Donation Cooldown Active</h2>
            </div>
            <p className="text-sm text-orange-600 ml-9">
              You donated recently. You can book your next appointment from <strong>{nextEligible}</strong>.
            </p>
          </div>
        )}

        {/* STEP 3 — Donation history */}
        {hospitalRows.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <h2 className="text-base font-bold text-gray-800">Donation History</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4 ml-9">
              The hospital will confirm your donation after your appointment. You'll see it reflected here.
            </p>
            <div className="flex flex-col gap-3">
              {hospitalRows.map(row => {
                const unitsDonatedHere = row.donated_count
                const canDonateHere = !!row.pending_notif_id && !maxReached
                return (
                  <div key={row.hospital_id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
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
                    <div className="flex items-center gap-2 mb-3">
                      {[1, 2].map(i => (
                        <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border
                          ${i <= unitsDonatedHere ? 'bg-green-100 border-green-400 text-green-700' : 'bg-white border-gray-300 text-gray-400'}`}>
                          {i <= unitsDonatedHere ? '✓' : i}
                        </div>
                      ))}
                      <span className="text-xs text-gray-400 ml-1">
                        {unitsDonatedHere === 0 && 'Awaiting hospital confirmation'}
                        {unitsDonatedHere === 1 && '1 unit confirmed by hospital'}
                        {unitsDonatedHere >= 2 && '2 units confirmed by hospital'}
                      </span>
                    </div>
                    {canDonateHere && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
                        ⏳ Waiting for hospital to confirm your donation after your appointment.
                      </div>
                    )}
                    {unitsDonatedHere >= 2 && (
                      <p className="text-green-600 text-xs font-semibold">✅ Complete — 2 units donated!</p>
                    )}
                    {!canDonateHere && unitsDonatedHere < 2 && row.pending_notif_id && maxReached && (
                      <p className="text-gray-400 text-xs mt-1">Global limit reached — rest before donating again.</p>
                    )}
                  </div>
                )
              })}
              {maxReached && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-800 font-semibold text-sm mb-1">You've given your all — time to recharge. 🌿</p>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    💧 Drink extra water · 🥩 Eat iron-rich foods · 😴 Sleep well · 🚫 Skip intense workouts for 24 hours.
                    Come back in 3 months!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard