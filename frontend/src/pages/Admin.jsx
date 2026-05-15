import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const API = 'https://blood-bank-eqyr.onrender.com'

/* ─── Premium Admin Styles ─────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  @keyframes ad-gradient  { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes ad-particle  { 0%,100% { transform:translateY(0) translateX(0) scale(1); opacity:.25; } 50% { transform:translateY(-22px) translateX(var(--px,6px)) scale(1.15); opacity:.65; } }
  @keyframes ad-orb       { 0%,100% { transform:translateY(0) translateX(0) scale(1); } 33% { transform:translateY(-25px) translateX(18px) scale(1.06); } 66% { transform:translateY(10px) translateX(-12px) scale(.94); } }
  @keyframes ad-pulse     { 0%,100%  { opacity:1; } 50% { opacity:.4; } }
  @keyframes ad-float     { 0%,100%  { transform:translateY(0); } 50% { transform:translateY(-8px); } }
  
  @keyframes ad-blood-flow {
    0% { transform: translateY(-100%) translateX(0); opacity: 0; }
    25% { opacity: 0.7; }
    75% { opacity: 0.7; }
    100% { transform: translateY(100vh) translateX(40px); opacity: 0; }
  }
  
  @keyframes ad-cell-orbit {
    0% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(60px, -40px) rotate(120deg); }
    66% { transform: translate(-50px, -60px) rotate(240deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }

  .ad-root {
    min-height:100vh;
    background:linear-gradient(-45deg,#FFEBEE,#F8F9FA,#FFEBEE,rgba(14,165,233,.25));
    background-size:400% 400%;
    animation:ad-gradient 14s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
  }

  .ad-glass {
    background:rgba(255,255,255,.42);
    backdrop-filter:blur(28px) saturate(180%);
    -webkit-backdrop-filter:blur(28px) saturate(180%);
    border:1px solid rgba(255,255,255,.72);
    box-shadow:0 8px 32px rgba(211,47,47,.07),inset 0 0 20px rgba(255,255,255,.6);
  }

  .ad-glass-deep {
    background:rgba(255,255,255,.35);
    backdrop-filter:blur(40px) contrast(1.1);
    -webkit-backdrop-filter:blur(40px) contrast(1.1);
    border:1px solid rgba(255,255,255,.8);
    box-shadow:0 24px 56px -12px rgba(211,47,47,.08),inset 0 0 36px rgba(255,255,255,.6);
  }

  .ad-orb { 
    position:fixed;
    border-radius:50%;
    filter:blur(100px);
    pointer-events:none;
    animation:ad-orb var(--dur,8s) ease-in-out infinite; 
  }

  .ad-particle { 
    position:fixed;
    border-radius:50%;
    pointer-events:none;
    animation:ad-particle var(--dur,5s) ease-in-out infinite; 
  }

  .ad-blood-drop {
    position:fixed;
    width:12px;
    height:16px;
    border-radius:50% 50% 50% 0;
    pointer-events:none;
    animation:ad-blood-flow var(--dur,8s) linear infinite;
    transform-origin:center;
  }

  .ad-btn {
    position:relative;overflow:hidden;cursor:pointer;
    border:none;outline:none;
    transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s;
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  .ad-btn::after {
    content:'';position:absolute;top:50%;left:50%;
    width:0;height:0;background:rgba(255,255,255,.28);border-radius:50%;
    transform:translate(-50%,-50%);transition:width .4s,height .4s;
  }

  .ad-btn:hover::after { width:300px;height:300px; }
  .ad-btn:hover { transform:translateY(-3px) scale(1.05); }
  .ad-btn:active { transform:scale(.97); }

  .ad-btn-primary {
    background:linear-gradient(135deg,#D32F2F,#ff6b6b);
    color:white;
    box-shadow:0 12px 32px rgba(211,47,47,.32);
  }

  .ad-btn-primary:hover { box-shadow:0 18px 48px rgba(211,47,47,.44); }

  .ad-card-hover { transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s; }
  .ad-card-hover:hover { transform:translateY(-4px) scale(1.01);box-shadow:0 20px 50px rgba(211,47,47,.15) !important; }

  .ad-header {
    position:sticky;
    top:0;
    z-index:40;
    background:rgba(255,255,255,.42);
    backdrop-filter:blur(40px);
    -webkit-backdrop-filter:blur(40px);
    border-bottom:2px solid rgba(211,47,47,.1);
    box-shadow:0 8px 32px rgba(211,47,47,.12);
  }

  .ad-stat-dot {
    display:inline-block;
    width:10px;
    height:10px;
    border-radius:50%;
    animation:ad-pulse 2s ease-in-out infinite;
  }

  .ad-input {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    border:2px solid rgba(211,47,47,.15);
    color:#D32F2F;
    transition:all .28s cubic-bezier(.22,1,.36,1);
  }

  .ad-input:focus {
    background:rgba(255,255,255,.72);
    border-color:rgba(211,47,47,.5);
    box-shadow:0 8px 24px rgba(211,47,47,.12);
  }

  .ad-tab-btn {
    position:relative;overflow:hidden;
    background:rgba(255,255,255,.5);
    border:2px solid rgba(211,47,47,.1);
    color:#D32F2F;
    font-weight:700;
    transition:all .28s cubic-bezier(.22,1,.36,1);
  }

  .ad-tab-btn.active {
    background:linear-gradient(135deg,#D32F2F,#ff6b6b);
    color:white;
    border-color:transparent;
    box-shadow:0 10px 28px rgba(211,47,47,.3);
  }
`

if (typeof document !== 'undefined' && !document.getElementById('ad-styles-premium')) {
  const s = document.createElement('style')
  s.id = 'ad-styles-premium'
  s.textContent = STYLES
  document.head.appendChild(s)
}

/* ─── Advanced Background with Unique Blood Animations ───────────────────────── */
function AdvancedBackground() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    w: Math.random() * 5 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: (Math.random() * 4 + 3).toFixed(1),
    delay: -(Math.random() * 4).toFixed(1),
    px: ((Math.random() * 20 - 10).toFixed(0)) + 'px',
    color: i % 3 === 0 ? 'rgba(211,47,47,.35)' : i % 3 === 1 ? 'rgba(14,165,233,.45)' : 'rgba(255,235,238,.7)',
  }))

  const bloodDrops = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${15 + i * 10}%`,
    dur: (Math.random() * 6 + 8).toFixed(1),
    delay: -(Math.random() * 8).toFixed(1),
    opacity: 0.3 + Math.random() * 0.4,
  }))

  return (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {/* Particles */}
      {particles.map(p => (
        <div
          key={`p-${p.id}`}
          className="ad-particle"
          style={{
            '--dur': `${p.dur}s`,
            '--px': p.px,
            width: p.w, height: p.w,
            left: `${p.left}%`, top: `${p.top}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Flowing Blood Drops - Unique Animation */}
      {bloodDrops.map((drop, i) => (
        <div
          key={`blood-${drop.id}`}
          className="ad-blood-drop"
          style={{
            '--dur': `${drop.dur}s`,
            left: drop.left,
            top: '-20px',
            background: `linear-gradient(180deg, rgba(211,47,47,${drop.opacity}), rgba(255,107,107,${drop.opacity * 0.5}))`,
            filter: 'drop-shadow(0 4px 8px rgba(211,47,47,.3))',
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}

      {/* Floating Orbs */}
      {[
        { t:'8%', l:'8%', w:'min(420px,36vw)', c:'rgba(211,47,47,.17)', d:'0s' },
        { b:'18%', r:'8%', w:'min(480px,40vw)', c:'rgba(14,165,233,.22)', d:'-2s' },
        { t:'50%', r:'10%', w:'min(320px,28vw)', c:'rgba(255,235,238,.35)', d:'-5s' },
      ].map((o, i) => (
        <div
          key={`orb-${i}`}
          className="ad-orb"
          style={{
            '--dur': '12s',
            width: o.w,
            height: o.w,
            background: o.c,
            top: o.t,
            bottom: o.b,
            left: o.l,
            right: o.r,
            animationDelay: o.d,
            zIndex: -1,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Stat Card Component ─────────────────────────────────── */
function StatCard({ icon, value, label, color = '#D32F2F', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      className="ad-glass ad-card-hover"
      style={{
        borderRadius: '20px',
        padding: '24px',
        border: '2px solid rgba(211,47,47,.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, background:'rgba(255,235,238,.5)', borderRadius:'50%', filter:'blur(30px)', pointerEvents:'none' }}/>
      <div style={{ display:'flex', alignItems:'center', gap:16, position:'relative', zIndex:1 }}>
        <div style={{
          width:56,
          height:56,
          background:`rgba(${color === '#D32F2F' ? '211,47,47' : '14,165,233'},.1)`,
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
          <p style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.2em', margin:'6px 0 0', lineHeight:1 }}>{label}</p>
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
      <AdvancedBackground />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="ad-header"
      >
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#D32F2F,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 22, boxShadow: '0 8px 24px rgba(211,47,47,.3)' }}>
              🩸
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#D32F2F', margin: 0, fontFamily: "'Fraunces', serif" }}>BloodConnect</h1>
              <p style={{ fontSize: 10, color: 'rgba(211,47,47,.5)', margin: '4px 0 0', fontWeight: 700, letterSpacing: '.1em' }}>ADMIN CONTROL CENTER</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="ad-btn ad-btn-primary"
            style={{ padding: '10px 24px', borderRadius: 14, fontSize: 13, fontWeight: 900 }}
          >
            Logout
          </motion.button>
        </div>
      </motion.header>

      <main style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: '32px 24px' }}>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 44 }}
        >
          <StatCard
            icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#D32F2F' }}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
            value={donors.length}
            label="Total Donors"
            color="#D32F2F"
            delay={0.1}
          />
          <StatCard
            icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#22C55E' }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
            value={eligibleDonors}
            label="Eligible Now"
            color="#22C55E"
            delay={0.2}
          />
          <StatCard
            icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#3B82F6' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
            value={hospitals.length}
            label="Hospitals"
            color="#3B82F6"
            delay={0.3}
          />
          <StatCard
            icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#F97316' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>}
            value={pendingRequests}
            label="Active Requests"
            color="#F97316"
            delay={0.4}
          />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}
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
                transitionDelay: `${i * 50}ms`
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
            style={{ borderRadius:'28px', padding:'60px', textAlign:'center', border:'2px solid rgba(211,47,47,.1)' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width:70, height:70, margin:'0 auto', border:'4px solid rgba(211,47,47,.2)', borderTopColor:'#D32F2F', borderRadius:'50%' }}
            />
            <p style={{ marginTop:20, fontSize:14, fontWeight:700, color:'rgba(211,47,47,.6)' }}>Loading dashboard...</p>
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
                      style={{ borderRadius:'28px', padding:'32px', border:'2px solid rgba(211,47,47,.1)', position:'relative', overflow:'hidden' }}
                    >
                      <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, background:'rgba(255,235,238,.4)', borderRadius:'50%', filter:'blur(40px)', pointerEvents:'none' }} />
                      
                      <h3 style={{ fontSize:20, fontWeight:900, color:'#D32F2F', marginBottom:16, position:'relative', zIndex:1 }}>🩸 Most Needed Blood Type</h3>
                      {mostNeeded ? (
                        <div style={{ display:'flex', alignItems:'center', gap:18, position:'relative', zIndex:1 }}>
                          <div className="ad-glass" style={{ width:90, height:90, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(211,47,47,.1)', boxShadow: '0 8px 24px rgba(211,47,47,.15)' }}>
                            <p style={{ fontSize:32, fontWeight:900, color:'#D32F2F', margin:0 }}>{mostNeeded[0]}</p>
                          </div>
                          <div>
                            <p style={{ fontSize:16, fontWeight:800, color:'#D32F2F' }}>{mostNeeded[1]} active request{mostNeeded[1] > 1 ? 's' : ''}</p>
                            <p style={{ fontSize:11, color:'rgba(211,47,47,.5)', marginTop:6 }}>Across all hospitals</p>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color:'rgba(211,47,47,.4)', fontSize:13, position:'relative', zIndex:1 }}>No active requests right now</p>
                      )}
                    </motion.div>

                    {/* Blood Types */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="ad-glass-deep ad-card-hover"
                      style={{ borderRadius:'28px', padding:'32px', border:'2px solid rgba(211,47,47,.1)', position:'relative', overflow:'hidden' }}
                    >
                      <div style={{ position:'absolute', top:-40, left:-40, width:160, height:160, background:'rgba(14,165,233,.3)', borderRadius:'50%', filter:'blur(40px)', pointerEvents:'none' }} />
                      
                      <h3 style={{ fontSize:20, fontWeight:900, color:'#D32F2F', marginBottom:16, position:'relative', zIndex:1 }}>📊 Donors by Type</h3>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, position:'relative', zIndex:1 }}>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => {
                          const count = donors.filter(d => d.blood_type === bt).length
                          return (
                            <motion.div
                              key={bt}
                              whileHover={{ scale: 1.1, y: -4 }}
                              className="ad-glass"
                              style={{ borderRadius:14, padding:12, textAlign:'center', border:'2px solid rgba(211,47,47,.1)' }}
                            >
                              <p style={{ fontSize:11, fontWeight:900, color:'#D32F2F', margin:0 }}>{bt}</p>
                              <p style={{ fontSize:18, fontWeight:900, color:'rgba(211,47,47,.8)', margin:'4px 0 0' }}>{count}</p>
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
                    style={{ borderRadius:'28px', padding:'32px', border:'2px solid rgba(211,47,47,.1)', position:'relative', overflow:'hidden' }}
                  >
                    <h3 style={{ fontSize:20, fontWeight:900, color:'#D32F2F', marginBottom:16, position:'relative', zIndex:1 }}>🕐 Recent Blood Requests</h3>
                    {requests.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'40px 0', position:'relative', zIndex:1 }}>
                        <p style={{ fontSize:48, margin:0 }}>📭</p>
                        <p style={{ color:'rgba(211,47,47,.4)', fontSize:13, marginTop:12 }}>No blood requests yet</p>
                      </div>
                    ) : (
                      <div style={{ overflowX:'auto', position:'relative', zIndex:1 }}>
                        <table style={{ width:'100%', fontSize:13 }}>
                          <thead>
                            <tr style={{ borderBottom:'2px solid rgba(211,47,47,.1)', textAlign:'left' }}>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Hospital</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Blood Type</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Units</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {requests.slice(0, 5).map(r => (
                              <tr key={r.id} style={{ borderBottom:'1px solid rgba(211,47,47,.05)' }}>
                                <td style={{ padding:'12px 0', fontWeight:600, color:'#D32F2F' }}>{r.hospital_name}</td>
                                <td style={{ padding:'12px 0', fontWeight:900, color:'#D32F2F' }}>{r.blood_type}</td>
                                <td style={{ padding:'12px 0', fontWeight:600, color:'rgba(211,47,47,.7)' }}>{r.quantity_needed}</td>
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
                  style={{ borderRadius:'28px', padding:'32px', border:'2px solid rgba(211,47,47,.1)', position:'relative', overflow:'hidden' }}
                >
                  <h2 style={{ fontSize:22, fontWeight:900, color:'#D32F2F', marginBottom:20, position:'relative', zIndex:1 }}>👥 Donors ({donors.length})</h2>
                  {donors.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px 0', position:'relative', zIndex:1 }}>
                      <p style={{ fontSize:64, margin:0 }}>👤</p>
                      <p style={{ color:'rgba(211,47,47,.4)', fontSize:14, marginTop:16 }}>No donors registered yet</p>
                    </div>
                  ) : (
                    <div style={{ overflowX:'auto', position:'relative', zIndex:1 }}>
                      <table style={{ width:'100%', fontSize:13 }}>
                        <thead>
                          <tr style={{ borderBottom:'2px solid rgba(211,47,47,.1)', textAlign:'left' }}>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Name</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Email</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Blood Type</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Eligible</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donors.map(d => (
                            <tr key={d.id} style={{ borderBottom:'1px solid rgba(211,47,47,.05)' }}>
                              <td style={{ padding:'12px 0', fontWeight:700, color:'#D32F2F' }}>{d.full_name}</td>
                              <td style={{ padding:'12px 0', color:'rgba(211,47,47,.6)' }}>{d.email}</td>
                              <td style={{ padding:'12px 0', fontWeight:900, color:'#D32F2F' }}>{d.blood_type}</td>
                              <td style={{ padding:'12px 0', fontSize:16 }}>{d.is_eligible ? '✅' : '❌'}</td>
                              <td style={{ padding:'12px 0' }}>
                                <button onClick={() => deleteDonor(d.id)} style={{ background:'none', border:'none', color:'#D32F2F', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>
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
                    style={{ borderRadius:'28px', padding:'32px', border:'2px solid rgba(211,47,47,.1)', position:'relative', overflow:'hidden' }}
                  >
                    <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, background:'rgba(255,235,238,.4)', borderRadius:'50%', filter:'blur(40px)', pointerEvents:'none' }} />
                    
                    <h2 style={{ fontSize:22, fontWeight:900, color:'#D32F2F', marginBottom:8, position:'relative', zIndex:1 }}>➕ Add New Hospital</h2>
                    <p style={{ fontSize:12, color:'rgba(211,47,47,.6)', marginBottom:20, position:'relative', zIndex:1 }}>Add a hospital so it can log in and post blood requests</p>
                    {hospitalMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginBottom:16, fontSize:13, fontWeight:700, color: hospitalMessage.includes('success') ? '#22c55e' : '#D32F2F', position:'relative', zIndex:1 }}
                      >
                        {hospitalMessage}
                      </motion.p>
                    )}
                    <form onSubmit={addHospital} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, position:'relative', zIndex:1 }}>
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
                    style={{ borderRadius:'28px', padding:'32px', border:'2px solid rgba(211,47,47,.1)', position:'relative', overflow:'hidden' }}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12, position:'relative', zIndex:1 }}>
                      <h2 style={{ fontSize:22, fontWeight:900, color:'#D32F2F', margin:0 }}>🏥 Hospitals ({hospitals.filter(h => h.name.toLowerCase().includes(hospitalSearch.toLowerCase())).length})</h2>
                      <input placeholder="🔍 Search..." value={hospitalSearch} onChange={e => setHospitalSearch(e.target.value)} className="ad-input" style={{ width:240, padding:'10px 14px', borderRadius:12, fontSize:12, fontWeight:700 }} />
                    </div>
                    {hospitals.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'60px 0', position:'relative', zIndex:1 }}>
                        <p style={{ fontSize:64, margin:0 }}>🏥</p>
                        <p style={{ color:'rgba(211,47,47,.4)', fontSize:14, marginTop:16 }}>No hospitals added yet</p>
                      </div>
                    ) : (
                      <div style={{ overflowX:'auto', position:'relative', zIndex:1 }}>
                        <table style={{ width:'100%', fontSize:13 }}>
                          <thead>
                            <tr style={{ borderBottom:'2px solid rgba(211,47,47,.1)', textAlign:'left' }}>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Name</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Email</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Address</th>
                              <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hospitals.filter(h => h.name.toLowerCase().includes(hospitalSearch.toLowerCase())).map(h => (
                              <tr key={h.id} style={{ borderBottom:'1px solid rgba(211,47,47,.05)' }}>
                                <td style={{ padding:'12px 0', fontWeight:700, color:'#D32F2F' }}>
                                  {editHospital?.id === h.id ? (
                                    <input value={editHospital.name} onChange={e => setEditHospital({...editHospital, name: e.target.value})} className="ad-input" style={{ padding:'6px 10px' }} />
                                  ) : h.name}
                                </td>
                                <td style={{ padding:'12px 0', color:'rgba(211,47,47,.6)' }}>
                                  {editHospital?.id === h.id ? (
                                    <input value={editHospital.email} onChange={e => setEditHospital({...editHospital, email: e.target.value})} className="ad-input" style={{ padding:'6px 10px' }} />
                                  ) : h.email}
                                </td>
                                <td style={{ padding:'12px 0', color:'rgba(211,47,47,.6)' }}>
                                  {editHospital?.id === h.id ? (
                                    <input value={editHospital.address} onChange={e => setEditHospital({...editHospital, address: e.target.value})} className="ad-input" style={{ padding:'6px 10px' }} />
                                  ) : h.address}
                                </td>
                                <td style={{ padding:'12px 0' }}>
                                  {editHospital?.id === h.id ? (
                                    <div style={{ display:'flex', gap:8 }}>
                                      <button onClick={() => saveHospital(h.id)} style={{ background:'none', border:'none', color:'#22c55e', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>Save</button>
                                      <button onClick={() => setEditHospital(null)} style={{ background:'none', border:'none', color:'rgba(211,47,47,.5)', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>Cancel</button>
                                    </div>
                                  ) : (
                                    <div style={{ display:'flex', gap:8 }}>
                                      <button onClick={() => setEditHospital({...h})} style={{ background:'none', border:'none', color:'#3b82f6', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>Edit</button>
                                      <button onClick={() => deleteHospital(h.id)} style={{ background:'none', border:'none', color:'#D32F2F', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>Delete</button>
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
                  style={{ borderRadius:'28px', padding:'32px', border:'2px solid rgba(211,47,47,.1)', position:'relative', overflow:'hidden' }}
                >
                  <h2 style={{ fontSize:22, fontWeight:900, color:'#D32F2F', marginBottom:20, position:'relative', zIndex:1 }}>🩸 Blood Requests ({requests.length})</h2>
                  {requests.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px 0', position:'relative', zIndex:1 }}>
                      <p style={{ fontSize:64, margin:0 }}>📭</p>
                      <p style={{ color:'rgba(211,47,47,.4)', fontSize:14, marginTop:16 }}>No blood requests yet</p>
                    </div>
                  ) : (
                    <div style={{ overflowX:'auto', position:'relative', zIndex:1 }}>
                      <table style={{ width:'100%', fontSize:13 }}>
                        <thead>
                          <tr style={{ borderBottom:'2px solid rgba(211,47,47,.1)', textAlign:'left' }}>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Hospital</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Blood Type</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Units</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Status</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.map(r => (
                            <tr key={r.id} style={{ borderBottom:'1px solid rgba(211,47,47,.05)' }}>
                              <td style={{ padding:'12px 0', fontWeight:700, color:'#D32F2F' }}>{r.hospital_name}</td>
                              <td style={{ padding:'12px 0', fontWeight:900, color:'#D32F2F' }}>{r.blood_type}</td>
                              <td style={{ padding:'12px 0', fontWeight:600, color:'rgba(211,47,47,.7)' }}>{r.quantity_needed}</td>
                              <td style={{ padding:'12px 0' }}>
                                <span style={{ padding:'4px 12px', borderRadius:10, fontSize:10, fontWeight:900, background: r.status === 'pending' ? 'rgba(249,115,22,.15)' : 'rgba(34,197,94,.15)', color: r.status === 'pending' ? '#f97316' : '#22c55e' }}>
                                  {r.status}
                                </span>
                              </td>
                              <td style={{ padding:'12px 0' }}>
                                <button onClick={() => deleteRequest(r.id)} style={{ background:'none', border:'none', color:'#D32F2F', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>
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
                    style={{ borderRadius:'28px', padding:'32px', border:'2px solid rgba(211,47,47,.1)', position:'relative', overflow:'hidden' }}
                  >
                    <h2 style={{ fontSize:22, fontWeight:900, color:'#D32F2F', marginBottom:8, position:'relative', zIndex:1 }}>➕ Add New Admin</h2>
                    <p style={{ fontSize:12, color:'rgba(211,47,47,.6)', marginBottom:20, position:'relative', zIndex:1 }}>Admin email must end with @bloodconnect.com</p>
                    {adminMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginBottom:16, fontSize:13, fontWeight:700, color: adminMessage.includes('successfully') ? '#22c55e' : '#D32F2F', position:'relative', zIndex:1 }}
                      >
                        {adminMessage}
                      </motion.p>
                    )}
                    <form onSubmit={addAdmin} style={{ display:'flex', gap:12, flexWrap:'wrap', position:'relative', zIndex:1 }}>
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
                    style={{ borderRadius:'28px', padding:'32px', border:'2px solid rgba(211,47,47,.1)', position:'relative', overflow:'hidden' }}
                  >
                    <h2 style={{ fontSize:22, fontWeight:900, color:'#D32F2F', marginBottom:20, position:'relative', zIndex:1 }}>🔐 Admins ({admins.length})</h2>
                    <div style={{ overflowX:'auto', position:'relative', zIndex:1 }}>
                      <table style={{ width:'100%', fontSize:13 }}>
                        <thead>
                          <tr style={{ borderBottom:'2px solid rgba(211,47,47,.1)', textAlign:'left' }}>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Username</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Email</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Created At</th>
                            <th style={{ paddingBottom:12, fontWeight:900, color:'rgba(211,47,47,.5)' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {admins.map(a => (
                            <tr key={a.id} style={{ borderBottom:'1px solid rgba(211,47,47,.05)' }}>
                              <td style={{ padding:'12px 0', fontWeight:700, color:'#D32F2F' }}>{a.username}</td>
                              <td style={{ padding:'12px 0', color:'rgba(211,47,47,.6)' }}>{a.email}</td>
                              <td style={{ padding:'12px 0', color:'rgba(211,47,47,.5)' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                              <td style={{ padding:'12px 0' }}>
                                <button onClick={() => deleteAdmin(a.id)} style={{ background:'none', border:'none', color:'#D32F2F', fontWeight:900, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>
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
                  style={{ borderRadius:'28px', padding:'32px', border:'2px solid rgba(211,47,47,.1)', maxWidth:600, marginX:'auto', position:'relative', overflow:'hidden' }}
                >
                  <div style={{ position:'absolute', top:-40, left:-40, width:160, height:160, background:'rgba(255,235,238,.4)', borderRadius:'50%', filter:'blur(40px)', pointerEvents:'none' }} />
                  
                  <h2 style={{ fontSize:22, fontWeight:900, color:'#D32F2F', marginBottom:20, position:'relative', zIndex:1 }}>🔑 Change Password</h2>
                  {changePassMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginBottom:16, fontSize:13, fontWeight:700, color: changePassMessage.includes('success') ? '#22c55e' : '#D32F2F', position:'relative', zIndex:1 }}
                    >
                      {changePassMessage}
                    </motion.p>
                  )}
                  <form onSubmit={handleChangePassword} style={{ display:'flex', flexDirection:'column', gap:14, position:'relative', zIndex:1 }}>
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
    </div>
  )
}

export default Admin