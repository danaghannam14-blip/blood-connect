import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChangePassword from '../components/ChangePassword'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: '#DC2626', bg: 'from-red-500 to-red-600', light: 'rgba(220,38,38,.15)', border: 'border-red-300' },
  urgent:   { label: 'Urgent',   color: '#EA580C', bg: 'from-orange-500 to-orange-600', light: 'rgba(234,88,12,.15)', border: 'border-orange-300' },
  medium:   { label: 'Medium',   color: '#FBBF24', bg: 'from-yellow-500 to-yellow-600', light: 'rgba(251,191,36,.15)', border: 'border-yellow-300' },
  low:      { label: 'Low',      color: '#6B7280', bg: 'from-gray-500 to-gray-600', light: 'rgba(107,114,128,.15)', border: 'border-gray-200' }
}

/* ─── Injected Styles ─────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  @keyframes bc-ping      { 75%,100% { transform:scale(2.2); opacity:0; } }
  @keyframes bc-pulse     { 0%,100%  { opacity:1; } 50% { opacity:.4; } }
  @keyframes bc-float-b   { 0%,100%  { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes bc-particle  { 0%,100% { transform:translateY(0) translateX(0) scale(1); opacity:.3; } 50% { transform:translateY(-28px) translateX(var(--px,6px)) scale(1.2); opacity:.8; } }
  @keyframes bc-orb       { 0%,100% { transform:translateY(0) translateX(0) scale(1); } 33% { transform:translateY(-30px) translateX(20px) scale(1.08); } 66% { transform:translateY(8px) translateX(-10px) scale(.96); } }
  @keyframes bc-gradient  { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes bc-spin8     { to { transform:rotate(360deg); } }
  @keyframes bc-shimmer   { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

  .hd-root {
    min-height:100vh;
    background:linear-gradient(-45deg,#f8f8f8,#efefef,#f8f8f8,rgba(14,165,233,.25));
    background-size:400% 400%;
    animation:bc-gradient 14s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
  }

  .hd-glass {
    background:rgba(255,255,255,.42);
    backdrop-filter:blur(28px) saturate(180%);
    -webkit-backdrop-filter:blur(28px) saturate(180%);
    border:1px solid rgba(255,255,255,.72);
    box-shadow:0 8px 32px rgba(211,47,47,.07),inset 0 0 20px rgba(255,255,255,.6);
  }

  .hd-glass-deep {
    background:rgba(255,255,255,.35);
    backdrop-filter:blur(40px) contrast(1.1);
    -webkit-backdrop-filter:blur(40px) contrast(1.1);
    border:1px solid rgba(255,255,255,.8);
    box-shadow:0 24px 56px -12px rgba(211,47,47,.08),inset 0 0 36px rgba(255,255,255,.6);
  }

  .hd-orb { 
    position:absolute;
    border-radius:50%;
    filter:blur(100px);
    pointer-events:none;
    animation:bc-orb var(--dur,8s) ease-in-out infinite; 
  }

  .hd-particle { 
    position:absolute;
    border-radius:50%;
    pointer-events:none;
    animation:bc-particle var(--dur,5s) ease-in-out infinite; 
  }

  .hd-input {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    border:2px solid rgba(211,47,47,.15);
    color:#dc2626;
    transition:all .28s cubic-bezier(.22,1,.36,1);
  }

  .hd-input:focus {
    background:rgba(255,255,255,.72);
    border-color:rgba(211,47,47,.5);
    box-shadow:0 8px 24px rgba(211,47,47,.12);
  }

  .hd-btn {
    position:relative;overflow:hidden;cursor:pointer;
    border:none;outline:none;
    transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s;
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  .hd-btn::after {
    content:'';position:absolute;top:50%;left:50%;
    width:0;height:0;background:rgba(255,255,255,.28);border-radius:50%;
    transform:translate(-50%,-50%);transition:width .4s,height .4s;
  }

  .hd-btn:hover::after { width:300px;height:300px; }
  .hd-btn:hover  { transform:translateY(-3px) scale(1.05); }
  .hd-btn:active { transform:scale(.97); }

  .hd-btn-primary {
    background:linear-gradient(135deg,#dc2626,#ff6b6b);
    color:#faf7f7;
    box-shadow:0 12px 32px rgba(211,47,47,.32);
  }

  .hd-btn-primary:hover { box-shadow:0 18px 48px rgba(211,47,47,.44); }

  .hd-card-hover { transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s; }
  .hd-card-hover:hover { transform:translateY(-4px) scale(1.01);box-shadow:0 20px 50px rgba(211,47,47,.15) !important; }

  .hd-tab-btn {
    position:relative;overflow:hidden;
    background:rgba(255,255,255,.5);
    border:2px solid rgba(211,47,47,.2);
    color:#dc2626;
    font-weight:700;
    transition:all .28s cubic-bezier(.22,1,.36,1);
  }

  .hd-tab-btn.active {
    background:linear-gradient(135deg,#dc2626,#ff6b6b);
    color:#faf7f7;
    border-color:transparent;
    box-shadow:0 10px 28px rgba(211,47,47,.3);
  }

  .hd-stat-dot {
    display:inline-block;
    width:10px;
    height:10px;
    border-radius:50%;
    animation:bc-pulse 2s ease-in-out infinite;
  }
`

if (typeof document !== 'undefined' && !document.getElementById('hd-styles')) {
  const s = document.createElement('style')
  s.id = 'hd-styles'
  s.textContent = STYLES
  document.head.appendChild(s)
}

/* ─── Particle Field ─────────────────────────────────────── */
function ParticleField() {
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

  return (
    <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="hd-particle"
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

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon, value, label, color = '#dc2626', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      className="hd-glass hd-card-hover"
      style={{
        borderRadius: '20px',
        padding: '24px',
        border: '2px solid rgba(211,47,47,.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, background:'rgba(255,235,238,.5)', borderRadius:'50%', filter:'blur(30px)', pointerEvents:'none' }}/>
      <div style={{ display:'flex', alignItems:'center', gap:16, position:'relative', zIndex:1 }}>
        <div style={{
          width:56,
          height:56,
          background:`rgba(${color === '#dc2626' ? '211,47,47' : '14,165,233'},.1)`,
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

function HospitalDashboard() {
  const navigate = useNavigate()
  const [hospital, setHospital] = useState(null)
  const [requests, setRequests] = useState([])
  const [bloodStock, setBloodStock] = useState({})
  const [stockMessage, setStockMessage] = useState('')
  const [transfusionForm, setTransfusionForm] = useState({ blood_type: '', units: 1 })
  const [transfusionMessage, setTransfusionMessage] = useState('')
  const [transfusions, setTransfusions] = useState([])
  const [emergencyDonations, setEmergencyDonations] = useState([])
  const [form, setForm] = useState({ blood_type: '', quantity_needed: '', urgency: 'urgent' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('requests')
  const [visible, setVisible] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  useEffect(() => {
    const data = localStorage.getItem('hospitalData')
    if (!data) { navigate('/login'); return }
    setHospital(JSON.parse(data))
  }, [])

  useEffect(() => {
    if (!hospital) return
    loadData()
  }, [hospital])

  const loadData = async () => {
    setLoading(true)
    try {
      const [reqRes, stockRes, transfusionRes, emergencyRes] = await Promise.all([
        axios.get(`${API}/api/requests/hospital/${hospital.id}`),
        axios.get(`${API}/api/hospitals/stock/${hospital.id}`),
        axios.get(`${API}/api/hospitals/transfusions/${hospital.id}`),
        axios.get(`${API}/api/blood-requests/all-emergency-donations`)
      ])
      setRequests(reqRes.data)
      const stockMap = {}
      stockRes.data.forEach(s => { stockMap[s.blood_type] = s.units_available })
      setBloodStock(stockMap)
      setTransfusions(transfusionRes.data)
      setEmergencyDonations(emergencyRes.data || [])
    } catch (err) { console.log(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)
    try {
      await axios.post(`${API}/api/requests/create`, {
        hospital_id: hospital.id,
        blood_type: form.blood_type,
        quantity_needed: form.quantity_needed,
        urgency: form.urgency
      })
      setMessage('✅ Request posted! Donors are being notified.')
      setForm({ blood_type: '', quantity_needed: '', urgency: 'urgent' })
      loadData()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to post request')
    } finally { setSubmitting(false) }
  }

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Delete this blood request?')) return
    try {
      const response = await fetch(`${API}/api/requests/${requestId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Error deleting request:', error)
    }
  }

  const handleConfirmDonation = async (notificationId) => {
    setConfirmingId(notificationId)
    try {
      await axios.post(`${API}/api/blood-requests/hospital-confirm`, {
        notificationId,
        hospitalId: hospital.id
      })
      alert('✅ Donation confirmed! Patient notified.')
      loadData()
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message))
    } finally {
      setConfirmingId(null)
    }
  }

  const handleSaveStock = async () => {
    setStockMessage('')
    try {
      await Promise.all(
        Object.entries(bloodStock).map(([bt, units]) =>
          axios.put(`${API}/api/hospitals/stock/${hospital.id}`, {
            blood_type: bt,
            units_available: units
          })
        )
      )
      setStockMessage('✅ Blood stock updated successfully!')
    } catch (err) {
      setStockMessage('Failed to update stock')
    }
  }

  const handleRecordTransfusion = async () => {
    if (!transfusionForm.blood_type) return
    setTransfusionMessage('')
    try {
      const res = await axios.post(`${API}/api/hospitals/transfusion/${hospital.id}`, transfusionForm)
      setTransfusionMessage(`✅ Recorded! ${transfusionForm.units} unit(s) of ${transfusionForm.blood_type} used. ${res.data.remaining} remaining.`)
      setTransfusionForm({ blood_type: '', units: 1 })
      loadData()
    } catch (err) {
      setTransfusionMessage(err.response?.data?.message || 'Failed to record transfusion')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hospitalToken')
    localStorage.removeItem('hospitalData')
    navigate('/')
  }

  if (!hospital) return null

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const fulfilledCount = requests.filter(r => r.status === 'fulfilled').length
  const emergencyAwaitingCount = emergencyDonations.filter(d => d.status === 'awaiting_confirmation' && d.donor_donation_location === 'hospital' && d.hospital_id === hospital.id).length

  const fadeUp = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
  })

  return (
    <div className="hd-root">
      <ParticleField />

      {/* Orbs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[
          { t:'8%', l:'8%', w:'min(380px,32vw)', c:'rgba(211,47,47,.17)', d:'0s' },
          { b:'15%', r:'10%', w:'min(420px,36vw)', c:'rgba(14,165,233,.22)', d:'-3s' },
          { t:'50%', r:'8%', w:'min(280px,24vw)', c:'rgba(255,235,238,.5)', d:'-6s' },
        ].map((o, i) => (
          <div key={i} className="hd-orb" style={{ '--dur':'9s', width:o.w, height:o.w, background:o.c, top:o.t, bottom:o.b, left:o.l, right:o.r, animationDelay:o.d }}/>
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hd-glass"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          borderBottom: '2px solid rgba(211,47,47,.3)',
          backdropFilter: 'blur(40px)',
        }}
      >
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#dc2626,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#faf7f7', fontWeight: 900, fontSize: 22, boxShadow: '0 8px 24px rgba(211,47,47,.3)' }}>
              H
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', margin: 0 }}>{hospital.name}</h1>
              <p style={{ fontSize: 10, color: 'rgba(211,47,47,.5)', margin: '4px 0 0', fontWeight: 700, letterSpacing: '.1em' }}>{hospital.email}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="hd-btn hd-btn-primary"
            style={{ padding: '10px 24px', borderRadius: 14, fontSize: 13, fontWeight: 900 }}
          >
            Logout
          </motion.button>
        </div>
      </motion.div>

      <main style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: '32px 24px' }}>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 44 }}
        >
          <StatCard
            icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#EA580C' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-13h-2v6h6v-2h-4z"/></svg>}
            value={pendingCount}
            label="Active Requests"
            color="#EA580C"
            delay={0.1}
          />
          <StatCard
            icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#22C55E' }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
            value={fulfilledCount}
            label="Fulfilled"
            color="#22C55E"
            delay={0.2}
          />
          <StatCard
            icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#DC2626' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z"/></svg>}
            value={emergencyAwaitingCount}
            label="Emergency Awaiting"
            color="#DC2626"
            delay={0.3}
          />
        </motion.div>

        {/* Emergency Donations Section */}
        {emergencyAwaitingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
            transition={{ delay: 0.4 }}
            className="hd-glass-deep hd-card-hover"
            style={{ borderRadius: 28, padding: 32, border: '2px solid #dc2626', background:'linear-gradient(135deg, rgba(220,38,38,.08), rgba(255,107,107,.04))', marginBottom: 44, position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, background: 'rgba(255,235,238,.4)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 20px', position: 'relative', zIndex: 1 }}>🩸 Emergency Donations Awaiting Confirmation</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
              <AnimatePresence>
                {emergencyDonations
                  .filter(d => d.status === 'awaiting_confirmation' && d.donor_donation_location === 'hospital' && d.hospital_id === hospital.id)
                  .map((donation, idx) => (
                    <motion.div
                      key={donation.notification_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hd-glass hd-card-hover"
                      style={{
                        borderRadius: 18,
                        padding: 18,
                        border: '2px solid rgba(220,38,38,.3)',
                        background: 'rgba(254,226,226,.5)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 900, color: '#dc2626', margin: '0 0 6px 0' }}>
                          {donation.blood_type} • {donation.donor_name}
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(211,47,47,.65)', margin: '0 0 4px 0', fontWeight: 700 }}>
                          Patient: {donation.patient_email}
                        </p>
                        <p style={{ fontSize: 10, color: 'rgba(211,47,47,.5)', margin: '0 0 0 0', fontWeight: 700 }}>
                          🏥 Hospital: {donation.hospital_name || 'BCC Hamra Center'}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleConfirmDonation(donation.notification_id)}
                        disabled={confirmingId === donation.notification_id}
                        style={{
                          background: confirmingId === donation.notification_id ? '#ccc' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                          color: '#fff',
                          border: 'none',
                          padding: '9px 18px',
                          borderRadius: 10,
                          fontWeight: 900,
                          fontSize: 12,
                          cursor: confirmingId === donation.notification_id ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                          opacity: confirmingId === donation.notification_id ? 0.7 : 1
                        }}
                        className="hd-btn"
                      >
                        {confirmingId === donation.notification_id ? '⏳ Confirming...' : '✅ Confirm Donation'}
                      </motion.button>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}
        >
          {['requests', 'stock', 'transfusions', 'post'].map((t, i) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(t)}
              className={`hd-btn hd-tab-btn ${activeTab === t ? 'active' : ''}`}
              style={{
                padding: '10px 18px',
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 900,
                transitionDelay: `${i * 50}ms`
              }}
            >
              {t === 'post' ? '+ Post Request' :
               t === 'stock' ? 'Blood Stock' :
               t === 'transfusions' ? 'Blood Used' :
               'Requests'}
            </motion.button>
          ))}
        </motion.div>

        {/* Content Sections - Keep existing sections unchanged */}
        <AnimatePresence mode="wait">

          {/* POST REQUEST TAB */}
          {activeTab === 'post' && (
            <motion.div
              key="post"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="hd-glass-deep hd-card-hover"
              style={{ borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,235,238,.4)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
              
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 20px', position: 'relative', zIndex: 1 }}>Post Blood Request</h2>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hd-glass"
                  style={{
                    background: message.startsWith('✅') ? 'rgba(34,197,94,.15)' : 'rgba(255,235,238,.8)',
                    border: `2px solid ${message.startsWith('✅') ? '#22c55e' : 'rgba(211,47,47,.4)'}`,
                    padding: 14,
                    borderRadius: 14,
                    marginBottom: 20,
                    textAlign: 'center',
                    color: message.startsWith('✅') ? '#22c55e' : '#dc2626',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {message}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8, display: 'block' }}>Blood Type</label>
                  <select
                    value={form.blood_type}
                    onChange={e => setForm({...form, blood_type: e.target.value})}
                    className="hd-input"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700 }}
                    required
                  >
                    <option value="">Select Blood Type</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8, display: 'block' }}>Units Needed</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    min="1"
                    value={form.quantity_needed}
                    onChange={e => setForm({...form, quantity_needed: e.target.value})}
                    className="hd-input"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 12, display: 'block' }}>Urgency Level</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {Object.entries(URGENCY_CONFIG).map(([key, val]) => (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setForm({...form, urgency: key})}
                        className="hd-glass hd-btn"
                        style={{
                          padding: 12,
                          borderRadius: 14,
                          border: `2px solid ${form.urgency === key ? val.color : 'rgba(211,47,47,.15)'}`,
                          background: form.urgency === key ? `linear-gradient(135deg, ${val.color}, ${val.color}40)` : undefined,
                          color: form.urgency === key ? '#faf7f7' : val.color,
                          fontWeight: 900,
                          fontSize: 11,
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          textTransform: 'uppercase',
                          letterSpacing: '.1em',
                        }}
                      >
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: val.color,
                          boxShadow: `0 0 12px ${val.color}80`,
                          animation: form.urgency === key ? 'bc-pulse 1.5s ease-in-out infinite' : 'none',
                        }} />
                        {val.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="hd-btn hd-btn-primary"
                  style={{ padding: 14, borderRadius: 16, fontSize: 14, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 }}
                >
                  {submitting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,.3)', borderTopColor: '#faf7f7', borderRadius: '50%' }} />
                      Posting...
                    </>
                  ) : (
                    'Post Request & Notify Donors'
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="hd-glass-deep"
              style={{ borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)', position: 'relative', overflow: 'hidden' }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 20px', position: 'relative', zIndex: 1 }}>Your Blood Requests</h2>

              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 12 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ width: 40, height: 40, border: '4px solid rgba(211,47,47,.15)', borderTopColor: '#dc2626', borderRadius: '50%' }} />
                </div>
              ) : requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(211,47,47,.4)', margin: 0 }}>No requests yet.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActiveTab('post')}
                    style={{ marginTop: 16, color: '#dc2626', fontWeight: 900, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    + Post your first request
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05 }}
                >
                  {requests.map((r, i) => {
                    const urgency = URGENCY_CONFIG[r.urgency] || URGENCY_CONFIG.urgent
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hd-glass hd-card-hover"
                        style={{
                          borderRadius: 18,
                          padding: 18,
                          border: `2px solid ${urgency.color}40`,
                          background: urgency.light,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: `${urgency.color}20`, borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                              <span style={{ fontSize: 24, fontWeight: 900, color: urgency.color }}>{r.blood_type}</span>
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 900,
                                  padding: '6px 12px',
                                  borderRadius: 9,
                                  background: `linear-gradient(135deg, ${urgency.color}, ${urgency.color}80)`,
                                  color: '#faf7f7',
                                  textTransform: 'uppercase',
                                  letterSpacing: '.1em',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                <span className="hd-stat-dot" style={{ background: urgency.color }} />
                                {urgency.label}
                              </motion.span>
                            </div>
                            <p style={{ fontSize: 13, color: '#333', margin: '8px 0', fontWeight: 700 }}>{r.quantity_needed} units needed</p>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 900,
                              padding: '6px 12px',
                              borderRadius: 9,
                              background: r.status === 'pending' ? 'rgba(234,88,12,.15)' : 'rgba(34,197,94,.15)',
                              color: r.status === 'pending' ? '#EA580C' : '#22c55e',
                              textTransform: 'uppercase',
                              letterSpacing: '.1em',
                              display: 'inline-block',
                            }}>
                              {r.status}
                            </span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteRequest(r.id)}
                            className="hd-glass hd-btn"
                            style={{
                              fontSize: 11,
                              fontWeight: 900,
                              color: '#dc2626',
                              background: 'rgba(255,255,255,.7)',
                              padding: '8px 14px',
                              borderRadius: 10,
                              border: '2px solid rgba(211,47,47,.2)',
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STOCK TAB */}
          {activeTab === 'stock' && (
            <motion.div
              key="stock"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="hd-glass-deep"
              style={{ borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)', position: 'relative', overflow: 'hidden' }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 8px', position: 'relative', zIndex: 1 }}>Current Blood Stock</h2>
              <p style={{ fontSize: 12, color: 'rgba(211,47,47,.5)', margin: '0 0 16px', fontWeight: 600, position: 'relative', zIndex: 1 }}>Update your current blood inventory. This is visible to donors on the map.</p>

              {stockMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginBottom: 20,
                    padding: 14,
                    borderRadius: 14,
                    background: stockMessage.startsWith('✅') ? 'rgba(34,197,94,.15)' : 'rgba(255,235,238,.8)',
                    border: `2px solid ${stockMessage.startsWith('✅') ? '#22c55e' : 'rgba(211,47,47,.4)'}`,
                    color: stockMessage.startsWith('✅') ? '#22c55e' : '#dc2626',
                    fontWeight: 700,
                    fontSize: 13,
                    textAlign: 'center',
                  }}
                >
                  {stockMessage}
                </motion.div>
              )}

              <div className="hd-glass" style={{ background: 'rgba(255,184,66,.15)', border: '2px solid rgba(255,184,66,.3)', borderRadius: 16, padding: 14, marginBottom: 20, position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(211,47,47,.7)', margin: 0 }}>Having stock doesn't mean donations aren't needed. Blood expires quickly and reserves must stay topped up.</p>
              </div>

              <motion.div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20, position: 'relative', zIndex: 1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
              >
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bt, i) => {
                  const units = bloodStock[bt] ?? 0
                  const dotColor = units === 0 ? '#DC2626' : units <= 5 ? '#EA580C' : '#22C55E'
                  const bgColor = units === 0 ? 'rgba(220,38,38,.15)' : units <= 5 ? 'rgba(234,88,12,.15)' : 'rgba(34,197,94,.15)'
                  return (
                    <motion.div
                      key={bt}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="hd-glass hd-card-hover"
                      style={{
                        borderRadius: 16,
                        padding: 14,
                        border: `2px solid ${dotColor}40`,
                        background: bgColor,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: dotColor,
                          boxShadow: `0 0 12px ${dotColor}80`,
                        }} />
                        <span style={{ fontSize: 16, fontWeight: 900, color: dotColor }}>{bt}</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={units}
                        onChange={e => setBloodStock(prev => ({...prev, [bt]: parseInt(e.target.value) || 0}))}
                        className="hd-input"
                        style={{
                          padding: '8px 10px',
                          fontSize: 13,
                          borderRadius: 10,
                          textAlign: 'center',
                          fontWeight: 900,
                        }}
                      />
                      <span style={{ fontSize: 9, color: 'rgba(211,47,47,.4)', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '.1em' }}>units</span>
                    </motion.div>
                  )
                })}
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveStock}
                className="hd-btn hd-btn-primary"
                style={{ width: '100%', padding: 14, borderRadius: 16, fontSize: 14, fontWeight: 900, position: 'relative', zIndex: 1 }}
              >
                Save Blood Stock
              </motion.button>
            </motion.div>
          )}

          {/* TRANSFUSIONS TAB */}
          {activeTab === 'transfusions' && (
            <motion.div
              key="transfusions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="hd-glass-deep"
              style={{ borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)', position: 'relative', overflow: 'hidden' }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 8px', position: 'relative', zIndex: 1 }}>Record Blood Usage</h2>
              <p style={{ fontSize: 12, color: 'rgba(211,47,47,.5)', margin: '0 0 20px', fontWeight: 600, position: 'relative', zIndex: 1 }}>When a patient receives blood, record it here to keep stock accurate.</p>

              {transfusionMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginBottom: 20,
                    padding: 14,
                    borderRadius: 14,
                    background: transfusionMessage.startsWith('✅') ? 'rgba(34,197,94,.15)' : 'rgba(255,235,238,.8)',
                    border: `2px solid ${transfusionMessage.startsWith('✅') ? '#22c55e' : 'rgba(211,47,47,.4)'}`,
                    color: transfusionMessage.startsWith('✅') ? '#22c55e' : '#dc2626',
                    fontWeight: 700,
                    fontSize: 13,
                    textAlign: 'center',
                  }}
                >
                  {transfusionMessage}
                </motion.div>
              )}

              <div className="hd-glass" style={{ background: 'rgba(255,235,238,.4)', border: '2px solid rgba(211,47,47,.15)', borderRadius: 18, padding: 18, marginBottom: 24, position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 900, color: '#dc2626', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '.1em' }}>Record New Transfusion</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8, display: 'block' }}>Blood Type Used</label>
                    <select
                      value={transfusionForm.blood_type}
                      onChange={e => setTransfusionForm({...transfusionForm, blood_type: e.target.value})}
                      className="hd-input"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700 }}
                    >
                      <option value="">Select blood type</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
                        <option key={bt} value={bt}>{bt} — {bloodStock[bt] ?? 0} units available</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8, display: 'block' }}>Units Used</label>
                    <input
                      type="number"
                      min="1"
                      value={transfusionForm.units}
                      onChange={e => setTransfusionForm({...transfusionForm, units: parseInt(e.target.value) || 1})}
                      className="hd-input"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700 }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRecordTransfusion}
                    disabled={!transfusionForm.blood_type}
                    className="hd-btn hd-btn-primary"
                    style={{ padding: 12, borderRadius: 14, fontSize: 13, fontWeight: 900 }}
                  >
                    Record Blood Usage
                  </motion.button>
                </div>
              </div>

              <p style={{ fontSize: 13, fontWeight: 900, color: '#dc2626', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '.1em', position: 'relative', zIndex: 1 }}>Recent Transfusions</p>
              {transfusions.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'rgba(211,47,47,.4)', fontSize: 13, padding: '24px 16px', position: 'relative', zIndex: 1 }}>No transfusions recorded yet.</p>
              ) : (
                <motion.div
                  style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 1 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05 }}
                >
                  {transfusions.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hd-glass hd-card-hover"
                      style={{
                        borderRadius: 14,
                        padding: 12,
                        background: 'rgba(255,235,238,.4)',
                        border: '2px solid rgba(211,47,47,.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span style={{ color: '#dc2626', fontWeight: 900, fontSize: 13 }}>{t.blood_type}</span>
                        <span style={{ color: 'rgba(211,47,47,.5)', fontSize: 11, marginLeft: 12, fontWeight: 700 }}>{t.units} unit(s) used</span>
                        {t.notes && <p style={{ fontSize: 11, color: 'rgba(211,47,47,.4)', margin: '4px 0 0', fontWeight: 600 }}>{t.notes}</p>}
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(211,47,47,.4)', fontWeight: 700 }}>{new Date(t.created_at).toLocaleDateString('en-GB')}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ delay: 0.5 }}
          className="hd-glass-deep hd-card-hover"
          style={{ borderRadius: 28, padding: 32, marginTop: 44, border: '2px solid rgba(211,47,47,.2)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, background: 'rgba(255,235,238,.4)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 20px', position: 'relative', zIndex: 1 }}>Change Password</h2>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ChangePassword
              onSubmit={async (oldPass, newPass) => {
                const hospitalData = JSON.parse(localStorage.getItem('hospitalData'))
                return await axios.put(`${API}/api/hospitals/change-password`, {
                  hospital_id: hospitalData.id,
                  old_password: oldPass,
                  new_password: newPass
                })
              }}
            />
          </div>
        </motion.div>

      </main>
    </div>
  )
}

export default HospitalDashboard