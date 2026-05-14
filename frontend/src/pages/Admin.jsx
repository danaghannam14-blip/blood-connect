import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const API = 'https://blood-bank-eqyr.onrender.com'

/* ─── Injected Styles (matching Home.jsx) ─────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  @keyframes bc-ping      { 75%,100% { transform:scale(2.2); opacity:0; } }
  @keyframes bc-pulse     { 0%,100%  { opacity:1; } 50% { opacity:.4; } }
  @keyframes bc-float-b   { 0%,100%  { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes bc-spin8     { to { transform:rotate(360deg); } }
  @keyframes bc-gradient  { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes bc-particle  { 0%,100% { transform:translateY(0) translateX(0) scale(1); opacity:.3; } 50% { transform:translateY(-28px) translateX(var(--px,6px)) scale(1.2); opacity:.8; } }
  @keyframes bc-orb       { 0%,100% { transform:translateY(0) translateX(0) scale(1); } 33% { transform:translateY(-30px) translateX(20px) scale(1.08); } 66% { transform:translateY(8px) translateX(-10px) scale(.96); } }

  .bc-admin-root {
    min-height:100vh;
    background:linear-gradient(-45deg,#FFEBEE,#F8F9FA,#FFEBEE,rgba(136,189,242,.35));
    background-size:400% 400%;
    animation:bc-gradient 14s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
  }

  .bc-glass {
    background:rgba(255,255,255,.42);
    backdrop-filter:blur(28px) saturate(180%);
    -webkit-backdrop-filter:blur(28px) saturate(180%);
    border:1px solid rgba(255,255,255,.72);
    box-shadow:0 8px 32px rgba(211,47,47,.07),inset 0 0 20px rgba(255,255,255,.6);
  }

  .bc-glass-deep {
    background:rgba(255,255,255,.35);
    backdrop-filter:blur(40px) contrast(1.1);
    -webkit-backdrop-filter:blur(40px) contrast(1.1);
    border:1px solid rgba(255,255,255,.8);
    box-shadow:0 24px 56px -12px rgba(211,47,47,.08),inset 0 0 36px rgba(255,255,255,.6);
  }

  .bc-btn {
    position:relative;
    overflow:hidden;
    cursor:pointer;
    border:none;
    outline:none;
    transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s;
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  .bc-btn::after {
    content:'';
    position:absolute;
    top:50%;
    left:50%;
    width:0;
    height:0;
    background:rgba(255,255,255,.28);
    border-radius:50%;
    transform:translate(-50%,-50%);
    transition:width .4s,height .4s;
  }

  .bc-btn:hover::after { width:300px; height:300px; }
  .bc-btn:hover { transform:translateY(-3px) scale(1.05); }
  .bc-btn:active { transform:scale(.97); }

  .bc-btn-primary {
    background:linear-gradient(135deg,#D32F2F,#ff6b6b);
    color:white;
    box-shadow:0 12px 32px rgba(211,47,47,.32);
  }
  .bc-btn-primary:hover { box-shadow:0 18px 48px rgba(211,47,47,.44); }

  .bc-card-hover {
    transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s;
  }
  .bc-card-hover:hover {
    transform:translateY(-4px) scale(1.01);
    box-shadow:0 20px 50px rgba(211,47,47,.15) !important;
  }

  .bc-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(100px);
    pointer-events:none;
    animation:bc-orb var(--dur,8s) ease-in-out infinite;
  }

  .bc-particle {
    position:absolute;
    border-radius:50%;
    pointer-events:none;
    animation:bc-particle var(--dur,5s) ease-in-out infinite;
  }

  .bc-input {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    border:2px solid rgba(211,47,47,.15);
    border-radius:12px;
    padding:12px 16px;
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:600;
    font-size:13px;
    color:#D32F2F;
    outline:none;
    transition:all .28s;
  }

  .bc-input::placeholder { color:rgba(211,47,47,.35); }
  .bc-input:focus {
    border-color:rgba(211,47,47,.5);
    background:rgba(255,255,255,.72);
    box-shadow:0 8px 24px rgba(211,47,47,.12);
  }

  .bc-tab {
    padding:10px 20px;
    border-radius:12px;
    font-weight:700;
    font-size:13px;
    cursor:pointer;
    transition:all .22s;
    text-transform:capitalize;
  }

  .bc-tab:hover { transform:translateY(-2px); }

  .bc-tab-active {
    background:linear-gradient(135deg,#D32F2F,#ff6b6b);
    color:white;
    box-shadow:0 8px 24px rgba(211,47,47,.3);
  }

  .bc-tab-inactive {
    background:rgba(255,255,255,.6);
    color:rgba(211,47,47,.65);
  }
`

if (typeof document !== 'undefined' && !document.getElementById('bc-admin-styles')) {
  const s = document.createElement('style')
  s.id = 'bc-admin-styles'
  s.textContent = STYLES
  document.head.appendChild(s)
}

/* ─── Particle Field ─────────────────────────────────────── */
function ParticleField() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    w: Math.random() * 5 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: (Math.random() * 4 + 3).toFixed(1),
    delay: -(Math.random() * 4).toFixed(1),
    px: ((Math.random() * 20 - 10).toFixed(0)) + 'px',
    color: i % 3 === 0 ? 'rgba(211,47,47,.35)' : i % 3 === 1 ? 'rgba(136,189,242,.45)' : 'rgba(255,235,238,.7)',
  }))

  return (
    <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="bc-particle"
          style={{
            '--dur': `${p.dur}s`,
            '--px': p.px,
            width: p.w,
            height: p.w,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

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
    const adminData = localStorage.getItem('adminData')
    if (adminData) {
      setAuthed(true)
      loadData()
      setTimeout(() => setVisible(true), 60)
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
      setAdminMessage('Admin added successfully!')
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
      setHospitalMessage('Hospital added successfully!')
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

  const fadeUp = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
  })

  return (
    <div className="bc-admin-root">
      <ParticleField />

      {/* Orbs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[
          { t:'8%', l:'8%', w:'min(420px,36vw)', c:'rgba(211,47,47,.17)', d:'0s' },
          { b:'18%', r:'8%', w:'min(480px,40vw)', c:'rgba(136,189,242,.22)', d:'-2s' },
        ].map((o, i) => (
          <div key={i} className="bc-orb" style={{ '--dur':'8s', width:o.w, height:o.w, background:o.c, top:o.t, bottom:o.b, left:o.l, right:o.r, animationDelay:o.d }}/>
        ))}
      </div>

      <div style={{ position:'relative', zIndex:10, maxWidth:1400, margin:'0 auto', padding:'clamp(20px,3.5vw,44px) clamp(16px,3.5vw,44px)' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -20 }}
          transition={{ duration: 0.6 }}
          className="bc-glass-deep bc-card-hover"
          style={{ borderRadius:'clamp(20px,3vw,32px)', padding:'clamp(18px,2.5vw,32px)', marginBottom:'clamp(20px,3vw,40px)', border:'2px solid rgba(211,47,47,.1)' }}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:56, height:56, background:'linear-gradient(135deg,#D32F2F,#ff6b6b)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>
                🩸
              </div>
              <div>
                <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(24px,3.5vw,38px)', fontWeight:900, color:'#D32F2F', margin:0, lineHeight:1.1 }}>Admin Dashboard</h1>
                <p style={{ fontSize:11, fontWeight:700, color:'rgba(211,47,47,.6)', textTransform:'uppercase', letterSpacing:'.2em', margin:'4px 0 0' }}>BloodConnect Control Center</p>
              </div>
            </div>
            <button onClick={handleLogout} className="bc-btn bc-btn-primary" style={{ padding:'12px 24px', borderRadius:14, fontSize:13, fontWeight:900 }}>
              Logout →
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ display:'flex', gap:10, marginBottom:'clamp(20px,3vw,40px)', flexWrap:'wrap' }}
        >
          {tabs.map((t, i) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
              className={`bc-tab ${tab === t ? 'bc-tab-active' : 'bc-tab-inactive'}`}
            >
              {t}
            </motion.button>
          ))}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="bc-glass-deep" style={{ borderRadius:24, padding:60, textAlign:'center', border:'2px solid rgba(211,47,47,.1)' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width:60, height:60, margin:'0 auto', border:'4px solid rgba(211,47,47,.2)', borderTopColor:'#D32F2F', borderRadius:'50%' }}
            />
            <p style={{ marginTop:20, fontSize:14, fontWeight:700, color:'rgba(211,47,47,.6)' }}>Loading dashboard...</p>
          </div>
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
                <div style={{ display:'flex', flexDirection:'column', gap:'clamp(20px,3vw,32px)' }}>

                  {/* Stats */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
                    {[
                      { icon:'👥', value:donors.length, label:'Total Donors', color:'#D32F2F' },
                      { icon:'✅', value:eligibleDonors, label:'Eligible Now', color:'#22c55e' },
                      { icon:'🏥', value:hospitals.length, label:'Hospitals', color:'#3b82f6' },
                      { icon:'🚨', value:pendingRequests, label:'Active Requests', color:'#f97316' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4, type: 'spring' }}
                        className="bc-glass bc-card-hover"
                        style={{ borderRadius:20, padding:24, border:'2px solid rgba(211,47,47,.1)', textAlign:'center', position:'relative', overflow:'hidden' }}
                      >
                        <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, background:'rgba(255,235,238,.5)', borderRadius:'50%', filter:'blur(30px)' }}/>
                        <div style={{ position:'relative', zIndex:1 }}>
                          <p style={{ fontSize:32 }}>{stat.icon}</p>
                          <p style={{ fontSize:36, fontWeight:900, color:stat.color, margin:'8px 0 0' }}>{stat.value}</p>
                          <p style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.2em', marginTop:8 }}>{stat.label}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Second Row */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>

                    {/* Most Needed */}
                    <div className="bc-glass-deep bc-card-hover" style={{ borderRadius:24, padding:24, border:'2px solid rgba(211,47,47,.1)' }}>
                      <h3 style={{ fontSize:16, fontWeight:900, color:'#D32F2F', marginBottom:16 }}>🩸 Most Needed Blood Type</h3>
                      {mostNeeded ? (
                        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                          <div className="bc-glass" style={{ width:80, height:80, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(211,47,47,.2)' }}>
                            <p style={{ fontSize:28, fontWeight:900, color:'#D32F2F', margin:0 }}>{mostNeeded[0]}</p>
                          </div>
                          <div>
                            <p style={{ fontSize:14, fontWeight:700, color:'#D32F2F' }}>{mostNeeded[1]} active request{mostNeeded[1] > 1 ? 's' : ''}</p>
                            <p style={{ fontSize:11, color:'rgba(211,47,47,.5)', marginTop:4 }}>Across all hospitals</p>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color:'rgba(211,47,47,.4)', fontSize:13 }}>No active requests right now.</p>
                      )}
                    </div>

                    {/* Blood Type Breakdown */}
                    <div className="bc-glass-deep bc-card-hover" style={{ borderRadius:24, padding:24, border:'2px solid rgba(211,47,47,.1)' }}>
                      <h3 style={{ fontSize:16, fontWeight:900, color:'#D32F2F', marginBottom:16 }}>📊 Donors by Type</h3>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => {
                          const count = donors.filter(d => d.blood_type === bt).length
                          return (
                            <div key={bt} className="bc-glass" style={{ borderRadius:12, padding:12, textAlign:'center', border:'1px solid rgba(211,47,47,.1)' }}>
                              <p style={{ fontSize:11, fontWeight:900, color:'#D32F2F', margin:0 }}>{bt}</p>
                              <p style={{ fontSize:20, fontWeight:900, color:'rgba(211,47,47,.8)', margin:'4px 0 0' }}>{count}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Recent Requests */}
                  <div className="bc-glass-deep bc-card-hover" style={{ borderRadius:24, padding:24, border:'2px solid rgba(211,47,47,.1)' }}>
                    <h3 style={{ fontSize:16, fontWeight:900, color:'#D32F2F', marginBottom:16 }}>🕐 Recent Blood Requests</h3>
                    {requests.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'40px 0' }}>
                        <p style={{ fontSize:48, margin:0 }}>📭</p>
                        <p style={{ color:'rgba(211,47,47,.4)', fontSize:13, marginTop:12 }}>No blood requests yet.</p>
                      </div>
                    ) : (
                      <div style={{ overflowX:'auto' }}>
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
                                  <span style={{ padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:900, background: r.status === 'pending' ? 'rgba(249,115,22,.15)' : 'rgba(34,197,94,.15)', color: r.status === 'pending' ? '#f97316' : '#22c55e' }}>
                                    {r.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* DONORS */}
              {tab === 'donors' && (
                <div className="bc-glass-deep bc-card-hover" style={{ borderRadius:24, padding:24, border:'2px solid rgba(211,47,47,.1)' }}>
                  <h2 style={{ fontSize:20, fontWeight:900, color:'#D32F2F', marginBottom:20 }}>👥 Donors ({donors.length})</h2>
                  {donors.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px 0' }}>
                      <p style={{ fontSize:64, margin:0 }}>👤</p>
                      <p style={{ color:'rgba(211,47,47,.4)', fontSize:14, marginTop:16 }}>No donors registered yet.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
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
                </div>
              )}

              {/* HOSPITALS */}
              {tab === 'hospitals' && (
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <div className="bc-glass-deep bc-card-hover" style={{ borderRadius:24, padding:24, border:'2px solid rgba(211,47,47,.1)' }}>
                    <h2 style={{ fontSize:20, fontWeight:900, color:'#D32F2F', marginBottom:8 }}>➕ Add New Hospital</h2>
                    <p style={{ fontSize:12, color:'rgba(211,47,47,.6)', marginBottom:20 }}>Add a hospital so it can log in and post blood requests.</p>
                    {hospitalMessage && (
                      <p style={{ marginBottom:16, fontSize:13, fontWeight:700, color: hospitalMessage.includes('success') ? '#22c55e' : '#D32F2F' }}>
                        {hospitalMessage}
                      </p>
                    )}
                    <form onSubmit={addHospital} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
                      <input placeholder="Hospital Name" value={newHospital.name} onChange={e => setNewHospital({...newHospital, name: e.target.value})} className="bc-input" required />
                      <input placeholder="email@hospital.com" value={newHospital.email} onChange={e => setNewHospital({...newHospital, email: e.target.value})} className="bc-input" required />
                      <input type="password" placeholder="Password" value={newHospital.password} onChange={e => setNewHospital({...newHospital, password: e.target.value})} className="bc-input" required />
                      <input placeholder="Address" value={newHospital.address} onChange={e => setNewHospital({...newHospital, address: e.target.value})} className="bc-input" />
                      <input placeholder="Latitude" value={newHospital.latitude} onChange={e => setNewHospital({...newHospital, latitude: e.target.value})} className="bc-input" />
                      <input placeholder="Longitude" value={newHospital.longitude} onChange={e => setNewHospital({...newHospital, longitude: e.target.value})} className="bc-input" />
                      <button type="submit" className="bc-btn bc-btn-primary" style={{ gridColumn:'1/-1', padding:14, borderRadius:12, fontSize:13, fontWeight:900 }}>
                        Add Hospital
                      </button>
                    </form>
                  </div>

                  <div className="bc-glass-deep bc-card-hover" style={{ borderRadius:24, padding:24, border:'2px solid rgba(211,47,47,.1)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                      <h2 style={{ fontSize:20, fontWeight:900, color:'#D32F2F', margin:0 }}>🏥 Hospitals ({hospitals.filter(h => h.name.toLowerCase().includes(hospitalSearch.toLowerCase())).length})</h2>
                      <input placeholder="🔍 Search..." value={hospitalSearch} onChange={e => setHospitalSearch(e.target.value)} className="bc-input" style={{ width:240 }} />
                    </div>
                    {hospitals.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'60px 0' }}>
                        <p style={{ fontSize:64, margin:0 }}>🏥</p>
                        <p style={{ color:'rgba(211,47,47,.4)', fontSize:14, marginTop:16 }}>No hospitals added yet.</p>
                      </div>
                    ) : (
                      <div style={{ overflowX:'auto' }}>
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
                                    <input value={editHospital.name} onChange={e => setEditHospital({...editHospital, name: e.target.value})} className="bc-input" style={{ padding:'6px 10px' }} />
                                  ) : h.name}
                                </td>
                                <td style={{ padding:'12px 0', color:'rgba(211,47,47,.6)' }}>
                                  {editHospital?.id === h.id ? (
                                    <input value={editHospital.email} onChange={e => setEditHospital({...editHospital, email: e.target.value})} className="bc-input" style={{ padding:'6px 10px' }} />
                                  ) : h.email}
                                </td>
                                <td style={{ padding:'12px 0', color:'rgba(211,47,47,.6)' }}>
                                  {editHospital?.id === h.id ? (
                                    <input value={editHospital.address} onChange={e => setEditHospital({...editHospital, address: e.target.value})} className="bc-input" style={{ padding:'6px 10px' }} />
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
                  </div>
                </div>
              )}

              {/* REQUESTS */}
              {tab === 'requests' && (
                <div className="bc-glass-deep bc-card-hover" style={{ borderRadius:24, padding:24, border:'2px solid rgba(211,47,47,.1)' }}>
                  <h2 style={{ fontSize:20, fontWeight:900, color:'#D32F2F', marginBottom:20 }}>🩸 Blood Requests ({requests.length})</h2>
                  {requests.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px 0' }}>
                      <p style={{ fontSize:64, margin:0 }}>📭</p>
                      <p style={{ color:'rgba(211,47,47,.4)', fontSize:14, marginTop:16 }}>No blood requests yet.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
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
                                <span style={{ padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:900, background: r.status === 'pending' ? 'rgba(249,115,22,.15)' : 'rgba(34,197,94,.15)', color: r.status === 'pending' ? '#f97316' : '#22c55e' }}>
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
                </div>
              )}

              {/* ADMINS */}
              {tab === 'admins' && (
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <div className="bc-glass-deep bc-card-hover" style={{ borderRadius:24, padding:24, border:'2px solid rgba(211,47,47,.1)' }}>
                    <h2 style={{ fontSize:20, fontWeight:900, color:'#D32F2F', marginBottom:8 }}>➕ Add New Admin</h2>
                    <p style={{ fontSize:12, color:'rgba(211,47,47,.6)', marginBottom:20 }}>Admin email must end with @bloodconnect.com</p>
                    {adminMessage && (
                      <p style={{ marginBottom:16, fontSize:13, fontWeight:700, color: adminMessage.includes('successfully') ? '#22c55e' : '#D32F2F' }}>
                        {adminMessage}
                      </p>
                    )}
                    <form onSubmit={addAdmin} style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                      <input placeholder="email@bloodconnect.com" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="bc-input" style={{ flex:1, minWidth:200 }} required />
                      <input type="password" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="bc-input" style={{ flex:1, minWidth:200 }} required />
                      <button type="submit" className="bc-btn bc-btn-primary" style={{ padding:'12px 32px', borderRadius:12, fontSize:13, fontWeight:900 }}>
                        Add Admin
                      </button>
                    </form>
                  </div>

                  <div className="bc-glass-deep bc-card-hover" style={{ borderRadius:24, padding:24, border:'2px solid rgba(211,47,47,.1)' }}>
                    <h2 style={{ fontSize:20, fontWeight:900, color:'#D32F2F', marginBottom:20 }}>🔐 Admins ({admins.length})</h2>
                    <div style={{ overflowX:'auto' }}>
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
                  </div>
                </div>
              )}

              {/* SETTINGS */}
              {tab === 'settings' && (
                <div className="bc-glass-deep bc-card-hover" style={{ borderRadius:24, padding:24, border:'2px solid rgba(211,47,47,.1)', maxWidth:600 }}>
                  <h2 style={{ fontSize:20, fontWeight:900, color:'#D32F2F', marginBottom:20 }}>🔑 Change Password</h2>
                  {changePassMessage && (
                    <p style={{ marginBottom:16, fontSize:13, fontWeight:700, color: changePassMessage.includes('success') ? '#22c55e' : '#D32F2F' }}>
                      {changePassMessage}
                    </p>
                  )}
                  <form onSubmit={handleChangePassword} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <input placeholder="Your email (@bloodconnect.com)" value={changePass.email} onChange={e => setChangePass({...changePass, email: e.target.value})} className="bc-input" required />
                    <input type="password" placeholder="Old password" value={changePass.old_password} onChange={e => setChangePass({...changePass, old_password: e.target.value})} className="bc-input" required />
                    <input type="password" placeholder="New password" value={changePass.new_password} onChange={e => setChangePass({...changePass, new_password: e.target.value})} className="bc-input" required />
                    <button type="submit" className="bc-btn bc-btn-primary" style={{ padding:14, borderRadius:12, fontSize:13, fontWeight:900, marginTop:8 }}>
                      Change Password
                    </button>
                  </form>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </div>
  )
}

export default Admin