import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function RecenterMap({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location) map.setView(location, 13)
  }, [location])
  return null
}

function DonorMap() {
  const navigate = useNavigate()
  const [hospitals, setHospitals] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [mainLocation, setMainLocation] = useState(null)
  const [requests, setRequests] = useState([])
  const [locationDenied, setLocationDenied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=lb`
      )
      const data = await res.json()
      setSearchResults(data)
    } catch (err) {
      console.log(err)
    }
    setSearching(false)
  }

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchQuery(val)
    if (val === '' && mainLocation) {
      setUserLocation(mainLocation)
      setSearchResults([])
    }
  }

  const selectLocation = (result) => {
    setUserLocation([parseFloat(result.lat), parseFloat(result.lon)])
    setSearchQuery(result.display_name)
    setSearchResults([])
    setLocationDenied(false)
  }

  useEffect(() => {
    const myLat = import.meta.env.VITE_MY_LAT
    const myLng = import.meta.env.VITE_MY_LNG

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = (myLat && myLng)
          ? [parseFloat(myLat), parseFloat(myLng)]
          : [position.coords.latitude, position.coords.longitude]
        setUserLocation(loc)
        setMainLocation(loc)
      },
      () => setLocationDenied(true)
    )

    axios.get('http://localhost:5000/api/hospitals/all')
      .then(res => setHospitals(res.data))
      .catch(err => console.log(err))

    axios.get('http://localhost:5000/api/requests/all')
      .then(res => setRequests(res.data))
      .catch(err => console.log(err))
  }, [])

  const getHospitalRequests = (hospitalId) => {
    return requests.filter(r => r.hospital_id === hospitalId && r.status === 'pending')
  }

  if (!userLocation && !locationDenied) return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <p className="text-gray-500">Getting your location...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-red-50">

      {locationDenied && !userLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 mx-4 text-center shadow-xl w-full max-w-sm">
            <p className="text-4xl mb-3">📍</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Location Required</h2>
            <p className="text-gray-500 mb-4">Enable location access or search for your location below.</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search your location..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="border border-gray-300 rounded-lg p-2 text-sm flex-1 focus:outline-none focus:border-red-400 text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={handleSearch}
                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                {searching ? '...' : '🔍'}
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-lg overflow-hidden text-left">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => selectLocation(r)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 border-b last:border-0">
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-red-600 text-white p-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold">🗺️ Nearby Hospitals</h1>
          <button onClick={() => navigate('/donor/dashboard')}
            className="bg-white text-red-600 px-4 py-1 rounded-lg font-semibold">
            Back
          </button>
        </div>
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search your location in Lebanon..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 rounded-lg p-2 text-gray-800 text-sm focus:outline-none bg-white border border-gray-300 placeholder-gray-400"
            />
            <button
              onClick={handleSearch}
              className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-gray-300">
              {searching ? '...' : 'Go'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-[9999] overflow-hidden">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectLocation(r)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 border-b last:border-0">
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {userLocation && (
        <MapContainer center={userLocation} zoom={13} style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
          <TileLayer
            attribution='Tiles &copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          />
          <RecenterMap location={userLocation} />
          <Marker position={userLocation}>
            <Popup>📍 Your Location</Popup>
          </Marker>
          {hospitals.filter(h => h.latitude && h.longitude).map(hospital => (
            <Marker
              key={hospital.id}
              position={[hospital.latitude, hospital.longitude]}
              icon={hospitalIcon}>
              <Popup>
                <div>
                  <h3 className="font-bold text-red-600">{hospital.name}</h3>
                  <p className="text-gray-500 text-sm">{hospital.address}</p>
                  <div className="mt-2">
                    <p className="font-semibold text-sm">Blood Needed:</p>
                    {getHospitalRequests(hospital.id).length === 0
                      ? <p className="text-green-600 text-sm">No urgent requests</p>
                      : getHospitalRequests(hospital.id).map(r => (
                        <p key={r.id} className="text-red-600 text-sm">
                          {r.blood_type} — {r.quantity_needed} units
                        </p>
                      ))
                    }
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

    </div>
  )
}

export default DonorMap