import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { API_BASE_URL as API } from '../config/apiConfig'

// Fix Leaflet marker icons
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

function RecenterMap({ center, zoom }) {
  const map = useMap()
  const lastCenterRef = useRef(null)
  
  useEffect(() => { 
    if (center && (lastCenterRef.current === null || 
        (lastCenterRef.current[0] !== center[0] || lastCenterRef.current[1] !== center[1]))) {
      map.flyTo(center, zoom || 10, { duration: 1 })
      lastCenterRef.current = center
    }
  }, [center, zoom, map])
  return null
}

function HospitalPartners() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [mapCenter, setMapCenter] = useState([33.8547, 35.8623]) // Lebanon center
  const [mapZoom, setMapZoom] = useState(9)
  const [selectedHospital, setSelectedHospital] = useState(null)

  // Governorate coordinates for zooming
  const GOVERNORATE_COORDS = {
    'Akkar': { lat: 34.5933, lng: 36.0167, zoom: 11 },
    'Baalbek-Hermel': { lat: 34.0033, lng: 36.2167, zoom: 10 },
    'Beirut': { lat: 33.8886, lng: 35.4955, zoom: 12 },
    'Beqaa': { lat: 33.8333, lng: 36.3333, zoom: 10 },
    'Keserwan-Jbeil': { lat: 34.0667, lng: 35.6333, zoom: 11 },
    'Mount Lebanon': { lat: 33.7833, lng: 35.5500, zoom: 11 },
    'Nabatiyeh': { lat: 33.3667, lng: 35.2167, zoom: 11 },
    'North Lebanon': { lat: 34.4167, lng: 35.8333, zoom: 10 },
    'South Lebanon': { lat: 33.2667, lng: 35.3833, zoom: 10 },
  }

  // 9 Official Lebanese Governorates
  const LEBANESE_GOVERNORATES = [
    'Akkar',
    'Baalbek-Hermel',
    'Beirut',
    'Beqaa',
    'Keserwan-Jbeil',
    'Mount Lebanon',
    'Nabatiyeh',
    'North Lebanon',
    'South Lebanon'
  ]

  useEffect(() => { 
    setTimeout(() => setVisible(true), 60)
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📍 [HospitalPartners] Fetching from:', `${API}/api/hospitals/all`)
      
      const response = await fetch(`${API}/api/hospitals/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}. Make sure your backend is running at ${API}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Backend returned non-JSON response. Check server setup.`)
      }

      const data = await response.json()
      const hospitalsArray = Array.isArray(data) ? data : []
      
      // Transform and normalize data
      const transformedHospitals = hospitalsArray.map((hospital) => ({
        id: hospital.id,
        name: hospital.name || 'Unknown Hospital',
        city: extractCityFromAddress(hospital.address),
        governorate: normalizeGovernorate(hospital.address),
        active: true,
        phone: hospital.phone || '',
        address: abbreviateAddress(hospital.address || ''),
        fullAddress: hospital.address || '',
        latitude: hospital.latitude,
        longitude: hospital.longitude,
      }))

      // Sort hospitals alphabetically by name
      transformedHospitals.sort((a, b) => a.name.localeCompare(b.name))

      setHospitals(transformedHospitals)
      setLoading(false)
      
      console.log(`✅ [HospitalPartners] Loaded ${transformedHospitals.length} hospitals`)
    } catch (err) {
      console.error('❌ [HospitalPartners] Error:', err.message)
      setError(err.message)
      setLoading(false)
    }
  }

  // Normalize all variations to official governorate names
  const normalizeGovernorate = (address) => {
    if (!address) return 'Other'
    
    const addressLower = address.toLowerCase()
    
    const normalizationMap = {
      'akkar': 'Akkar',
      'محافظة عكار': 'Akkar',
      'عكار': 'Akkar',
      
      'baalbek': 'Baalbek-Hermel',
      'baalbak': 'Baalbek-Hermel',
      'hermel': 'Baalbek-Hermel',
      'محافظة بعلبك الهرمل': 'Baalbek-Hermel',
      'بعلبك': 'Baalbek-Hermel',
      'الهرمل': 'Baalbek-Hermel',
      'baalbek-hermel': 'Baalbek-Hermel',
      
      'beirut': 'Beirut',
      'beyrouth': 'Beirut',
      'محافظة بيروت': 'Beirut',
      'بيروت': 'Beirut',
      'hamra': 'Beirut',
      'ashrafieh': 'Beirut',
      'sin el fil': 'Beirut',
      'سن الفيل': 'Beirut',
      
      'beqaa': 'Beqaa',
      'bekaa': 'Beqaa',
      'محافظة البقاع': 'Beqaa',
      'البقاع': 'Beqaa',
      'chtaura': 'Beqaa',
      'chtoura': 'Beqaa',
      'zahle': 'Beqaa',
      'zahlé': 'Beqaa',
      'زحلة': 'Beqaa',
      
      'keserwan': 'Keserwan-Jbeil',
      'jbeil': 'Keserwan-Jbeil',
      'jbail': 'Keserwan-Jbeil',
      'محافظة كسروان جبيل': 'Keserwan-Jbeil',
      'كسروان': 'Keserwan-Jbeil',
      'جبيل': 'Keserwan-Jbeil',
      'jounieh': 'Keserwan-Jbeil',
      'juniyah': 'Keserwan-Jbeil',
      
      'mount lebanon': 'Mount Lebanon',
      'محافظة جبل لبنان': 'Mount Lebanon',
      'جبل لبنان': 'Mount Lebanon',
      'baabda': 'Mount Lebanon',
      'aley': 'Mount Lebanon',
      'chouf': 'Mount Lebanon',
      'شوف': 'Mount Lebanon',
      
      'nabatiyeh': 'Nabatiyeh',
      'nabatieh': 'Nabatiyeh',
      'محافظة النبطية': 'Nabatiyeh',
      'النبطية': 'Nabatiyeh',
      'bent jbail': 'Nabatiyeh',
      'bint jbail': 'Nabatiyeh',
      
      'north lebanon': 'North Lebanon',
      'محافظة الشمال': 'North Lebanon',
      'الشمال': 'North Lebanon',
      'tripoli': 'North Lebanon',
      'trablous': 'North Lebanon',
      'طرابلس': 'North Lebanon',
      'batrun': 'North Lebanon',
      'halba': 'North Lebanon',
      'البترون': 'North Lebanon',
      
      'south lebanon': 'South Lebanon',
      'محافظة الجنوب': 'South Lebanon',
      'الجنوب': 'South Lebanon',
      'sidon': 'South Lebanon',
      'saida': 'South Lebanon',
      'صيدا': 'South Lebanon',
      'tyre': 'South Lebanon',
      'sour': 'South Lebanon',
      'صور': 'South Lebanon',
      'jezzine': 'South Lebanon',
      'جزين': 'South Lebanon',
    }
    
    for (let [key, value] of Object.entries(normalizationMap)) {
      if (addressLower.includes(key)) {
        return value
      }
    }
    
    return 'Other'
  }

  const abbreviateAddress = (fullAddress) => {
    if (!fullAddress) return ''
    const parts = fullAddress.split(',')
    return parts.slice(0, 2).join(',').trim()
  }

  const extractCityFromAddress = (address) => {
    if (!address) return 'Unknown'
    const parts = address.split(',')
    return parts[0]?.trim() || 'Unknown'
  }

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

    @keyframes hp-gradient { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
    @keyframes hp-float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }

    .hp-root {
      min-height:100vh;
      background:linear-gradient(135deg,#f8f8f8 0%,#efefef 25%,#e8e8e8 50%,#f2f2f2 75%,#f8f8f8 100%);
      background-size:400% 400%;
      animation:hp-gradient 15s ease infinite;
      font-family:'Plus Jakarta Sans',sans-serif;
      overflow-x:hidden;
      position:relative;
      color:#380101;
    }

    .hp-orbs {
      position:fixed;
      inset:0;
      overflow:hidden;
      pointer-events:none;
      z-index:0;
    }

    .hp-orb {
      position:absolute;
      border-radius:50%;
      filter:blur(80px);
      pointer-events:none;
      animation:hp-float-orb 6s ease-in-out infinite;
    }

    .hp-dots {
      position:fixed;
      width:100%;
      height:100%;
      inset:0;
      pointer-events:none;
      z-index:0;
    }

    .hp-dot {
      position:fixed;
      border-radius:50%;
      pointer-events:none;
    }

    .hp-nav {
      position:sticky;top:0;z-index:50;
      background:rgba(248,248,248,.85);
      backdrop-filter:blur(20px) saturate(200%);
      -webkit-backdrop-filter:blur(20px) saturate(200%);
      border-bottom:1px solid rgba(180,180,180,.15);
      box-shadow:0 4px 30px rgba(0,0,0,.08);
    }

    .hp-nav-inner {
      max-width:1360px;margin:0 auto;
      display:flex;justify-content:space-between;align-items:center;
      padding:14px clamp(16px,3.5vw,44px);
      gap:clamp(16px,2.5vw,32px);
    }

    .hp-glass {
      background:rgba(255,255,255,.6);
      backdrop-filter:blur(20px) saturate(180%);
      -webkit-backdrop-filter:blur(20px) saturate(180%);
      border:1px solid rgba(180,180,180,.2);
      box-shadow:0 8px 32px rgba(0,0,0,.08);
    }

    .hp-glass-deep {
      background:rgba(255,255,255,.65);
      backdrop-filter:blur(30px) saturate(200%);
      -webkit-backdrop-filter:blur(30px) saturate(200%);
      border:1px solid rgba(180,180,180,.25);
      box-shadow:0 16px 48px rgba(0,0,0,.05),inset 0 1px 1px rgba(255,255,255,.4);
    }

    .hp-filter-btn {
      cursor:pointer;
      border:none;
      outline:none;
      transition:all .22s cubic-bezier(.34,1.56,.64,1);
      font-family:'Plus Jakarta Sans',sans-serif;
      font-weight:900;
      background:rgba(255,255,255,.5);
      backdrop-filter:blur(20px);
      border:2px solid rgba(220,38,38,.15);
      color:#dc2626;
      padding:clamp(8px,1vw,12px) clamp(14px,1.8vw,22px);
      border-radius:clamp(10px,1.4vw,16px);
      font-size:clamp(11px,1vw,13px);
      text-transform:uppercase;
      letter-spacing:.06em;
    }

    .hp-filter-btn:hover {
      transform:translateY(-2px);
      background:rgba(255,255,255,.72);
      border-color:rgba(220,38,38,.42);
      box-shadow:0 10px 28px rgba(220,38,38,.15);
    }

    .hp-filter-btn.active {
      background:linear-gradient(135deg,#dc2626,#ff6b6b);
      color:#faf7f7;
      box-shadow:0 10px 28px rgba(220,38,38,.3);
      transform:scale(1.05);
      border-color:#dc2626;
    }

    .hp-hospital-card {
      background:rgba(255,255,255,.65);
      backdrop-filter:blur(28px);
      -webkit-backdrop-filter:blur(28px);
      border:1px solid rgba(180,180,180,.25);
      border-radius:clamp(16px,2vw,28px);
      padding:clamp(18px,2.5vw,28px);
      transition:all .28s cubic-bezier(.22,1,.36,1);
      position:relative;
      overflow:hidden;
      cursor:pointer;
      box-shadow:0 8px 32px rgba(0,0,0,.06),inset 0 1px 1px rgba(255,255,255,.4);
    }

    .hp-hospital-card::before {
      content:'';
      position:absolute;
      top:0;
      left:0;
      right:0;
      height:1px;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.8),transparent);
    }

    .hp-hospital-card::after {
      content:'';
      position:absolute;
      inset:0;
      background:linear-gradient(135deg,rgba(255,235,238,.0),rgba(255,235,238,.0));
      opacity:0;
      transition:opacity .28s;
      border-radius:inherit;
    }

    .hp-hospital-card:hover {
      transform:translateY(-6px) scale(1.02);
      box-shadow:0 20px 56px rgba(220,38,38,.15),inset 0 1px 1px rgba(255,255,255,.5);
      border-color:rgba(220,38,38,.25);
    }

    .hp-hospital-card:hover::after {
      opacity:1;
    }

    .hp-card-inner {
      position:relative;
      z-index:2;
    }

    .hp-hospital-icon {
      width:44px;
      height:44px;
      background:linear-gradient(135deg,rgba(220,38,38,.15),rgba(153,27,27,.1));
      border-radius:12px;
      display:flex;
      align-items:center;
      justify-content:center;
      margin-bottom:12px;
      border:1px solid rgba(220,38,38,.2);
    }

    .hp-hospital-name {
      font-family:'Fraunces',serif;
      font-size:clamp(14px,1.5vw,17px);
      font-weight:900;
      color:#dc2626;
      margin:0 0 4px 0;
      line-height:1.2;
    }

    .hp-hospital-phone {
      font-size:clamp(12px,1.2vw,14px);
      font-weight:700;
      color:#991b1b;
      margin:6px 0 10px 0;
      display:flex;
      align-items:center;
      gap:6px;
      letter-spacing:.02em;
    }

    .hp-phone-icon {
      width:16px;
      height:16px;
      display:flex;
      align-items:center;
      justify-content:center;
      flex-shrink:0;
    }

    .hp-hospital-address {
      font-size:clamp(10px,.9vw,12px);
      color:rgba(220,38,38,.6);
      font-weight:500;
      margin:0;
      line-height:1.4;
    }

    .hp-hospital-city {
      font-size:clamp(9px,.8vw,11px);
      color:rgba(64,88,120,.55);
      font-weight:600;
      margin-top:8px;
      text-transform:uppercase;
      letter-spacing:.08em;
    }

    .hp-badge {
      display:inline-flex;
      align-items:center;
      gap:6px;
      padding:6px 12px;
      background:rgba(34,197,94,.1);
      border:1px solid rgba(34,197,94,.3);
      border-radius:12px;
      font-size:10px;
      font-weight:900;
      color:#16a34a;
      text-transform:uppercase;
      letter-spacing:0.1em;
      margin-top:12px;
    }

    .hp-badge::before {
      content:'';
      width:6px;
      height:6px;
      background:#16a34a;
      border-radius:50%;
      display:inline-block;
    }

    .hp-error {
      background:rgba(220,38,38,.08);
      border:2px solid rgba(220,38,38,.3);
      border-radius:16px;
      padding:24px;
      color:#dc2626;
      font-weight:600;
      text-align:center;
    }

    .hp-no-results {
      text-align:center;
      padding:40px 20px;
      color:rgba(220,38,38,.65);
    }

    .hp-loading {
      display:flex;
      align-items:center;
      justify-content:center;
      min-height:400px;
      font-size:18px;
      color:#dc2626;
      font-weight:700;
    }

    @media (max-width:960px) {
      .hp-nav-inner { flex-direction:row; }
      .hp-main-grid { grid-template-columns:1fr !important; }
      .hp-map-container { display:none !important; }
    }
  `

  if (typeof document !== 'undefined' && !document.getElementById('hp-styles-premium')) {
    const s = document.createElement('style')
    s.id = 'hp-styles-premium'
    s.textContent = STYLES
    document.head.appendChild(s)
  }

  const governoratesInData = [...new Set(hospitals.map(h => h.governorate))].filter(Boolean)
  const sortedGovernorates = LEBANESE_GOVERNORATES.filter(gov => governoratesInData.includes(gov))
  const regions = ['all', ...sortedGovernorates]
  
  const filtered = filter === 'all' ? hospitals : hospitals.filter(h => h.governorate === filter)

  // Calculate map center and zoom only when filter changes
  useEffect(() => {
    if (filtered.length > 0) {
      const validHospitals = filtered.filter(h => h.latitude && h.longitude)
      if (validHospitals.length > 0) {
        const avgLat = validHospitals.reduce((sum, h) => sum + parseFloat(h.latitude), 0) / validHospitals.length
        const avgLng = validHospitals.reduce((sum, h) => sum + parseFloat(h.longitude), 0) / validHospitals.length
        setMapCenter([avgLat, avgLng])
        // Use governorate zoom if available
        if (filter !== 'all' && GOVERNORATE_COORDS[filter]) {
          setMapZoom(GOVERNORATE_COORDS[filter].zoom)
        } else if (filter === 'all') {
          setMapZoom(9)
        }
      }
    }
  }, [filter])

  // Generate animated dots
  const dots = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1.5,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 2,
  }))

  return (
    <div className="hp-root">
      {/* Animated Orbs Background */}
      <div className="hp-orbs">
        {[
          { w: 'min(420px,36vw)', c: 'rgba(220,38,38,.1)', t: '8%', l: '8%', d: '0s' },
          { w: 'min(480px,40vw)', c: 'rgba(180,180,180,.08)', b: '18%', r: '8%', d: '-2s' },
          { w: 'min(320px,28vw)', c: 'rgba(220,38,38,.08)', t: '45%', r: '18%', d: '-5s' },
          { w: 'min(220px,20vw)', c: 'rgba(180,180,180,.06)', b: '4%', l: '12%', d: '-3s' },
        ].map((o, i) => (
          <motion.div
            key={i}
            className="hp-orb"
            style={{
              width: o.w,
              height: o.w,
              background: o.c,
              top: o.t,
              bottom: o.b,
              left: o.l,
              right: o.r,
            }}
            animate={{ y: [0, -50, 0], x: [0, 40, 0], scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Animated Dots */}
      <div className="hp-dots">
        {dots.map((dot) => (
          <motion.div
            key={`dot-${dot.id}`}
            className="hp-dot"
            style={{
              width: dot.size,
              height: dot.size,
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
      </div>

      {/* NAVBAR */}
      <header className="hp-nav" style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)', transition: 'transform .6s cubic-bezier(.22,1,.36,1)' }}>
        <div className="hp-nav-inner">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
            onClick={() => navigate('/')}
            whileHover={{ x: 3 }}
          >
            <motion.div
              style={{
                width: 50,
                height: 50,
                background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 32px rgba(220,38,38,.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
              whileHover={{ scale: 1.12, boxShadow: '0 16px 40px rgba(220,38,38,.4)' }}
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            >
              <svg viewBox="0 0 100 130" style={{ width: 28, height: 38 }}>
                <defs>
                  <linearGradient id="navBloodHP" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="50%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                </defs>
                <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill="url(#navBloodHP)" opacity="0.95" />
                <ellipse cx="32" cy="65" rx="16" ry="22" fill="#faf7f7" opacity="0.2" />
              </svg>
            </motion.div>
            <motion.div 
              style={{ fontSize: 22, fontWeight: 900, color: '#dc2626' }}
              animate={{ letterSpacing: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              BloodConnect
            </motion.div>
          </motion.div>

          <div style={{ flex: 1 }} />
        </div>
      </header>

      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: 'clamp(40px,6vw,80px) clamp(16px,3.5vw,44px)', textAlign: 'center' }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(36px,5.5vw,72px)', lineHeight: 0.93, fontWeight: 900, color: '#dc2626', margin: '0 0 16px', textShadow: '0 4px 20px rgba(220,38,38,.35)' }}
        >
          Hospital Partners
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: 'clamp(13px,1.3vw,17px)', color: 'rgba(56,1,1,.7)', fontWeight: 600, maxWidth: 540, margin: '0 auto', lineHeight: 1.65 }}
        >
          Trusted medical centers across Lebanon partnered with BloodConnect to ensure life-saving blood reaches patients in critical need.
        </motion.p>
      </motion.section>

      {/* ERROR STATE */}
      {error && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,3.5vw,44px) 24px', position: 'relative', zIndex: 10 }}
        >
          <div className="hp-error">
            <strong>Unable to load hospitals</strong>: {error}
          </div>
        </motion.section>
      )}

      {/* FILTERS */}
      {!loading && hospitals.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,3.5vw,44px) clamp(30px,4vw,50px)', display: 'flex', gap: 'clamp(8px,1.2vw,14px)', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 10 }}
        >
          {regions.map((region, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: -10 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                setFilter(region)
                if (region === 'all') {
                  setMapCenter([33.8547, 35.8623])
                  setMapZoom(9)
                } else {
                  const coords = GOVERNORATE_COORDS[region]
                  if (coords) {
                    setMapCenter([coords.lat, coords.lng])
                    setMapZoom(coords.zoom)
                  }
                }
              }}
              className={`hp-filter-btn ${filter === region ? 'active' : ''}`}
            >
              {region === 'all' ? 'All Governorates' : region}
            </motion.button>
          ))}
        </motion.section>
      )}

      {/* MAP */}
      {!loading && filtered.length > 0 && (
        <section style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: 'clamp(20px,2.5vw,32px) clamp(16px,3.5vw,44px) clamp(40px,6vw,80px)' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderRadius: 28, overflow: 'hidden', border: '2px solid rgba(220,38,38,.15)', boxShadow: '0 24px 60px rgba(220,38,38,.1)', height: 'clamp(300px,50vh,600px)' }}>
            {mapCenter && (
              <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                <RecenterMap center={mapCenter} zoom={mapZoom} />
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filtered.filter(h => h.latitude && h.longitude).map(h => (
                  <Marker key={h.id} position={[parseFloat(h.latitude), parseFloat(h.longitude)]} icon={hospitalIcon}
                    eventHandlers={{
                      mouseover: function(e) {
                        this.openPopup()
                      },
                      mouseout: function(e) {
                        this.closePopup()
                      }
                    }}>
                    <Popup>
                      <div style={{ minWidth: 200 }}>
                        <p style={{ fontWeight: 'bold', color: '#dc2626', margin: 0, marginBottom: 6 }}>{h.name}</p>
                        <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0' }}>{h.fullAddress}</p>
                        {h.phone && <p style={{ fontSize: 12, fontWeight: 'bold', color: '#991b1b', margin: '6px 0' }}>Phone: {h.phone}</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </motion.div>
        </section>
      )}

      {/* HOSPITALS GRID */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: '0 clamp(16px,3.5vw,44px) clamp(60px,8vw,100px)' }}>
        {loading ? (
          <div className="hp-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid rgba(220,38,38,.15)', borderTopColor: '#dc2626', marginRight: 16 }}
            />
            Loading hospitals...
          </div>
        ) : filtered.length === 0 && !error ? (
          <div className="hp-no-results">
            <p style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>No hospitals found</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Try selecting a different governorate</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'clamp(16px,2.5vw,24px)' }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((hospital, idx) => (
                <motion.div
                  key={hospital.id}
                  className="hp-glass-deep hp-hospital-card"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
                  layout
                  onClick={() => setSelectedHospital(hospital)}
                >
                  <div className="hp-card-inner">
                    <div className="hp-hospital-icon">
                      <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', fill: '#dc2626' }}>
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 11h-2v2h-2v-2h-2v-2h2v-2h2v2h2v2z"/>
                      </svg>
                    </div>

                    <h3 className="hp-hospital-name">{hospital.name}</h3>

                    {hospital.phone && hospital.phone.trim() !== '' && (
                      <p className="hp-hospital-phone">
                        <span className="hp-phone-icon">
                          <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%', fill: 'currentColor' }}>
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                        </span>
                        {hospital.phone}
                      </p>
                    )}

                    <p className="hp-hospital-address">{hospital.address}</p>
                    <p className="hp-hospital-city">{hospital.city}</p>

                    {hospital.active && (
                      <div className="hp-badge">
                        Active
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* CTA SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px,6vw,80px) clamp(16px,3.5vw,44px)', textAlign: 'center' }}
      >
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(26px,5.5vw,62px)', fontWeight: 900, color: '#dc2626', lineHeight: 1.1, letterSpacing: '-.04em', margin: 0 }}>
          Ready to save lives?
        </h2>
        <p style={{ fontSize: 'clamp(12px,1.4vw,16px)', color: 'rgba(56,1,1,.65)', fontWeight: 600, margin: 'clamp(12px,1.8vw,24px) auto 0', maxWidth: 520, lineHeight: 1.65 }}>
          Join Lebanon's most innovative network of heroes. Your contribution is vital, and with our intelligent logistics, your impact is immediate.
        </p>
        <div style={{ marginTop: 'clamp(20px,2.5vw,36px)' }}>
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/donor/register')}
            style={{ background: 'linear-gradient(135deg,#dc2626,#ff6b6b)', color: '#faf7f7', border: 'none', cursor: 'pointer', padding: 'clamp(14px,1.8vw,20px) clamp(28px,4vw,52px)', borderRadius: 28, fontWeight: 900, fontSize: 'clamp(14px,1.4vw,18px)', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: '0 12px 32px rgba(220,38,38,.32)', transition: 'all .22s cubic-bezier(.34,1.56,.64,1)' }}
          >
            Become a Donor Today
          </motion.button>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 10, background: 'rgba(255,255,255,.4)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(220,38,38,.08)', padding: 'clamp(20px,3vw,32px) clamp(16px,3.5vw,44px)', textAlign: 'center', fontSize: 'clamp(10px,.9vw,12px)', color: 'rgba(220,38,38,.5)', fontWeight: 500 }}>
        © 2026 BloodConnect · Dana Ghannam & Lynn Anani · Lebanon.
      </footer>
    </div>
  )
}

export default HospitalPartners