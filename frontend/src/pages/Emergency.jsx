import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://blood-bank-eqyr.onrender.com'

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => { if (center) map.setView(center, 13) }, [center])
  return null
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GOVERNORATES = ['Beirut', 'Mount Lebanon', 'North', 'South', 'Bekaa', 'Nabatieh']

const compatibleBloodForPatient = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; }
  body { background:linear-gradient(135deg,#f8f8f8 0%,#efefef 25%,#e8e8e8 50%,#f2f2f2 75%,#f8f8f8 100%); background-attachment:fixed; min-height:100vh; margin:0; padding:0; }

  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes pulse-ring { 0% { transform:scale(.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }

  .em-root {
    min-height:100vh;
    background:transparent;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
    color:#380101;
    zoom: 0.75;
  }

  .em-glass {
    background:rgba(255,255,255,.6);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(180,180,180,.2);
    box-shadow:0 8px 32px rgba(0,0,0,.08);
  }

  .em-glass-deep {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(180,180,180,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.1),inset 0 1px 1px rgba(255,255,255,.3);
  }

  .em-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .em-input {
    width:100%;
    padding:clamp(13px,1.5vw,16px) clamp(16px,2vw,20px);
    border-radius:clamp(12px,1.5vw,16px);
    border:1.5px solid rgba(180,180,180,.2);
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:600;
    font-size:clamp(12px,1.1vw,14px);
    color:#380101;
    outline:none;
    transition:all .28s cubic-bezier(.22,1,.36,1);
    box-shadow:inset 0 1px 1px rgba(255,255,255,.3);
  }

  .em-input::placeholder { color:rgba(56,1,1,.4); }

  .em-input:focus {
    border-color:rgba(220,38,38,.4);
    background:rgba(255,255,255,.7);
    box-shadow:0 8px 24px rgba(220,38,38,.15),inset 0 1px 1px rgba(255,255,255,.3);
    transform:translateY(-2px);
  }

  .em-blood-chip {
    cursor:pointer;
    border:1.5px solid rgba(220,38,38,.2);
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(10px);
    font-weight:700;
    font-size:clamp(12px,1.2vw,14px);
    color:rgba(56,1,1,.6);
    border-radius:clamp(12px,1.5vw,16px);
    padding:clamp(12px,1.5vw,16px) clamp(10px,1.2vw,14px);
    transition:all .25s cubic-bezier(.34,1.56,.64,1);
    font-family:'Plus Jakarta Sans',sans-serif;
    position:relative;
    overflow:hidden;
  }

  .em-blood-chip:hover {
    transform:translateY(-3px) scale(1.05);
    box-shadow:0 10px 28px rgba(220,38,38,.18);
    border-color:rgba(220,38,38,.4);
  }

  .em-blood-chip.selected {
    background:linear-gradient(135deg,#dc2626,#991b1b);
    color:#faf7f7;
    border-color:transparent;
    box-shadow:0 12px 32px rgba(220,38,38,.4);
    transform:scale(1.08);
  }

  .em-btn {
    position:relative;
    overflow:hidden;
    cursor:pointer;
    border:none;
    outline:none;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
    border-radius:clamp(12px,1.5vw,16px);
  }

  .em-btn::before {
    content:'';
    position:absolute;
    top:0;
    left:-100%;
    width:100%;
    height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
    transition:left .5s;
  }

  .em-btn:hover::before { left:100%; }

  .em-btn-primary {
    background:linear-gradient(135deg,#dc2626 0%,#991b1b 50%,#7f1d1d 100%);
    color:#faf7f7;
    box-shadow:0 10px 30px rgba(220,38,38,.35);
    border:1px solid rgba(255,255,255,.15);
  }

  .em-btn-primary:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 20px 60px rgba(220,38,38,.5);
  }

  .em-btn-secondary {
    background:rgba(255,255,255,.6);
    border:1.5px solid rgba(180,180,180,.3);
    color:#380101;
  }

  .em-btn-secondary:hover {
    background:rgba(255,255,255,.8);
    border-color:rgba(180,180,180,.5);
    transform:translateY(-2px);
  }

  .em-card-hover {
    transition:all .4s cubic-bezier(.22,1,.36,1);
  }

  .em-card-hover:hover {
    transform:translateY(-5px) scale(1.01);
    box-shadow:0 24px 60px rgba(220,38,38,.16) !important;
  }

  .em-toggle-btn {
    flex:1;
    padding:clamp(12px,1.5vw,16px);
    border-radius:clamp(12px,1.5vw,16px);
    font-size:clamp(12px,1.1vw,13px);
    font-weight:700;
    font-family:'Plus Jakarta Sans',sans-serif;
    cursor:pointer;
    border:none;
    transition:all .25s cubic-bezier(.34,1.56,.64,1);
  }

  .em-toggle-btn.active {
    background:linear-gradient(135deg,#dc2626,#991b1b);
    color:#faf7f7;
    box-shadow:0 8px 24px rgba(220,38,38,.3);
  }

  .em-toggle-btn.inactive {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(10px);
    color:rgba(56,1,1,.6);
    border:1.5px solid rgba(180,180,180,.2);
  }

  .em-toggle-btn.inactive:hover {
    background:rgba(255,255,255,.7);
    border-color:rgba(180,180,180,.4);
  }

  @media (max-width:1024px) {
    .em-root { zoom: 0.78; }
    .em-results-grid { grid-template-columns:1fr !important; }
    .em-header-grid { grid-template-columns:1fr !important; gap: clamp(8px,1.5vw,14px) !important; }
    .em-landing-grid { grid-template-columns:1fr !important; gap: clamp(16px,2.5vw,24px) !important; }
  }

  @media (max-width:768px) {
    .em-root { zoom: 0.70; }
    .em-landing-grid { grid-template-columns:1fr !important; gap: clamp(14px,2vw,20px) !important; }
  }

  @media (max-width:480px) {
    .em-root { zoom: 0.65; }
    .em-landing-grid { grid-template-columns:1fr !important; gap: clamp(12px,1.5vw,16px) !important; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('em-styles-unified')) {
  const s = document.createElement('style')
  s.id = 'em-styles-unified'
  s.textContent = STYLES
  document.head.appendChild(s)
}

/* ─── Animated Background Orbs ───────────────────────── */
function AnimatedBackgroundOrbs() {
  const orbs = [
    { size: 'min(350px,32vw)', color: 'rgba(220,38,38,.1)', top: '-8%', left: '-5%', duration: 8 },
    { size: 'min(300px,28vw)', color: 'rgba(180,180,180,.08)', top: '20%', right: '-8%', duration: 11 },
    { size: 'min(320px,30vw)', color: 'rgba(220,38,38,.08)', bottom: '-12%', left: '8%', duration: 13 },
    { size: 'min(280px,26vw)', color: 'rgba(180,180,180,.06)', bottom: '15%', right: '-5%', duration: 9 },
  ]

  const dots = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 3,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 2,
  }))

  return (
    <motion.div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="em-float-orb"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.color,
            top: orb.top,
            right: orb.right,
            left: orb.left,
            bottom: orb.bottom,
          }}
          animate={{ y: [0, -50, 0], x: [0, 40, 0], scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {dots.map((dot) => (
        <motion.div
          key={`dot-${dot.id}`}
          style={{
            position: 'fixed',
            width: dot.size,
            height: dot.size,
            borderRadius: '50%',
            background: `rgba(220, 38, 38, ${0.4 + Math.random() * 0.3})`,
            left: `${dot.startX}%`,
            top: `${dot.startY}%`,
            boxShadow: `0 0 ${dot.size * 2}px rgba(220, 38, 38, ${0.5 + Math.random() * 0.3})`,
          }}
          animate={{
            y: [0, -200 - Math.random() * 100],
            x: [-50 + Math.random() * 100, -50 + Math.random() * 100],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  )
}

function HospitalCard({ h, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.055, duration: 0.45, type: 'spring' }}
      className="em-glass em-card-hover"
      style={{
        borderRadius: 'clamp(14px,1.5vw,18px)',
        padding: 'clamp(12px,1.5vw,16px)',
        border: index === 0 ? '1.5px solid rgba(220,38,38,.3)' : '1.5px solid rgba(220,38,38,.15)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 10,
      }}
    >
      {index === 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#dc2626,transparent)' }} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 'clamp(32px,4vw,40px)',
              height: 'clamp(32px,4vw,40px)',
              borderRadius: 10,
              flexShrink: 0,
              background: index === 0 ? 'linear-gradient(135deg,#dc2626,#ff6b6b)' : 'rgba(220,38,38,.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: index === 0 ? '0 8px 20px rgba(220,38,38,.35)' : 'none',
            }}
          >
            <span style={{ fontWeight: 900, fontSize: 'clamp(11px,1.2vw,12px)', color: index === 0 ? '#faf7f7' : '#dc2626' }}>
              #{index + 1}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 900, fontSize: 'clamp(12px,1.1vw,13px)', color: '#dc2626', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {h.name}
            </p>
            <p style={{ fontSize: 'clamp(10px,0.9vw,11px)', color: 'rgba(56,1,1,.6)', margin: 'clamp(2px,0.5vw,4px) 0 0', fontWeight: 600 }}>
              {h.address}
            </p>
            {h.distance != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 'clamp(4px,0.5vw,6px)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: index === 0 ? '#dc2626' : '#991b1b', boxShadow: `0 0 8px ${index === 0 ? '#dc2626' : '#991b1b'}` }} />
                <span style={{ fontSize: 'clamp(10px,0.9vw,11px)', fontWeight: 700, color: index === 0 ? '#dc2626' : '#991b1b' }}>
                  {h.distance.toFixed(1)} km
                </span>
              </div>
            )}
          </div>
        </div>
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(h.name)}/@${h.latitude},${h.longitude},15z`}
          target="_blank"
          rel="noopener noreferrer"
          className="em-btn em-btn-primary"
          style={{ padding: 'clamp(8px,1vw,10px) clamp(12px,1.5vw,14px)', fontSize: 'clamp(10px,0.9vw,11px)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: '#faf7f7' }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          Map
        </a>
      </div>
    </motion.div>
  )
}

function Emergency() {
  const [patientBloodType, setPatientBloodType] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [patientGovernorate, setPatientGovernorate] = useState('')
  const [bloodTypeSelected, setBloodTypeSelected] = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [userLocation, setUserLocation] = useState(undefined)
  const [sortedHospitals, setSortedHospitals] = useState([])
  const [search, setSearch] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [mapCenter, setMapCenter] = useState(null)
  const [loadingHospitals, setLoadingHospitals] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371,
      dLat = ((lat2 - lat1) * Math.PI) / 180,
      dLon = ((lon2 - lon1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const handleCreateEmergency = async () => {
    if (patientEmail && !/\S+@\S+\.\S+/.test(patientEmail)) {
      setRequestMessage('Please enter a valid email address')
      return
    }
    if (!patientBloodType) {
      setRequestMessage('Please select blood type')
      return
    }

    setIsCreatingRequest(true)
    setRequestMessage('')

    try {
      const response = await fetch(`${API}/api/blood-requests/create-emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_email: patientEmail,
          blood_type: patientBloodType,
          governorate: patientGovernorate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setRequestMessage(`Request sent to ${data.donorsNotified || 0} donors`)
        setTimeout(() => {
          setPatientEmail('')
          setPatientGovernorate('')
          setRequestMessage('')
        }, 2000)
      } else {
        setRequestMessage(data.message || 'Failed to create request')
      }
    } catch (error) {
      setRequestMessage(`Error: ${error.message}`)
    } finally {
      setIsCreatingRequest(false)
    }
  }

  const handleSearchHospitals = () => {
    setLoadingHospitals(true)
    fetch(`${API}/api/hospitals/with-stock`)
      .then((r) => r.json())
      .then((d) => {
        setHospitals(Array.isArray(d) ? d : [])
        setBloodTypeSelected(true)
        setLoadingHospitals(false)
      })
      .catch(() => setLoadingHospitals(false))
    navigator.geolocation.getCurrentPosition(
      (p) => setUserLocation([p.coords.latitude, p.coords.longitude]),
      () => {
        const la = import.meta.env.VITE_MY_LAT,
          ln = import.meta.env.VITE_MY_LNG
        setUserLocation(la && ln ? [parseFloat(la), parseFloat(ln)] : null)
      }
    )
  }

  useEffect(() => {
    if (!hospitals.length) return
    const process = (loc) =>
      setSortedHospitals(
        hospitals
          .filter((h) => h.latitude && h.longitude)
          .map((h) => ({ ...h, distance: loc ? getDistance(loc[0], loc[1], h.latitude, h.longitude) : null }))
          .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
      )
    if (userLocation !== undefined) process(userLocation)
  }, [userLocation, hospitals])

  const handleSearch = async () => {
    if (!search.trim()) return
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search + ', Lebanon')}&format=json&limit=1`)
    const data = await res.json()
    if (data.length) {
      const nl = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      setUserLocation(nl)
      setMapCenter(nl)
    }
  }

  const filteredHospitals = sortedHospitals

  // ═══════════════════════════════════════════════════════════════════════════════════
  // LANDING PAGE - SELECT BLOOD TYPE
  // ═══════════════════════════════════════════════════════════════════════════════════
  if (!bloodTypeSelected) {
    return (
      <div className="em-root">
        <AnimatedBackgroundOrbs />

        <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,56px)', alignItems: 'center', padding: 'clamp(20px,3vw,40px) clamp(16px,3vw,32px)' }} className="em-landing-grid">
          {/* LEFT COLUMN: HERO MESSAGING */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -40 }} transition={{ duration: 0.8, type: 'spring', stiffness: 100 }} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px,2vw,28px)' }}>
            <div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 180 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(16px,2vw,24px)', padding: '8px 18px', borderRadius: 9999, background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)' }}>
                <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#dc2626', opacity: 0.75, animation: 'pulse-ring 1.2s cubic-bezier(0,0,.2,1) infinite' }} />
                  <span style={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 10px #dc2626', display: 'inline-flex' }} />
                </span>
                <span style={{ color: '#dc2626', fontWeight: 900, fontSize: 'clamp(9px,0.9vw,10px)', letterSpacing: '.15em', textTransform: 'uppercase' }}>
                  Live Emergency
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }} transition={{ delay: 0.1, duration: 0.6 }} style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(36px,5.5vw,72px)', fontWeight: 900, color: '#dc2626', margin: 0, lineHeight: 0.95 }}>
                Emergency Blood
                <br />
                <em style={{ color: '#991b1b', fontStyle: 'italic' }}>Near You</em>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }} transition={{ delay: 0.2, duration: 0.6 }} style={{ fontSize: 'clamp(13px,1.3vw,16px)', color: 'rgba(56,1,1,.7)', fontWeight: 600, margin: 'clamp(12px,1.5vw,18px) 0 0', lineHeight: 1.65 }}>
                Select the patient's blood type to notify donors instantly across Lebanon.
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9 }} transition={{ delay: 0.25, duration: 0.5 }} className="em-glass" style={{ borderRadius: 'clamp(22px,3vw,28px)', padding: 'clamp(20px,2.5vw,28px)', border: '1.5px solid rgba(180,180,180,.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'rgba(220,38,38,.1)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 'clamp(44px,5vw,52px)', height: 'clamp(44px,5vw,52px)', borderRadius: 12, background: 'linear-gradient(135deg,#dc2626,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 28px rgba(220,38,38,.35)' }}>
                    <svg viewBox="0 0 100 130" style={{ width: '60%', height: '60%', fill: '#faf7f7' }}>
                      <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 'clamp(9px,0.9vw,10px)', fontWeight: 700, color: 'rgba(56,1,1,.5)', textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>
                      Blood Type
                    </p>
                    <p style={{ fontSize: 'clamp(13px,1.3vw,16px)', fontWeight: 900, color: '#dc2626', margin: '2px 0 0' }}>
                      Select
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(8px,1.2vw,10px)' }}>
                  {BLOOD_TYPES.map((bt, i) => (
                    <motion.button
                      key={bt}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05, type: 'spring' }}
                      onClick={() => setPatientBloodType(bt)}
                      className={`em-blood-chip${patientBloodType === bt ? ' selected' : ''}`}
                      style={{ padding: 'clamp(12px,1.5vw,16px) clamp(8px,1vw,10px)', fontSize: 'clamp(14px,1.5vw,18px)' }}
                    >
                      {bt}
                    </motion.button>
                  ))}
                </div>

                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: patientBloodType ? 1 : 0, height: patientBloodType ? 'auto' : 0 }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 18, paddingTop: 18, borderTop: patientBloodType ? '1px solid rgba(180,180,180,.2)' : 'none' }}>
                  {patientBloodType && (
                    <>
                      <p style={{ fontSize: 'clamp(9px,0.9vw,10px)', fontWeight: 700, color: 'rgba(56,1,1,.5)', textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 10px' }}>
                        Receives from these types
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {compatibleBloodForPatient[patientBloodType].map((bt) => (
                          <span key={bt} style={{ background: 'rgba(153,27,27,.08)', color: '#dc2626', fontSize: 'clamp(11px,1.1vw,13px)', fontWeight: 700, padding: 'clamp(5px,0.6vw,8px) clamp(12px,1.3vw,16px)', borderRadius: 10, border: '1.5px solid rgba(220,38,38,.2)' }}>
                            {bt}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>

            <motion.button
              onClick={handleSearchHospitals}
              disabled={loadingHospitals}
              className="em-btn em-btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              style={{ padding: 'clamp(16px,2vw,20px)', fontSize: 'clamp(14px,1.4vw,16px)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', opacity: loadingHospitals ? 0.7 : 1 }}
            >
              {loadingHospitals ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#faf7f7', borderRadius: '50%' }} />
                  Loading...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: '#faf7f7' }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Search Hospitals
                </>
              )}
            </motion.button>
          </motion.div>

          {/* RIGHT COLUMN: ACTION CARD */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 40 }} transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}>
            <div className="em-glass-deep" style={{ borderRadius: 'clamp(24px,3vw,32px)', padding: 'clamp(24px,3vw,32px)', border: '1.5px solid rgba(180,180,180,.15)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#dc2626,transparent)' }} />
              <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'rgba(220,38,38,.08)', borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, background: 'rgba(220,38,38,.06)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 180 }} style={{ display: 'flex', justifyContent: 'center', marginBottom: 'clamp(24px,3vw,32px)' }}>
                  <div style={{ position: 'relative', width: 'clamp(68px,8vw,84px)', height: 'clamp(68px,8vw,84px)' }}>
                    <motion.div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(220,38,38,.15)', animation: 'pulse-ring 2s infinite' }} />
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 40px rgba(220,38,38,.45)' }}>
                      <svg viewBox="0 0 100 130" style={{ width: '58%', height: '58%', fill: '#faf7f7' }}>
                        <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,3.5vw,36px)' , marginTop: 'clamp(90px,10vw,85px)'}}>
                  <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(24px,3.5vw,32px)', fontWeight: 900, color: '#dc2626', margin: '0 0 10px', lineHeight: 1.1 }}>
                    Alert Donors
                  </h2>
                  <p style={{ fontSize: 'clamp(12px,1.2vw,14px)', color: 'rgba(56,1,1,.6)', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                    Notify nearby donors of your emergency blood needs instantly
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px,1.2vw,14px)', marginBottom: 'clamp(16px,2vw,22px)' }}>
                  <div>
                    <label style={{ fontSize: 'clamp(9px,0.9vw,10px)', fontWeight: 700, color: 'rgba(56,1,1,.5)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 'clamp(8px,1vw,10px)', display: 'block' }}>
                      Patient Email
                    </label>
                    <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} className="em-input" />
                  </div>

                  <div>
                    <label style={{ fontSize: 'clamp(9px,0.9vw,10px)', fontWeight: 700, color: 'rgba(56,1,1,.5)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 'clamp(8px,1vw,10px)', display: 'block' }}>
                      Governorate
                    </label>
                    <select value={patientGovernorate} onChange={(e) => setPatientGovernorate(e.target.value)} className="em-input" style={{ appearance: 'none', cursor: 'pointer' }}>
                      <option value=""></option>
                      {GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <AnimatePresence>
                  {requestMessage && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="em-glass" style={{ padding: 'clamp(12px,1.5vw,16px)', borderRadius: 'clamp(12px,1.5vw,16px)', marginBottom: 'clamp(18px,2vw,24px)', background: requestMessage.includes('Error') || requestMessage.includes('Please') ? 'rgba(220,38,38,.08)' : 'rgba(34,197,94,.08)', border: requestMessage.includes('Error') || requestMessage.includes('Please') ? '1.5px solid rgba(220,38,38,.3)' : '1.5px solid rgba(34,197,94,.3)', textAlign: 'center' }}>
                      <p style={{ fontSize: 'clamp(11px,1.1vw,13px)', fontWeight: 600, color: requestMessage.includes('Error') || requestMessage.includes('Please') ? '#dc2626' : '#16a34a', margin: 0 }}>
                        {requestMessage}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleCreateEmergency}
                  disabled={isCreatingRequest || !patientBloodType}
                  className="em-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ padding: 'clamp(16px,2vw,20px)', fontSize: 'clamp(13px,1.3vw,15px)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', opacity: !patientBloodType || isCreatingRequest ? 0.5 : 1, background: 'linear-gradient(135deg,#22c55e 0%,#16a34a 50%,#15803d 100%)', color: '#faf7f7', boxShadow: '0 10px 30px rgba(34,197,94,.35)', border: '1px solid rgba(255,255,255,.15)' }}
                >
                  {isCreatingRequest ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#faf7f7', borderRadius: '50%' }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: '#faf7f7' }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      Alert Donors Now
                    </>
                  )}
                </motion.button>

                <p style={{ textAlign: 'center', fontSize: 'clamp(11px,1vw,12px)', color: 'rgba(56,1,1,.5)', fontWeight: 600, margin: 'clamp(16px,2vw,22px) 0 0', lineHeight: 1.5 }}>
                  Notify nearby donors of your emergency needs. Optional follow-up info recommended.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  // HOSPITAL SEARCH PAGE
  // ═══════════════════════════════════════════════════════════════════════════════════

  if (userLocation === undefined) {
    return (
      <div className="em-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <AnimatedBackgroundOrbs />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="em-glass-deep" style={{ borderRadius: 'clamp(24px,3vw,32px)', padding: 'clamp(32px,4vw,48px)', textAlign: 'center', border: '1px solid rgba(180,180,180,.15)', position: 'relative', zIndex: 10 }}>
          <div style={{ width: 'clamp(44px,5vw,56px)', height: 'clamp(44px,5vw,56px)', border: '3px solid rgba(220,38,38,.15)', borderTopColor: '#dc2626', borderRadius: '50%', animation: 'linear infinite rotate 1s', margin: '0 auto clamp(16px,2vw,20px)', position: 'relative' }} />
          <p style={{ color: 'rgba(56,1,1,.7)', fontWeight: 700, margin: 0, fontSize: 'clamp(12px,1.1vw,14px)' }}>
            Getting your location...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="em-root">
      <AnimatedBackgroundOrbs />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 'clamp(320px,95vw,1360px)', margin: '0 auto', padding: 'clamp(16px,2vw,24px)' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="em-glass-deep" style={{ borderRadius: 'clamp(20px,2.5vw,28px)', padding: 'clamp(16px,2vw,20px) clamp(18px,2.5vw,24px)', border: '1.5px solid rgba(180,180,180,.15)', marginBottom: 'clamp(16px,2vw,20px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#dc2626,transparent)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 'clamp(12px,1.8vw,16px)' }} className="em-header-grid">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px,1.5vw,12px)', minWidth: 0 }}>
              <div style={{ position: 'relative', width: 'clamp(40px,5vw,48px)', height: 'clamp(40px,5vw,48px)', flexShrink: 0 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(220,38,38,.12)', animation: 'pulse-ring 2s infinite' }} />
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 28px rgba(220,38,38,.4)' }}>
                  <svg viewBox="0 0 100 130" style={{ width: '55%', height: '55%', fill: '#faf7f7' }}>
                    <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" />
                  </svg>
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(14px,2vw,18px)', fontWeight: 900, color: '#dc2626', margin: 0, lineHeight: 1.1 }}>
                  Hospitals Nearby
                </h1>
                {patientBloodType && (
                  <p style={{ fontSize: 'clamp(10px,0.9vw,11px)', color: 'rgba(56,1,1,.6)', margin: 'clamp(4px,0.5vw,6px) 0 0', fontWeight: 700 }}>
                    Type <span style={{ color: '#dc2626', fontWeight: 900 }}>{patientBloodType}</span> available
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'clamp(8px,1vw,10px)', minWidth: 0 }}>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Search location..." className="em-input" style={{ margin: 0, minWidth: 0 }} />
              <motion.button onClick={handleSearch} className="em-btn em-btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} style={{ padding: 'clamp(12px,1.5vw,16px) clamp(14px,2vw,18px)', fontSize: 'clamp(11px,1vw,12px)', fontWeight: 700, flexShrink: 0 }}>
                Go
              </motion.button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px,1vw,10px)' }}>
              <div className="em-glass" style={{ padding: 'clamp(8px,1vw,10px) clamp(12px,1.5vw,14px)', borderRadius: 'clamp(10px,1.2vw,12px)', border: '1px solid rgba(180,180,180,.15)', textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: 'clamp(9px,0.9vw,10px)', fontWeight: 700, color: 'rgba(56,1,1,.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  {filteredHospitals.length}
                </p>
              </div>
              <motion.button
                onClick={() => {
                  setBloodTypeSelected(false)
                  setPatientBloodType('')
                }}
                className="em-btn em-btn-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: 'clamp(8px,1vw,10px) clamp(12px,1.5vw,14px)', fontSize: 'clamp(10px,0.9vw,11px)', fontWeight: 700, flexShrink: 0 }}
              >
                Change
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'clamp(12px,2vw,16px)', alignItems: 'start' }} className="em-results-grid">
          {/* Hospital List - Vertical Scroll */}
          <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <div style={{ display: 'flex', gap: 'clamp(6px,1vw,8px)', marginBottom: 'clamp(12px,1.5vw,14px)' }}>
              <button onClick={() => setShowMap(false)} className={`em-toggle-btn ${!showMap ? 'active' : 'inactive'}`} style={{ flex: 1 }}>
                List
              </button>
              <button onClick={() => setShowMap(true)} className={`em-toggle-btn ${showMap ? 'active' : 'inactive'}`} style={{ flex: 1 }}>
                Map
              </button>
            </div>

            {!showMap ? (
              <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: 'clamp(4px,0.5vw,6px)' }}>
                {loadingHospitals ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px,5vw,48px) 0', gap: 'clamp(12px,1.5vw,16px)' }}>
                    <div style={{ width: 'clamp(40px,5vw,48px)', height: 'clamp(40px,5vw,48px)', border: '3px solid rgba(220,38,38,.15)', borderTopColor: '#dc2626', borderRadius: '50%', animation: 'rotate 1s linear infinite' }} />
                    <p style={{ color: 'rgba(56,1,1,.6)', fontWeight: 700, margin: 0, fontSize: 'clamp(11px,1vw,12px)' }}>
                      Finding hospitals...
                    </p>
                  </div>
                ) : filteredHospitals.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="em-glass" style={{ borderRadius: 'clamp(16px,2vw,20px)', padding: 'clamp(20px,2.5vw,28px)', textAlign: 'center', border: '1.5px solid rgba(180,180,180,.2)' }}>
                    <p style={{ fontWeight: 900, color: '#dc2626', fontSize: 'clamp(12px,1.2vw,14px)', margin: 0 }}>
                      No hospitals found
                    </p>
                    <p style={{ fontSize: 'clamp(10px,0.9vw,11px)', color: 'rgba(56,1,1,.6)', fontWeight: 600, margin: 'clamp(6px,1vw,10px) 0 0', lineHeight: 1.5 }}>
                      Try another location
                    </p>
                  </motion.div>
                ) : (
                  filteredHospitals.map((h, i) => <HospitalCard key={h.id} h={h} index={i} />)
                )}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ borderRadius: 'clamp(20px,2.5vw,28px)', overflow: 'hidden', border: '1.5px solid rgba(180,180,180,.15)', boxShadow: '0 16px 48px rgba(0,0,0,.08)', height: 'clamp(400px,60vh,700px)' }}>
                {userLocation && (
                  <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <RecenterMap center={mapCenter || userLocation} />
                    <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={userLocation}>
                      <Popup>Your Location</Popup>
                    </Marker>
                    {filteredHospitals
                      .filter((h) => h.latitude && h.longitude)
                      .map((h) => (
                        <Marker key={h.id} position={[parseFloat(h.latitude), parseFloat(h.longitude)]} icon={hospitalIcon}>
                          <Popup>
                            <div style={{ minWidth: 160 }}>
                              <p style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: 'clamp(2px,0.5vw,4px)', fontSize: 'clamp(11px,1vw,12px)' }}>
                                {h.name}
                              </p>
                              <p style={{ fontSize: 'clamp(9px,0.8vw,10px)', color: '#6b7280', marginBottom: 'clamp(6px,1vw,8px)' }}>
                                {h.address}
                              </p>
                              <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name)}/@${h.latitude},${h.longitude},15z`} target="_blank" rel="noopener noreferrer" style={{ color: '#dc2626', fontSize: 'clamp(10px,0.9vw,11px)', fontWeight: 'bold', textDecoration: 'none' }}>
                                Directions
                              </a>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
        </div>
      </div>
  )
}

export default Emergency