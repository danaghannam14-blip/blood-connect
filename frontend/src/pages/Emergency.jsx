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
  'O-':  ['O-'],
}

const BLOOD_FACTS = {
  'A+':  { pop:'34%', donate:'A+, AB+',          special:'Most common type' },
  'A-':  { pop:'6%',  donate:'A+, A-, AB+, AB-', special:'Universal plasma' },
  'B+':  { pop:'9%',  donate:'B+, AB+',          special:'Rare & powerful'  },
  'B-':  { pop:'2%',  donate:'B+, B-, AB+, AB-', special:'Very rare'        },
  'AB+': { pop:'3%',  donate:'AB+',              special:'Universal recipient'},
  'AB-': { pop:'1%',  donate:'AB+, AB-',          special:'Rarest type'     },
  'O+':  { pop:'38%', donate:'A+, B+, O+, AB+',  special:'Most needed'      },
  'O-':  { pop:'7%',  donate:'All types',        special:'Universal donor'  },
}

/* ─── Injected Styles ─────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  @keyframes em-ping      { 75%,100%{ transform:scale(2.4); opacity:0; } }
  @keyframes em-pulse     { 0%,100%{ opacity:1; } 50%{ opacity:.35; } }
  @keyframes em-gradient  { 0%,100%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } }
  @keyframes em-orb       { 0%,100%{ transform:translateY(0) translateX(0) scale(1); } 33%{ transform:translateY(-40px) translateX(24px) scale(1.1); } 66%{ transform:translateY(12px) translateX(-14px) scale(.94); } }
  @keyframes em-particle  { 0%,100%{ transform:translateY(0) translateX(0) scale(1); opacity:.25; } 50%{ transform:translateY(-32px) translateX(var(--px,6px)) scale(1.3); opacity:.9; } }
  @keyframes em-spin      { to{ transform:rotate(360deg); } }
  @keyframes em-spin-slow { to{ transform:rotate(360deg); } }
  @keyframes em-spin-r    { to{ transform:rotate(-360deg); } }
  @keyframes em-hb        { 0%,100%{ transform:scale(1); } 14%{ transform:scale(1.2); } 28%{ transform:scale(1); } 42%{ transform:scale(1.17); } }
  @keyframes em-float-b   { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-12px); } }
  @keyframes em-float-c   { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(10px); } }
  @keyframes em-shimmer   { 0%{ transform:translateX(-100%); } 100%{ transform:translateX(100%); } }
  @keyframes em-drop-bob  { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-14px); } }
  @keyframes em-orbit     { 0%{ transform:rotate(0deg) translateX(52px) rotate(0deg); } 100%{ transform:rotate(360deg) translateX(52px) rotate(-360deg); } }
  @keyframes em-orbit2    { 0%{ transform:rotate(0deg) translateX(72px) rotate(0deg); } 100%{ transform:rotate(-360deg) translateX(72px) rotate(360deg); } }
  @keyframes em-heartpath { to{ stroke-dashoffset:0; } }
  @keyframes em-ticker    { 0%{ transform:translateX(0); } 100%{ transform:translateX(-50%); } }

  .em-root {
    min-height:100vh;
    background:linear-gradient(-45deg,#f8f8f8,#efefef,#e8e8e8,rgba(153,27,27,.18),#f2f2f2);
    background-size:400% 400%;
    animation:em-gradient 14s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
  }
  .em-glass {
    background:rgba(255,255,255,.42);
    backdrop-filter:blur(28px) saturate(180%);
    -webkit-backdrop-filter:blur(28px) saturate(180%);
    border:1px solid rgba(255,255,255,.72);
    box-shadow:0 8px 32px rgba(211,47,47,.07),inset 0 0 20px rgba(255,255,255,.6);
  }
  .em-glass-deep {
    background:rgba(255,255,255,.35);
    backdrop-filter:blur(40px) contrast(1.1);
    -webkit-backdrop-filter:blur(40px) contrast(1.1);
    border:1px solid rgba(255,255,255,.8);
    box-shadow:0 24px 56px -12px rgba(211,47,47,.08),inset 0 0 36px rgba(255,255,255,.6);
  }
  .em-orb { position:fixed; border-radius:50%; filter:blur(110px); pointer-events:none; animation:em-orb var(--dur,8s) ease-in-out infinite; }
  .em-particle { position:fixed; border-radius:50%; pointer-events:none; animation:em-particle var(--dur,5s) ease-in-out infinite; }

  .em-btn { position:relative; overflow:hidden; cursor:pointer; border:none; outline:none; transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s; font-family:'Plus Jakarta Sans',sans-serif; }
  .em-btn::after { content:''; position:absolute; top:50%; left:50%; width:0; height:0; background:rgba(255,255,255,.28); border-radius:50%; transform:translate(-50%,-50%); transition:width .4s,height .4s; }
  .em-btn:hover::after { width:320px; height:320px; }
  .em-btn:hover  { transform:translateY(-3px) scale(1.05); }
  .em-btn:active { transform:scale(.97); }
  .em-btn-primary { background:linear-gradient(135deg,#dc2626,#ff6b6b); color:#faf7f7; box-shadow:0 12px 32px rgba(211,47,47,.32); }
  .em-btn-primary:hover { box-shadow:0 20px 52px rgba(211,47,47,.48); }
  .em-btn-primary:disabled { opacity:.4; cursor:not-allowed; transform:none !important; }

  .em-input { width:100%; padding:16px 22px; border-radius:18px; border:2px solid rgba(211,47,47,.15); background:rgba(255,255,255,.5); backdrop-filter:blur(20px); font-family:'Plus Jakarta Sans',sans-serif; font-weight:700; font-size:14px; color:#dc2626; outline:none; transition:all .28s cubic-bezier(.22,1,.36,1); box-sizing:border-box; }
  .em-input::placeholder { color:rgba(211,47,47,.35); }
  .em-input:focus { border-color:rgba(211,47,47,.5); background:rgba(255,255,255,.72); box-shadow:0 8px 28px rgba(211,47,47,.14); transform:translateY(-2px); }

  .em-blood-chip { cursor:pointer; border:2px solid rgba(211,47,47,.18); background:rgba(255,255,255,.5); backdrop-filter:blur(10px); font-weight:900; font-size:clamp(15px,1.8vw,20px); color:rgba(211,47,47,.55); border-radius:18px; padding:16px 10px; transition:all .25s cubic-bezier(.34,1.56,.64,1); font-family:'Plus Jakarta Sans',sans-serif; position:relative; overflow:hidden; }
  .em-blood-chip:hover { transform:translateY(-4px) scale(1.07); box-shadow:0 10px 28px rgba(211,47,47,.18); border-color:rgba(211,47,47,.45); }
  .em-blood-chip.selected { background:linear-gradient(135deg,#dc2626,#ff6b6b); color:#faf7f7; border-color:transparent; box-shadow:0 12px 32px rgba(211,47,47,.42); transform:scale(1.1); }
  .em-blood-chip.selected::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent); animation:em-shimmer 1.5s ease infinite; }

  .em-card-hover { transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s; }
  .em-card-hover:hover { transform:translateY(-5px) scale(1.01); box-shadow:0 24px 60px rgba(211,47,47,.16) !important; }

  .em-toggle-btn { flex:1; padding:14px 18px; border-radius:16px; font-size:14px; font-weight:900; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; border:none; transition:all .25s cubic-bezier(.34,1.56,.64,1); }
  .em-toggle-btn.active { background:linear-gradient(135deg,#dc2626,#ff6b6b); color:#faf7f7; box-shadow:0 10px 28px rgba(211,47,47,.32); }
  .em-toggle-btn.inactive { background:rgba(255,255,255,.5); backdrop-filter:blur(10px); color:rgba(211,47,47,.6); border:2px solid rgba(211,47,47,.12); }
  .em-toggle-btn.inactive:hover { background:rgba(255,255,255,.75); border-color:rgba(211,47,47,.28); }

  .em-stat-float-a { animation:em-float-b 3.5s ease-in-out infinite; }
  .em-stat-float-b { animation:em-float-c 4s ease-in-out infinite; }

  .em-ticker-wrap { overflow:hidden; flex:1; }
  .em-ticker-inner { display:flex; gap:52px; animation:em-ticker 30s linear infinite; #faf7f7-space:nowrap; width:max-content; }

  @media(max-width:960px){
    .em-sel-grid { grid-template-columns:1fr !important; }
    .em-sel-hero { display:none !important; }
    .em-results-grid { grid-template-columns:1fr !important; }
    .em-header-grid { grid-template-columns:1fr !important; }
    .em-header-search { grid-column:1 !important; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('em-styles-v3')) {
  const s = document.createElement('style'); s.id = 'em-styles-v3'; s.textContent = STYLES; document.head.appendChild(s)
}

/* ─── Particle Field ─────────────────────────────────────── */
function ParticleField() {
  const pts = Array.from({ length:32 }, (_, i) => ({
    id:i, w:Math.random()*5+2, left:Math.random()*100, top:Math.random()*100,
    dur:(Math.random()*4+3).toFixed(1), delay:-(Math.random()*5).toFixed(1),
    px:((Math.random()*22-11).toFixed(0))+'px',
    color: i%3===0?'rgba(211,47,47,.4)':i%3===1?'rgba(153,27,27,.5)':'rgba(255,235,238,.75)',
  }))
  return (
    <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {pts.map(p => <div key={p.id} className="em-particle" style={{ '--dur':`${p.dur}s`,'--px':p.px, width:p.w, height:p.w, left:`${p.left}%`, top:`${p.top}%`, background:p.color, animationDelay:`${p.delay}s` }}/>)}
    </div>
  )
}

