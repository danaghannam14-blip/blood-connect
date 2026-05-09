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

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => { if (center) map.setView(center, 13) }, [center])
  return null
}

function Emergency() {
  const [hospitals, setHospitals] = useState([])
  const [userLocation, setUserLocation] = useState(undefined)
  const [locationDenied, setLocationDenied] = useState(false)
  const [sortedHospitals, setSortedHospitals] = useState([])
  const [search, setSearch] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [mapCenter, setMapCenter] = useState(null)

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  useEffect(() => {
    fetch('https://blood-bank-eqyr.onrender.com/api/hospitals/all')
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
      setSortedHospitals(withDistance)
    }
  }, [userLocation, hospitals])

  const handleSearch = async () => {
    if (!search.trim()) return
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search + ', Lebanon')}&format=json&limit=1`)
    const data = await res.json()
    if (data.length > 0) {
      const newLocation = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      setUserLocation(newLocation)
      setMapCenter(newLocation)
      setLocationDenied(false)
    }
  }

  if (userLocation === undefined) return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <p className="text-gray-500">Getting your location...</p>
    </div>
  )

  if (locationDenied && userLocation === null) return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-5xl">📍</p>
      <h2 className="text-xl font-bold text-gray-800">Location Access Required</h2>
      <p className="text-gray-500">Please allow location access to find the nearest hospital.</p>
      <p className="text-gray-400 text-sm">Or search your location below:</p>
      <div className="flex gap-2 w-full max-w-sm">
        <input value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search your location..."
          className="flex-1 border rounded-lg p-3 focus:outline-none text-sm" />
        <button onClick={handleSearch}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700">
          Go
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-red-50">
      <div className="bg-red-600 text-white p-4">
        <h1 className="text-2xl font-bold text-center">🚨 Emergency — Find Nearest Hospital</h1>
      </div>

      <div className="flex gap-2 px-4 pt-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search your location in Lebanon..."
          className="flex-1 border rounded-lg p-3 focus:outline-none text-sm" />
        <button onClick={handleSearch}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700">
          Go
        </button>
      </div>

      <div className="flex gap-2 px-4 pt-3">
        <button onClick={() => setShowMap(false)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${!showMap ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border'}`}>
          📋 Hospital List
        </button>
        <button onClick={() => setShowMap(true)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${showMap ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border'}`}>
          🗺️ Map View
        </button>
      </div>

      {!showMap && sortedHospitals.length > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow p-4" style={{maxHeight: 'calc(100vh - 200px)', overflowY: 'auto'}}>
          <h2 className="text-lg font-bold text-gray-800 mb-3">🏥 Hospitals Nearest to You</h2>
          <div className="flex flex-col gap-2">
            {sortedHospitals.map((h, index) => (
              <div key={h.id} className="flex justify-between items-center border-b py-2 last:border-0">
                <div className="flex items-start gap-3">
                  <span className={`text-lg font-bold ${index === 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{h.name}</p>
                    <p className="text-gray-500 text-xs">{h.address}</p>
                    <p className={`text-xs font-semibold mt-1 ${index === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      📍 {h.distance.toFixed(1)} km away
                    </p>
                  </div>
                </div>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name)}/@${h.latitude},${h.longitude},15z`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-700 shrink-0">
                  Get Directions
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMap && userLocation && (
        <MapContainer center={userLocation} zoom={13} style={{ height: 'calc(100vh - 200px)', width: '100%', marginTop: '8px' }}>
          <RecenterMap center={mapCenter || userLocation} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={userLocation}>
            <Popup>📍 Your Location</Popup>
          </Marker>
          {hospitals.filter(h => h.latitude && h.longitude).map(h => (
            <Marker key={h.id} position={[h.latitude, h.longitude]} icon={hospitalIcon}>
              <Popup>
                <h3 className="font-bold text-red-600">{h.name}</h3>
                <p className="text-gray-500 text-sm">{h.address}</p>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name)}/@${h.latitude},${h.longitude},15z`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-red-600 text-sm font-semibold">
                  Get Directions →
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  )
}

export default Emergency