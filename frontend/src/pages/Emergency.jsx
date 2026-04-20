import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
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

function Emergency() {
  const [hospitals, setHospitals] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [mainLocation, setMainLocation] = useState(null)
  const [nearest, setNearest] = useState(null)
  const [locationDenied, setLocationDenied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

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
    fetch('http://localhost:5000/api/hospitals/all')
      .then(res => res.json())
      .then(data => setHospitals(data))

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
  }, [])

  useEffect(() => {
    if (userLocation && hospitals.length > 0) {
      const withDistance = hospitals
        .filter(h => h.latitude && h.longitude)
        .map(h => ({
          ...h,
          distance: getDistance(userLocation[0], userLocation[1], h.latitude, h.longitude)
        }))
        .sort((a, b) => a.distance - b.distance)
      setNearest(withDistance[0])
    }
  }, [userLocation, hospitals])

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
        <h1 className="text-2xl font-bold text-center mb-3">🚨 Emergency — Find Nearest Hospital</h1>
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

      {nearest && (
        <div className="bg-white mx-4 mt-4 rounded-2xl shadow p-4">
          <p className="text-gray-500 text-sm mb-1">Nearest Hospital</p>
          <h2 className="text-xl font-bold text-red-600">{nearest.name}</h2>
          <p className="text-gray-500">{nearest.address}</p>
          <p className="text-green-600 font-semibold mt-1">
            📍 {nearest.distance.toFixed(1)} km away
          </p>
        </div>
      )}

      {userLocation && (
        <MapContainer center={userLocation} zoom={13} style={{ height: 'calc(100vh - 180px)', width: '100%', marginTop: '16px' }}>
          <TileLayer
            attribution='Tiles &copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          />
          <RecenterMap location={userLocation} />
          <Marker position={userLocation}>
            <Popup>📍 Your Location</Popup>
          </Marker>
          {hospitals.filter(h => h.latitude && h.longitude).map(h => (
            <Marker key={h.id} position={[h.latitude, h.longitude]} icon={hospitalIcon}>
              <Popup>
                <h3 className="font-bold text-red-600">{h.name}</h3>
                <p className="text-gray-500 text-sm">{h.address}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

    </div>
  )
}

export default Emergency