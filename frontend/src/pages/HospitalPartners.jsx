import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { PremiumHamburgerMenu } from '../components/NavbarHamburger-Premium'

// Backend API URL
const API_BASE_URL = 'http://localhost:5000'

function HospitalPartners() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

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
      
      console.log('📍 [HospitalPartners] Fetching from:', `${API_BASE_URL}/api/hospitals/all`)
      
      const response = await fetch(`${API_BASE_URL}/api/hospitals/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}. Make sure your backend is running at ${API_BASE_URL}`)
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
        contact: hospital.phone || '',
        address: abbreviateAddress(hospital.address || ''),
        fullAddress: hospital.address || '',
        latitude: hospital.latitude,
        longitude: hospital.longitude,
      }))

      // Sort hospitals alphabetically by name
      transformedHospitals.sort((a, b) => a.name.localeCompare(b.name))

      // Calculate statistics
      const governorateCounts = {}
      transformedHospitals.forEach(h => {
        const gov = h.governorate
        governorateCounts[gov] = (governorateCounts[gov] || 0) + 1
      })

      console.log('✅ [HospitalPartners] Governorate Distribution:', governorateCounts)

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
    
    // Comprehensive mapping of all variations
    const normalizationMap = {
      // Akkar
      'akkar': 'Akkar',
      'محافظة عكار': 'Akkar',
      'عكار': 'Akkar',
      
      // Baalbek-Hermel
      'baalbek': 'Baalbek-Hermel',
      'baalbak': 'Baalbek-Hermel',
      'hermel': 'Baalbek-Hermel',
      'محافظة بعلبك الهرمل': 'Baalbek-Hermel',
      'بعلبك': 'Baalbek-Hermel',
      'الهرمل': 'Baalbek-Hermel',
      'baalbek-hermel': 'Baalbek-Hermel',
      'beqaa': 'Baalbek-Hermel',
      
      // Beirut
      'beirut': 'Beirut',
      'beyrouth': 'Beirut',
      'محافظة بيروت': 'Beirut',
      'بيروت': 'Beirut',
      'hamra': 'Beirut',
      'ashrafieh': 'Beirut',
      'sin el fil': 'Beirut',
      'سن الفيل': 'Beirut',
      
      // Beqaa
      'beqaa': 'Beqaa',
      'bekaa': 'Beqaa',
      'محافظة البقاع': 'Beqaa',
      'البقاع': 'Beqaa',
      'chtaura': 'Beqaa',
      'chtoura': 'Beqaa',
      'zahle': 'Beqaa',
      'zahlé': 'Beqaa',
      'زحلة': 'Beqaa',
      
      // Keserwan-Jbeil
      'keserwan': 'Keserwan-Jbeil',
      'jbeil': 'Keserwan-Jbeil',
      'jbail': 'Keserwan-Jbeil',
      'محافظة كسروان جبيل': 'Keserwan-Jbeil',
      'كسروان': 'Keserwan-Jbeil',
      'جبيل': 'Keserwan-Jbeil',
      'jounieh': 'Keserwan-Jbeil',
      'juniyah': 'Keserwan-Jbeil',
      
      // Mount Lebanon
      'mount lebanon': 'Mount Lebanon',
      'محافظة جبل لبنان': 'Mount Lebanon',
      'جبل لبنان': 'Mount Lebanon',
      'baabda': 'Mount Lebanon',
      'aley': 'Mount Lebanon',
      'chouf': 'Mount Lebanon',
      'شوف': 'Mount Lebanon',
      
      // Nabatiyeh
      'nabatiyeh': 'Nabatiyeh',
      'nabatieh': 'Nabatiyeh',
      'محافظة النبطية': 'Nabatiyeh',
      'النبطية': 'Nabatiyeh',
      'bent jbail': 'Nabatiyeh',
      'bint jbail': 'Nabatiyeh',
      
      // North Lebanon
      'north lebanon': 'North Lebanon',
      'محافظة الشمال': 'North Lebanon',
      'الشمال': 'North Lebanon',
      'tripoli': 'North Lebanon',
      'trablous': 'North Lebanon',
      'طرابلس': 'North Lebanon',
      'batrun': 'North Lebanon',
      'halba': 'North Lebanon',
      'البترون': 'North Lebanon',
      
      // South Lebanon
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
    
    // Try exact match
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
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
    
    @keyframes hp-gradient { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
    @keyframes hp-pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }

    .hp-root {
      min-height:100vh;
      background:linear-gradient(-45deg,#FFEBEE,#F8F9FA,#FFEBEE,rgba(14,165,233,.35));
      background-size:400% 400%;
      animation:hp-gradient 14s ease infinite;
      font-family:'Plus Jakarta Sans',sans-serif;
      overflow-x:hidden;
      position:relative;
    }

    .hp-glass {
      background:rgba(255,255,255,.42);
      backdrop-filter:blur(28px) saturate(180%);
      -webkit-backdrop-filter:blur(28px) saturate(180%);
      border:1px solid rgba(255,255,255,.72);
      box-shadow:0 8px 32px rgba(211,47,47,.07),inset 0 0 20px rgba(255,255,255,.6);
    }

    .hp-nav {
      position:sticky;top:0;z-index:50;
      background:rgba(255,255,255,.85);
      backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(211,47,47,.08);
      box-shadow:0 2px 12px rgba(211,47,47,.04);
    }

    .hp-nav-inner {
      max-width:1360px;margin:0 auto;
      display:flex;justify-content:space-between;align-items:center;
      padding:16px 44px;
      gap:32px;
    }

    .hp-logo {
      display:flex;flex-direction:column;gap:2px;cursor:pointer;
    }

    .hp-logo-main {
      font-size:16px;font-weight:900;color:#D32F2F;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.1;
    }

    .hp-logo-sub {
      font-size:10px;font-weight:700;color:rgba(211,47,47,.6);font-style:italic;
    }

    .hp-emergency-btn {
      background:linear-gradient(135deg,#D32F2F,#ff6b6b);
      color:white;
      border:none;
      cursor:pointer;
      padding:12px 28px;
      border-radius:20px;
      font-weight:900;
      font-size:13px;
      font-family:'Plus Jakarta Sans',sans-serif;
      box-shadow:0 8px 24px rgba(211,47,47,.25);
      transition:all .22s cubic-bezier(.34,1.56,.64,1);
      display:flex;align-items:center;gap:6px;
    }

    .hp-emergency-btn:hover {
      transform:translateY(-2px);
      box-shadow:0 12px 32px rgba(211,47,47,.35);
    }

    .hp-hospital-card {
      background:rgba(255,255,255,.5);
      backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,.8);
      border-radius:24px;
      padding:28px;
      transition:all .28s cubic-bezier(.22,1,.36,1);
    }

    .hp-hospital-card:hover {
      transform:translateY(-4px);
      box-shadow:0 16px 40px rgba(211,47,47,.08);
    }

    .hp-hospital-name {
      font-family:'Fraunces',serif;
      font-size:18px;
      font-weight:900;
      color:#D32F2F;
      margin:0 0 8px;
    }

    .hp-hospital-meta {
      font-size:13px;
      color:rgba(211,47,47,.65);
      font-weight:600;
      margin:0 0 4px;
    }

    .hp-hospital-contact {
      font-size:12px;
      color:rgba(211,47,47,.55);
      margin:12px 0 0;
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

    .hp-filter-btn {
      padding:10px 20px;
      border-radius:18px;
      border:none;
      cursor:pointer;
      font-weight:700;
      font-size:12px;
      transition:all .22s;
      white-space:nowrap;
    }

    .hp-filter-btn.active {
      background:linear-gradient(135deg,#D32F2F,#ff6b6b);
      color:white;
    }

    .hp-filter-btn:not(.active) {
      background:rgba(255,255,255,.5);
      border:1px solid rgba(211,47,47,.15);
      color:rgba(211,47,47,.65);
    }

    .hp-error {
      background:rgba(239,68,68,.1);
      border:1px solid rgba(239,68,68,.3);
      color:rgba(185,28,28,.8);
      padding:16px 24px;
      border-radius:12px;
      max-width:700px;
      margin:0 auto;
      text-align:left;
      font-size:13px;
      line-height:1.6;
    }

    .hp-no-results {
      text-align:center;
      padding:40px 20px;
      color:rgba(211,47,47,.65);
    }

    @media (max-width:960px) {
      .hp-nav-inner { padding:12px 20px;gap:12px; }
      .hp-logo-main { font-size:13px; }
      .hp-hospital-card { padding:16px; }
      .hp-hospital-name { font-size:14px; }
    }
  `

  if (typeof document !== 'undefined' && !document.getElementById('hp-styles')) {
    const s = document.createElement('style')
    s.id = 'hp-styles'
    s.textContent = STYLES
    document.head.appendChild(s)
  }

  const governoratesInData = [...new Set(hospitals.map(h => h.governorate))].filter(Boolean)
  const sortedGovernorates = LEBANESE_GOVERNORATES.filter(gov => governoratesInData.includes(gov))
  const regions = ['all', ...sortedGovernorates]
  
  const filtered = filter === 'all' ? hospitals : hospitals.filter(h => h.governorate === filter)

  return (
    <div className="hp-root">
      {/* NAV */}
      <header className="hp-nav" style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)', transition:'transform .6s cubic-bezier(.22,1,.36,1)' }}>
        <div className="hp-nav-inner">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hp-logo"
            onClick={() => navigate('/')}
          >
            <div className="hp-logo-main">BloodConnect</div>
            <div className="hp-logo-sub">Smart Donor Matching System</div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => navigate('/emergency')}
            className="hp-emergency-btn"
          >
            <span style={{ animation: 'hp-pulse 1.2s cubic-bezier(0,0,.2,1) infinite', display: 'inline-block', fontWeight:900 }}>!</span>
            Emergency
          </motion.button>

          <PremiumHamburgerMenu />
        </div>
      </header>

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ padding:'60px 44px 80px', textAlign:'center' }}
      >
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'56px', fontWeight:900, color:'#D32F2F', lineHeight:1.1, margin:'0 0 16px' }}>
          Hospital Partners
        </h1>
        <p style={{ fontSize:'15px', color:'rgba(211,47,47,.65)', fontWeight:600, maxWidth:540, margin:'0 auto', lineHeight:1.7 }}>
          Trusted medical centers across Lebanon partnered with BloodConnect to ensure life-saving blood reaches patients in critical need.
        </p>
      </motion.section>

      {/* ERROR STATE */}
      {error && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth:1200, margin:'0 auto', padding:'0 44px 24px' }}
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
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ maxWidth:1200, margin:'0 auto', padding:'0 44px 44px', display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}
        >
          {regions.map((region, idx) => (
            <button
              key={idx}
              onClick={() => setFilter(region)}
              className={`hp-filter-btn ${filter === region ? 'active' : ''}`}
            >
              {region === 'all' ? 'All Governorates' : `${region}`}
            </button>
          ))}
        </motion.section>
      )}

      {/* HOSPITALS GRID */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'0 44px 100px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:24 }}>
        {loading ? (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 20px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ width:56, height:56, borderRadius:'50%', border:'4px solid rgba(211,47,47,.15)', borderTopColor:'#D32F2F', margin:'0 auto 12px' }}
            />
            <p style={{ color:'rgba(211,47,47,.65)', fontSize:'14px' }}>Loading hospitals...</p>
          </div>
        ) : filtered.length === 0 && !error ? (
          <div style={{ gridColumn:'1/-1' }}>
            <div className="hp-no-results">
              <p style={{ fontSize:'16px', fontWeight:600, margin:'0 0 8px' }}>No hospitals found</p>
              <p style={{ fontSize:'13px', margin:0 }}>Try selecting a different governorate</p>
            </div>
          </div>
        ) : (
          filtered.map((hospital, idx) => (
            <motion.div
              key={hospital.id}
              className="hp-glass hp-hospital-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
            >
              <h3 className="hp-hospital-name">{hospital.name}</h3>
              <p className="hp-hospital-meta">{hospital.address}</p>
              {hospital.contact && (
                <p className="hp-hospital-contact">{hospital.contact}</p>
              )}
              {hospital.active && (
                <div className="hp-badge">
                  <span style={{ width:6, height:6, background:'#16a34a', borderRadius:'50%', display:'inline-block' }}/>
                  Active
                </div>
              )}
            </motion.div>
          ))
        )}
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{ padding:'60px 44px', textAlign:'center' }}
      >
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'48px', fontWeight:900, color:'#D32F2F', margin:'0 0 16px' }}>
          Ready to Donate?
        </h2>
        <p style={{ fontSize:'14px', color:'rgba(211,47,47,.65)', fontWeight:600, margin:'0 0 24px' }}>
          Find your nearest hospital partner and save lives today.
        </p>
        <button
          onClick={() => navigate('/donor/register')}
          style={{ background:'linear-gradient(135deg,#D32F2F,#ff6b6b)', color:'white', border:'none', cursor:'pointer', padding:'16px 48px', borderRadius:'24px', fontWeight:900, fontSize:'15px', fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:'0 10px 28px rgba(211,47,47,.25)', transition:'all .22s cubic-bezier(.34,1.56,.64,1)' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(211,47,47,.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(211,47,47,.25)'; }}
        >
          Register as Donor
        </button>
      </motion.section>

      {/* FOOTER */}
      <footer style={{ background:'rgba(255,255,255,.4)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(211,47,47,.08)', padding:'24px 44px', textAlign:'center', fontSize:'12px', color:'rgba(211,47,47,.5)', fontWeight:500 }}>
        © 2026 BloodConnect. Smart Donor Matching System. All rights reserved.
      </footer>
    </div>
  )
}

export default HospitalPartners