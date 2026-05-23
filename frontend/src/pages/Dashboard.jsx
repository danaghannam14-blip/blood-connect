import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

// ✅ API Auto-Detection (works on localhost and production)
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://blood-bank-eqyr.onrender.com'

const URGENCY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  urgent:   { label: 'Urgent',   bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  low:      { label: 'Low',      bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }
  @keyframes dd-ping      { 75%,100% { transform:scale(2.2); opacity:0; } }
  @keyframes dd-pulse     { 0%,100%  { opacity:1; } 50% { opacity:.4; } }
  @keyframes dd-particle  { 0%,100% { transform:translateY(0) translateX(0) scale(1); opacity:.3; } 50% { transform:translateY(-28px) translateX(var(--px,6px)) scale(1.2); opacity:.8; } }
  @keyframes dd-orb       { 0%,100% { transform:translateY(0) translateX(0) scale(1); } 33% { transform:translateY(-30px) translateX(20px) scale(1.08); } 66% { transform:translateY(8px) translateX(-10px) scale(.96); } }
  @keyframes dd-gradient  { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes dd-float     { 0%,100%  { transform:translateY(0); } 50% { transform:translateY(-12px); } }
  @keyframes dd-glow      { 0%,100% { box-shadow:0 0 20px rgba(211,47,47,.2),inset 0 0 8px rgba(211,47,47,.08); } 50% { box-shadow:0 0 40px rgba(211,47,47,.5),inset 0 0 20px rgba(211,47,47,.2); } }
  @keyframes dd-pop       { 0% { transform:scale(.8); opacity:0; } 60% { transform:scale(1.05); } 100% { transform:scale(1); opacity:1; } }
  @keyframes dd-hb        { 0%,100% { transform:scale(1); } 14% { transform:scale(1.15); } 28% { transform:scale(1); } 42% { transform:scale(1.15); } }

  .dd-root {
    min-height:100vh;
    background:linear-gradient(-45deg,#f8f8f8,#efefef,#f8f8f8,rgba(14,165,233,.35));
    background-size:400% 400%;
    animation:dd-gradient 14s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
  }

  .dd-glass {
    background:rgba(255,255,255,.42);
    backdrop-filter:blur(28px) saturate(180%);
    -webkit-backdrop-filter:blur(28px) saturate(180%);
    border:1px solid rgba(255,255,255,.72);
    box-shadow:0 8px 32px rgba(211,47,47,.07),inset 0 0 20px rgba(255,255,255,.6);
  }

  .dd-glass-deep {
    background:rgba(255,255,255,.35);
    backdrop-filter:blur(40px) contrast(1.1);
    -webkit-backdrop-filter:blur(40px) contrast(1.1);
    border:1px solid rgba(255,255,255,.8);
    box-shadow:0 24px 56px -12px rgba(211,47,47,.08),inset 0 0 36px rgba(255,255,255,.6);
  }

  .dd-orb { 
    position:fixed;
    border-radius:50%;
    filter:blur(100px);
    pointer-events:none;
    animation:dd-orb var(--dur,8s) ease-in-out infinite; 
  }

  .dd-particle { 
    position:fixed;
    border-radius:50%;
    pointer-events:none;
    animation:dd-particle var(--dur,5s) ease-in-out infinite; 
  }

  .dd-btn {
    position:relative;overflow:hidden;cursor:pointer;
    border:none;outline:none;
    transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s;
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  .dd-btn-primary {
    background:linear-gradient(135deg,#dc2626,#ff6b6b);
    color:#faf7f7;
    box-shadow:0 12px 32px rgba(211,47,47,.32);
  }
  .dd-btn-primary:hover { box-shadow:0 18px 48px rgba(211,47,47,.44); }

  .dd-btn-secondary {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    border:2px solid rgba(211,47,47,.2) !important;
    color:#dc2626;
  }
  .dd-btn-secondary:hover { background:rgba(255,255,255,.72);border-color:rgba(211,47,47,.42) !important; }

  .dd-card-hover { transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s; }
  .dd-card-hover:hover { transform:translateY(-4px) scale(1.01);box-shadow:0 20px 50px rgba(211,47,47,.15) !important; }

  .dd-nav {
    position:sticky;top:0;z-index:50;
    background:rgba(255,255,255,.62);
    backdrop-filter:blur(40px);
    -webkit-backdrop-filter:blur(40px);
    border-bottom:2px solid rgba(211,47,47,.3);
    box-shadow:0 4px 24px rgba(211,47,47,.06);
  }

  .dd-nav-inner {
    max-width:1360px;margin:0 auto;
    display:flex;justify-content:space-between;align-items:center;
    padding:clamp(10px,1.4vw,16px) clamp(16px,3.5vw,44px);
  }
`

if (typeof document !== 'undefined' && !document.getElementById('dd-styles-premium')) {
  const s = document.createElement('style')
  s.id = 'dd-styles-premium'
  s.textContent = STYLES
  document.head.appendChild(s)
}

function ParticleField() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    w: Math.random() * 5 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: (Math.random() * 4 + 3).toFixed(1),
    delay: -(Math.random() * 4).toFixed(1),
    px: ((Math.random() * 20 - 10).toFixed(0)) + 'px',
    color: i % 3 === 0 ? 'rgba(211,47,47,.35)' : i % 3 === 1 ? 'rgba(14,165,233,.45)' : 'rgba(255,235,238,.7)',
  }))

  return (
    <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="dd-particle"
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
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [donor, setDonor] = useState(null)
  const [inventory, setInventory] = useState([])
  const [notifications, setNotifications] = useState([])
  const [emergencyNotifications, setEmergencyNotifications] = useState([])
  const [visible, setVisible] = useState(false)
  const [expandedNotif, setExpandedNotif] = useState(null)
  const [showHospitalSelect, setShowHospitalSelect] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [confirmingId, setConfirmingId] = useState(null)
  const [loadingEmergency, setLoadingEmergency] = useState(true)

  useEffect(() => {
    const data = localStorage.getItem('donorData')
    if (!data) { navigate('/login'); return }
    const donorData = JSON.parse(data)
    setDonor(donorData)
    
    axios.get(`${API}/api/requests/compatible/${donorData.blood_type}`).then(res => setInventory(res.data)).catch(console.log)
    axios.get(`${API}/api/donors/notifications/${donorData.id}`).then(res => setNotifications(res.data)).catch(console.log)
    
    // ✅ Load emergency notifications
    axios.get(`${API}/api/blood-requests/donor/${donorData.id}`)
      .then(res => {
        console.log('Emergency notifications:', res.data)
        setEmergencyNotifications(res.data || [])
      })
      .catch(err => {
        console.error('Error fetching emergency notifications:', err)
        setEmergencyNotifications([])
      })
      .finally(() => setLoadingEmergency(false))
    
    axios.get(`${API}/api/hospitals/all`).then(res => setHospitals(res.data || [])).catch(console.log)
    
    setTimeout(() => setVisible(true), 60)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('donorToken')
    localStorage.removeItem('donorData')
    navigate('/')
  }

  // ✅ Handle center donation confirmation
  const handleDonateAtCenter = async (notificationId) => {
    setConfirmingId(notificationId)
    try {
      await axios.post(`${API}/api/blood-requests/donor-confirm-donation`, {
        notification_id: notificationId,
        donation_location: 'center'
      })
      alert('✅ Center donation confirmed! Patient will be notified.')
      const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
      setEmergencyNotifications(res.data || [])
      setExpandedNotif(null)
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setConfirmingId(null)
    }
  }

  // ✅ Handle hospital donation confirmation
  const handleDonateAtHospital = async (notificationId, hospitalId) => {
    setConfirmingId(notificationId)
    try {
      await axios.post(`${API}/api/blood-requests/donor-confirm-donation`, {
        notification_id: notificationId,
        donation_location: 'hospital',
        hospital_id: hospitalId
      })
      alert('✅ Hospital donation confirmed! Patient will be notified.')
      const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
      setEmergencyNotifications(res.data || [])
      setShowHospitalSelect(null)
      setExpandedNotif(null)
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setConfirmingId(null)
    }
  }

  const getCanDonateTo = (bt) => {
    const map = {
      'O-': 'Everyone (Universal Donor! 🌟)',
      'O+': 'O+, A+, B+, AB+',
      'A-': 'A-, A+, AB-, AB+',
      'A+': 'A+, AB+',
      'B-': 'B-, B+, AB-, AB+',
      'B+': 'B+, AB+',
      'AB-': 'AB-, AB+',
      'AB+': 'AB+ only'
    }
    return map[bt] || bt
  }

  const getNextEligibleDate = () => {
    if (!donor?.last_donation_date) return null
    const last = new Date(donor.last_donation_date)
    const next = new Date(last)
    next.setDate(next.getDate() + 56)
    return next > new Date() ? next.toLocaleDateString('en-GB') : null
  }

  if (!donor) return null

  const totalDonations = notifications.filter(n => n.donated).length
  const maxReached = totalDonations >= 2
  const nextEligible = getNextEligibleDate()

  const hospitalMap = {}
  notifications.forEach(n => {
    if (!hospitalMap[n.hospital_id]) {
      hospitalMap[n.hospital_id] = {
        hospital_id: n.hospital_id,
        hospital_name: n.hospital_name,
        hospital_address: n.hospital_address,
        blood_type: n.blood_type,
        created_at: n.created_at,
        donated_count: 0,
        pending_notif_id: null
      }
    }
    if (n.donated) hospitalMap[n.hospital_id].donated_count++
    else if (!hospitalMap[n.hospital_id].pending_notif_id) hospitalMap[n.hospital_id].pending_notif_id = n.id
  })
  const hospitalRows = Object.values(hospitalMap)

  const steps = [
    { id: 1, label: 'Health Screening', icon: '🩺', done: true },
    { id: 2, label: 'Hospital Matched', icon: '🏥', done: inventory.length > 0 },
    { id: 3, label: 'Donation Complete', icon: '✅', done: totalDonations > 0 },
  ]

  return (
    <div className="dd-root">
      <ParticleField />

      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[
          { t:'10%', l:'8%', w:'min(420px,36vw)', c:'rgba(211,47,47,.17)', d:'0s' },
          { b:'15%', r:'8%', w:'min(480px,40vw)', c:'rgba(64,88,120,.22)', d:'-2s' },
          { t:'45%', r:'15%', w:'min(320px,28vw)', c:'rgba(255,235,238,.45)', d:'-5s' },
        ].map((o, i) => (
          <div key={i} className="dd-orb" style={{ '--dur':'8s', width:o.w, height:o.w, background:o.c, top:o.t, bottom:o.b, left:o.l, right:o.r, animationDelay:o.d }}/>
        ))}
      </div>

      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -20 }} transition={{ duration: 0.5 }} className="dd-nav">
        <div className="dd-nav-inner">
          <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <span style={{ fontSize:'clamp(16px,1.8vw,22px)', fontWeight:800, color:'#dc2626', letterSpacing:'-.04em', fontFamily:"'Fraunces',serif" }}>
              BloodConnect
            </span>
            <span style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.2em' }}>Donor Portal</span>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={handleLogout} className="dd-btn dd-btn-secondary" style={{ padding:'10px 24px', borderRadius:14, fontSize:13 }}>
            Logout
          </motion.button>
        </div>
      </motion.header>

      <main style={{ position:'relative', zIndex:10, maxWidth:1360, margin:'0 auto', padding:'clamp(24px,3.5vw,52px) clamp(16px,3.5vw,44px)', display:'flex', flexDirection:'column', gap:'clamp(32px,4.5vw,72px)' }}>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }} transition={{ duration: 0.6 }} className="dd-glass-deep dd-card-hover" style={{ borderRadius:'clamp(24px,3.5vw,44px)', padding:'clamp(24px,3.5vw,40px)', border:'1px solid rgba(255,255,255,.72)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(24px,3.5vw,44px)', fontWeight:900, color:'#dc2626', margin:0, lineHeight:1.1 }}>Welcome, {donor.full_name} 👋</h2>
            <p style={{ fontSize:'clamp(12px,1.2vw,15px)', color:'rgba(211,47,47,.65)', fontWeight:600, marginTop:8, marginBottom:0 }}>Blood Type: <span style={{ color:'#dc2626', fontWeight:900 }}>{donor.blood_type}</span> · Governorate: <span style={{ color:'#dc2626', fontWeight:900 }}>{donor.governorate}</span></p>
          </div>
          <motion.div whileHover={{ scale: 1.12 }} className="dd-glass" style={{ borderRadius:22, padding:'clamp(18px,2.5vw,32px)', textAlign:'center', border:'1px solid rgba(255,255,255,.72)', minWidth:'fit-content' }}>
            <p style={{ fontSize:'clamp(28px,5vw,52px)', fontWeight:900, color:'#dc2626', margin:0, lineHeight:1, textShadow:'0 4px 20px rgba(211,47,47,.2)' }}>{totalDonations * 3}</p>
            <p style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.2em', marginTop:8, marginBottom:0 }}>Lives Saved</p>
          </motion.div>
        </motion.div>

        {/* ✅ Emergency Notifications Section */}
        {!loadingEmergency && emergencyNotifications.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }} transition={{ duration: 0.6, delay: 0.1 }} className="dd-glass-deep dd-card-hover" style={{ borderRadius:'clamp(24px,3.5vw,44px)', padding:'clamp(24px,3.5vw,40px)', border:'2px solid #dc2626', background:'linear-gradient(135deg, rgba(220,38,38,.08), rgba(255,107,107,.04))' }}>
            <h3 style={{ fontSize:'clamp(18px,2.5vw,22px)', fontWeight:900, color:'#dc2626', margin:'0 0 16px 0' }}>
              🩸 Emergency Blood Requests ({emergencyNotifications.length})
            </h3>
            <AnimatePresence>
              {emergencyNotifications.map((notif, idx) => (
                <motion.div
                  key={notif.notification_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => notif.status === 'pending' && setExpandedNotif(expandedNotif === notif.notification_id ? null : notif.notification_id)}
                  className="dd-glass dd-card-hover"
                  style={{
                    borderRadius:16, padding:16, marginBottom:12,
                    background:'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
                    border:'2px solid #fca5a5',
                    cursor: notif.status === 'pending' ? 'pointer' : 'default',
                    display:'flex', justifyContent:'space-between', alignItems:'center'
                  }}
                >
                  <div>
                    <p style={{ fontSize:14, fontWeight:900, color:'#dc2626', margin:'0 0 4px 0' }}>
                      {notif.blood_type} Blood Needed
                    </p>
                    <p style={{ fontSize:11, color:'#991b1b', margin:'0 0 4px 0', fontWeight:700 }}>
                      📍 {notif.governorate}
                    </p>
                    {notif.status === 'pending' && (
                      <p style={{ fontSize:11, color:'#991b1b', margin:0, fontWeight:600 }}>
                        Click to confirm donation location →
                      </p>
                    )}
                  </div>
                  <motion.div
                    style={{
                      background: notif.status === 'pending' ? '#FFA500' : notif.status === 'awaiting_confirmation' ? '#9CA3AF' : '#22c55e',
                      color:'#fff', padding:'6px 12px', borderRadius:8, fontSize:10, fontWeight:900,
                      textTransform:'uppercase', whiteSpace:'nowrap'
                    }}
                  >
                    {notif.status === 'pending' && '⏳ Pending'}
                    {notif.status === 'awaiting_confirmation' && '⏸️ Confirming'}
                    {notif.status === 'confirmed' && '✅ Confirmed'}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Expanded Emergency Notification */}
            <AnimatePresence>
              {emergencyNotifications.map((notif) => expandedNotif === notif.notification_id && notif.status === 'pending' && (
                <motion.div
                  key={`expand-${notif.notification_id}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    borderTop:'2px solid rgba(220,38,38,.2)', paddingTop:12, marginTop:12,
                    background:'rgba(255,255,255,.8)', borderRadius:12, padding:12
                  }}
                >
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {donor?.governorate === 'Beirut' && (
                      <motion.button
                        whileHover={{ scale: 1.06, boxShadow: '0 12px 40px rgba(220, 38, 38, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDonateAtCenter(notif.notification_id)
                        }}
                        disabled={confirmingId === notif.notification_id}
                        style={{
                          background: confirmingId === notif.notification_id ? '#ccc' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
                          color:'#fff', border:'2px solid rgba(220, 38, 38, 0.6)',
                          padding:'14px 20px', borderRadius:12, fontWeight:900, fontSize:14,
                          cursor:confirmingId === notif.notification_id ? 'not-allowed' : 'pointer',
                          opacity: confirmingId === notif.notification_id ? 0.7 : 1,
                          boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3)',
                          position: 'relative', overflow: 'hidden', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        {confirmingId === notif.notification_id ? '⏳ Confirming...' : '👑 Donate at BCC Hamra Center (Featured)'}
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowHospitalSelect(showHospitalSelect === notif.notification_id ? null : notif.notification_id)
                      }}
                      disabled={confirmingId === notif.notification_id}
                      style={{
                        background: confirmingId === notif.notification_id ? '#ccc' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color:'#fff', border:'none', padding:'12px 16px', borderRadius:8,
                        fontWeight:900, fontSize:13, cursor:confirmingId === notif.notification_id ? 'not-allowed' : 'pointer',
                        opacity: confirmingId === notif.notification_id ? 0.7 : 1
                      }}
                    >
                      🏥 Donate at a Hospital in {donor?.governorate}
                    </motion.button>

                    <AnimatePresence>
                      {showHospitalSelect === notif.notification_id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8, padding:12, background:'rgba(255,255,255,.6)', borderRadius:8 }}
                        >
                          <p style={{ fontSize:10, fontWeight:700, color:'#666', margin:'0 0 8px 0', textTransform:'uppercase', letterSpacing:'.05em' }}>
                            🏥 Select a hospital in {donor?.governorate}:
                          </p>
                          {hospitals.filter(h => h.governorate === donor?.governorate).length > 0 ? (
                            hospitals
                              .filter(h => h.governorate === donor?.governorate)
                              .map(hospital => (
                              <motion.button
                                key={hospital.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDonateAtHospital(notif.notification_id, hospital.id)
                                }}
                                disabled={confirmingId === notif.notification_id}
                                style={{
                                  background:'#fff', border:'2px solid #3b82f6', padding:'10px 12px',
                                  borderRadius:6, fontSize:12, fontWeight:700, color:'#3b82f6',
                                  cursor: confirmingId === notif.notification_id ? 'not-allowed' : 'pointer',
                                  textAlign:'left', opacity: confirmingId === notif.notification_id ? 0.7 : 1,
                                  transition: 'all 0.2s'
                                }}
                              >
                                {hospital.name}
                              </motion.button>
                            ))
                          ) : (
                            <p style={{ fontSize:11, color:'#999', margin:0, fontStyle:'italic', padding:'8px' }}>
                              No hospitals found in {donor?.governorate}.
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </main>
    </div>
  )
}

export default Dashboard