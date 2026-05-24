import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

// ✅ FIX 1: API Auto-Detection (localhost vs production)
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://blood-bank-eqyr.onrender.com'

console.log('[Admin.jsx] API endpoint:', API);

/* ─── Premium Admin Styles ─────────────────────────────────── */
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

  return (
    <motion.div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
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
  const [requests, setRequests] = useState([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  
  // ✅ Emergency donations state
  const [awaitingDonations, setAwaitingDonations] = useState([])
  const [confirmedDonations, setConfirmedDonations] = useState([])
  const [confirmingId, setConfirmingId] = useState(null)

  // ✅ Donors, Hospitals, Admin management
  const [donors, setDonors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [admins, setAdmins] = useState([])
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [passwordMessage, setPasswordMessage] = useState('')
  const [newAdminForm, setNewAdminForm] = useState({ email: '', password: '' })
  const [adminMessage, setAdminMessage] = useState('')

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  // ✅ Check authentication
  useEffect(() => {
    const adminData = localStorage.getItem('adminData')
    console.log('[Admin.jsx] Checking auth, adminData:', !!adminData);
    if (adminData) {
      setAuthed(true)
      loadData()
    } else {
      navigate('/login')
    }
  }, [navigate])

  // ✅ Load requests from backend
  const loadData = async () => {
    console.log('[Admin.jsx] loadData() called, fetching from:', API);
    setLoading(true)
    try {
      const response = await axios.get(`${API}/api/requests`)
      console.log('[Admin.jsx] Response received:', response.data);
      setRequests(response.data || [])
      
      // ✅ Load emergency donations for BCC Hamra center
      try {
        const emergencyRes = await axios.get(`${API}/api/blood-requests/center-donations`)
        const donations = emergencyRes.data || []
        setAwaitingDonations(donations.filter(d => d.status === 'no_show'))
        setConfirmedDonations(donations.filter(d => d.status === 'confirmed'))
        console.log('[Admin.jsx] Emergency donations loaded:', donations.length)
      } catch (err) {
        console.error('[Admin.jsx] Error loading emergency donations:', err.message)
      }
    } catch (err) {
      console.error('[Admin.jsx] Error loading requests:', err.message)
      if (err.response) {
        console.error('[Admin.jsx] Response error:', err.response.status, err.response.data)
      }
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ MARK REQUEST AS CONFIRMED (syncs to donor dashboard)
  const handleConfirmed = async (requestId) => {
    try {
      // Update blood_requests status to "confirmed"
      await axios.put(`${API}/api/requests/${requestId}`, { status: 'confirmed' })
      
      // Also update corresponding emergency_donations record
      const request = requests.find(r => r.id === requestId)
      if (request) {
        await axios.put(`${API}/api/blood-requests/${requestId}`, { status: 'confirmed' })
      }
      
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'confirmed' } : r))
      alert('✅ Request confirmed! Donor will see this on their dashboard.')
      loadData()
    } catch (err) {
      alert(`❌ Error: ${err.message}`)
    }
  }

  // ✅ MARK REQUEST AS "DIDN'T SHOW UP" (moves to admin supply blood section)
  const handleDidntShowUp = async (requestId) => {
    try {
      // Update blood_requests status to "no_show"
      await axios.put(`${API}/api/requests/${requestId}`, { status: 'no_show' })
      
      // Also update corresponding emergency_donations record
      const request = requests.find(r => r.id === requestId)
      if (request) {
        await axios.put(`${API}/api/blood-requests/${requestId}`, { status: 'no_show' })
      }
      
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'no_show' } : r))
      alert('❌ Request marked as "didn\'t show up". Will appear in supply blood section for admin.')
      loadData()
    } catch (err) {
      alert(`❌ Error: ${err.message}`)
    }
  }

  // ✅ DELETE REQUEST (removes from everywhere)
  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this request completely?')) return
    try {
      await axios.delete(`${API}/api/requests/${id}`)
      // Also delete from emergency_donations
      await axios.delete(`${API}/api/blood-requests/${id}`)
      setRequests(requests.filter(r => r.id !== id))
      alert('✅ Request deleted from everywhere!')
      loadData()
    } catch (err) {
      alert(`❌ Error: ${err.message}`)
    }
  }

  // ✅ SUPPLY BLOOD FOR HOSPITAL (when donor didn't show up)
  const handleSupplyBlood = async (donationId) => {
    setConfirmingId(donationId)
    try {
      const donation = awaitingDonations.find(d => d.id === donationId)
      console.log('Donation found:', donation)

      if (!donation) {
        alert('❌ Donation not found')
        setConfirmingId(null)
        return
      }

      if (!donation.patient_email) {
        alert('❌ Patient email is missing from donation record')
        console.error('Missing patient_email in donation:', donation)
        setConfirmingId(null)
        return
      }

      const response = await axios.post(`${API}/api/blood-requests/admin-confirm`, {
        donationId: donationId,
        bloodType: donation.blood_type,
        patientEmail: donation.patient_email,
        donorName: donation.donor_name
      })
      console.log('Supply blood response:', response.data)
      alert('✅ Blood supplied from BCC Hamra bank to hospital! Patient notified.')
      loadData()
    } catch (err) {
      console.error('Supply blood error:', err)
      alert(`❌ Error: ${err.response?.data?.error || err.message}`)
    } finally {
      setConfirmingId(null)
    }
  }

  // ✅ DELETE DONOR
  const handleDeleteDonor = async (donorId) => {
    if (!window.confirm('Delete this donor? This cannot be undone.')) return
    try {
      await axios.delete(`${API}/api/donors/${donorId}`)
      setDonors(donors.filter(d => d.id !== donorId))
      alert('✅ Donor deleted!')
    } catch (err) {
      alert(`❌ Error: ${err.message}`)
    }
  }

  // ✅ CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMessage('')

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage('❌ Passwords do not match')
      return
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordMessage('❌ Password must be at least 6 characters')
      return
    }

    try {
      const adminData = JSON.parse(localStorage.getItem('adminData'))
      await axios.put(`${API}/api/admin/change-password`, {
        admin_id: adminData.id,
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      })
      setPasswordMessage('✅ Password changed successfully!')
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPasswordMessage(`❌ Error: ${err.response?.data?.message || err.message}`)
    }
  }

  // ✅ ADD NEW ADMIN
  const handleAddAdmin = async (e) => {
    e.preventDefault()
    setAdminMessage('')

    if (!newAdminForm.email || !newAdminForm.password) {
      setAdminMessage('❌ Please fill all fields')
      return
    }

    try {
      await axios.post(`${API}/api/admin/create`, {
        email: newAdminForm.email,
        password: newAdminForm.password
      })
      setAdminMessage('✅ Admin created successfully!')
      setNewAdminForm({ email: '', password: '' })
      loadData()
    } catch (err) {
      setAdminMessage(`❌ Error: ${err.response?.data?.message || err.message}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminData')
    navigate('/login')
  }

  if (!authed) return null

  const pendingRequests = requests.filter(r => r.status === 'pending').length
  const confirmedRequests = requests.filter(r => r.status === 'confirmed').length
  const didntShowUpRequests = requests.filter(r => r.status === 'no_show').length

  const tabs = ['all', 'pending', 'confirmed', 'no_show', 'donors', 'hospitals', 'settings']

  // Filtered requests based on tab
  let filteredRequests = requests
  if (tab === 'pending') filteredRequests = requests.filter(r => r.status === 'pending')
  if (tab === 'confirmed') filteredRequests = requests.filter(r => r.status === 'confirmed')
  if (tab === 'no_show') filteredRequests = requests.filter(r => r.status === 'no_show')

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
              }}
              whileHover={{ scale: 1.12 }}
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
              </svg>
            </motion.div>
            
            <div>
              <motion.div style={{ fontSize: 22, fontWeight: 900, color: '#dc2626' }}>
                BloodConnect
              </motion.div>
              <div style={{ fontSize: 10, color: 'rgba(56,1,1,.5)', fontWeight: 700 }}>ADMIN</div>
            </div>
          </motion.div>

          <div style={{ flex: 1 }} />

          <motion.button
            onClick={handleLogout}
            className="ad-btn ad-btn-primary"
            whileHover={{ scale: 1.08 }}
            style={{ padding: '13px 26px', borderRadius: 24, fontSize: 13, fontWeight: 700 }}
          >
            Logout
          </motion.button>
        </div>
      </motion.header>

      <main style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: '40px clamp(20px,3vw,50px)', display: 'flex', flexDirection: 'column', gap: '60px' }}>

        {/* STATS */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ staggerChildren: 0.1, delayChildren: 0.2 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <StatCard icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#1f2937' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>} value={requests.length} label="Total Requests" color="#1f2937" delay={0.1} />
          <StatCard icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#EA580C' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>} value={pendingRequests} label="Pending" color="#EA580C" delay={0.2} />
          <StatCard icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#22C55E' }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>} value={confirmedRequests} label="Confirmed" color="#22C55E" delay={0.3} />
          <StatCard icon={<svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#EF4444' }}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>} value={didntShowUpRequests} label="Didn't Show Up" color="#EF4444" delay={0.4} />
        </motion.div>

        {/* TABS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }} transition={{ delay: 0.3 }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map((t) => {
            let count = requests.length
            if (t === 'pending') count = pendingRequests
            if (t === 'confirmed') count = confirmedRequests
            if (t === 'no_show') count = didntShowUpRequests
            
            return (
              <motion.button key={t} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTab(t)} className={`ad-btn ad-tab-btn ${tab === t ? 'active' : ''}`} style={{ padding: '10px 18px', borderRadius: 14, fontSize: 13, fontWeight: 900 }}>
                {t === 'all' ? `📋 All (${count})` : t === 'pending' ? `⏳ Pending (${count})` : t === 'confirmed' ? `✅ Confirmed (${count})` : t === 'no_show' ? `❌ Didn't Show (${count})` : t === 'donors' ? '👥 Donors' : t === 'hospitals' ? '🏥 Hospitals' : '⚙️ Settings'}
              </motion.button>
            )
          })}
        </motion.div>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ad-glass-deep" style={{ borderRadius:'28px', padding:'60px', textAlign:'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width:70, height:70, margin:'0 auto', border:'4px solid rgba(220,38,38,.2)', borderTopColor:'#dc2626', borderRadius:'50%' }} />
            <p style={{ marginTop:20, fontSize:14, fontWeight:700, color:'rgba(56,1,1,.6)' }}>Loading dashboard...</p>
          </motion.div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ad-glass-deep ad-card-hover" style={{ borderRadius:'28px', padding:'32px' }}>
                <h2 style={{ fontSize:22, fontWeight:900, color:'#1f2937', marginBottom:20 }}>
                  {tab === 'all' ? '📋 All Hospital Blood Requests' : tab === 'pending' ? '⏳ Pending Requests' : tab === 'confirmed' ? '✅ Confirmed Requests' : '❌ Didn\'t Show Up'}
                </h2>
                {filteredRequests.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px 0' }}>
                    <p style={{ fontSize:48, margin:0 }}>📭</p>
                    <p style={{ color:'rgba(56,1,1,.4)', fontSize:14, marginTop:16 }}>No requests in this category</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filteredRequests.map((request, idx) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{
                          background: 'rgba(255,255,255,.4)',
                          borderRadius: 16,
                          padding: 18,
                          border: '1px solid rgba(180,180,180,.2)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 16
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 300 }}>
                          <p style={{ fontSize: 14, fontWeight: 900, color: '#1f2937', margin: '0 0 8px 0' }}>
                            🏥 {request.hospital_name || 'Unknown Hospital'}
                          </p>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 20, fontWeight: 900, color: '#dc2626' }}>{request.blood_type}</span>
                            <span style={{ fontSize: 10, fontWeight: 900, padding: '6px 12px', borderRadius: 9, background: 'rgba(234,88,12,.15)', color: '#EA580C', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                              {request.urgency?.toUpperCase() || 'URGENT'}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 900, padding: '6px 12px', borderRadius: 9, background: request.status === 'pending' ? 'rgba(234,88,12,.15)' : 'rgba(34,197,94,.15)', color: request.status === 'pending' ? '#EA580C' : '#22c55e', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                              {request.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: '#4b5563', margin: '8px 0', fontWeight: 700 }}>
                            📦 {request.quantity_needed} units needed
                          </p>
                          <p style={{ fontSize: 11, color: 'rgba(31,41,55,.6)', margin: '4px 0 0', fontWeight: 600 }}>
                            📅 {new Date(request.created_at).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {request.status === 'pending' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleConfirmed(request.id)}
                                className="ad-btn ad-btn-primary"
                                style={{ padding: '9px 18px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                              >
                                ✅ Confirmed
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDidntShowUp(request.id)}
                                className="ad-btn ad-btn-secondary"
                                style={{ padding: '9px 18px', borderRadius: 10, fontWeight: 900, fontSize: 12, color: '#ef4444', borderColor: '#fca5a5' }}
                              >
                                ❌ Didn't Show
                              </motion.button>
                            </>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteRequest(request.id)}
                            className="ad-btn ad-btn-secondary"
                            style={{ padding: '9px 18px', borderRadius: 10, fontWeight: 900, fontSize: 12 }}
                          >
                            🗑️ Delete
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ✅ SUPPLY BLOOD SECTION - Only shows when donors "didn't show up" */}
        {awaitingDonations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ background: 'linear-gradient(135deg, rgba(220,38,38,.12), rgba(255,107,107,.06))', borderRadius: 28, padding: 32, border: '2px solid #dc2626' }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 20px 0' }}>
              🩸 BCC Hamra Supply Blood ({awaitingDonations.length})
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(31,41,55,.6)', margin: '0 0 20px 0', fontWeight: 600 }}>
              When donors didn't show up, BCC Hamra (main center) supplies blood from its bank to hospitals across Lebanon:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {awaitingDonations.map((donation) => (
                <div
                  key={donation.id}
                  style={{
                    background: 'rgba(254,226,226,.6)',
                    borderRadius: 18,
                    padding: 18,
                    border: '2px solid rgba(220,38,38,.4)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 900, color: '#dc2626', margin: '0 0 6px 0' }}>
                      {donation.blood_type} • Hospital: {donation.patient_email}
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(211,47,47,.7)', margin: '0', fontWeight: 700 }}>
                      ❌ {donation.donor_name || 'Donor'} didn't show up • {new Date(donation.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSupplyBlood(donation.id)}
                    disabled={confirmingId === donation.id}
                    style={{
                      background: confirmingId === donation.id ? '#ccc' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: '#fff',
                      border: 'none',
                      padding: '9px 18px',
                      borderRadius: 10,
                      fontWeight: 900,
                      fontSize: 12,
                      cursor: confirmingId === donation.id ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      opacity: confirmingId === donation.id ? 0.7 : 1
                    }}
                  >
                    {confirmingId === donation.id ? '⏳ Supplying...' : '🏥 Supply Blood'}
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {confirmedDonations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,.08), rgba(134,239,172,.04))', borderRadius: 28, padding: 32, border: '2px solid rgba(34,197,94,.3)' }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#22c55e', margin: '0 0 20px 0' }}>
              ✅ Confirmed Donor Donations (BCC Hamra Center)
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {confirmedDonations.map((donation) => (
                <div
                  key={donation.id}
                  style={{
                    background: 'rgba(236,253,245,.5)',
                    borderRadius: 18,
                    padding: 18,
                    border: '2px solid rgba(34,197,94,.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 900, color: '#22c55e', margin: '0 0 6px 0' }}>
                      {donation.blood_type} • {donation.donor_name || 'Anonymous Donor'}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(34,197,94,.65)', margin: '0', fontWeight: 700 }}>
                      ✅ Confirmed & Available • {new Date(donation.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#22c55e', padding: '8px 16px', background: 'rgba(34,197,94,.15)', borderRadius: 10 }}>
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* DONORS TAB */}
        {tab === 'donors' && !loading && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="ad-glass-deep ad-card-hover" style={{ borderRadius:'28px', padding:'32px' }}>
            <h2 style={{ fontSize:22, fontWeight:900, color:'#1f2937', marginBottom:20 }}>👥 Donor Management</h2>
            {donors.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 0' }}>
                <p style={{ fontSize:14, color:'rgba(56,1,1,.4)' }}>No donors found</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '600px', overflowY: 'auto' }}>
                {donors.map((donor) => (
                  <div key={donor.id} style={{ background: 'rgba(255,255,255,.4)', borderRadius: 16, padding: 18, border: '1px solid rgba(180,180,180,.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#1f2937', margin: '0 0 6px 0' }}>
                        {donor.full_name}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(31,41,55,.6)', margin: '0 0 4px 0' }}>
                        📧 {donor.email}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(31,41,55,.6)', margin: 0 }}>
                        🩸 {donor.blood_type} • 📍 {donor.governorate}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteDonor(donor.id)}
                      className="ad-btn ad-btn-secondary"
                      style={{ padding: '9px 18px', borderRadius: 10, fontWeight: 900, fontSize: 12 }}
                    >
                      🗑️ Delete
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* HOSPITALS TAB */}
        {tab === 'hospitals' && !loading && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="ad-glass-deep ad-card-hover" style={{ borderRadius:'28px', padding:'32px' }}>
            <h2 style={{ fontSize:22, fontWeight:900, color:'#1f2937', marginBottom:20 }}>🏥 Hospital Partners</h2>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/hospital-partners')}
                className="ad-btn ad-btn-primary"
                style={{ padding: '12px 24px', borderRadius: 14, fontWeight: 900, fontSize: 14 }}
              >
                View Hospital Partner
              </motion.button>
            </div>
            {hospitals.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 0' }}>
                <p style={{ fontSize:14, color:'rgba(56,1,1,.4)' }}>No hospital partners</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {hospitals.map((hospital) => (
                  <div key={hospital.id} style={{ background: 'rgba(255,255,255,.4)', borderRadius: 16, padding: 18, border: '1px solid rgba(180,180,180,.2)' }}>
                    <p style={{ fontSize: 14, fontWeight: 900, color: '#1f2937', margin: '0 0 8px 0' }}>
                      {hospital.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(31,41,55,.6)', margin: '0 0 4px 0' }}>
                      📍 {hospital.address}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(31,41,55,.6)', margin: 0 }}>
                      📧 {hospital.email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && !loading && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Change Password */}
            <motion.div className="ad-glass-deep ad-card-hover" style={{ borderRadius:'28px', padding:'32px' }}>
              <h2 style={{ fontSize:22, fontWeight:900, color:'#1f2937', marginBottom:20 }}>🔒 Change Password</h2>
              {passwordMessage && (
                <div style={{
                  background: passwordMessage.startsWith('✅') ? 'rgba(34,197,94,.15)' : 'rgba(255,235,238,.8)',
                  border: `2px solid ${passwordMessage.startsWith('✅') ? '#22c55e' : 'rgba(211,47,47,.4)'}`,
                  padding: 14,
                  borderRadius: 14,
                  marginBottom: 20,
                  textAlign: 'center',
                  color: passwordMessage.startsWith('✅') ? '#22c55e' : '#dc2626',
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  {passwordMessage}
                </div>
              )}
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(31,41,55,.5)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.old_password}
                    onChange={e => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(180,180,180,.15)', background: 'rgba(255,255,255,.5)', color: '#1f2937' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(31,41,55,.5)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(180,180,180,.15)', background: 'rgba(255,255,255,.5)', color: '#1f2937' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(31,41,55,.5)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(180,180,180,.15)', background: 'rgba(255,255,255,.5)', color: '#1f2937' }}
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="ad-btn ad-btn-primary"
                  style={{ padding: 14, borderRadius: 16, fontSize: 14, fontWeight: 900 }}
                >
                  Update Password
                </motion.button>
              </form>
            </motion.div>

            {/* Add Admin */}
            <motion.div className="ad-glass-deep ad-card-hover" style={{ borderRadius:'28px', padding:'32px' }}>
              <h2 style={{ fontSize:22, fontWeight:900, color:'#1f2937', marginBottom:20 }}>👤 Add New Admin</h2>
              {adminMessage && (
                <div style={{
                  background: adminMessage.startsWith('✅') ? 'rgba(34,197,94,.15)' : 'rgba(255,235,238,.8)',
                  border: `2px solid ${adminMessage.startsWith('✅') ? '#22c55e' : 'rgba(211,47,47,.4)'}`,
                  padding: 14,
                  borderRadius: 14,
                  marginBottom: 20,
                  textAlign: 'center',
                  color: adminMessage.startsWith('✅') ? '#22c55e' : '#dc2626',
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  {adminMessage}
                </div>
              )}
              <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(31,41,55,.5)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Email</label>
                  <input
                    type="email"
                    value={newAdminForm.email}
                    onChange={e => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(180,180,180,.15)', background: 'rgba(255,255,255,.5)', color: '#1f2937' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(31,41,55,.5)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Password</label>
                  <input
                    type="password"
                    value={newAdminForm.password}
                    onChange={e => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(180,180,180,.15)', background: 'rgba(255,255,255,.5)', color: '#1f2937' }}
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="ad-btn ad-btn-primary"
                  style={{ padding: 14, borderRadius: 16, fontSize: 14, fontWeight: 900 }}
                >
                  Add Admin
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}

      </main>

      <motion.footer className="ad-glass" style={{ marginTop: 'clamp(60px,8vw,120px)', borderTop: '1px solid rgba(180,180,180,.15)', background: 'rgba(255,255,255,.3)' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
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