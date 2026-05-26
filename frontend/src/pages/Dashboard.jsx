import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://blood-bank-eqyr.onrender.com'

const UNIFIED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes pulse-ring { 0% { transform:scale(.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }

  .dd-root {
    min-height:100vh;
    background:linear-gradient(135deg,#f8f8f8 0%,#efefef 25%,#e8e8e8 50%,#f2f2f2 75%,#f8f8f8 100%);
    background-size:400% 400%;
    animation:gradient-shift 15s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
    color:#380101;
    zoom: 0.82;
  }

  .dd-glass {
    background:rgba(255,255,255,.6);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(180,180,180,.2);
    box-shadow:0 8px 32px rgba(0,0,0,.08);
  }

  .dd-glass-deep {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(180,180,180,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.1),inset 0 1px 1px rgba(255,255,255,.3);
  }

  .dd-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .dd-btn {
    position:relative;
    overflow:hidden;
    cursor:pointer;
    border:none;
    outline:none;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
    border-radius:14px;
  }

  .dd-btn::before {
    content:'';
    position:absolute;
    top:0;
    left:-100%;
    width:100%;
    height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
    transition:left .5s;
  }

  .dd-btn:hover::before { left:100%; }

  .dd-btn-primary {
    background:linear-gradient(135deg,#dc2626 0%,#991b1b 50%,#7f1d1d 100%);
    color:#faf7f7;
    box-shadow:0 10px 30px rgba(220,38,38,.35);
    border:1px solid rgba(255,255,255,.15);
  }

  .dd-btn-primary:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 20px 60px rgba(220,38,38,.5);
  }

  .dd-btn-secondary {
    background:rgba(255,255,255,.7);
    backdrop-filter:blur(10px);
    border:1.5px solid rgba(180,180,180,.3);
    color:#380101;
  }

  .dd-btn-secondary:hover {
    background:rgba(255,255,255,.85);
    border-color:rgba(180,180,180,.5);
    transform:translateY(-2px);
  }

  .dd-btn-success {
    background:linear-gradient(135deg,rgba(34,197,94,.2),rgba(34,197,94,.08));
    border:1.5px solid rgba(34,197,94,.4);
    color:#16a34a;
    box-shadow:0 8px 24px rgba(34,197,94,.15);
  }

  .dd-btn-success:hover {
    background:linear-gradient(135deg,rgba(34,197,94,.3),rgba(34,197,94,.15));
    border-color:rgba(34,197,94,.6);
    transform:translateY(-2px);
  }

  .dd-btn-danger {
    background:linear-gradient(135deg,rgba(220,38,38,.2),rgba(220,38,38,.08));
    border:1.5px solid rgba(220,38,38,.4);
    color:#dc2626;
    box-shadow:0 8px 24px rgba(220,38,38,.12);
  }

  .dd-btn-danger:hover {
    background:linear-gradient(135deg,rgba(220,38,38,.3),rgba(220,38,38,.15));
    border-color:rgba(220,38,38,.6);
    transform:translateY(-2px);
  }

  .dd-card-hover {
    transition:all .4s cubic-bezier(.22,1,.36,1);
  }

  .dd-card-hover:hover {
    transform:translateY(-8px) scale(1.02);
    box-shadow:0 32px 80px rgba(220,38,38,.2) !important;
  }

  .dd-tab-btn {
    position:relative;
    padding: clamp(12px,1.5vw,16px) clamp(20px,2.5vw,28px);
    font-size: clamp(13px,1.1vw,15px);
    font-weight: 700;
    border: none;
    background: transparent;
    cursor: pointer;
    color: rgba(56,1,1,.6);
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
  }

  .dd-tab-btn.active {
    color: #dc2626;
    border-bottom-color: #dc2626;
  }

  .dd-tab-btn:hover {
    color: #dc2626;
  }

  @media (max-width:1200px) {
    .dd-root { zoom: 0.88; }
  }

  @media (max-width:1024px) {
    .dd-root { zoom: 0.85; }
  }

  @media (max-width:768px) {
    .dd-root { zoom: 0.75; }
  }

  @media (max-width:480px) {
    .dd-root { zoom: 0.65; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('dd-styles-unified')) {
  const s = document.createElement('style')
  s.id = 'dd-styles-unified'
  s.textContent = UNIFIED_STYLES
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
          className="dd-float-orb"
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

function Dashboard() {
  const navigate = useNavigate()
  const [donor, setDonor] = useState(null)
  const [activeTab, setActiveTab] = useState('emergency')
  const [emergencyRequests, setEmergencyRequests] = useState([])
  const [hospitalRequests, setHospitalRequests] = useState([])
  const [notifications, setNotifications] = useState([])
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
    
    // Load donations - SEPARATE calls for patient emergencies vs hospital requests
    const loadAllDonations = async () => {
      try {
        // ✅ Patient emergencies from blood-requests
        const emergencyRes = await axios.get(`${API}/api/blood-requests/donor/${donorData.id}`)
        const patientEmergencies = emergencyRes.data || []
        console.log('[Dashboard] Patient emergencies:', patientEmergencies.length)
        
        // ✅ Hospital requests from requests (completely separate)
        const hospitalRes = await axios.get(`${API}/api/requests/donor/${donorData.id}`)
        const hospitalRequests = hospitalRes.data || []
        console.log('[Dashboard] Hospital requests:', hospitalRequests.length)
        
        setEmergencyRequests(patientEmergencies)
        setHospitalRequests(hospitalRequests)
      } catch (err) {
        console.error('[Dashboard] Error fetching donations:', err)
      } finally {
        setLoadingEmergency(false)
      }
    }
    
    loadAllDonations()
    
    // Auto-refresh every 500ms (5x faster for real-time updates)
    const interval = setInterval(() => {
      console.log('[Dashboard] Auto-polling...')
      loadAllDonations()
    }, 500)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [navigate])

  // Hospital requests are now loaded in the main effect above

  // Separate effect for hospitals list
  useEffect(() => {
    axios.get(`${API}/api/hospitals/all`).then(res => setHospitals(res.data || [])).catch(console.log)
  }, [])

  // Animation visibility
  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('donorToken')
    localStorage.removeItem('donorData')
    navigate('/')
  }

  const handleDonateAtCenter = async (notificationId) => {
    setConfirmingId(notificationId)
    try {
      await axios.post(`${API}/api/blood-requests/donor-confirm-donation`, {
        notification_id: notificationId,
        donation_location: 'center'
      })
      alert('Center donation confirmed!')
      // Refresh data immediately
      setTimeout(async () => {
        const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
        console.log('[Refresh after confirm] New data:', res.data)
        const allRequests = res.data || []
        const patientEmergencies = allRequests.filter(d => !d.hospital_id)
        const hospitalRequests = allRequests.filter(d => d.hospital_id)
        setEmergencyRequests(patientEmergencies)
        setHospitalRequests(hospitalRequests)
        setExpandedNotif(null)
      }, 500)
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setConfirmingId(null)
    }
  }

  const handleDonateAtHospital = async (notificationId, hospitalId) => {
    setConfirmingId(notificationId)
    try {
      await axios.post(`${API}/api/blood-requests/donor-confirm-donation`, {
        notification_id: notificationId,
        donation_location: 'hospital',
        hospital_id: hospitalId
      })
      alert('Hospital donation confirmed!')
      // Refresh data immediately
      setTimeout(async () => {
        const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
        console.log('[Refresh after confirm] New data:', res.data)
        const allRequests = res.data || []
        const patientEmergencies = allRequests.filter(d => !d.hospital_id)
        const hospitalRequests = allRequests.filter(d => d.hospital_id)
        setEmergencyRequests(patientEmergencies)
        setHospitalRequests(hospitalRequests)
        setShowHospitalSelect(null)
        setExpandedNotif(null)
      }, 500)
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setConfirmingId(null)
    }
  }

  const handleDidntShowUp = async (notificationId) => {
    if (!window.confirm('Are you sure you want to decline this donation request?')) return
    setConfirmingId(notificationId)
    try {
      await axios.delete(`${API}/api/blood-requests/${notificationId}`)
      alert('Request marked as declined.')
      // Refresh data immediately
      setTimeout(async () => {
        const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
        console.log('[Refresh after decline] New data:', res.data)
        const allRequests = res.data || []
        const patientEmergencies = allRequests.filter(d => !d.hospital_id)
        const hospitalRequests = allRequests.filter(d => d.hospital_id)
        setEmergencyRequests(patientEmergencies)
        setHospitalRequests(hospitalRequests)
        setExpandedNotif(null)
      }, 500)
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setConfirmingId(null)
    }
  }

  if (!donor) return null

  const totalDonations = notifications.filter(n => n.donated).length

  return (
    <div className="dd-root">
      <AnimatedBackgroundOrbs />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: 'clamp(16px,2.5vw,32px)' }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="dd-glass-deep"
          style={{
            padding: 'clamp(24px,3vw,36px)',
            borderRadius: 'clamp(20px,2.5vw,28px)',
            marginBottom: 'clamp(20px,2.5vw,28px)',
            border: '1px solid rgba(180,180,180,.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'clamp(12px,2vw,20px)' }}>
            <div>
              <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#dc2626', margin: 0, lineHeight: 1.1 }}>
                Welcome, {donor.full_name}
              </h1>
              <p style={{ fontSize: 'clamp(12px,1.2vw,14px)', color: 'rgba(56,1,1,.6)', fontWeight: 600, margin: 'clamp(8px,1vw,12px) 0 0', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Blood Type: {donor.blood_type} • Governorate: {donor.governorate}
              </p>
            </div>
            <motion.button
              onClick={handleLogout}
              className="dd-btn dd-btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: 'clamp(12px,1.5vw,16px) clamp(20px,2.5vw,28px)', fontSize: 'clamp(12px,1.1vw,14px)', fontWeight: 700 }}
            >
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="dd-glass-deep"
          style={{
            padding: '0 clamp(24px,3vw,36px)',
            borderRadius: 'clamp(20px,2.5vw,28px)',
            marginBottom: 'clamp(20px,2.5vw,28px)',
            border: '1px solid rgba(180,180,180,.15)',
            display: 'flex',
            gap: 'clamp(8px,1.5vw,16px)',
            borderBottom: 'none',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <button
            onClick={() => setActiveTab('emergency')}
            className={`dd-tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
          >
            Emergency Patient Requests ({emergencyRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`dd-tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`}
          >
            Hospital Requests ({hospitalRequests.length})
          </button>
        </motion.div>

        {/* Tab Content: Emergency Patient Requests */}
        <AnimatePresence mode="wait">
          {activeTab === 'emergency' && (
            <motion.div
              key="emergency-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="dd-glass"
              style={{
                padding: 'clamp(24px,3vw,36px)',
                borderRadius: 'clamp(20px,2.5vw,28px)',
                marginBottom: 'clamp(20px,2.5vw,28px)',
                border: '2px solid rgba(220,38,38,.3)',
                background: 'rgba(255,255,255,.65)',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(20px,3vw,32px)', fontWeight: 900, color: '#dc2626', margin: '0 0 clamp(16px,2vw,24px)', lineHeight: 1.1 }}>
                Emergency Blood Requests from Patients
              </h2>
              
              {!loadingEmergency && emergencyRequests.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: 'clamp(14px,1.2vw,16px)', color: 'rgba(56,1,1,.5)', textAlign: 'center', padding: 'clamp(32px,4vw,48px) 0', margin: 0 }}
                >
                  No emergency patient requests at this time.
                </motion.p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)' }}>
                  {emergencyRequests.map((notif, idx) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="dd-glass"
                      onClick={() => notif.status === 'pending' && setExpandedNotif(expandedNotif === notif.id ? null : notif.id)}
                      style={{
                        padding: 'clamp(16px,2vw,22px)',
                        borderRadius: 'clamp(14px,1.8vw,18px)',
                        cursor: notif.status === 'pending' ? 'pointer' : 'default',
                        border: '1.5px solid rgba(220,38,38,.25)',
                        transition: 'all .3s cubic-bezier(.22,1,.36,1)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'clamp(12px,1.5vw,16px)', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 'clamp(14px,1.3vw,16px)', fontWeight: 700, color: '#dc2626', margin: 0, lineHeight: 1.3 }}>
                            {notif.blood_type} Blood Needed
                          </p>
                          <p style={{ fontSize: 'clamp(12px,1.1vw,13px)', color: 'rgba(56,1,1,.6)', margin: 'clamp(6px,0.8vw,10px) 0 0', fontWeight: 600 }}>
                            Location: {notif.governorate}
                          </p>
                          {notif.hospital_name && (
                            <p style={{ fontSize: 'clamp(12px,1.1vw,13px)', color: 'rgba(56,1,1,.5)', margin: 'clamp(4px,0.6vw,6px) 0 0', fontStyle: 'italic' }}>
                              Hospital: {notif.hospital_name}
                            </p>
                          )}
                          {notif.status === 'pending' && (
                            <p style={{ fontSize: 'clamp(11px,1vw,12px)', color: 'rgba(56,1,1,.5)', margin: 'clamp(4px,0.6vw,6px) 0 0', fontStyle: 'italic' }}>
                              Click to confirm or respond
                            </p>
                          )}
                          {notif.hospital_id && notif.status === 'ok' && (
                            <div style={{ fontSize: 'clamp(11px,1vw,12px)', color: '#22c55e', margin: 'clamp(8px,1vw,12px) 0 0', fontWeight: 600, background: 'rgba(34,197,94,.1)', padding: 'clamp(8px,1vw,10px) clamp(12px,1.5vw,14px)', borderRadius: 8, textAlign: 'center' }}>
                              ✅ Confirmed & Ready
                            </div>
                          )}
                          {notif.hospital_id && notif.status === 'ns' && (
                            <div style={{ fontSize: 'clamp(11px,1vw,12px)', color: '#ef4444', margin: 'clamp(8px,1vw,12px) 0 0', fontWeight: 600, background: 'rgba(239,68,68,.1)', padding: 'clamp(8px,1vw,10px) clamp(12px,1.5vw,14px)', borderRadius: 8, textAlign: 'center' }}>
                              ❌ Moved to BCC Hamra Supply
                            </div>
                          )}
                          {notif.hospital_id && notif.status === 'supply_coming' && (
                            <div style={{ fontSize: 'clamp(11px,1vw,12px)', color: '#3b82f6', margin: 'clamp(8px,1vw,12px) 0 0', fontWeight: 600, background: 'rgba(59,130,246,.1)', padding: 'clamp(8px,1vw,10px) clamp(12px,1.5vw,14px)', borderRadius: 8, textAlign: 'center' }}>
                              ✈️ Coming for Supply from BCC Hamra
                            </div>
                          )}
                        </div>
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            background: notif.status === 'pending' ? 'rgba(234,179,8,.2)' : notif.status === 'awaiting_confirmation' ? 'rgba(107,114,128,.2)' : notif.status === 'confirmed' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)',
                            color: notif.status === 'pending' ? '#d97706' : notif.status === 'awaiting_confirmation' ? '#6b7280' : notif.status === 'confirmed' ? '#22c55e' : '#ef4444',
                            padding: 'clamp(8px,1vw,12px) clamp(12px,1.5vw,16px)',
                            borderRadius: '10px',
                            fontSize: 'clamp(11px,1vw,12px)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '.04em',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            border: `1.5px solid ${notif.status === 'pending' ? 'rgba(234,179,8,.3)' : notif.status === 'awaiting_confirmation' ? 'rgba(107,114,128,.3)' : notif.status === 'confirmed' ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
                          }}
                        >
                          {notif.status === 'pending' && 'Pending'}
                          {notif.status === 'awaiting_confirmation' && 'Confirming'}
                          {notif.status === 'confirmed' && 'Confirmed'}
                          {notif.status === 'didnt_show_up' && 'Declined'}
                        </motion.span>
                      </div>

                      {/* Expanded Options */}
                      <AnimatePresence>
                        {expandedNotif === notif.id && notif.status === 'pending' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ marginTop: 'clamp(16px,2vw,22px)', paddingTop: 'clamp(16px,2vw,22px)', borderTop: '1px solid rgba(180,180,180,.2)' }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px,1.5vw,14px)' }}>
                              {donor?.governorate === 'Beirut' && (
                                <motion.button
                                  onClick={() => handleDonateAtCenter(notif.id)}
                                  disabled={confirmingId === notif.id}
                                  className="dd-btn dd-btn-success"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.95 }}
                                  style={{
                                    width: '100%',
                                    padding: 'clamp(12px,1.5vw,16px)',
                                    fontSize: 'clamp(13px,1.1vw,14px)',
                                    opacity: confirmingId === notif.id ? 0.6 : 1,
                                    pointerEvents: confirmingId === notif.id ? 'none' : 'auto',
                                  }}
                                >
                                  {confirmingId === notif.id ? 'Confirming...' : 'Donate at BCC Hamra Center'}
                                </motion.button>
                              )}
                              <motion.button
                                onClick={() => setShowHospitalSelect(showHospitalSelect === notif.id ? null : notif.id)}
                                disabled={confirmingId === notif.id}
                                className="dd-btn dd-btn-primary"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                  width: '100%',
                                  padding: 'clamp(12px,1.5vw,16px)',
                                  fontSize: 'clamp(13px,1.1vw,14px)',
                                  opacity: confirmingId === notif.id ? 0.6 : 1,
                                  pointerEvents: confirmingId === notif.id ? 'none' : 'auto',
                                }}
                              >
                                Donate at a Hospital
                              </motion.button>

                              <AnimatePresence>
                                {showHospitalSelect === notif.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginTop: 'clamp(8px,1vw,12px)', display: 'flex', flexDirection: 'column', gap: 'clamp(6px,1vw,10px)' }}
                                  >
                                    {hospitals.filter(h => h.governorate === donor?.governorate).map(h => (
                                      <motion.button
                                        key={h.id}
                                        onClick={() => handleDonateAtHospital(notif.id, h.id)}
                                        disabled={confirmingId === notif.id}
                                        className="dd-btn dd-btn-secondary"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                          padding: 'clamp(10px,1.2vw,14px)',
                                          fontSize: 'clamp(12px,1vw,13px)',
                                          fontWeight: 600,
                                          opacity: confirmingId === notif.id ? 0.6 : 1,
                                          pointerEvents: confirmingId === notif.id ? 'none' : 'auto',
                                        }}
                                      >
                                        {h.name}
                                      </motion.button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div style={{ display: 'flex', gap: 'clamp(8px,1.5vw,12px)', marginTop: 'clamp(6px,1vw,10px)' }}>
                                <motion.button
                                  onClick={() => handleDidntShowUp(notif.id)}
                                  disabled={confirmingId === notif.id}
                                  className="dd-btn dd-btn-danger"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.95 }}
                                  style={{
                                    flex: 1,
                                    padding: 'clamp(10px,1.2vw,14px)',
                                    fontSize: 'clamp(12px,1vw,13px)',
                                    opacity: confirmingId === notif.id ? 0.6 : 1,
                                    pointerEvents: confirmingId === notif.id ? 'none' : 'auto',
                                  }}
                                >
                                  Decline
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content: Hospital Requests */}
        <AnimatePresence mode="wait">
          {activeTab === 'hospitals' && (
            <motion.div
              key="hospitals-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="dd-glass"
              style={{
                padding: 'clamp(24px,3vw,36px)',
                borderRadius: 'clamp(20px,2.5vw,28px)',
                marginBottom: 'clamp(20px,2.5vw,28px)',
                border: '1px solid rgba(180,180,180,.2)',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(20px,3vw,32px)', fontWeight: 900, color: '#dc2626', margin: '0 0 clamp(16px,2vw,24px)', lineHeight: 1.1 }}>
                Hospital Blood Requests
              </h2>
              {hospitalRequests.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: 'clamp(14px,1.2vw,16px)', color: 'rgba(56,1,1,.5)', textAlign: 'center', padding: 'clamp(32px,4vw,48px) 0', margin: 0 }}
                >
                  No hospital requests for your blood type right now.
                </motion.p>
              ) : (
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 },
                    },
                  }}
                  initial="hidden"
                  animate="show"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px,90vw,320px), 1fr))', gap: 'clamp(14px,2vw,20px)' }}
                >
                  {hospitalRequests.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                      }}
                      className="dd-glass dd-card-hover"
                      style={{
                        padding: 'clamp(20px,2.5vw,28px)',
                        borderRadius: 'clamp(16px,2vw,20px)',
                        border: '1px solid rgba(220,38,38,.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(14px,2vw,18px)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 'clamp(120px,12vw,160px)',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ fontSize: 'clamp(18px,2.5vw,28px)', fontWeight: 900, color: '#dc2626', margin: 0, lineHeight: 1.2 }}>
                        {item.hospital_name || 'Hospital'}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="dd-glass-deep"
          style={{
            padding: 'clamp(24px,3vw,36px)',
            borderRadius: 'clamp(20px,2.5vw,28px)',
            border: '1px solid rgba(180,180,180,.15)',
          }}
        >
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(20px,3vw,32px)', fontWeight: 900, color: '#dc2626', margin: '0 0 clamp(16px,2vw,24px)', lineHeight: 1.1 }}>
            Your Donation Stats
          </h2>
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            initial="hidden"
            animate="show"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(240px,90vw,280px), 1fr))', gap: 'clamp(14px,2vw,20px)' }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="dd-glass"
              style={{
                padding: 'clamp(20px,2.5vw,28px)',
                borderRadius: 'clamp(16px,2vw,20px)',
                textAlign: 'center',
                border: '1px solid rgba(220,38,38,.2)',
              }}
            >
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: 'clamp(32px,5vw,48px)', fontWeight: 900, color: '#dc2626', margin: 0, lineHeight: 1 }}
              >
                {totalDonations}
              </motion.p>
              <p style={{ fontSize: 'clamp(10px,0.9vw,12px)', color: 'rgba(56,1,1,.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', margin: 'clamp(8px,1vw,12px) 0 0' }}>
                Total Donations
              </p>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
              }}
              className="dd-glass"
              style={{
                padding: 'clamp(20px,2.5vw,28px)',
                borderRadius: 'clamp(16px,2vw,20px)',
                textAlign: 'center',
                border: '1px solid rgba(34,197,94,.2)',
              }}
            >
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                style={{ fontSize: 'clamp(32px,5vw,48px)', fontWeight: 900, color: '#22c55e', margin: 0, lineHeight: 1 }}
              >
                {totalDonations * 3}
              </motion.p>
              <p style={{ fontSize: 'clamp(10px,0.9vw,12px)', color: 'rgba(56,1,1,.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', margin: 'clamp(8px,1vw,12px) 0 0' }}>
                Lives Saved
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Dashboard