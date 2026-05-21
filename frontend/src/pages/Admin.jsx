import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const API = 'https://blood-bank-eqyr.onrender.com'

/* ─── Premium Admin Styles (matching home page aesthetic) ─────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes pulse-ring { 0% { transform:scale(.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes shimmer { 0%,100% { opacity:.5; } 50% { opacity:1; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }

  .ad-root {
    min-height:100vh;
    background:linear-gradient(135deg,#f8f8f8 0%,#efefef 25%,#e8e8e8 50%,#f2f2f2 75%,#f8f8f8 100%);
    background-size:400% 400%;
    animation:gradient-shift 15s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
    color:#380101;
    zoom: 0.85;
  }

  .ad-glass {
    background:rgba(255,255,255,.6);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(180,180,180,.2);
    box-shadow:0 8px 32px rgba(0,0,0,.08);
  }
  
  .ad-glass-deep {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(180,180,180,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.1),inset 0 1px 1px rgba(255,255,255,.3);
  }

  .ad-header {
    position:sticky;top:0;z-index:50;
    background:rgba(248,248,248,.85);
    backdrop-filter:blur(20px) saturate(200%);
    -webkit-backdrop-filter:blur(20px) saturate(200%);
    border-bottom:1px solid rgba(180,180,180,.15);
    box-shadow:0 4px 30px rgba(0,0,0,.08);
  }
  
  .ad-header-inner {
    max-width:1360px;margin:0 auto;
    display:flex;justify-content:space-between;align-items:center;
    padding:14px clamp(16px,3.5vw,44px);
    gap:clamp(16px,2.5vw,32px);
  }

  .ad-btn {
    position:relative;overflow:hidden;cursor:pointer;
    border:none;outline:none;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
  }

  .ad-btn::before {
    content:'';position:absolute;top:0;left:-100%;
    width:100%;height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
    transition:left .5s;
  }

  .ad-btn:hover::before { left:100%; }

  .ad-btn-primary {
    background:linear-gradient(135deg,#dc2626 0%,#991b1b 50%,#7f1d1d 100%);
    color:#faf7f7;
    box-shadow:0 10px 30px rgba(220,38,38,.35);
    border:1px solid rgba(255,255,255,.15);
  }

  .ad-btn-primary:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 20px 60px rgba(220,38,38,.5);
  }

  .ad-btn-secondary {
    background:rgba(255,255,255,.7);
    backdrop-filter:blur(10px);
    border:1.5px solid rgba(180,180,180,.3) !important;
    color:#380101;
  }

  .ad-btn-secondary:hover {
    background:rgba(255,255,255,.85);
    border-color:rgba(180,180,180,.5) !important;
    transform:translateY(-2px);
  }

  .ad-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .ad-card-hover {
    transition:all .4s cubic-bezier(.22,1,.36,1);
  }

  .ad-card-hover:hover {
    transform:translateY(-8px) scale(1.02);
    box-shadow:0 32px 80px rgba(220,38,38,.2) !important;
  }

  .ad-input {
    background:rgba(255,255,255,.6);
    backdrop-filter:blur(20px);
    border:1.5px solid rgba(180,180,180,.3);
    color:#380101;
    font-family:'Plus Jakarta Sans',sans-serif;
    transition:all .3s cubic-bezier(.22,1,.36,1);
  }

  .ad-input:focus {
    background:rgba(255,255,255,.8);
    border-color:rgba(220,38,38,.5);
    box-shadow:0 8px 24px rgba(220,38,38,.12);
    outline:none;
  }

  .ad-tab-btn {
    position:relative;overflow:hidden;
    background:rgba(255,255,255,.5);
    border:1.5px solid rgba(180,180,180,.3);
    color:#380101;
    font-weight:700;
    transition:all .3s cubic-bezier(.22,1,.36,1);
  }

  .ad-tab-btn.active {
    background:linear-gradient(135deg,#dc2626,#991b1b);
    color:#faf7f7;
    border-color:transparent;
    box-shadow:0 10px 28px rgba(220,38,38,.3);
  }

  footer {
    border-top:1px solid rgba(140,140,140,.1);
  }

  @media (max-width:960px) {
    .ad-root { zoom: 0.9; }
    .ad-nav-buttons { flex-direction: column; width: 100%; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('ad-styles-premium')) {
  const s = document.createElement('style')
  s.id = 'ad-styles-premium'
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
      {/* Large background orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="ad-float-orb"
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

      {/* Floating dots */}
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

