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

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function BloodStockBadges({ stock }) {
  if (!stock) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {BLOOD_TYPES.map(bt => {
        const units = stock[bt] ?? 0
        return (
          <span key={bt} className={`text-xs px-1.5 py-0.5 rounded font-semibold
            ${units === 0 ? 'bg-red-100 text-red-600' :
              units <= 5 ? 'bg-orange-100 text-orange-600' :
              'bg-green-100 text-green-600'}`}>
            {bt}: {units}
          </span>
        )
      })}
    </div>
  )
}

function Emergency() {
  const [hospitals, setHospitals] = useState([])
  const [userLocation, setUserLocation] = useState(undefined)
  const [locationDenied, setLocationDenied] = useState(false)
  const [sortedHospitals, setSortedHospitals] = useState([])
  const [search, setSearch] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [mapCenter, setMapCenter] = useState(null)
  const [filterBt, setFilterBt] = useState('')

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
    fetch('https://blood-bank-eqyr.onrender.com/api/hospitals/with-stock')
      .then(res => res.json())
      .then(data => setHospitals(data))

    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {
        const myLat = import.meta.env.VITE_MY_LAT
        const myLng = import.meta.env.VITE_MY_LNG
        if (myLat && myLng) {
          setUserLocation([parseFloat(myLat), parseFloat(myLng)])
        } else {
          setLocationDenied(true)
          setUserLocation(null)
        }
      }
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
const displayHospitals = sortedHospitals.length > 0 ? sortedHospitals : hospitals
const filteredHospitals = filterBt
  ? displayHospitals.filter(h => h.blood_stock && (h.blood_stock[filterBt] ?? 0) > 0)
  : displayHospitals

  if (userLocation === undefined) return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <p className="text-gray-500">Getting your location...</p>
    </div>
  )

 

  return (
    <div className="min-h-screen bg-red-50">
      <div className="bg-red-600 text-white p-4">
        <h1 className="text-2xl font-bold text-center">🚨 Emergency — Find Nearest Hospital</h1>
        <p className="text-red-200 text-xs text-center mt-1">
          Blood stock shown may not reflect real-time availability — always call ahead
        </p>
      </div>

      {/* Search */}
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

      {/* Filter by blood type */}
      <div className="px-4 pt-3">
        <p className="text-xs text-gray-500 mb-2 font-medium">Filter by blood type availability:</p>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilterBt('')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border ${!filterBt ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'}`}>
            All
          </button>
          {BLOOD_TYPES.map(bt => (
            <button key={bt} onClick={() => setFilterBt(filterBt === bt ? '' : bt)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border ${filterBt === bt ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'}`}>
              {bt}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle */}
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

      {/* Hospital List */}
      {!showMap && (
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow p-4" style={{maxHeight: 'calc(100vh - 280px)', overflowY: 'auto'}}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-800">🏥 Hospitals Nearest to You</h2>
            <span className="text-xs text-gray-400">{filteredHospitals.length} found</span>
          </div>

          {/* Stock legend */}
          <div className="flex gap-3 text-xs text-gray-500 mb-3 pb-3 border-b">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Empty</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span> Low (≤5)</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Available</div>
          </div>

          <div className="flex flex-col gap-3">
            {filteredHospitals.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                No hospitals found with {filterBt} blood available nearby.
              </p>
            ) : filteredHospitals.map((h, index) => (
              <div key={h.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3">
                    <span className={`text-lg font-bold flex-shrink-0 ${index === 0 && !filterBt ? 'text-red-600' : 'text-gray-400'}`}>
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{h.name}</p>
                      <p className="text-gray-500 text-xs">{h.address}</p>
                      <p className={`text-xs font-semibold mt-0.5 ${index === 0 && !filterBt ? 'text-red-600' : 'text-green-600'}`}>
                        📍 {h.distance.toFixed(1)} km away
                      </p>
                    </div>
                  </div>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name)}/@${h.latitude},${h.longitude},15z`}
                    target="_blank" rel="noopener noreferrer"
                    className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-700 shrink-0">
                    Directions
                  </a>
                </div>

                {/* Blood stock */}
                <BloodStockBadges stock={h.blood_stock} />

                {/* Donation reminder */}
                <p className="text-xs text-orange-500 mt-1.5 italic">
                  💡 Even if blood is available, hospitals always welcome donations to maintain reserves.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map View */}
      {showMap && userLocation && (
        <MapContainer center={userLocation} zoom={13} style={{ height: 'calc(100vh - 280px)', width: '100%', marginTop: '8px' }}>
          <RecenterMap center={mapCenter || userLocation} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={userLocation}>
            <Popup>📍 Your Location</Popup>
          </Marker>
          {hospitals.filter(h => h.latitude && h.longitude).map(h => (
            <Marker key={h.id} position={[parseFloat(h.latitude), parseFloat(h.longitude)]} icon={hospitalIcon}>
              <Popup>
                <div style={{minWidth: '180px'}}>
                  <p style={{fontWeight: 'bold', color: '#dc2626', marginBottom: '2px'}}>{h.name}</p>
                  <p style={{fontSize: '11px', color: '#6b7280', marginBottom: '6px'}}>{h.address}</p>
                  {h.blood_stock && (
                    <div style={{marginBottom: '6px'}}>
                      <p style={{fontSize: '11px', fontWeight: 'bold', marginBottom: '3px'}}>Blood Stock:</p>
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '2px'}}>
                        {BLOOD_TYPES.map(bt => {
                          const units = h.blood_stock[bt] ?? 0
                          const bg = units === 0 ? '#fee2e2' : units <= 5 ? '#ffedd5' : '#dcfce7'
                          const color = units === 0 ? '#dc2626' : units <= 5 ? '#ea580c' : '#16a34a'
                          return (
                            <span key={bt} style={{
                              fontSize: '10px', padding: '1px 4px', borderRadius: '4px',
                              fontWeight: 'bold', background: bg, color: color
                            }}>
                              {bt}: {units}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name)}/@${h.latitude},${h.longitude},15z`}
                    target="_blank" rel="noopener noreferrer"
                    style={{color: '#dc2626', fontSize: '12px', fontWeight: 'bold'}}>
                    Get Directions →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  )
}

export default Emergency