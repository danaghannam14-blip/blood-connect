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

const compatibleBloodForPatient = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-']
}

function Emergency() {
  const [patientBloodType, setPatientBloodType] = useState('')
  const [bloodTypeSelected, setBloodTypeSelected] = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [userLocation, setUserLocation] = useState(undefined)
  const [sortedHospitals, setSortedHospitals] = useState([])
  const [search, setSearch] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [mapCenter, setMapCenter] = useState(null)
const [loadingHospitals, setLoadingHospitals] = useState(false)
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
    if (!bloodTypeSelected) return
   setLoadingHospitals(true)
fetch('https://blood-bank-eqyr.onrender.com/api/hospitals/with-stock')
  .then(res => res.json())
  .then(data => {
    setHospitals(Array.isArray(data) ? data : [])
    setLoadingHospitals(false)
  })
  .catch(() => setLoadingHospitals(false))
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {
        const myLat = import.meta.env.VITE_MY_LAT
        const myLng = import.meta.env.VITE_MY_LNG
        if (myLat && myLng) {
          setUserLocation([parseFloat(myLat), parseFloat(myLng)])
        } else {
          setUserLocation(null)
        }
      }
    )
  }, [bloodTypeSelected])

  useEffect(() => {
    if (hospitals.length === 0) return
    const process = (loc) => {
      const withDistance = hospitals
        .filter(h => h.latitude && h.longitude)
        .map(h => ({
          ...h,
          distance: loc ? getDistance(loc[0], loc[1], h.latitude, h.longitude) : null
        }))
        .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
      setSortedHospitals(withDistance)
    }
    if (userLocation !== undefined) process(userLocation)
  }, [userLocation, hospitals])

  const handleSearch = async () => {
    if (!search.trim()) return
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search + ', Lebanon')}&format=json&limit=1`)
    const data = await res.json()
    if (data.length > 0) {
      const newLocation = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      setUserLocation(newLocation)
      setMapCenter(newLocation)
    }
  }

  const compatibleTypes = patientBloodType ? compatibleBloodForPatient[patientBloodType] : []

  const filteredHospitals = sortedHospitals.filter(h => {
    if (!h.blood_stock) return false
    return compatibleTypes.some(bt => (h.blood_stock[bt] ?? 0) > 0)
  })

  // Blood type selection screen
  if (!bloodTypeSelected) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 text-center">
          <p className="text-5xl mb-4">🩸</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Emergency Blood Finder</h2>
          <p className="text-gray-500 text-sm mb-6">
            What is the patient's blood type? We'll show only hospitals that have compatible blood available.
          </p>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {BLOOD_TYPES.map(bt => (
              <button key={bt} onClick={() => setPatientBloodType(bt)}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all
                  ${patientBloodType === bt
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-300'}`}>
                {bt}
              </button>
            ))}
          </div>
          {patientBloodType && (
            <div className="mb-4 bg-red-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Compatible blood types for <span className="font-bold text-red-600">{patientBloodType}</span> patient:</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {compatibleBloodForPatient[patientBloodType].map(bt => (
                  <span key={bt} className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">{bt}</span>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={() => patientBloodType && setBloodTypeSelected(true)}
            disabled={!patientBloodType}
            className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-red-700 disabled:opacity-40">
            Find Compatible Hospitals 🚨
          </button>
        </div>
      </div>
    )
  }

  if (userLocation === undefined) return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <p className="text-gray-500">Getting your location...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-red-50">
      <div className="bg-red-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🚨 Emergency — Find Hospital</h1>
            {patientBloodType && (
              <p className="text-red-200 text-xs mt-0.5">
                Compatible blood for <span className="font-bold text-white">{patientBloodType}</span> patient
              </p>
            )}
          </div>
          <button onClick={() => { setBloodTypeSelected(false); setPatientBloodType('') }}
            className="bg-white text-red-600 px-3 py-1 rounded-lg text-xs font-semibold">
            Change
          </button>
        </div>
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
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow p-4" style={{maxHeight: 'calc(100vh - 220px)', overflowY: 'auto'}}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-gray-800">🏥 Hospitals with Compatible Blood</h2>
            <span className="text-xs text-gray-400">{filteredHospitals.length} found</span>
          </div>

          <div className="flex gap-3 text-xs text-gray-500 mb-3 pb-3 border-b">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>Low (≤5)</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Available</div>
          </div>

          {loadingHospitals ? (
  <div className="flex items-center justify-center py-16">
    <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
  </div>
) : filteredHospitals.length === 0 ? (
  <div className="text-center py-10">
    <p className="text-3xl mb-2">😔</p>
    <p className="text-gray-500 text-sm">No hospitals found with compatible blood nearby.</p>
    <p className="text-gray-400 text-xs mt-1">Try searching a different location or call hospitals directly.</p>
  </div>
          ) : filteredHospitals.map((h, index) => (
            <div key={h.id} className="border-b pb-3 mb-3 last:border-0 last:mb-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-3">
                  <span className={`text-lg font-bold flex-shrink-0 ${index === 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{h.name}</p>
                    <p className="text-gray-500 text-xs">{h.address}</p>
                    {h.distance !== null && h.distance !== undefined && (
                      <p className={`text-xs font-semibold mt-0.5 ${index === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        📍 {h.distance.toFixed(1)} km away
                      </p>
                    )}
                  </div>
                </div>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name)}/@${h.latitude},${h.longitude},15z`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-700 shrink-0">
                  Directions
                </a>
              </div>
              <div className="flex flex-wrap gap-1">
                {compatibleTypes.filter(bt => (h.blood_stock?.[bt] ?? 0) > 0).map(bt => {
                  const units = h.blood_stock?.[bt] ?? 0
                  const bg = units <= 5 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                  return (
                    <span key={bt} className={`text-xs px-2 py-0.5 rounded font-semibold ${bg}`}>
                      {bt}: {units}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map View */}
      {showMap && userLocation && (
        <MapContainer center={userLocation} zoom={13} style={{ height: 'calc(100vh - 220px)', width: '100%', marginTop: '8px' }}>
          <RecenterMap center={mapCenter || userLocation} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={userLocation}>
            <Popup>📍 Your Location</Popup>
          </Marker>
          {filteredHospitals.filter(h => h.latitude && h.longitude).map(h => (
            <Marker key={h.id} position={[parseFloat(h.latitude), parseFloat(h.longitude)]} icon={hospitalIcon}>
              <Popup>
                <div style={{minWidth: '180px'}}>
                  <p style={{fontWeight: 'bold', color: '#dc2626', marginBottom: '2px'}}>{h.name}</p>
                  <p style={{fontSize: '11px', color: '#6b7280', marginBottom: '6px'}}>{h.address}</p>
                  <p style={{fontSize: '11px', fontWeight: 'bold', marginBottom: '3px'}}>Compatible Blood Available:</p>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '2px', marginBottom: '6px'}}>
                    {compatibleTypes.filter(bt => (h.blood_stock?.[bt] ?? 0) > 0).map(bt => {
                      const units = h.blood_stock?.[bt] ?? 0
                      const bg = units <= 5 ? '#ffedd5' : '#dcfce7'
                      const color = units <= 5 ? '#ea580c' : '#16a34a'
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