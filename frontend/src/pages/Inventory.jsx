import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Inventory() {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://blood-bank-eqyr.onrender.com/api/requests/inventory/status')
      .then(res => res.json())
      .then(data => { setInventory(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const statusConfig = {
    critical: { label: 'Critical', bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-600', dot: 'bg-red-500' },
    low: { label: 'Low', bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-600', dot: 'bg-orange-400' },
    available: { label: 'Available', bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-600', dot: 'bg-green-500' }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-red-600 text-white p-5">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🩸 Blood Availability</h1>
            <p className="text-red-200 text-sm mt-1">Live status across Lebanese hospitals</p>
          </div>
          <button onClick={() => navigate('/')}
            className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-semibold">
            Home
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-5">

        {/* Legend */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {Object.entries(statusConfig).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${val.dot}`}></div>
              <span className="text-sm text-gray-600">{val.label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventory.map(item => {
              const config = statusConfig[item.status]
              return (
                <div key={item.blood_type}
                  className={`${config.bg} border-2 ${config.border} rounded-2xl p-5 text-center`}>
                  <p className="text-3xl font-extrabold text-gray-800 mb-1">{item.blood_type}</p>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full mb-2`}>
                    <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                    <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {item.units_needed === 0 ? 'No requests' : `${item.units_needed} units needed`}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-gray-600 text-sm mb-4">See a critical blood type? You can help right now.</p>
          <button onClick={() => navigate('/login')}
            className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 text-sm">
            Register or Sign In to Donate
          </button>
        </div>

      </div>
    </div>
  )
}

export default Inventory