/* ─── Orbs ───────────────────────────────────────────────── */
function Orbs({ set }) {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      {set.map((o,i) => <div key={i} className="em-orb" style={{ '--dur':'9s', width:o.w, height:o.w, background:o.c, top:o.t, bottom:o.b, left:o.l, right:o.r, animationDelay:o.d }}/>)}
    </div>
  )
}

/* ─── Live Ticker ────────────────────────────────────────── */
function LiveTicker() {
  const items = ['🔴 Tripoli — O- critically needed','🟡 Beirut — A+ supply stable','🔴 Baalbek — B+ urgent request','🟢 Sidon — AB+ available','🔴 Zahle — O+ shortage alert','🟢 Jounieh — All types available','🔴 Tyre — AB- emergency request']
  return (
    <div style={{ background:'linear-gradient(135deg,rgba(211,47,47,.07),rgba(153,27,27,.07))', borderTop:'1px solid rgba#991b1b', borderBottom:'1px solid rgba#991b1b', padding:'9px 0', overflow:'hidden', position:'relative', zIndex:20 }}>
      <div style={{ display:'flex', alignItems:'center' }}>
        <div style={{ background:'linear-gradient(135deg,#dc2626,#ff6b6b)', color:'#faf7f7', padding:'4px 18px', fontSize:10, fontWeight:900, letterSpacing:'.22em', textTransform:'uppercase', flexShrink:0, marginRight:24, borderRadius:'0 8px 8px 0' }}>LIVE</div>
        <div className="em-ticker-wrap">
          <div className="em-ticker-inner">
            {[...items,...items].map((item,i) => (
              <span key={i} style={{ fontSize:12, fontWeight:700, color:'rgba(211,47,47,.75)', display:'inline-flex', alignItems:'center', gap:6 }}>
                {item}<span style={{ color:'rgba(211,47,47,.2)', marginLeft:8 }}>•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Animated Blood Drop ────────────────────────────────── */
function BloodDropHero({ bloodType }) {
  return (
    <div style={{ position:'relative', width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      {[90,76,62].map((pct,i) => (
        <div key={i} style={{ position:'absolute', borderRadius:'50%', width:`${pct}%`, height:`${pct}%`, border:`2px solid rgba(211,47,47,${.08+i*.07})`, animation:`em-spin-${i%2===0?'slow':'r'} ${22+i*8}s linear infinite` }}/>
      ))}
      {[0,1,2].map(i => (
        <div key={i} style={{ position:'absolute', width:13, height:13, borderRadius:'50%', background:'linear-gradient(135deg,#ff6b6b,#dc2626)', animation:`em-orbit${i===1?'2':''} ${5+i*2}s linear infinite`, animationDelay:`${i*1.6}s`, top:'50%', left:'50%', marginTop:-6.5, marginLeft:-6.5, boxShadow:'0 0 12px rgba(211,47,47,.6)' }}/>
      ))}
      <div style={{ position:'relative', zIndex:2, animation:'em-drop-bob 3.2s ease-in-out infinite' }}>
        <svg viewBox="0 0 100 130" style={{ width:'clamp(110px,13vw,170px)', height:'auto', filter:'drop-shadow(0 16px 40px rgba(211,47,47,.5))' }}>
          <defs>
            <linearGradient id="emDropGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff8a80"/><stop offset="50%" stopColor="#dc2626"/><stop offset="100%" stopColor="#7f1d1d"/>
            </linearGradient>
            <linearGradient id="emHL2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#faf7f7" stopOpacity=".65"/><stop offset="100%" stopColor="#faf7f7" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill="url(#emDropGrad2)"/>
          <ellipse cx="33" cy="68" rx="16" ry="22" fill="url(#emHL2)"/>
          <path d="M50 18 C50 18 82 66 82 85 C82 103 68 118 50 118 C32 118 18 103 18 85 C18 66 50 18 50 18 Z" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.5"/>
          {bloodType && <text x="50" y="92" textAnchor="middle" fill="#faf7f7" fontSize="20" fontWeight="900" fontFamily="Plus Jakarta Sans,sans-serif" opacity=".95">{bloodType}</text>}
        </svg>
      </div>
      <div style={{ position:'absolute', bottom:'8%', left:'5%', right:'5%' }}>
        <svg style={{ width:'100%', height:34 }} viewBox="0 0 260 40">
          <path d="M0,20 L55,20 L65,6 L75,34 L85,20 L130,20 L140,10 L150,30 L160,20 L260,20" fill="none" stroke="rgba(211,47,47,.45)" strokeLinecap="round" strokeWidth="2.5" strokeDasharray="700" strokeDashoffset="700" style={{ animation:'em-heartpath 3s linear infinite' }}/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:'25%', borderRadius:'50%', background:'radial-gradient(circle,rgba(211,47,47,.22),transparent)', filter:'blur(28px)', animation:'em-hb 2s ease-in-out infinite', zIndex:1 }}/>
    </div>
  )
}

/* ─── Hospital Card ──────────────────────────────────────── */
function HospitalCard({ h, index, compatibleTypes }) {
  return (
    <motion.div
      initial={{ opacity:0, x:-18 }} animate={{ opacity:1, x:0 }}
      transition={{ delay:index*0.055, duration:.45, type:'spring' }}
      className="em-glass em-card-hover"
      style={{ borderRadius:22, padding:'clamp(13px,1.5vw,18px)', border: index===0?'2px solid rgba(211,47,47,.35)':'2px solid rgba#991b1b', position:'relative', overflow:'hidden', marginBottom:10 }}
    >
      {index===0 && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#dc2626,transparent)' }}/>}
      {index===0 && <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, background:'rgba(255,235,238,.7)', borderRadius:'50%', filter:'blur(30px)', pointerEvents:'none' }}/>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:10, flex:1, minWidth:0 }}>
          <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, background: index===0?'linear-gradient(135deg,#dc2626,#ff6b6b)':'rgba(153,27,27,.1)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: index===0?'0 8px 20px rgba(211,47,47,.35)':'none' }}>
            <span style={{ fontWeight:900, fontSize:13, color: index===0?'#faf7f7':'#991b1b' }}>#{index+1}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontWeight:900, fontSize:'clamp(12px,1.2vw,14px)', color:'#dc2626', margin:0, overflow:'hidden', textOverflow:'ellipsis', #faf7f7Space:'nowrap' }}>{h.name}</p>
            <p style={{ fontSize:11, color:'rgba(153,27,27,.7)', margin:'2px 0 0', fontWeight:600 }}>{h.address}</p>
            {h.distance != null && (
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:4 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background: index===0?'#dc2626':'#991b1b', boxShadow:`0 0 8px ${index===0?'#dc2626':'#991b1b'}`, animation:'em-pulse 1.5s infinite' }}/>
                <span style={{ fontSize:11, fontWeight:900, color: index===0?'#dc2626':'#991b1b' }}>{h.distance.toFixed(1)} km away</span>
              </div>
            )}
          </div>
        </div>
        <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name)}/@${h.latitude},${h.longitude},15z`} target="_blank" rel="noopener noreferrer"
          className="em-btn em-btn-primary"
          style={{ padding:'7px 14px', borderRadius:11, fontSize:11, fontWeight:900, textDecoration:'none', display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
          <svg viewBox="0 0 24 24" style={{ width:12, height:12, fill:'#faf7f7' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          Directions
        </a>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:10 }}>
        {compatibleTypes.filter(bt => (h.blood_stock?.[bt]??0) > 0).map(bt => {
          const u = h.blood_stock?.[bt]??0; const low = u<=5
          return <span key={bt} style={{ fontSize:11, padding:'3px 9px', borderRadius:7, fontWeight:900, background: low?'rgba(234,88,12,.1)':'rgba(34,197,94,.1)', color: low?'#ea580c':'#16a34a', border:`1.5px solid ${low?'rgba(234,88,12,.25)':'rgba(34,197,94,.25)'}` }}>{bt}: {u}</span>
        })}
      </div>
    </motion.div>
  )
}

/* ─── Main Component ─────────────────────────────────────── */
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
  const [visible, setVisible] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 60) }, [])

  const getDistance = (lat1,lon1,lat2,lon2) => {
    const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
  }

  useEffect(() => {
    if (!bloodTypeSelected) return
    setLoadingHospitals(true)
    fetch('https://blood-bank-eqyr.onrender.com/api/hospitals/with-stock')
      .then(r => r.json()).then(d => { setHospitals(Array.isArray(d)?d:[]); setLoadingHospitals(false) })
      .catch(() => setLoadingHospitals(false))
    navigator.geolocation.getCurrentPosition(
      p => setUserLocation([p.coords.latitude, p.coords.longitude]),
      () => {
        const la = import.meta.env.VITE_MY_LAT, ln = import.meta.env.VITE_MY_LNG
        setUserLocation(la&&ln ? [parseFloat(la),parseFloat(ln)] : null)
      }
    )
  }, [bloodTypeSelected])

  useEffect(() => {
    if (!hospitals.length) return
    const process = loc => setSortedHospitals(
      hospitals.filter(h => h.latitude&&h.longitude)
        .map(h => ({ ...h, distance: loc?getDistance(loc[0],loc[1],h.latitude,h.longitude):null }))
        .sort((a,b) => (a.distance??999)-(b.distance??999))
    )
    if (userLocation !== undefined) process(userLocation)
  }, [userLocation, hospitals])

  const handleSearch = async () => {
    if (!search.trim()) return
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search+', Lebanon')}&format=json&limit=1`)
    const data = await res.json()
    if (data.length) { const nl=[parseFloat(data[0].lat),parseFloat(data[0].lon)]; setUserLocation(nl); setMapCenter(nl) }
  }

  const compatibleTypes = patientBloodType ? compatibleBloodForPatient[patientBloodType] : []
  const filteredHospitals = sortedHospitals.filter(h => h.blood_stock && compatibleTypes.some(bt => (h.blood_stock[bt]??0)>0))
  const fact = patientBloodType ? BLOOD_FACTS[patientBloodType] : null

  const fadeUp = (delay=0) => ({ opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(24px)', transition:`opacity .6s ease ${delay}s, transform .6s ease ${delay}s` })

  /* ════════ BLOOD TYPE SELECTION SCREEN ════════ */
  if (!bloodTypeSelected) return (
    <div className="em-root">
      <ParticleField />
      <Orbs set={[
        { t:'4%', l:'4%', w:'min(500px,42vw)', c:'rgba(211,47,47,.18)', d:'0s' },
        { b:'8%', r:'6%', w:'min(560px,46vw)', c:'rgba(64,88,120,.14)', d:'-3s' },
        { t:'40%', r:'12%', w:'min(340px,30vw)', c:'rgba(255,235,238,.55)', d:'-6s' },
        { b:'2%', l:'15%', w:'min(260px,22vw)', c:'rgba(64,88,120,.2)', d:'-4s' },
      ]}/>

      <LiveTicker />

      <div style={{ position:'relative', zIndex:10, maxWidth:1360, margin:'0 auto', padding:'clamp(24px,4vw,56px) clamp(16px,3.5vw,44px)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(28px,5vw,80px)', alignItems:'center', minHeight:'calc(100vh - 42px)' }} className="em-sel-grid">

        {/* LEFT hero */}
        <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:.7, type:'spring' }} style={{ display:'flex', flexDirection:'column', gap:'clamp(18px,2.5vw,32px)' }} className="em-sel-hero">

          <div style={fadeUp(0)}>
            <div className="em-glass" style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'8px 20px', borderRadius:9999, border:'1px solid rgba(211,47,47,.18)', width:'fit-content' }}>
              <span style={{ position:'relative', display:'inline-flex', width:12, height:12 }}>
                <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#dc2626', opacity:.75, animation:'em-ping 1.2s cubic-bezier(0,0,.2,1) infinite' }}/>
                <span style={{ position:'relative', width:12, height:12, borderRadius:'50%', background:'#dc2626', boxShadow:'0 0 12px #dc2626', display:'inline-flex' }}/>
              </span>
              <span style={{ color:'#dc2626', fontWeight:900, fontSize:10, letterSpacing:'.2em', textTransform:'uppercase' }}>EMERGENCY MATCHING ACTIVE</span>
            </div>
          </div>

          <div style={fadeUp(.1)}>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(36px,5.5vw,72px)', lineHeight:.93, fontWeight:900, color:'#dc2626', margin:0 }}>
              Find Blood.<br/><em style={{ color:'#991b1b', fontStyle:'italic' }}>Save a Life.</em>
            </h1>
          </div>

          <div style={fadeUp(.2)}>
            <p style={{ fontSize:'clamp(13px,1.3vw,16px)', color:'rgba(211,47,47,.7)', fontWeight:600, maxWidth:480, lineHeight:1.65, margin:0 }}>
              Select the patient's blood type and we'll instantly locate every hospital in Lebanon carrying compatible blood — sorted by distance in real time.
            </p>
          </div>

          {/* Drop visual card */}
          <div style={fadeUp(.3)}>
            <div className="em-glass-deep em-card-hover" style={{ borderRadius:'clamp(24px,3.5vw,44px)', height:'clamp(240px,28vw,360px)', border:'2px solid rgba(211,47,47,.12)', overflow:'hidden', position:'relative' }}>
              <BloodDropHero bloodType={patientBloodType} />
              <div className="em-stat-float-a em-glass" style={{ position:'absolute', top:'6%', right:'4%', borderRadius:18, padding:'12px 16px', border:'2px solid rgba(211,47,47,.15)', minWidth:120 }}>
                <p style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.4)', letterSpacing:'.2em', textTransform:'uppercase', margin:0 }}>RESPONSE TIME</p>
                <p style={{ fontSize:22, fontWeight:900, color:'#dc2626', margin:'4px 0 0' }}>8.4<span style={{ fontSize:11, opacity:.6 }}>min</span></p>
              </div>
              <div className="em-stat-float-b em-glass" style={{ position:'absolute', bottom:'6%', left:'4%', borderRadius:18, padding:'10px 14px', border:'2px solid rgba(64,88,120,.2)', minWidth:100 }}>
                <p style={{ fontSize:8, fontWeight:900, color:'rgba(153,27,27,.5)', letterSpacing:'.2em', textTransform:'uppercase', margin:0 }}>HOSPITALS</p>
                <p style={{ fontSize:20, fontWeight:900, color:'#991b1b', margin:'3px 0 0' }}>142+</p>
              </div>
            </div>
          </div>

          {/* Blood fact panel */}
          <AnimatePresence>
            {fact && (
              <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:14 }}
                className="em-glass" style={{ borderRadius:22, padding:'16px 20px', border:'2px solid rgba(211,47,47,.12)' }}>
                <p style={{ fontSize:9, fontWeight:900, color:'rgba(211,47,47,.4)', letterSpacing:'.2em', textTransform:'uppercase', margin:'0 0 12px' }}>{patientBloodType} — BLOOD PROFILE</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px 16px' }}>
                  {[{ label:'Population', val:fact.pop }, { label:'Donates to', val:fact.donate }, { label:'Special', val:fact.special }].map(({ label, val }) => (
                    <div key={label}>
                      <p style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.35)', letterSpacing:'.15em', textTransform:'uppercase', margin:'0 0 3px' }}>{label}</p>
                      <p style={{ fontSize:12, fontWeight:900, color:'#dc2626', margin:0 }}>{val}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* RIGHT form */}
        <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:.7, type:'spring', delay:.1 }}>
          <div className="em-glass-deep" style={{ borderRadius:'clamp(32px,4vw,52px)', padding:'clamp(28px,4vw,52px)', border:'2px solid rgba(211,47,47,.12)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,#dc2626,#991b1b,transparent)' }}/>
            <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180, background:'rgba(255,235,238,.6)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' }}/>

            <motion.div initial={{ scale:.7, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:.3, type:'spring', stiffness:180 }}
              style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
              <div style={{ position:'relative', width:76, height:76 }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(211,47,47,.12)', animation:'em-ping 2s infinite' }}/>
                <div style={{ width:76, height:76, borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 14px 36px rgba(211,47,47,.45)' }}>
                  <svg viewBox="0 0 100 130" style={{ width:34, height:34, fill:'#faf7f7' }}><path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z"/></svg>
                </div>
              </div>
            </motion.div>

            <div style={{ textAlign:'center', marginBottom:26 }}>
              <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(22px,3vw,34px)', fontWeight:900, color:'#dc2626', margin:'0 0 10px', lineHeight:1.1 }}>Emergency Blood Finder</h2>
              <p style={{ fontSize:'clamp(11px,1.1vw,13px)', color:'rgba(211,47,47,.6)', fontWeight:600, margin:0, lineHeight:1.65 }}>What is the patient's blood type? We'll show only hospitals that have compatible blood available.</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:22 }}>
              {BLOOD_TYPES.map((bt,i) => (
                <motion.button key={bt} initial={{ opacity:0, scale:.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:.15+i*.05, type:'spring' }}
                  onClick={() => setPatientBloodType(bt)} className={`em-blood-chip${patientBloodType===bt?' selected':''}`}>
                  {bt}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {patientBloodType && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} style={{ overflow:'hidden', marginBottom:20 }}>
                  <div className="em-glass" style={{ background:'rgba(255,235,238,.5)', border:'2px solid rgba(211,47,47,.15)', borderRadius:18, padding:'14px 18px' }}>
                    <p style={{ fontSize:9, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.18em', margin:'0 0 10px' }}>Compatible for <span style={{ color:'#dc2626' }}>{patientBloodType}</span> patient</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                      {compatibleBloodForPatient[patientBloodType].map(bt => (
                        <span key={bt} style={{ background:'rgba#991b1b', color:'#dc2626', fontSize:12, fontWeight:900, padding:'4px 12px', borderRadius:9, border:'1px solid rgba(211,47,47,.2)' }}>{bt}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={() => patientBloodType && setBloodTypeSelected(true)} disabled={!patientBloodType}
              className="em-btn em-btn-primary"
              style={{ width:'100%', padding:'clamp(14px,1.8vw,20px)', borderRadius:20, fontSize:'clamp(13px,1.4vw,16px)', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              <svg viewBox="0 0 24 24" style={{ width:18, height:18, fill:'#faf7f7' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Find Compatible Hospitals 🚨
            </button>

            <div style={{ display:'flex', justifyContent:'center', gap:5, marginTop:20 }}>
              {['A+','O-','B+','AB+'].map((t,i) => (
                <div key={t} className="em-glass" style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:900, color:'#dc2626', border:'2px solid rgba(211,47,47,.18)', marginLeft:i===0?0:-9, zIndex:4-i }}>{t}</div>
              ))}
              <span style={{ marginLeft:8, fontSize:9, fontWeight:900, color:'rgba(211,47,47,.45)', textTransform:'uppercase', letterSpacing:'.16em', display:'flex', alignItems:'center' }}>Network Live</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )

  /* ════════ LOADING ════════ */
  if (userLocation === undefined) return (
    <div className="em-root" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <ParticleField />
      <motion.div initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }} className="em-glass-deep"
        style={{ borderRadius:36, padding:52, textAlign:'center', border:'2px solid rgba(211,47,47,.12)', position:'relative', zIndex:10 }}>
        <div style={{ width:56, height:56, border:'4px solid rgba(211,47,47,.15)', borderTopColor:'#dc2626', borderRadius:'50%', animation:'em-spin 1s linear infinite', margin:'0 auto 20px' }}/>
        <p style={{ color:'rgba(211,47,47,.7)', fontWeight:700, margin:0, fontSize:15 }}>Getting your location...</p>
      </motion.div>
    </div>
  )

  /* ════════ RESULTS SCREEN ════════ */
  return (
    <div className="em-root">
      <ParticleField />
      <Orbs set={[
        { t:'3%', l:'3%', w:'min(380px,32vw)', c:'rgba(211,47,47,.12)', d:'0s' },
        { b:'5%', r:'5%', w:'min(430px,36vw)', c:'rgba(153,27,27,.11)', d:'-3s' },
        { t:'45%', l:'42%', w:'min(280px,24vw)', c:'rgba(255,235,238,.4)', d:'-5s' },
      ]}/>

      <LiveTicker />

      <div style={{ position:'relative', zIndex:10, maxWidth:1360, margin:'0 auto', padding:'clamp(14px,2vw,28px) clamp(16px,3.5vw,44px)' }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}
          className="em-glass-deep"
          style={{ borderRadius:'clamp(20px,2.5vw,32px)', padding:'clamp(14px,1.8vw,22px) clamp(18px,2.2vw,28px)', border:'2px solid rgba(211,47,47,.12)', marginBottom:14, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,#dc2626,#991b1b,transparent)' }}/>

          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:'clamp(10px,1.8vw,24px)' }} className="em-header-grid">
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ position:'relative', width:50, height:50, flexShrink:0 }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(211,47,47,.15)', animation:'em-ping 2s infinite' }}/>
                <div style={{ width:50, height:50, borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 10px 28px rgba(211,47,47,.4)' }}>
                  <span style={{ fontSize:22 }}>🚨</span>
                </div>
              </div>
              <div>
                <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(15px,2vw,22px)', fontWeight:900, color:'#dc2626', margin:0, lineHeight:1.1 }}>Emergency — Find Hospital</h1>
                {patientBloodType && (
                  <p style={{ fontSize:11, color:'rgba(211,47,47,.6)', margin:'3px 0 0', fontWeight:700 }}>
                    Compatible blood for{' '}
                    <span style={{ color:'#dc2626', fontWeight:900, background:'rgba#991b1b', padding:'1px 7px', borderRadius:6 }}>{patientBloodType}</span>{' '}patient
                  </p>
                )}
              </div>
            </div>

            <div style={{ display:'flex', gap:10 }} className="em-header-search">
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleSearch()} placeholder="Search your location in Lebanon..." className="em-input" style={{ margin:0 }}/>
              <button onClick={handleSearch} className="em-btn em-btn-primary" style={{ padding:'14px 24px', borderRadius:16, fontSize:13, fontWeight:900, flexShrink:0 }}>Go</button>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div className="em-glass" style={{ padding:'8px 14px', borderRadius:14, border:'1px solid rgba(211,47,47,.15)', textAlign:'center' }}>
                <p style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.4)', letterSpacing:'.18em', textTransform:'uppercase', margin:0 }}>{filteredHospitals.length} FOUND</p>
              </div>
              <button onClick={() => { setBloodTypeSelected(false); setPatientBloodType('') }}
                className="em-btn em-glass" style={{ padding:'10px 16px', borderRadius:13, fontSize:11, fontWeight:900, color:'#dc2626', border:'2px solid rgba(211,47,47,.15)' }}>
                Change
              </button>
            </div>
          </div>
        </motion.div>

        {/* 2-col main layout */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:14, alignItems:'start' }} className="em-results-grid">

          {/* LEFT — list */}
          <motion.div initial={{ opacity:0, x:-18 }} animate={{ opacity:1, x:0 }} transition={{ delay:.1, duration:.5 }}>
            <div className="em-glass" style={{ display:'flex', gap:8, padding:6, borderRadius:20, border:'2px solid rgba#991b1b', marginBottom:12 }}>
              <button onClick={() => setShowMap(false)} className={`em-toggle-btn ${!showMap?'active':'inactive'}`}>📋 Hospital List</button>
              <button onClick={() => setShowMap(true)}  className={`em-toggle-btn ${showMap?'active':'inactive'}`}>🗺️ Map View</button>
            </div>

            <div className="em-glass" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', borderRadius:14, border:'1px solid rgba#991b1b', marginBottom:12 }}>
              <span style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.15em' }}>Stock level</span>
              <div style={{ display:'flex', gap:14 }}>
                {[{ c:'#ea580c', l:'Low (≤5)' }, { c:'#16a34a', l:'Available' }].map(({ c, l }) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:c, boxShadow:`0 0 6px ${c}`, display:'inline-block', animation:'em-pulse 2s infinite' }}/>
                    <span style={{ fontSize:11, fontWeight:700, color:'rgba(211,47,47,.5)' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ maxHeight:'calc(100vh - 310px)', overflowY:'auto', paddingRight:2 }}>
              {loadingHospitals ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'52px 0', gap:14 }}>
                  <div style={{ width:50, height:50, border:'4px solid rgba(211,47,47,.12)', borderTopColor:'#dc2626', borderRadius:'50%', animation:'em-spin 1s linear infinite' }}/>
                  <p style={{ color:'rgba(211,47,47,.5)', fontWeight:700, margin:0, fontSize:13 }}>Finding hospitals...</p>
                </div>
              ) : filteredHospitals.length === 0 ? (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="em-glass"
                  style={{ borderRadius:22, padding:'36px 24px', textAlign:'center', border:'2px solid rgba#991b1b' }}>
                  <div style={{ fontSize:42, marginBottom:12 }}>😔</div>
                  <p style={{ fontWeight:900, color:'#dc2626', fontSize:14, margin:'0 0 6px' }}>No hospitals found</p>
                  <p style={{ fontSize:12, color:'rgba(211,47,47,.5)', fontWeight:600, margin:0, lineHeight:1.6 }}>Try searching a different location or call hospitals directly.</p>
                </motion.div>
              ) : filteredHospitals.map((h,i) => <HospitalCard key={h.id} h={h} index={i} compatibleTypes={compatibleTypes}/>)}
            </div>
          </motion.div>

          {/* RIGHT — map or info panel */}
          <motion.div initial={{ opacity:0, x:18 }} animate={{ opacity:1, x:0 }} transition={{ delay:.15, duration:.5 }}>
            <AnimatePresence mode="wait">
              {!showMap ? (
                <motion.div key="info" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
                  <div className="em-glass-deep" style={{ borderRadius:28, border:'2px solid rgba(211,47,47,.12)', overflow:'hidden', position:'relative' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,#991b1b,transparent)' }}/>
                    <div style={{ height:'clamp(190px,21vw,270px)', position:'relative' }}>
                      <BloodDropHero bloodType={patientBloodType} />
                    </div>
                    <div style={{ padding:'clamp(14px,1.8vw,24px)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      {[
                        { label:'Avg Response', val:'8.4 min', icon:'⚡' },
                        { label:'Active Centers', val:'4,200+', icon:'🏥' },
                        { label:'Compatible Types', val:compatibleTypes.length, icon:'🩸' },
                        { label:'Network Status', val:'LIVE', icon:'📡' },
                      ].map(({ label, val, icon }) => (
                        <div key={label} className="em-glass em-card-hover" style={{ borderRadius:16, padding:'12px 14px', border:'2px solid rgba#991b1b' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                            <span style={{ fontSize:16 }}>{icon}</span>
                            <p style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.18em', margin:0 }}>{label}</p>
                          </div>
                          <p style={{ fontSize:'clamp(16px,1.9vw,22px)', fontWeight:900, color:'#dc2626', margin:0 }}>{val}</p>
                        </div>
                      ))}
                    </div>
                    {patientBloodType && (
                      <div style={{ padding:'0 clamp(14px,1.8vw,24px) clamp(14px,1.8vw,22px)' }}>
                        <div className="em-glass" style={{ borderRadius:16, padding:'12px 16px', border:'2px solid rgba#991b1b' }}>
                          <p style={{ fontSize:9, fontWeight:900, color:'rgba(211,47,47,.4)', letterSpacing:'.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Compatible donor types</p>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                            {compatibleTypes.map(bt => (
                              <span key={bt} style={{ background:'linear-gradient(135deg,rgba#991b1b,rgba(153,27,27,.07))', color:'#dc2626', fontSize:12, fontWeight:900, padding:'5px 13px', borderRadius:9, border:'1.5px solid rgba(211,47,47,.2)' }}>{bt}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="map" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                  style={{ borderRadius:28, overflow:'hidden', border:'2px solid rgba(211,47,47,.15)', boxShadow:'0 24px 60px rgba#991b1b', height:'calc(100vh - 260px)' }}>
                  {userLocation && (
                    <MapContainer center={userLocation} zoom={13} style={{ height:'100%', width:'100%' }}>
                      <RecenterMap center={mapCenter||userLocation} />
                      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                      <Marker position={userLocation}><Popup>📍 Your Location</Popup></Marker>
                      {filteredHospitals.filter(h => h.latitude&&h.longitude).map(h => (
                        <Marker key={h.id} position={[parseFloat(h.latitude),parseFloat(h.longitude)]} icon={hospitalIcon}
                          eventHandlers={{
                            mouseover: function(e) {
                              this.openPopup()
                            },
                            mouseout: function(e) {
                              this.closePopup()
                            }
                          }}>
                          <Popup>
                            <div style={{ minWidth:180 }}>
                              <p style={{ fontWeight:'bold', color:'#dc2626', marginBottom:2 }}>{h.name}</p>
                              <p style={{ fontSize:11, color:'#6b7280', marginBottom:6 }}>{h.address}</p>
                              <p style={{ fontSize:11, fontWeight:'bold', marginBottom:3 }}>Compatible Blood:</p>
                              <div style={{ display:'flex', flexWrap:'wrap', gap:2, marginBottom:6 }}>
                                {compatibleTypes.filter(bt => (h.blood_stock?.[bt]??0)>0).map(bt => {
                                  const u=h.blood_stock?.[bt]??0
                                  return <span key={bt} style={{ fontSize:10, padding:'1px 4px', borderRadius:4, fontWeight:'bold', background:u<=5?'rgba(110,32,22,.12)':'#dcfce7', color:u<=5?'#ea580c':'#16a34a' }}>{bt}: {u}</span>
                                })}
                              </div>
                              <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name)}/@${h.latitude},${h.longitude},15z`} target="_blank" rel="noopener noreferrer" style={{ color:'#dc2626', fontSize:12, fontWeight:'bold' }}>Get Directions →</a>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Emergency