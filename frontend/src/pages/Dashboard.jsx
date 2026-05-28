import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE_URL as API } from '../config/apiConfig'

const UNIFIED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes pulse-ring { 0% { transform:scale(.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }
  @keyframes shimmer { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes pulse-button { 0%,100% { box-shadow: 0 4px 12px rgba(220,38,38,.15); } 50% { box-shadow: 0 8px 24px rgba(220,38,38,.25); } }

  .dd-root {
    min-height:100vh;
    background:linear-gradient(135deg,#f8f8f8 0%,#efefef 25%,#e8e8e8 50%,#f2f2f2 75%,#f8f8f8 100%);
    background-size:400% 400%;
    animation:gradient-shift 15s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
    color:#3d3d3d;
    zoom: 1;
  }

  .dd-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .dd-glass {
    background:rgba(255,255,255,.7);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(200,180,160,.2);
    box-shadow:0 8px 32px rgba(0,0,0,.04);
  }

  .dd-glass-deep {
    background:rgba(255,255,255,.65);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(200,180,160,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.05),inset 0 1px 1px rgba(255,255,255,.4);
  }

  .dd-btn {
    position:relative;
    overflow:hidden;
    cursor:pointer;
    border:none;
    outline:none;
    transition:all .35s cubic-bezier(.25,1,.5,1);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
    border-radius:7px;
    letter-spacing:.5px;
    font-size:13px;
    text-transform:uppercase;
    padding:12px 16px;
    flex:1;
  }

  .dd-btn::before {
    content:'';
    position:absolute;
    top:0;
    left:-100%;
    width:100%;
    height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
    transition:left .5s cubic-bezier(.25,1,.5,1);
  }

  .dd-btn:hover::before { left:100%; }

  .dd-btn-primary {
    background:linear-gradient(135deg,#c92a2a 0%,#a01e1e 100%);
    color:#ffffff;
    box-shadow:0 6px 18px rgba(201,42,42,.22);
    border:none;
  }

  .dd-btn-primary:hover {
    transform:translateY(-2px);
    box-shadow:0 10px 30px rgba(201,42,42,.28);
  }

  .dd-btn-primary:active {
    transform:translateY(0);
    box-shadow:0 3px 10px rgba(201,42,42,.18);
  }

  .dd-btn-secondary {
    background:#f5f5f5;
    border:1.5px solid #d4d4d4;
    color:#2d2d2d;
    box-shadow:0 4px 12px rgba(0,0,0,.08);
  }

  .dd-btn-secondary:hover {
    background:#ffffff;
    border-color:#999999;
    transform:translateY(-2px);
    box-shadow:0 8px 20px rgba(0,0,0,.12);
  }

  .dd-btn-secondary:active {
    transform:translateY(0);
    box-shadow:0 2px 6px rgba(0,0,0,.08);
  }

  .dd-btn-success {
    background:linear-gradient(135deg,#c92a2a 0%,#8a1515 100%);
    border:none;
    color:#ffffff;
    box-shadow:0 6px 18px rgba(201,42,42,.22);
  }

  .dd-btn-success:hover {
    transform:translateY(-2px);
    box-shadow:0 10px 30px rgba(201,42,42,.28);
  }

  .dd-btn-success:active {
    transform:translateY(0);
    box-shadow:0 3px 10px rgba(201,42,42,.18);
  }

  .dd-btn-danger {
    background:#f5e6e6;
    border:2px solid #c92a2a;
    color:#c92a2a;
    box-shadow:0 4px 12px rgba(201,42,42,.12);
    font-weight:800;
    animation:pulse-button 2s ease-in-out infinite;
  }

  .dd-btn-danger:hover {
    background:#c92a2a;
    border-color:#c92a2a;
    color:#ffffff;
    transform:translateY(-2px);
    box-shadow:0 10px 28px rgba(201,42,42,.28);
    animation:none;
  }

  .dd-btn-danger:active {
    transform:translateY(0);
    box-shadow:0 3px 10px rgba(220,38,38,.2);
  }

  .dd-card-hover {
    transition:all .4s cubic-bezier(.22,1,.36,1);
  }

  .dd-card-hover:hover {
    transform:translateY(-6px);
    box-shadow:0 28px 72px rgba(201,42,42,.1) !important;
  }

  .dd-tab-btn {
    position:relative;
    padding:12px 24px;
    font-size:13px;
    font-weight:600;
    border:none;
    background:transparent;
    cursor:pointer;
    color:rgba(61,61,61,.6);
    transition:all .3s ease;
    border-bottom:2px solid transparent;
    letter-spacing:.4px;
  }

  .dd-tab-btn.active {
    color:#c92a2a;
    border-bottom-color:#c92a2a;
  }

  .dd-tab-btn:hover {
    color:#c92a2a;
  }

  .dd-modal-overlay {
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.4);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:100;
    backdrop-filter:blur(4px);
    -webkit-backdrop-filter:blur(4px);
  }

  .dd-modal-content {
    background:rgba(255,255,255,.95);
    backdrop-filter:blur(30px);
    -webkit-backdrop-filter:blur(30px);
    border-radius:20px;
    border:1px solid rgba(200,200,200,.25);
    box-shadow:0 20px 80px rgba(0,0,0,.15);
    width:min(600px,90vw);
    max-height:70vh;
    overflow-y:auto;
    padding:40px;
  }

  .dd-search-input {
    width:100%;
    padding:12px 16px;
    border:1px solid rgba(150,150,150,.25);
    border-radius:8px;
    font-family:'Plus Jakarta Sans',sans-serif;
    font-size:13px;
    background:rgba(255,255,255,.7);
    color:#2d2d2d;
    transition:all .3s ease;
    margin-bottom:20px;
  }

  .dd-search-input:focus {
    outline:none;
    border-color:rgba(220,38,38,.4);
    background:rgba(255,255,255,.95);
    box-shadow:0 0 0 3px rgba(220,38,38,.1);
  }

  .dd-hospital-list {
    display:flex;
    flex-direction:column;
    gap:10px;
  }

  .dd-hospital-item {
    padding:14px 16px;
    border:1px solid rgba(200,200,200,.2);
    border-radius:8px;
    cursor:pointer;
    transition:all .3s ease;
    background:rgba(255,255,255,.5);
    font-size:13px;
    font-weight:500;
    color:#2d2d2d;
    width:100%;
    text-align:left;
  }

  .dd-hospital-item:hover {
    background:rgba(220,38,38,.08);
    border-color:rgba(220,38,38,.25);
    transform:translateX(4px);
  }

  @media (max-width:1200px) {
    .dd-root { zoom: 0.95; }
  }

  @media (max-width:1024px) {
    .dd-root { zoom: 0.9; }
  }

  @media (max-width:768px) {
    .dd-root { zoom: 1; }
    .dd-tab-btn { padding: 10px 16px; font-size: 12px; }
  }

  @media (max-width:600px) {
    .dd-root { zoom: 1; }
    .dd-modal-content { width: 95vw; padding: 24px; }
    .dd-btn { font-size: 12px; padding: 10px 12px; }
  }

  @media (max-width:480px) {
    .dd-root { zoom: 1; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('dd-styles-unified')) {
  const s = document.createElement('style')
  s.id = 'dd-styles-unified'
  s.textContent = UNIFIED_STYLES
  document.head.appendChild(s)
}

// ✅ HELPER: Format time "X minutes ago"
function formatTimeAgo(dateString) {
  if (!dateString) return 'recently'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

function AnimatedBackgroundOrbs() {
  const orbs = [
    { size: 'min(200px,20vw)', color: 'rgba(220,38,38,.08)', top: '-5%', left: '-3%', duration: 8 },
    { size: 'min(180px,18vw)', color: 'rgba(180,180,180,.06)', top: '20%', right: '-8%', duration: 11 },
    { size: 'min(190px,19vw)', color: 'rgba(220,38,38,.07)', bottom: '-10%', left: '5%', duration: 13 },
    { size: 'min(160px,16vw)', color: 'rgba(180,180,180,.05)', bottom: '15%', right: '-5%', duration: 9 },
  ]

  const dots = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1.5,
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
  const [visible, setVisible] = useState(false)
  const [hospitalModalOpen, setHospitalModalOpen] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hospitals, setHospitals] = useState([])
  const [confirmingId, setConfirmingId] = useState(null)
  const [loadingEmergency, setLoadingEmergency] = useState(true)
  const [expandedNotif, setExpandedNotif] = useState(null)
  const [manualRefreshLoading, setManualRefreshLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // ✅ FIXED: Load donations on mount (NO auto-refresh)
  useEffect(() => {
    const data = localStorage.getItem('donorData')
    if (!data) { navigate('/login'); return }
    const donorData = JSON.parse(data)
    setDonor(donorData)
    
    const loadAllDonations = async () => {
      try {
        console.log('[Dashboard] Fetching emergency requests for donor:', donorData.id)
        const res = await axios.get(`${API}/api/blood-requests/donor/${donorData.id}`)
        console.log('[Dashboard] Emergency requests received:', res.data)
        setEmergencyRequests(res.data || [])
        
        // ✅ FIXED: Call the correct endpoint
        console.log('[Dashboard] Fetching hospital requests for donor:', donorData.id)
        const hospitalRes = await axios.get(`${API}/api/blood-requests/hospital-requests/${donorData.id}`)
        console.log('[Dashboard] Hospital requests received:', hospitalRes.data)
        setHospitalRequests(hospitalRes.data || [])
      } catch (err) {
        console.error('[Dashboard] Error fetching donations:', err)
      } finally {
        setLoadingEmergency(false)
      }
    }
    
    loadAllDonations()
    // ✅ NO interval - only manual refresh needed
  }, [navigate])

  useEffect(() => {
    axios.get(`${API}/api/hospitals/all`).then(res => setHospitals(res.data || [])).catch(console.log)
  }, [])

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  // ✅ Auto-refresh hospital requests every 5 seconds
  useEffect(() => {
    if (!donor) return
    
    const interval = setInterval(async () => {
      try {
        const hospitalRes = await axios.get(`${API}/api/blood-requests/hospital-requests/${donor.id}`)
        setHospitalRequests(hospitalRes.data || [])
      } catch (err) {
        console.error('[Dashboard] Auto-refresh error:', err)
      }
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [donor])

  // ✅ NEW: Manual refresh button function
  const handleManualRefresh = async () => {
    setManualRefreshLoading(true)
    try {
      const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
      console.log('[Dashboard] Manual refresh - Emergency requests:', res.data)
      setEmergencyRequests(res.data || [])
      
      const hospitalRes = await axios.get(`${API}/api/blood-requests/hospital-requests/${donor.id}`)
      console.log('[Dashboard] Manual refresh - Hospital requests:', hospitalRes.data)
      setHospitalRequests(hospitalRes.data || [])
    } catch (err) {
      console.error('[Dashboard] Error refreshing:', err)
    } finally {
      setManualRefreshLoading(false)
    }
  }

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
        donation_location: 'center',
        donor_id: donor.id
      })
      alert('Center donation confirmed!')
      setTimeout(async () => {
        const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
        setEmergencyRequests(res.data || [])
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
      console.log('Donor choosing hospital:', hospitalId, 'for request:', notificationId)
      await axios.post(`${API}/api/blood-requests/donor-confirm-donation`, {
        notification_id: notificationId,
        donation_location: 'hospital',
        hospital_id: hospitalId,
        donor_id: donor.id
      })
      alert('Hospital selected! Waiting for hospital to confirm your donation.')
      
      setHospitalModalOpen(null)
      setExpandedNotif(null)
      
      setTimeout(async () => {
        try {
          const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
          setEmergencyRequests(res.data || [])
        } catch (err) {
          console.error('Error refreshing emergency requests:', err)
        }
      }, 300)
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setConfirmingId(null)
    }
  }

  // ✅ FIXED: Delete button - immediately removes from UI
  const handleDidntShowUp = async (notificationId) => {
    if (!window.confirm('Are you sure you want to decline this donation request?')) return
    
    setDeletingId(notificationId)
    try {
      console.log('[Dashboard] Deleting request:', notificationId)
      
      // Delete from database
      const response = await axios.delete(`${API}/api/blood-requests/${notificationId}`)
      console.log('[Dashboard] Delete response:', response.data)
      
      // ✅ IMMEDIATELY remove from UI (optimistic update)
      setEmergencyRequests(prev => prev.filter(req => req.id !== notificationId))
      setExpandedNotif(null)
      
      console.log('[Dashboard] ✅ Request removed from dashboard')
      alert('✅ Request declined and removed from your dashboard.')
    } catch (err) {
      console.error('[Dashboard] Delete error:', err)
      alert('❌ Error: ' + (err.response?.data?.error || err.message))
      
      // On error, refresh to show true state from server
      try {
        const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
        setEmergencyRequests(res.data || [])
      } catch (refreshErr) {
        console.error('[Dashboard] Refresh error:', refreshErr)
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (!donor) return null

  return (
    <div className="dd-root">
      <AnimatedBackgroundOrbs />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px)' }}
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -30 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            marginBottom: 'clamp(32px, 6vw, 64px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'clamp(20px, 3vw, 40px)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '250px' }}>
            <p style={{
              fontSize: 'clamp(9px, 1.2vw, 11px)',
              fontWeight: 700,
              color: '#dc2626',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: '0 0 12px 0',
            }}>
              Welcome
            </p>
            <h1 style={{
              fontFamily: "'Fraunces',serif",
              fontSize: 'clamp(28px, 5vw, 64px)',
              fontWeight: 900,
              color: '#6e2016',
              margin: '0 0 8px 0',
              lineHeight: 1.1,
            }}>
              {donor.full_name}
            </h1>
            <div style={{ display: 'flex', gap: 'clamp(16px, 3vw, 24px)', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 'clamp(9px, 1vw, 11px)', color: 'rgba(45,45,45,.6)', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '1px' }}>
                  Blood Type
                </p>
                <p style={{
                  fontSize: 'clamp(18px, 3vw, 24px)',
                  fontWeight: 900,
                  color: '#dc2626',
                  margin: 0,
                  fontFamily: "'Fraunces',serif",
                }}>
                  {donor.blood_type}
                </p>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(220,38,38,.2)' }} />
              <div>
                <p style={{ fontSize: 'clamp(9px, 1vw, 11px)', color: 'rgba(45,45,45,.6)', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '1px' }}>
                  Location
                </p>
                <p style={{
                  fontSize: 'clamp(13px, 2vw, 16px)',
                  fontWeight: 700,
                  color: '#2d2d2d',
                  margin: 0,
                }}>
                  {donor.governorate}
                </p>
              </div>
            </div>
          </div>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
              color: '#ffffff',
              border: 'none',
              padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 20px)',
              borderRadius: '8px',
              fontSize: 'clamp(10px, 1.2vw, 12px)',
              fontWeight: 900,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              boxShadow: '0 4px 14px rgba(220,38,38,.25)',
              transition: 'all .35s cubic-bezier(.25,1,.5,1)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Sign Out
          </motion.button>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="dd-glass-deep"
          style={{
            padding: '0 clamp(16px, 3vw, 32px)',
            borderRadius: '16px',
            marginBottom: '2px',
            display: 'flex',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            marginTop: '24px',
            overflowX: 'auto',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex' }}>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`dd-tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
            >
              Emergency ({emergencyRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`dd-tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`}
            >
              Hospital ({hospitalRequests.length})
            </button>
          </div>

          {/* ✅ NEW: Manual Refresh Button for BOTH tabs */}
          {(activeTab === 'emergency' || activeTab === 'hospitals') && (
            <motion.button
              onClick={handleManualRefresh}
              disabled={manualRefreshLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                borderRadius: '6px',
                fontSize: 'clamp(10px, 1vw, 11px)',
                fontWeight: 700,
                background: 'rgba(220,38,38,.1)',
                border: '1px solid rgba(220,38,38,.2)',
                color: '#dc2626',
                cursor: manualRefreshLoading ? 'not-allowed' : 'pointer',
                opacity: manualRefreshLoading ? 0.6 : 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
              }}
            >
              {manualRefreshLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: '12px',
                      height: '12px',
                      border: '2px solid rgba(220,38,38,.3)',
                      borderTopColor: '#dc2626',
                      borderRadius: '50%',
                    }}
                  />
                  Refreshing...
                </>
              ) : (
                <>
                  <span></span>
                  Refresh
                </>
              )}
            </motion.button>
          )}
        </motion.div>

        {/* Tab Content: Emergency Patient Requests */}
        <AnimatePresence mode="wait">
          {activeTab === 'emergency' && (
            <motion.div
              key="emergency-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="dd-glass"
              style={{
                padding: 'clamp(20px, 4vw, 40px)',
                borderRadius: '16px',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontFamily: "'Fraunces',serif",
                  fontSize: 'clamp(18px, 3.5vw, 36px)',
                  fontWeight: 900,
                  color: '#6e2016',
                  margin: '0 0 24px 0',
                  lineHeight: 1.1,
                }}
              >
                Emergency Blood Requests
              </motion.h2>

              {!loadingEmergency && emergencyRequests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    padding: 'clamp(30px, 6vw, 60px) clamp(20px, 4vw, 40px)',
                    textAlign: 'center',
                    background: 'rgba(220,38,38,.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(220,38,38,.1)',
                  }}
                >
                  <p style={{
                    fontSize: 'clamp(13px, 2vw, 16px)',
                    color: 'rgba(45,45,45,.6)',
                    fontWeight: 500,
                    margin: 0,
                    lineHeight: 1.6,
                  }}>
                    No emergency patient requests at this time. Check back regularly for urgent blood donation opportunities.
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {emergencyRequests.map((notif, idx) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20, y: 12 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.9 }}
                      transition={{ delay: idx * 0.08, duration: 0.5 }}
                      className="dd-glass dd-card-hover"
                      onClick={() => notif.status === 'pending' && setExpandedNotif(expandedNotif === notif.id ? null : notif.id)}
                      style={{
                        padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 28px)',
                        borderRadius: '12px',
                        cursor: notif.status === 'pending' ? 'pointer' : 'default',
                        border: `1px solid ${notif.status === 'pending' ? 'rgba(220,38,38,.15)' : 'rgba(200,200,200,.15)'}`,
                      }}
                      whileHover={notif.status === 'pending' ? { y: -2 } : {}}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'clamp(12px, 3vw, 24px)', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(8px, 2vw, 16px)', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <p
                              style={{
                                fontSize: 'clamp(16px, 2.5vw, 18px)',
                                fontWeight: 800,
                                color: '#dc2626',
                                margin: 0,
                                fontFamily: "'Fraunces',serif",
                              }}
                            >
                              {notif.blood_type}
                            </p>
                            <p style={{
                              fontSize: 'clamp(10px, 1.2vw, 12px)',
                              color: 'rgba(45,45,45,.5)',
                              fontWeight: 600,
                              margin: 0,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}>
                              Blood Type Required
                            </p>
                          </div>
                          <p style={{
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            color: 'rgba(45,45,45,.7)',
                            margin: '8px 0 0 0',
                            fontWeight: 500,
                          }}>
                            Location: {notif.governorate}
                          </p>
                          {/* ✅ NEW: Show "time ago" */}
                          <p style={{
                            fontSize: 'clamp(10px, 1.1vw, 12px)',
                            color: 'rgba(45,45,45,.5)',
                            margin: '6px 0 0 0',
                            fontWeight: 500,
                            fontStyle: 'italic',
                          }}>
                            Posted {formatTimeAgo(notif.created_at)}
                          </p>
                          {notif.status === 'pending' && expandedNotif !== notif.id && (
                            <p
                              style={{ fontSize: 'clamp(9px, 1vw, 11px)', color: '#dc2626', margin: 'clamp(6px, 1vw, 10px) 0 0 0', fontWeight: 600 }}
                            >
                              ↓ Click to respond
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: 'clamp(9px, 1.1vw, 11px)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            whiteSpace: 'nowrap',
                            background: notif.status === 'pending' ? 'rgba(234,179,8,.15)' : notif.status === 'awaiting_confirmation' ? 'rgba(107,114,128,.15)' : notif.status === 'confirmed' ? 'rgba(34,197,94,.15)' : 'rgba(220,38,38,.15)',
                            color: notif.status === 'pending' ? '#d97706' : notif.status === 'awaiting_confirmation' ? '#6b7280' : notif.status === 'confirmed' ? '#22c55e' : '#dc2626',
                            border: `1px solid ${notif.status === 'pending' ? 'rgba(234,179,8,.3)' : notif.status === 'awaiting_confirmation' ? 'rgba(107,114,128,.3)' : notif.status === 'confirmed' ? 'rgba(34,197,94,.3)' : 'rgba(220,38,38,.3)'}`,
                          }}
                        >
                          {notif.status === 'pending' && 'Pending'}
                          {notif.status === 'awaiting_confirmation' && 'Awaiting'}
                          {notif.status === 'confirmed' && 'Confirmed'}
                          {notif.status === 'didnt_show_up' && 'Declined'}
                        </div>
                      </div>

                      {/* Expanded Options */}
                      <AnimatePresence>
                        {expandedNotif === notif.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              marginTop: '16px',
                              paddingTop: '16px',
                              borderTop: '1px solid rgba(200,200,200,.2)',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', flexWrap: 'wrap' }}>
                              {donor?.governorate === 'Beirut' && (
                                <motion.button
                                  onClick={() => handleDonateAtCenter(notif.id)}
                                  disabled={confirmingId === notif.id || deletingId === notif.id}
                                  className="dd-btn dd-btn-success"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.96 }}
                                  style={{
                                    opacity: confirmingId === notif.id || deletingId === notif.id ? 0.6 : 1,
                                    pointerEvents: confirmingId === notif.id || deletingId === notif.id ? 'none' : 'auto',
                                    fontSize: 'clamp(11px, 1.2vw, 13px)',
                                    padding: 'clamp(8px, 1.5vw, 12px) clamp(10px, 2vw, 16px)',
                                  }}
                                >
                                  {confirmingId === notif.id ? 'Confirming...' : 'Hamra Center'}
                                </motion.button>
                              )}
                              <motion.button
                                onClick={() => {
                                  setHospitalModalOpen(notif.id)
                                  setSearchQuery('')
                                }}
                                disabled={confirmingId === notif.id || deletingId === notif.id}
                                className="dd-btn dd-btn-primary"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                                style={{
                                  opacity: confirmingId === notif.id || deletingId === notif.id ? 0.6 : 1,
                                  pointerEvents: confirmingId === notif.id || deletingId === notif.id ? 'none' : 'auto',
                                  fontSize: 'clamp(11px, 1.2vw, 13px)',
                                  padding: 'clamp(8px, 1.5vw, 12px) clamp(10px, 2vw, 16px)',
                                }}
                              >
                                Hospital
                              </motion.button>

                              <motion.button
                                onClick={() => handleDidntShowUp(notif.id)}
                                disabled={confirmingId === notif.id || deletingId === notif.id}
                                className="dd-btn dd-btn-danger"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                                style={{
                                  opacity: confirmingId === notif.id || deletingId === notif.id ? 0.6 : 1,
                                  pointerEvents: confirmingId === notif.id || deletingId === notif.id ? 'none' : 'auto',
                                  fontSize: 'clamp(11px, 1.2vw, 13px)',
                                  padding: 'clamp(8px, 1.5vw, 12px) clamp(10px, 2vw, 16px)',
                                }}
                              >
                                {deletingId === notif.id ? 'Declining...' : 'Decline'}
                              </motion.button>
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="dd-glass"
              style={{
                padding: 'clamp(20px, 4vw, 40px)',
                borderRadius: '16px',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontFamily: "'Fraunces',serif",
                  fontSize: 'clamp(18px, 3.5vw, 36px)',
                  fontWeight: 900,
                  color: '#6e2016',
                  margin: '0 0 24px 0',
                  lineHeight: 1.1,
                }}
              >
                Hospital Blood Requests
              </motion.h2>
              {hospitalRequests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    padding: 'clamp(30px, 6vw, 60px) clamp(20px, 4vw, 40px)',
                    textAlign: 'center',
                    background: 'rgba(220,38,38,.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(220,38,38,.1)',
                  }}
                >
                  <p style={{
                    fontSize: 'clamp(13px, 2vw, 16px)',
                    color: '#6e2016',
                    fontWeight: 500,
                    margin: 0,
                    lineHeight: 1.6,
                  }}>
                    No hospital requests for your blood type at this moment. Hospital requests will appear here when medical facilities need your blood type.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 40vw, 280px), 1fr))',
                    gap: 'clamp(16px, 3vw, 24px)',
                  }}
                >
                  {hospitalRequests.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                      className="dd-glass-deep dd-card-hover"
                      style={{
                        padding: 'clamp(20px, 4vw, 32px)',
                        borderRadius: '14px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '180px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      whileHover={{ y: -6 }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'radial-gradient(circle at center, rgba(220,38,38,.04), transparent)',
                          pointerEvents: 'none',
                        }}
                      />

                      <p
                        style={{
                          fontFamily: "'Fraunces',serif",
                          fontSize: 'clamp(14px, 2.5vw, 24px)',
                          fontWeight: 900,
                          color: '#6e2016',
                          margin: '0 0 12px 0',
                          lineHeight: 1.2,
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {item.hospital_name}
                      </p>

                      <div
                        style={{
                          width: '60%',
                          height: '2px',
                          background: 'linear-gradient(90deg, transparent, #dc2626, transparent)',
                          marginBottom: '12px',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      />

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        position: 'relative',
                        zIndex: 1,
                        flexWrap: 'wrap',
                      }}>
                        <p style={{
                          fontSize: 'clamp(9px, 1.1vw, 11px)',
                          color: 'rgba(45,45,45,.6)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          margin: 0,
                          letterSpacing: '0.5px',
                        }}>
                          Blood Type:
                        </p>
                        <p
                          style={{
                            fontSize: 'clamp(14px, 2.2vw, 18px)',
                            fontWeight: 800,
                            color: '#dc2626',
                            margin: 0,
                            fontFamily: "'Fraunces',serif",
                          }}
                        >
                          {item.blood_type}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hospital Selection Modal */}
      <AnimatePresence>
        {hospitalModalOpen && (
          <motion.div
            className="dd-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setHospitalModalOpen(null)
              setSearchQuery('')
            }}
          >
            <motion.div
              className="dd-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
            >
              <h3 style={{
                fontFamily: "'Fraunces',serif",
                fontSize: 'clamp(18px, 3vw, 24px)',
                fontWeight: 900,
                color: '#2d2d2d',
                margin: '0 0 20px 0',
              }}>
                Select Hospital
              </h3>

              <input
                type="text"
                placeholder="Search hospitals..."
                className="dd-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                autoFocus
              />

              <div className="dd-hospital-list">
                {hospitals
                  .filter(h => h.governorate === donor?.governorate && h.name.toLowerCase().includes(searchQuery))
                  .map((h) => (
                    <motion.button
                      key={h.id}
                      className="dd-hospital-item"
                      onClick={() => {
                        handleDonateAtHospital(hospitalModalOpen, h.id)
                        setHospitalModalOpen(null)
                        setSearchQuery('')
                      }}
                      disabled={confirmingId === hospitalModalOpen}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        opacity: confirmingId === hospitalModalOpen ? 0.6 : 1,
                        pointerEvents: confirmingId === hospitalModalOpen ? 'none' : 'auto',
                      }}
                    >
                      {h.name}
                    </motion.button>
                  ))}
              </div>

              {hospitals.filter(h => h.governorate === donor?.governorate && h.name.toLowerCase().includes(searchQuery)).length === 0 && (
                <p
                  style={{
                    textAlign: 'center',
                    color: 'rgba(45,45,45,.5)',
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    fontWeight: 500,
                    marginTop: '20px',
                  }}
                >
                  No hospitals found
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard