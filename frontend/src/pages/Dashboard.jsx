import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Dashboard() {
  const navigate = useNavigate()
  const [donor, setDonor] = useState(null)
  const [inventory, setInventory] = useState([])

  useEffect(() => {
    const data = localStorage.getItem('donorData')
    if (!data) {
      navigate('/donor/login')
      return
    }
    setDonor(JSON.parse(data))
  }, [])

  useEffect(() => {
    axios.get('http://localhost:5000/api/requests/all')
      .then(res => setInventory(res.data))
      .catch(err => console.log(err))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('donorToken')
    localStorage.removeItem('donorData')
    navigate('/')
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
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🚨 Blood Needed</h2>
          <div className="grid grid-cols-3 gap-4">
            {inventory.length === 0
              ? <p className="text-gray-400 col-span-3">No urgent requests right now.</p>
              : inventory.map(item => (
                <div key={item.id} className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{item.blood_type}</p>
                  <p className="text-gray-500">{item.quantity_needed} units needed</p>
                  <p className="text-xs text-gray-400">{item.hospital_name}</p>
                </div>
              ))
            }
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Health Screening</h2>
          <p className="text-gray-500 mb-4">Complete your health screening to confirm your eligibility to donate.</p>
          <button onClick={() => navigate('/donor/chatbot')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700">
            Start Health Screening
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🗺️ Find Nearby Hospitals</h2>
          <p className="text-gray-500 mb-4">See hospitals near you and what blood they need.</p>
          <button onClick={() => navigate('/donor/map')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            View Map
          </button>
        </div>

      </div>
    </div>
  )
}

export default Dashboard