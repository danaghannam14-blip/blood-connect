import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import AppointmentBooker from '../components/AppointmentBooker'

const API = 'https://blood-bank-eqyr.onrender.com'

const URGENCY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  urgent:   { label: 'Urgent',   bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  low:      { label: 'Low',      bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
}

/* ─── Injected Premium Styles ───────────────────────────────── */
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

  .dd-btn::after {
    content:'';position:absolute;top:50%;left:50%;
    width:0;height:0;background:rgba(255,255,255,.28);border-radius:50%;
    transform:translate(-50%,-50%);transition:width .4s,height .4s;
  }

  .dd-btn:hover::after { width:300px;height:300px; }
  .dd-btn:hover  { transform:translateY(-3px) scale(1.05); }
  .dd-btn:active { transform:scale(.97); }

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
    border-bottom:2px solid rgba#991b1b;
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

/* ─── Particle Field ───────────────────────────────────────── */
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
  const [appointments, setAppointments] = useState([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('donorData')
    if (!data) { navigate('/login'); return }
    const donorData = JSON.parse(data)
    setDonor(donorData)
    axios.get(`${API}/api/requests/compatible/${donorData.blood_type}`).then(res => setInventory(res.data)).catch(console.log)
    axios.get(`${API}/api/donors/notifications/${donorData.id}`).then(res => setNotifications(res.data)).catch(console.log)
    axios.get(`${API}/api/appointments/donor/${donorData.id}`).then(res => setAppointments(res.data)).catch(console.log)
    setTimeout(() => setVisible(true), 60)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('donorToken')
    localStorage.removeItem('donorData')
    navigate('/')
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
    { id: 3, label: 'Appointment Booked', icon: '📅', done: appointments.some(a => a.status === 'scheduled' || a.status === 'completed') },
    { id: 4, label: 'Donation Complete', icon: '✅', done: totalDonations > 0 },
  ]

  const fadeUp = (delay = 0) => ({
    opacity:   visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
  })

  return (
    <div className="dd-root">
      <ParticleField />

      {/* Orbs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[
          { t:'10%', l:'8%', w:'min(420px,36vw)', c:'rgba(211,47,47,.17)', d:'0s' },
          { b:'15%', r:'8%', w:'min(480px,40vw)', c:'rgba(64,88,120,.22)', d:'-2s' },
          { t:'45%', r:'15%', w:'min(320px,28vw)', c:'rgba(255,235,238,.45)', d:'-5s' },
        ].map((o, i) => (
          <div key={i} className="dd-orb" style={{ '--dur':'8s', width:o.w, height:o.w, background:o.c, top:o.t, bottom:o.b, left:o.l, right:o.r, animationDelay:o.d }}/>
        ))}
      </div>

      {/* NAV */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -20 }}
        transition={{ duration: 0.5 }}
        className="dd-nav"
      >
        <div className="dd-nav-inner">
          <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <span style={{ fontSize:'clamp(16px,1.8vw,22px)', fontWeight:800, color:'#dc2626', letterSpacing:'-.04em', fontFamily:"'Fraunces',serif" }}>
              BloodConnect
            </span>
            <span style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.2em' }}>Donor Portal</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="dd-btn dd-btn-secondary"
            style={{ padding:'10px 24px', borderRadius:14, fontSize:13 }}
          >
            Logout
          </motion.button>
        </div>
      </motion.header>

      {/* MAIN */}
      <main style={{ position:'relative', zIndex:10, maxWidth:1360, margin:'0 auto', padding:'clamp(24px,3.5vw,52px) clamp(16px,3.5vw,44px)', display:'flex', flexDirection:'column', gap:'clamp(32px,4.5vw,72px)' }}>

        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
          transition={{ duration: 0.6 }}
          className="dd-glass-deep dd-card-hover"
          style={{ borderRadius:'clamp(24px,3.5vw,44px)', padding:'clamp(24px,3.5vw,40px)', border:'1px solid rgba(255,255,255,.72)', display:'flex', justifyContent:'space-between', alignItems:'center' }}
        >
          <div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(24px,3.5vw,44px)', fontWeight:900, color:'#dc2626', margin:0, lineHeight:1.1 }}>Welcome, {donor.full_name} 👋</h2>
            <p style={{ fontSize:'clamp(12px,1.2vw,15px)', color:'rgba(211,47,47,.65)', fontWeight:600, marginTop:8, marginBottom:0 }}>Blood Type: <span style={{ color:'#dc2626', fontWeight:900 }}>{donor.blood_type}</span> · {donor.email}</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.12 }}
            className="dd-glass"
            style={{ borderRadius:22, padding:'clamp(18px,2.5vw,32px)', textAlign:'center', border:'1px solid rgba(255,255,255,.72)', minWidth:'fit-content' }}
          >
            <p style={{ fontSize:'clamp(28px,5vw,52px)', fontWeight:900, color:'#dc2626', margin:0, lineHeight:1, textShadow:'0 4px 20px rgba(211,47,47,.2)' }}>{totalDonations * 3}</p>
            <p style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.2em', marginTop:8, marginBottom:0 }}>Lives Saved</p>
          </motion.div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="dd-glass-deep dd-card-hover"
          style={{ borderRadius:'clamp(24px,3.5vw,44px)', padding:'clamp(24px,3.5vw,40px)', border:'1px solid rgba(255,255,255,.72)' }}
        >
          <p style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:20, marginTop:0 }}>Your Donation Journey</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="dd-card-hover"
                style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  className="dd-glass"
                  style={{
                    width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:18, border: step.done ? '2px solid #22c55e' : '2px solid rgba(211,47,47,.15)',
                    background: step.done ? 'rgba(34,197,94,.15)' : undefined,
                    marginBottom:10
                  }}
                >
                  {step.icon}
                </motion.div>
                <p style={{ fontSize:9, fontWeight:700, color: step.done ? '#22c55e' : 'rgba(211,47,47,.4)', textAlign:'center', margin:0, textTransform:'uppercase', letterSpacing:'.1em' }}>{step.label}</p>
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={visible ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    style={{ position:'absolute', height:2, width:'clamp(20px,3vw,40px)', background: steps[i+1].done ? '#22c55e' : 'rgba#991b1b', left: `calc(50% + ${24 + i * 0}px)`, originX:0 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Profile Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="dd-glass-deep dd-card-hover"
          style={{ borderRadius:'clamp(24px,3.5vw,44px)', padding:'clamp(24px,3.5vw,40px)', border:'1px solid rgba(255,255,255,.72)' }}
        >
          <p style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:16, marginTop:0 }}>Your Profile</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(12px,1.8vw,20px)' }}>
            <motion.div whileHover={{ y: -4 }} className="dd-glass dd-card-hover" style={{ borderRadius:18, padding:'clamp(16px,2vw,24px)', border:'1px solid rgba(255,255,255,.72)' }}>
              <p style={{ fontSize:9, fontWeight:700, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.1em', margin:'0 0 8px 0' }}>Can donate to</p>
              <p style={{ fontSize:'clamp(12px,1.3vw,16px)', fontWeight:900, color:'#dc2626', margin:0 }}>{getCanDonateTo(donor.blood_type)}</p>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} className="dd-glass dd-card-hover" style={{ borderRadius:18, padding:'clamp(16px,2vw,24px)', border:'1px solid rgba(255,255,255,.72)' }}>
              <p style={{ fontSize:9, fontWeight:700, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.1em', margin:'0 0 8px 0' }}>Total donations</p>
              <p style={{ fontSize:'clamp(12px,1.3vw,16px)', fontWeight:900, color:'#dc2626', margin:0 }}>{totalDonations} unit{totalDonations !== 1 ? 's' : ''}</p>
            </motion.div>
            {nextEligible ? (
              <motion.div
                whileHover={{ y: -4 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="dd-glass dd-card-hover"
                style={{ borderRadius:18, padding:'clamp(16px,2vw,24px)', border:'1px solid rgba(255,165,0,.3)', background:'rgba(255,165,0,.1)', gridColumn:'1 / -1' }}
              >
                <p style={{ fontSize:9, fontWeight:700, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.1em', margin:'0 0 8px 0' }}>Next eligible donation date</p>
                <p style={{ fontSize:'clamp(13px,1.4vw,16px)', fontWeight:900, color:'#dc2626', margin:0 }}>📅 {nextEligible}</p>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ y: -4 }}
                initial={{ scale: 0.9 }}
                animate={visible ? { scale: 1 } : { scale: 0.9 }}
                className="dd-glass dd-card-hover"
                style={{ borderRadius:18, padding:'clamp(16px,2vw,24px)', border:'1px solid rgba(34,197,94,.3)', background:'rgba(34,197,94,.1)', gridColumn:'1 / -1' }}
              >
                <p style={{ fontSize:9, fontWeight:700, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.1em', margin:'0 0 8px 0' }}>Donation eligibility</p>
                <p style={{ fontSize:'clamp(13px,1.4vw,16px)', fontWeight:900, color:'#22c55e', margin:0 }}>✅ You can donate now!</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Blood Requests Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="dd-glass-deep dd-card-hover"
          style={{ borderRadius:'clamp(24px,3.5vw,44px)', padding:'clamp(24px,3.5vw,40px)', border:'1px solid rgba(255,255,255,.72)' }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div className="dd-glass" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, border:'1px solid rgba(255,255,255,.72)' }}>1</div>
            <h3 style={{ fontSize:'clamp(16px,2vw,20px)', fontWeight:900, color:'#dc2626', margin:0 }}>Hospitals Requesting Your Blood Type</h3>
          </div>
          {inventory.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : { opacity: 0 }} style={{ textAlign:'center', paddingY:32 }}>
              <motion.p animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize:48, margin:0 }}>💤</motion.p>
              <p style={{ color:'rgba(211,47,47,.65)', fontWeight:700, fontSize:14, marginTop:12, marginBottom:0 }}>No urgent requests for your blood type right now.</p>
              <p style={{ color:'rgba(211,47,47,.4)', fontWeight:600, fontSize:12, marginTop:6, marginBottom:0 }}>We'll notify you by email when a hospital needs you.</p>
            </motion.div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <AnimatePresence>
                {inventory.map((item, idx) => {
                  const urgency = URGENCY_CONFIG[item.urgency] || URGENCY_CONFIG.urgent
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, x: 8 }}
                      className={`dd-glass dd-card-hover ${urgency.bg}`}
                      style={{ borderRadius:16, padding:16, border:'1px solid rgba(255,255,255,.4)' }}
                    >
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:8 }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:900, color:'#dc2626', margin:0 }}>{item.hospital_name}</p>
                          <p style={{ fontSize:11, color:'rgba(211,47,47,.65)', margin:'4px 0 0 0' }}>{item.hospital_address}</p>
                        </div>
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          style={{ background:'#dc2626', color:'#faf7f7', fontSize:11, fontWeight:900, padding:'6px 12px', borderRadius:10 }}
                        >
                          {item.blood_type}
                        </motion.span>
                      </div>
                      <motion.div
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ display:'flex', alignItems:'center', gap:6, fontSize:10 }}
                      >
                        <span className="dd-stat-dot" style={{ width:8, height:8, background: URGENCY_CONFIG[item.urgency]?.dot || '#ff6b6b', animation:'dd-pulse 2s infinite' }}/>
                        <span style={{ fontWeight:700, color: URGENCY_CONFIG[item.urgency]?.text }}>{urgency.label}</span>
                      </motion.div>
                      <p style={{ fontSize:11, fontWeight:900, color:'#dc2626', margin:'8px 0 0 0' }}>🩸 Needs {item.quantity_needed} units</p>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Appointment Booking */}
        {!maxReached && !nextEligible && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="dd-glass-deep dd-card-hover"
            style={{ borderRadius:'clamp(24px,3.5vw,44px)', padding:'clamp(24px,3.5vw,40px)', border:'1px solid rgba(255,255,255,.72)' }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div className="dd-glass" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, border:'1px solid rgba(255,255,255,.72)' }}>2</div>
              <h3 style={{ fontSize:'clamp(16px,2vw,20px)', fontWeight:900, color:'#dc2626', margin:0 }}>Book Your Donation Appointment</h3>
            </div>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(211,47,47,.65)', marginLeft:48, marginBottom:16, marginTop:0 }}>Choose a hospital from the list above and pick a time. After your appointment, the hospital will confirm your donation.</p>
            <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.6 }}>
              <AppointmentBooker donor={donor} onAppointmentsChange={setAppointments} />
            </motion.div>
          </motion.div>
        )}

        {/* Cooldown Message */}
        {nextEligible && !maxReached && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="dd-glass"
            style={{ borderRadius:'clamp(24px,3.5vw,44px)', padding:'clamp(24px,3.5vw,40px)', border:'1px solid rgba(255,165,0,.3)', background:'rgba(255,165,0,.1)' }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, background:'rgba(255,165,0,.3)' }}
              >
                2
              </motion.div>
              <h3 style={{ fontSize:'clamp(16px,2vw,20px)', fontWeight:900, color:'#dc2626', margin:0 }}>Donation Cooldown Active</h3>
            </div>
            <p style={{ fontSize:12, fontWeight:700, color:'rgba(211,47,47,.65)', marginLeft:48, marginTop:0, marginBottom:0 }}>You donated recently. You can book your next appointment from <strong>{nextEligible}</strong>.</p>
          </motion.div>
        )}

        {/* Donation History */}
        {hospitalRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="dd-glass-deep dd-card-hover"
            style={{ borderRadius:'clamp(24px,3.5vw,44px)', padding:'clamp(24px,3.5vw,40px)', border:'1px solid rgba(255,255,255,.72)' }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div className="dd-glass" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, border:'1px solid rgba(255,255,255,.72)' }}>3</div>
              <h3 style={{ fontSize:'clamp(16px,2vw,20px)', fontWeight:900, color:'#dc2626', margin:0 }}>Donation History</h3>
            </div>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(211,47,47,.65)', marginLeft:48, marginBottom:16, marginTop:0 }}>The hospital will confirm your donation after your appointment. You'll see it reflected here.</p>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <AnimatePresence>
                {hospitalRows.map((row, idx) => {
                  const unitsDonatedHere = row.donated_count
                  const canDonateHere = !!row.pending_notif_id && !maxReached
                  return (
                    <motion.div
                      key={row.hospital_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="dd-glass dd-card-hover"
                      style={{ borderRadius:16, padding:16, border:'1px solid rgba(255,255,255,.4)' }}
                    >
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:12 }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:900, color:'#dc2626', margin:0 }}>{row.hospital_name}</p>
                          <p style={{ fontSize:11, color:'rgba(211,47,47,.65)', margin:'4px 0 2px 0' }}>{row.hospital_address}</p>
                          <p style={{ fontSize:10, color:'rgba(211,47,47,.4)', margin:0 }}>{new Date(row.created_at).toLocaleDateString()}</p>
                        </div>
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          style={{ background:'rgba#991b1b', color:'#dc2626', fontSize:11, fontWeight:900, padding:'6px 12px', borderRadius:10, border:'1px solid rgba(211,47,47,.2)' }}
                        >
                          {row.blood_type}
                        </motion.span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                        {[1, 2].map(i => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.2 }}
                            style={{
                              width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                              fontWeight:900, fontSize:12, border:'2px solid rgba(211,47,47,.15)',
                              background: i <= unitsDonatedHere ? 'rgba(34,197,94,.15)' : undefined,
                              color: i <= unitsDonatedHere ? '#22c55e' : 'rgba(211,47,47,.4)',
                              borderColor: i <= unitsDonatedHere ? 'rgba(34,197,94,.4)' : undefined
                            }}
                          >
                            {i <= unitsDonatedHere ? '✓' : i}
                          </motion.div>
                        ))}
                        <span style={{ fontSize:10, fontWeight:700, color:'rgba(211,47,47,.65)', marginLeft:4 }}>
                          {unitsDonatedHere === 0 && 'Awaiting hospital confirmation'}
                          {unitsDonatedHere === 1 && '1 unit confirmed by hospital'}
                          {unitsDonatedHere >= 2 && '2 units confirmed by hospital'}
                        </span>
                      </div>
                      {canDonateHere && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="dd-glass"
                          style={{ borderRadius:12, padding:10, fontSize:10, fontWeight:700, color:'#991b1b', border:'1px solid rgba(64,88,120,.2)', background:'rgba(153,27,27,.1)' }}
                        >
                          ⏳ Waiting for hospital to confirm your donation after your appointment.
                        </motion.div>
                      )}
                      {unitsDonatedHere >= 2 && (
                        <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ fontSize:11, fontWeight:900, color:'#22c55e', margin:'8px 0 0 0' }}>
                          ✅ Complete — 2 units donated!
                        </motion.p>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {maxReached && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="dd-glass"
                  style={{ borderRadius:16, padding:16, border:'1px solid rgba(255,165,0,.3)', background:'rgba(255,165,0,.1)' }}
                >
                  <p style={{ fontSize:13, fontWeight:900, color:'#dc2626', margin:'0 0 8px 0' }}>You've given your all — time to recharge. 🌿</p>
                  <p style={{ fontSize:11, fontWeight:700, color:'rgba(211,47,47,.65)', lineHeight:1.6, margin:0 }}>
                    💧 Drink extra water · 🥩 Eat iron-rich foods · 😴 Sleep well · 🚫 Skip intense workouts for 24 hours. Come back in 3 months!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

      </main>
    </div>
  )
}

export default Dashboard