/* ─── Stat Card Component ─────────────────────────────────── */
function StatCard({ icon, value, label, color = '#dc2626', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      className="ad-glass ad-card-hover"
      style={{
        borderRadius: '20px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:16, position:'relative', zIndex:1 }}>
        <div style={{
          width:56,
          height:56,
          background:`linear-gradient(135deg, ${color}15, ${color}25)`,
          borderRadius:16,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          flexShrink:0,
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize:'28px', fontWeight:900, color, margin:0, lineHeight:1 }}>{value}</p>
          <p style={{ fontSize:10, fontWeight:900, color:'rgba(56,1,1,.4)', textTransform:'uppercase', letterSpacing:'.2em', margin:'6px 0 0', lineHeight:1 }}>{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Admin Dashboard ─────────────────────────────────────── */
function Admin() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [donors, setDonors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [requests, setRequests] = useState([])
  const [admins, setAdmins] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' })
  const [adminMessage, setAdminMessage] = useState('')
  const [changePass, setChangePass] = useState({ email: '', old_password: '', new_password: '' })
  const [changePassMessage, setChangePassMessage] = useState('')
  const [editHospital, setEditHospital] = useState(null)
  const [newHospital, setNewHospital] = useState({ name: '', email: '', password: '', address: '', latitude: '', longitude: '' })
  const [hospitalMessage, setHospitalMessage] = useState('')
  const [hospitalSearch, setHospitalSearch] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  useEffect(() => {
    const adminData = localStorage.getItem('adminData')
    if (adminData) {
      setAuthed(true)
      loadData()
    } else {
      navigate('/login')
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [d, h, r, a] = await Promise.all([
        axios.get(`${API}/api/admin/donors`),
        axios.get(`${API}/api/admin/hospitals`),
        axios.get(`${API}/api/admin/requests`),
        axios.get(`${API}/api/admin/admins`)
      ])
      setDonors(d.data)
      setHospitals(h.data)
      setRequests(r.data)
      setAdmins(a.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteDonor = async (id) => {
    if (!window.confirm('Delete this donor?')) return
    await axios.delete(`${API}/api/admin/donors/${id}`)
    setDonors(donors.filter(d => d.id !== id))
  }

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return
    await axios.delete(`${API}/api/admin/requests/${id}`)
    setRequests(requests.filter(r => r.id !== id))
  }

  const deleteAdmin = async (id) => {
    if (!window.confirm('Delete this admin?')) return
    await axios.delete(`${API}/api/admin/admins/${id}`)
    setAdmins(admins.filter(a => a.id !== id))
  }

  const addAdmin = async (e) => {
    e.preventDefault()
    setAdminMessage('')
    try {
      await axios.post(`${API}/api/admin/add-admin`, newAdmin)
      setAdminMessage('✅ Admin added successfully!')
      setNewAdmin({ email: '', password: '' })
      const res = await axios.get(`${API}/api/admin/admins`)
      setAdmins(res.data)
    } catch (err) {
      setAdminMessage(err.response?.data?.message || 'Failed to add admin')
    }
  }

  const addHospital = async (e) => {
    e.preventDefault()
    setHospitalMessage('')
    try {
      await axios.post(`${API}/api/admin/add-hospital`, newHospital)
      setHospitalMessage('✅ Hospital added successfully!')
      setNewHospital({ name: '', email: '', password: '', address: '', latitude: '', longitude: '' })
      const res = await axios.get(`${API}/api/admin/hospitals`)
      setHospitals(res.data)
    } catch (err) {
      setHospitalMessage(err.response?.data?.message || 'Failed to add hospital')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setChangePassMessage('')
    try {
      const res = await axios.put(`${API}/api/admin/change-password`, changePass)
      setChangePassMessage(res.data.message)
      setChangePass({ email: '', old_password: '', new_password: '' })
    } catch (err) {
      setChangePassMessage(err.response?.data?.message || 'Failed to change password')
    }
  }

  const deleteHospital = async (id) => {
    if (!window.confirm('Delete this hospital?')) return
    await axios.delete(`${API}/api/admin/hospitals/${id}`)
    setHospitals(hospitals.filter(h => h.id !== id))
  }

  const saveHospital = async (id) => {
    try {
      await axios.put(`${API}/api/admin/hospitals/${id}`, editHospital)
      setEditHospital(null)
      const res = await axios.get(`${API}/api/admin/hospitals`)
      setHospitals(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminData')
    navigate('/login')
  }

  if (!authed) return null

  const eligibleDonors = donors.filter(d => d.is_eligible).length
  const pendingRequests = requests.filter(r => r.status === 'pending').length
  const bloodTypeStats = requests.reduce((acc, r) => {
    if (r.status === 'pending') acc[r.blood_type] = (acc[r.blood_type] || 0) + 1
    return acc
  }, {})
  const mostNeeded = Object.entries(bloodTypeStats).sort((a, b) => b[1] - a[1])[0]

  const tabs = ['overview', 'donors', 'hospitals', 'requests', 'admins', 'settings']

  return (
    <div className="ad-root">
      <AnimatedBackgroundOrbs />

      {/* Header */}
      <motion.header
        className="ad-header"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)', transition: 'transform .6s cubic-bezier(.22,1,.36,1)' }}
      >
        <div className="ad-header-inner">
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
                  <linearGradient id="navBlood" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="50%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                </defs>
                <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill="url(#navBlood)" opacity="0.95" />
                <ellipse cx="32" cy="65" rx="16" ry="22" fill="#faf7f7" opacity="0.2" />
              </svg>
            </motion.div>
            
              <div>
              <motion.div style={{ fontSize: 22, fontWeight: 900, color: '#dc2626' }} animate={{ letterSpacing: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                BloodConnect
              </motion.div>
             
              <div style={{ fontSize: 10, color: 'rgba(56,1,1,.5)', fontWeight: 700, letterSpacing: '.1em' }}>ADMIN PANEL</div>
            </div>
          </motion.div>

          <div style={{ flex: 1 }} />

          <div className="ad-nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Hospital Partners Navigation */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={() => navigate('/hospital-partners')}
              className="ad-btn ad-btn-secondary"
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.92 }}
              style={{
                padding: '13px 24px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Hospital Partners
            </motion.button>

            {/* Logout */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onClick={handleLogout}
              className="ad-btn ad-btn-primary"
              whileHover={{ scale: 1.08, boxShadow: '0 20px 60px rgba(220,38,38,.6)' }}
              whileTap={{ scale: 0.92 }}
              style={{
                padding: '13px 26px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>


      <main style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: 1360,
        margin: '0 auto',
        padding: '40px clamp(20px,3vw,50px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '60px',
      }}>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}
        >
          <StatCard
            icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#dc2626' }}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
            value={donors.length}
            label="Total Donors"
            color="#dc2626"
            delay={0.1}
          />
          <StatCard
            icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#22c55e' }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
            value={eligibleDonors}
            label="Eligible Now"
            color="#22c55e"
            delay={0.2}
          />
          <StatCard
            icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#3b82f6' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
            value={hospitals.length}
            label="Hospitals"
            color="#3b82f6"
            delay={0.3}
          />
          <StatCard
            icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#f97316' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>}
            value={pendingRequests}
            label="Active Requests"
            color="#f97316"
            delay={0.4}
          />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
        >
          {tabs.map((t, i) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(t)}
              className={`ad-btn ad-tab-btn ${tab === t ? 'active' : ''}`}
              style={{
                padding: '10px 18px',
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              {t === 'overview' ? 'Overview' :
               t === 'donors' ? `Donors (${donors.length})` :
               t === 'hospitals' ? `Hospitals (${hospitals.length})` :
               t === 'requests' ? `Requests (${requests.length})` :
               t === 'admins' ? `Admins (${admins.length})` :
               'Settings'}
            </motion.button>
          ))}
        </motion.div>

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ad-glass-deep"
            style={{ borderRadius:'28px', padding:'60px', textAlign:'center' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width:70, height:70, margin:'0 auto', border:'4px solid rgba(220,38,38,.2)', borderTopColor:'#dc2626', borderRadius:'50%' }}
            />
            <p style={{ marginTop:20, fontSize:14, fontWeight:700, color:'rgba(56,1,1,.6)' }}>Loading dashboard...</p>
          </motion.div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >

              {/* OVERVIEW */}
              {tab === 'overview' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'32px' }}>

                  {/* Most Needed & Blood Types */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>

                    {/* Most Needed */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="ad-glass-deep ad-card-hover"
                      style={{ borderRadius:'28px', padding:'32px' }}
                    >
                      <h3 style={{ fontSize:20, fontWeight:900, color:'#dc2626', marginBottom:16 }}>Most Needed</h3>
                      {mostNeeded ? (
                        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
                          <div className="ad-glass" style={{ width:90, height:90, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', boxShadow: '0 8px 24px rgba(220,38,38,.15)' }}>
                            <p style={{ fontSize:32, fontWeight:900, color:'#dc2626', margin:0 }}>{mostNeeded[0]}</p>
                          </div>
                          <div>
                            <p style={{ fontSize:16, fontWeight:800, color:'#dc2626' }}>{mostNeeded[1]} request{mostNeeded[1] > 1 ? 's' : ''}</p>
                            <p style={{ fontSize:11, color:'rgba(56,1,1,.5)', marginTop:6 }}>Across hospitals</p>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color:'rgba(56,1,1,.4)', fontSize:13 }}>No active requests</p>
                      )}
                    </motion.div>

                    {/* Blood Types */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="ad-glass-deep ad-card-hover"
                      style={{ borderRadius:'28px', padding:'32px' }}
                    >
                      <h3 style={{ fontSize:20, fontWeight:900, color:'#dc2626', marginBottom:16 }}>Donors by Type</h3>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => {
                          const count = donors.filter(d => d.blood_type === bt).length
                          return (
                            <motion.div
                              key={bt}
                              whileHover={{ scale: 1.1, y: -4 }}
                              className="ad-glass"
                              style={{ borderRadius:14, padding:12, textAlign:'center' }}
                            >
                              <p style={{ fontSize:11, fontWeight:900, color:'#dc2626', margin:0 }}>{bt}</p>
                              <p style={{ fontSize:18, fontWeight:900, color:'rgba(220,38,38,.8)', margin:'4px 0 0' }}>{count}</p>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>

                  </div>

                  {/* Recent Requests */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="ad-glass-deep ad-card-hover"
                    style={{ borderRadius:'28px', padding:'32px' }}
                  >
                    <h3 style={{ fontSize:20, fontWeight:900, color:'#dc2626', marginBottom:16 }}>Recent Requests</h3>
                    {requests.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'40px 0' }}>
                        <p style={{ fontSize:48, margin:0 }}>📭</p>
                        <p style={{ color:'rgba(56,1,1,.4)', fontSize:13, marginTop:12 }}>No requests yet</p>
                      </div>
                    ) : (
                      <div style={{ overflowX:'auto' }}>
                        <table style={{ width:'100%', fontSize:13 }}>
                          <thead>
                            <tr style={{ borderBottom:'2px solid rgba(180,180,180,.2)', textAlign:'left' }}>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Hospital</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Blood Type</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Units</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {requests.slice(0, 5).map(r => (
                              <tr key={r.id} style={{ borderBottom:'1px solid rgba(56,1,1,.05)' }}>
                                <td style={{ padding:'12px 0', fontWeight:600, color:'#dc2626' }}>{r.hospital_name}</td>
                                <td style={{ padding:'12px 0', fontWeight:900, color:'#dc2626' }}>{r.blood_type}</td>
                                <td style={{ padding:'12px 0', fontWeight:600, color:'rgba(56,1,1,.7)' }}>{r.quantity_needed}</td>
                                <td style={{ padding:'12px 0' }}>
                                  <span style={{ padding:'4px 12px', borderRadius:10, fontSize:10, fontWeight:900, background: r.status === 'pending' ? 'rgba(249,115,22,.15)' : 'rgba(34,197,94,.15)', color: r.status === 'pending' ? '#f97316' : '#22c55e' }}>
                                    {r.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>

                </div>
              )}

              {/* DONORS */}
              {tab === 'donors' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ad-glass-deep ad-card-hover"
                  style={{ borderRadius:'28px', padding:'32px' }}
                >
                  <h2 style={{ fontSize:22, fontWeight:900, color:'#dc2626', marginBottom:20 }}>👥 Donors ({donors.length})</h2>
                  {donors.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px 0' }}>
                      <p style={{ fontSize:64, margin:0 }}>👤</p>
                      <p style={{ color:'rgba(56,1,1,.4)', fontSize:14, marginTop:16 }}>No donors yet</p>
                    </div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', fontSize:13 }}>
                        <thead>
                          <tr style={{ borderBottom:'2px solid rgba(180,180,180,.2)', textAlign:'left' }}>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Name</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Email</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Blood Type</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Eligible</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donors.map(d => (
                            <tr key={d.id} style={{ borderBottom:'1px solid rgba(56,1,1,.05)' }}>
                              <td style={{ padding:'12px 0', fontWeight:700, color:'#dc2626' }}>{d.full_name}</td>
                              <td style={{ padding:'12px 0', color:'rgba(56,1,1,.6)' }}>{d.email}</td>
                              <td style={{ padding:'12px 0', fontWeight:900, color:'#dc2626' }}>{d.blood_type}</td>
                              <td style={{ padding:'12px 0', fontSize:16 }}>{d.is_eligible ? '✅' : '❌'}</td>
                              <td style={{ padding:'12px 0' }}>
                                <button onClick={() => deleteDonor(d.id)} style={{ background:'none', border:'none', color:'#dc2626', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {/* HOSPITALS */}
              {tab === 'hospitals' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ad-glass-deep ad-card-hover"
                    style={{ borderRadius:'28px', padding:'32px' }}
                  >
                    <h2 style={{ fontSize:22, fontWeight:900, color:'#dc2626', marginBottom:8 }}>➕ Add Hospital</h2>
                    <p style={{ fontSize:12, color:'rgba(56,1,1,.6)', marginBottom:20 }}>Register a new hospital partner</p>
                    {hospitalMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginBottom:16, fontSize:13, fontWeight:700, color: hospitalMessage.includes('success') ? '#22c55e' : '#dc2626' }}
                      >
                        {hospitalMessage}
                      </motion.p>
                    )}
                    <form onSubmit={addHospital} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
                      <input placeholder="Hospital Name" value={newHospital.name} onChange={e => setNewHospital({...newHospital, name: e.target.value})} className="ad-input" style={{ padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:700 }} required />
                      <input placeholder="email@hospital.com" value={newHospital.email} onChange={e => setNewHospital({...newHospital, email: e.target.value})} className="ad-input" style={{ padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:700 }} required />
                      <input type="password" placeholder="Password" value={newHospital.password} onChange={e => setNewHospital({...newHospital, password: e.target.value})} className="ad-input" style={{ padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:700 }} required />
                      <input placeholder="Address" value={newHospital.address} onChange={e => setNewHospital({...newHospital, address: e.target.value})} className="ad-input" style={{ padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:700 }} />
                      <input placeholder="Latitude" value={newHospital.latitude} onChange={e => setNewHospital({...newHospital, latitude: e.target.value})} className="ad-input" style={{ padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:700 }} />
                      <input placeholder="Longitude" value={newHospital.longitude} onChange={e => setNewHospital({...newHospital, longitude: e.target.value})} className="ad-input" style={{ padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:700 }} />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="ad-btn ad-btn-primary"
                        style={{ gridColumn:'1/-1', padding:14, borderRadius:12, fontSize:13, fontWeight:900 }}
                      >
                        Add Hospital
                      </motion.button>
                    </form>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="ad-glass-deep ad-card-hover"
                    style={{ borderRadius:'28px', padding:'32px' }}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                      <h2 style={{ fontSize:22, fontWeight:900, color:'#dc2626', margin:0 }}>🏥 Hospitals ({hospitals.filter(h => h.name.toLowerCase().includes(hospitalSearch.toLowerCase())).length})</h2>
                      <input placeholder="🔍 Search..." value={hospitalSearch} onChange={e => setHospitalSearch(e.target.value)} className="ad-input" style={{ width:240, padding:'10px 14px', borderRadius:12, fontSize:12, fontWeight:700 }} />
                    </div>
                    {hospitals.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'60px 0' }}>
                        <p style={{ fontSize:64, margin:0 }}>🏥</p>
                        <p style={{ color:'rgba(56,1,1,.4)', fontSize:14, marginTop:16 }}>No hospitals added</p>
                      </div>
                    ) : (
                      <div style={{ overflowX:'auto' }}>
                        <table style={{ width:'100%', fontSize:13 }}>
                          <thead>
                            <tr style={{ borderBottom:'2px solid rgba(180,180,180,.2)', textAlign:'left' }}>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Name</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Email</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Address</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hospitals.filter(h => h.name.toLowerCase().includes(hospitalSearch.toLowerCase())).map(h => (
                              <tr key={h.id} style={{ borderBottom:'1px solid rgba(56,1,1,.05)' }}>
                                <td style={{ padding:'12px 0', fontWeight:700, color:'#dc2626' }}>
                                  {editHospital?.id === h.id ? (
                                    <input value={editHospital.name} onChange={e => setEditHospital({...editHospital, name: e.target.value})} className="ad-input" style={{ padding:'6px 10px' }} />
                                  ) : h.name}
                                </td>
                                <td style={{ padding:'12px 0', color:'rgba(56,1,1,.6)' }}>
                                  {editHospital?.id === h.id ? (
                                    <input value={editHospital.email} onChange={e => setEditHospital({...editHospital, email: e.target.value})} className="ad-input" style={{ padding:'6px 10px' }} />
                                  ) : h.email}
                                </td>
                                <td style={{ padding:'12px 0', color:'rgba(56,1,1,.6)' }}>
                                  {editHospital?.id === h.id ? (
                                    <input value={editHospital.address} onChange={e => setEditHospital({...editHospital, address: e.target.value})} className="ad-input" style={{ padding:'6px 10px' }} />
                                  ) : h.address}
                                </td>
                                <td style={{ padding:'12px 0' }}>
                                  {editHospital?.id === h.id ? (
                                    <div style={{ display:'flex', gap:8 }}>
                                      <button onClick={() => saveHospital(h.id)} style={{ background:'none', border:'none', color:'#22c55e', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>Save</button>
                                      <button onClick={() => setEditHospital(null)} style={{ background:'none', border:'none', color:'rgba(56,1,1,.5)', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>Cancel</button>
                                    </div>
                                  ) : (
                                    <div style={{ display:'flex', gap:8 }}>
                                      <button onClick={() => setEditHospital({...h})} style={{ background:'none', border:'none', color:'#3b82f6', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>Edit</button>
                                      <button onClick={() => deleteHospital(h.id)} style={{ background:'none', border:'none', color:'#dc2626', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>Delete</button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}

              {/* REQUESTS */}
              {tab === 'requests' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ad-glass-deep ad-card-hover"
                  style={{ borderRadius:'28px', padding:'32px' }}
                >
                  <h2 style={{ fontSize:22, fontWeight:900, color:'#dc2626', marginBottom:20 }}>🩸 Requests ({requests.length})</h2>
                  {requests.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px 0' }}>
                      <p style={{ fontSize:64, margin:0 }}>📭</p>
                      <p style={{ color:'rgba(56,1,1,.4)', fontSize:14, marginTop:16 }}>No requests yet</p>
                    </div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', fontSize:13 }}>
                        <thead>
                          <tr style={{ borderBottom:'2px solid rgba(180,180,180,.2)', textAlign:'left' }}>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Hospital</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Blood Type</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Units</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Status</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.map(r => (
                            <tr key={r.id} style={{ borderBottom:'1px solid rgba(56,1,1,.05)' }}>
                              <td style={{ padding:'12px 0', fontWeight:700, color:'#dc2626' }}>{r.hospital_name}</td>
                              <td style={{ padding:'12px 0', fontWeight:900, color:'#dc2626' }}>{r.blood_type}</td>
                              <td style={{ padding:'12px 0', fontWeight:600, color:'rgba(56,1,1,.7)' }}>{r.quantity_needed}</td>
                              <td style={{ padding:'12px 0' }}>
                                <span style={{ padding:'4px 12px', borderRadius:10, fontSize:10, fontWeight:900, background: r.status === 'pending' ? 'rgba(249,115,22,.15)' : 'rgba(34,197,94,.15)', color: r.status === 'pending' ? '#f97316' : '#22c55e' }}>
                                  {r.status}
                                </span>
                              </td>
                              <td style={{ padding:'12px 0' }}>
                                <button onClick={() => deleteRequest(r.id)} style={{ background:'none', border:'none', color:'#dc2626', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ADMINS */}
              {tab === 'admins' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ad-glass-deep ad-card-hover"
                    style={{ borderRadius:'28px', padding:'32px' }}
                  >
                    <h2 style={{ fontSize:22, fontWeight:900, color:'#dc2626', marginBottom:8 }}>➕ Add Admin</h2>
                    <p style={{ fontSize:12, color:'rgba(56,1,1,.6)', marginBottom:20 }}>Email must end with @bloodconnect.com</p>
                    {adminMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginBottom:16, fontSize:13, fontWeight:700, color: adminMessage.includes('successfully') ? '#22c55e' : '#dc2626' }}
                      >
                        {adminMessage}
                      </motion.p>
                    )}
                    <form onSubmit={addAdmin} style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                      <input placeholder="email@bloodconnect.com" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="ad-input" style={{ flex:1, minWidth:200, padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:700 }} required />
                      <input type="password" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="ad-input" style={{ flex:1, minWidth:200, padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:700 }} required />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="ad-btn ad-btn-primary"
                        style={{ padding:'12px 32px', borderRadius:12, fontSize:13, fontWeight:900 }}
                      >
                        Add Admin
                      </motion.button>
                    </form>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="ad-glass-deep ad-card-hover"
                    style={{ borderRadius:'28px', padding:'32px' }}
                  >
                    <h2 style={{ fontSize:22, fontWeight:900, color:'#dc2626', marginBottom:20 }}>🔐 Admins ({admins.length})</h2>
                    <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', fontSize:13 }}>
                        <thead>
                          <tr style={{ borderBottom:'2px solid rgba(180,180,180,.2)', textAlign:'left' }}>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Username</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Email</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Created At</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(56,1,1,.5)' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {admins.map(a => (
                            <tr key={a.id} style={{ borderBottom:'1px solid rgba(56,1,1,.05)' }}>
                              <td style={{ padding:'12px 0', fontWeight:700, color:'#dc2626' }}>{a.username}</td>
                              <td style={{ padding:'12px 0', color:'rgba(56,1,1,.6)' }}>{a.email}</td>
                              <td style={{ padding:'12px 0', color:'rgba(56,1,1,.5)' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                              <td style={{ padding:'12px 0' }}>
                                <button onClick={() => deleteAdmin(a.id)} style={{ background:'none', border:'none', color:'#dc2626', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* SETTINGS */}
              {tab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ad-glass-deep ad-card-hover"
                  style={{ borderRadius:'28px', padding:'32px', maxWidth:600, margin:'0 auto' }}
                >
                  <h2 style={{ fontSize:22, fontWeight:900, color:'#dc2626', marginBottom:20 }}>🔑 Change Password</h2>
                  {changePassMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginBottom:16, fontSize:13, fontWeight:700, color: changePassMessage.includes('success') ? '#22c55e' : '#dc2626' }}
                    >
                      {changePassMessage}
                    </motion.p>
                  )}
                  <form onSubmit={handleChangePassword} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <input placeholder="Your email (@bloodconnect.com)" value={changePass.email} onChange={e => setChangePass({...changePass, email: e.target.value})} className="ad-input" style={{ padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:700 }} required />
                    <input type="password" placeholder="Old password" value={changePass.old_password} onChange={e => setChangePass({...changePass, old_password: e.target.value})} className="ad-input" style={{ padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:700 }} required />
                    <input type="password" placeholder="New password" value={changePass.new_password} onChange={e => setChangePass({...changePass, new_password: e.target.value})} className="ad-input" style={{ padding:'12px 16px', borderRadius:12, fontSize:13, fontWeight:700 }} required />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="ad-btn ad-btn-primary"
                      style={{ padding:14, borderRadius:12, fontSize:13, fontWeight:900, marginTop:8 }}
                    >
                      Change Password
                    </motion.button>
                  </form>
                </motion.div>
              )}

            </motion.div>
          </AnimatePresence>
        )}

      </main>

      {/* Footer */}
      <motion.footer
        className="ad-glass"
        style={{
          marginTop: 'clamp(60px,8vw,120px)',
          borderTop: '1px solid rgba(180,180,180,.15)',
          background: 'rgba(255,255,255,.3)',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(44px,5vw,72px) clamp(16px,3.5vw,44px)', textAlign: 'center' }}>
          <p style={{ color: 'rgba(56,1,1,.5)', fontSize: 'clamp(9px,.9vw,11px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.18em', margin: 0 }}>
            © 2026 BloodConnect Admin Panel · Dana Ghannam & Lynn Anani · Lebanon
          </p>
        </div>
      </motion.footer>
    </div>
  )
}

export default Admin