import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://blood-bank-eqyr.onrender.com'

const ADMIN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes pulse-ring { 0% { transform:scale(.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

  .admin-root {
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

  .admin-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .admin-nav {
    position:sticky;top:0;z-index:50;
    background:rgba(248,248,248,.85);
    backdrop-filter:blur(20px) saturate(200%);
    -webkit-backdrop-filter:blur(20px) saturate(200%);
    border-bottom:1px solid rgba(180,180,180,.15);
    box-shadow:0 4px 30px rgba(0,0,0,.08);
  }

  .admin-nav-inner {
    max-width:1360px;margin:0 auto;
    display:flex;justify-content:space-between;align-items:center;
    padding:14px clamp(16px,3.5vw,44px);
    gap:clamp(16px,2.5vw,32px);
  }

  .admin-logo {
    display:flex;align-items:center;gap:14px;cursor:pointer;
  }

  .admin-logo-icon {
    width:50px;height:50px;
    background:linear-gradient(135deg,#dc2626,#991b1b);
    border-radius:14px;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 12px 32px rgba(220,38,38,.3);
    position:relative;
    overflow:hidden;
  }

  .admin-logo-icon svg {
    width:28px;height:38px;
  }

  .admin-logo-text {
    font-size:22px;font-weight:900;color:#dc2626;
    font-family:'Fraunces',serif;
  }

  .admin-main {
    position:relative;
    z-index:10;
    max-width:1360px;
    margin:0 auto;
    padding:clamp(24px,4vw,48px) clamp(16px,3vw,44px);
  }

  .admin-glass {
    background:rgba(255,255,255,.6);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(180,180,180,.2);
    box-shadow:0 8px 32px rgba(0,0,0,.04);
  }

  .admin-glass-deep {
    background:rgba(255,255,255,.65);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(180,180,180,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.05),inset 0 1px 1px rgba(255,255,255,.3);
  }

  .admin-btn {
    position:relative;
    overflow:hidden;
    cursor:pointer;
    border:none;
    outline:none;
    transition:all .35s cubic-bezier(.25,1,.5,1);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
    border-radius:10px;
    letter-spacing:.5px;
    font-size:clamp(11px,1.1vw,13px);
  }

  .admin-btn::before {
    content:'';
    position:absolute;
    top:0;
    left:-100%;
    width:100%;
    height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
    transition:left .5s cubic-bezier(.25,1,.5,1);
  }

  .admin-btn:hover::before { left:100%; }

  .admin-btn-primary {
    background:linear-gradient(135deg,#dc2626 0%,#991b1b 100%);
    color:#ffffff;
    box-shadow:0 6px 18px rgba(220,38,38,.22);
    padding:clamp(10px,1.5vw,14px) clamp(16px,2.5vw,24px);
  }

  .admin-btn-primary:hover {
    transform:translateY(-2px);
    box-shadow:0 10px 30px rgba(220,38,38,.28);
  }

  .admin-btn-primary:active {
    transform:translateY(0);
    box-shadow:0 3px 10px rgba(220,38,38,.18);
  }

  .admin-btn-secondary {
    background:rgba(255,255,255,.7);
    border:1.5px solid rgba(180,180,180,.3);
    color:#dc2626;
    box-shadow:0 4px 12px rgba(0,0,0,.04);
    padding:clamp(10px,1.5vw,14px) clamp(16px,2.5vw,24px);
    text-transform:uppercase;
  }

  .admin-btn-secondary:hover {
    background:rgba(255,255,255,.85);
    border-color:rgba(180,180,180,.5);
    transform:translateY(-2px);
  }

  .admin-btn-success {
    background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);
    color:#ffffff;
    box-shadow:0 6px 18px rgba(34,197,94,.22);
    padding:clamp(9px,1.5vw,12px) clamp(14px,2.2vw,18px);
  }

  .admin-btn-success:hover {
    transform:translateY(-2px);
    box-shadow:0 10px 30px rgba(34,197,94,.28);
  }

  .admin-tab-btn {
    padding:clamp(10px,1.5vw,12px) clamp(14px,2vw,18px);
    font-size:clamp(11px,1.1vw,13px);
    font-weight:700;
    border:none;
    background:transparent;
    cursor:pointer;
    color:rgba(61,61,61,.6);
    transition:all .3s ease;
    border-bottom:2px solid transparent;
    letter-spacing:.3px;
    text-transform:uppercase;
  }

  .admin-tab-btn.active {
    color:#dc2626;
    border-bottom-color:#dc2626;
    background:rgba(255,255,255,.5);
    border-radius:8px;
    border-bottom:none;
  }

  .admin-tab-btn:hover {
    color:#dc2626;
  }

  .admin-input {
    width:100%;
    padding:clamp(10px,1.5vw,12px) clamp(12px,2vw,16px);
    border:1px solid rgba(150,150,150,.25);
    border-radius:10px;
    font-family:'Plus Jakarta Sans',sans-serif;
    font-size:clamp(11px,1.1vw,13px);
    background:rgba(255,255,255,.7);
    color:#dc2626;
    transition:all .3s ease;
  }

  .admin-input:focus {
    outline:none;
    border-color:rgba(220,38,38,.4);
    background:rgba(255,255,255,.95);
    box-shadow:0 0 0 3px rgba(220,38,38,.1);
  }

  .admin-label {
    font-size:clamp(9px,1vw,10px);
    font-weight:900;
    color:rgba(45,45,45,.6);
    text-transform:uppercase;
    letter-spacing:.8px;
    margin-bottom:clamp(6px,1vw,8px);
    display:block;
  }

  .admin-card {
    background:rgba(255,255,255,.6);
    border:1px solid rgba(180,180,180,.2);
    border-radius:14px;
    padding:clamp(14px,2vw,20px);
    transition:all .3s ease;
  }

  .admin-card:hover {
    transform:translateY(-2px);
    box-shadow:0 12px 30px rgba(220,38,38,.1);
    border-color:rgba(220,38,38,.2);
  }

  .admin-card-title {
    font-family:'Fraunces',serif;
    font-size:clamp(14px,1.8vw,18px);
    font-weight:900;
    color:#6e2016;
    margin:0 0 clamp(8px,1.2vw,12px) 0;
  }

  .admin-card-text {
    font-size:clamp(11px,1.1vw,13px);
    color:rgba(45,45,45,.7);
    margin:0;
    font-weight:500;
    line-height:1.6;
  }

  .admin-message {
    border-radius:12px;
    padding:clamp(12px,2vw,16px);
    text-align:center;
    color:#dc2626;
    font-weight:700;
    font-size:clamp(11px,1.1vw,13px);
    margin-bottom:clamp(12px,2vw,20px);
  }

  .admin-message.success {
    background:rgba(34,197,94,.15);
    border:1px solid rgba(34,197,94,.3);
    color:#22c55e;
  }

  .admin-message.error {
    background:rgba(255,235,238,.8);
    border:1px solid rgba(220,38,38,.3);
    color:#dc2626;
  }

  @media (max-width:960px) {
    .admin-nav { padding:12px clamp(12px,2vw,20px); }
    .admin-logo-icon { width:40px; height:40px; }
    .admin-logo-icon svg { width:22px; height:30px; }
    .admin-logo-text { font-size:18px; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('admin-styles')) {
  const s = document.createElement('style')
  s.id = 'admin-styles'
  s.textContent = ADMIN_STYLES
  document.head.appendChild(s)
}

function AnimatedBackgroundOrbs() {
  const orbs = [
    { size: 'min(200px,20vw)', color: 'rgba(220,38,38,.1)', top: '-8%', left: '-5%', duration: 8 },
    { size: 'min(180px,18vw)', color: 'rgba(180,180,180,.08)', top: '20%', right: '-8%', duration: 11 },
    { size: 'min(190px,19vw)', color: 'rgba(220,38,38,.08)', bottom: '-12%', left: '8%', duration: 13 },
    { size: 'min(160px,16vw)', color: 'rgba(180,180,180,.06)', bottom: '15%', right: '-5%', duration: 9 },
  ]

  const dots = Array.from({ length: 8 }, (_, i) => ({
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
          className="admin-float-orb"
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
            boxShadow: `0 0 ${dot.size * 1.5}px rgba(220, 38, 38, ${0.5 + Math.random() * 0.3})`,
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

function Admin() {
  const navigate = useNavigate()
  
  const [admin, setAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('hospitals')
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  
  const [donors, setDonors] = useState([])
  const [admins, setAdmins] = useState([])
  const [newAdminForm, setNewAdminForm] = useState({ email: '', password: '' })
  const [adminMessage, setAdminMessage] = useState('')
  
  const [bccDonations, setBccDonations] = useState([])
  const [noShowDonations, setNoShowDonations] = useState([])
  const [confirmingId, setConfirmingId] = useState(null)
  const [confirmingNoShowId, setConfirmingNoShowId] = useState(null)
  
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    const data = localStorage.getItem('adminData')
    
    if (!data) {
      navigate('/admin/login')
      return
    }
    
    setAdmin(JSON.parse(data))
    loadData()
    setTimeout(() => setVisible(true), 100)
  }, [navigate])

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('[Admin] 📊 Loading all data...')
      
      // ✅ Load all donors
      const donorsRes = await axios.get(`${API}/api/admin/donors`)
      setDonors(donorsRes.data || [])
      console.log('[Admin] ✅ Donors loaded:', donorsRes.data?.length)
      
      // ✅ Load all admins
      const adminsRes = await axios.get(`${API}/api/admin/admins`)
      setAdmins(adminsRes.data || [])
      console.log('[Admin] ✅ Admins loaded:', adminsRes.data?.length)
      
      // ✅ Load BCC donations awaiting confirmation
      const bccRes = await axios.get(`${API}/api/blood-requests/center-donations`)
      const bccData = bccRes.data || []
      setBccDonations(bccData.filter(d => d.status === 'awaiting_confirmation'))
      console.log('[Admin] ✅ BCC donations loaded:', bccData.length)
      
      // ✅ FIXED: Load hospital supply requests with status 'ns'
      console.log('[Admin] 🔍 Fetching hospital supply requests from /all-no-show...')
      const noShowRes = await axios.get(`${API}/api/blood-requests/all-no-show`)
      console.log('[Admin] Response from /all-no-show:', noShowRes.data)
      
      let noShowData = []
      if (noShowRes.data && Array.isArray(noShowRes.data)) {
        noShowData = noShowRes.data.map(r => ({
          ...r,
          blood_type: r.blood_type || 'Unknown',
          quantity_needed: r.quantity_needed || 0,
          hospital_name: r.hospital_name || `Hospital ID: ${r.hospital_id}`,
          created_at: r.created_at || new Date().toISOString()
        }))
      }
      
      console.log('[Admin] ✅ Hospital supply requests loaded:', noShowData.length)
      setNoShowDonations(noShowData)
    } catch (err) {
      console.error('[Admin] ❌ Error loading data:', err)
      console.error('[Admin] Error details:', err.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDonor = async (donorId) => {
    if (!window.confirm('Delete this donor? This action cannot be undone.')) return
    try {
      await axios.delete(`${API}/api/admin/donors/${donorId}`)
      setDonors(donors.filter(d => d.id !== donorId))
      alert('Donor deleted successfully!')
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`)
    }
  }

  const handleAddAdmin = async () => {
    setAdminMessage('')
    
    if (!newAdminForm.email || !newAdminForm.password) {
      setAdminMessage('Email and password required')
      return
    }
    
    if (!newAdminForm.email.endsWith('@bloodconnect.com')) {
      setAdminMessage('Email must end with @bloodconnect.com')
      return
    }
    
    if (newAdminForm.password.length < 6) {
      setAdminMessage('Password must be at least 6 characters')
      return
    }
    
    try {
      await axios.post(`${API}/api/admin/add-admin`, {
        email: newAdminForm.email,
        password: newAdminForm.password
      })
      setAdminMessage('Admin created successfully!')
      setNewAdminForm({ email: '', password: '' })
      loadData()
    } catch (err) {
      setAdminMessage(`Error: ${err.response?.data?.error || err.message}`)
    }
  }

  const handleChangePassword = async () => {
    setPasswordMessage('')
    
    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setPasswordMessage('All fields required')
      return
    }
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage('Passwords do not match')
      return
    }
    
    try {
      await axios.put(`${API}/api/admin/change-password`, {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      })
      setPasswordMessage('Password changed!')
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPasswordMessage(`Error: ${err.response?.data?.error || err.message}`)
    }
  }

 const handleConfirmBccDonation = async (donationId) => {
  setConfirmingId(donationId)
  try {
    const donation = bccDonations.find(d => d.id === donationId)
    
    if (!donation || !donation.patient_email) {
      alert('Donation or patient email missing')
      setConfirmingId(null)
      return
    }
    
    await axios.post(`${API}/api/blood-requests/admin-confirm`, {
      donationId: donationId,
      bloodType: donation.blood_type,
      patientEmail: donation.patient_email,
      donorEmail: donation.donor_email  // ✅ ADDED: Pass donor email for thank you
    })
    
    alert('✅ Donation confirmed! Patient and donor notified.')
    loadData()
  } catch (err) {
    alert(`Error: ${err.response?.data?.error || err.message}`)
  } finally {
    setConfirmingId(null)
  }
}

  // ✅ Confirm hospital supply - updates request to 'supply_coming'
  const handleConfirmHospitalSupply = async (requestId) => {
    setConfirmingNoShowId(requestId)
    try {
      const request = noShowDonations.find(r => r.id === requestId)
      
      if (!request) {
        alert('❌ Request not found')
        setConfirmingNoShowId(null)
        return
      }
      
      console.log('[Admin] 🩸 Confirming hospital supply for request:', requestId)
      
      // ✅ Update the request status to 'supply_coming' using PUT endpoint
      await axios.put(`${API}/api/blood-requests/${requestId}`, { status: 'supply_coming' })
      
      alert(`✅ Supply confirmed for ${request.hospital_name}!\n🩸 ${request.blood_type} - ${request.quantity_needed} units\n\nHospital will see "✈️ Coming for Supply from BCC Hamra" on their dashboard.`)
      
      // ✅ Reload data to refresh the list
      loadData()
    } catch (err) {
      console.error('[Admin] Error confirming supply:', err)
      alert(`Error: ${err.response?.data?.error || err.message}`)
    } finally {
      setConfirmingNoShowId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminData')
    navigate('/')
  }

  if (!admin) return null

  return (
    <div className="admin-root">
      <AnimatedBackgroundOrbs />

      {/* NAV */}
      <header className="admin-nav" style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)', transition: 'transform .6s cubic-bezier(.22,1,.36,1)' }}>
        <div className="admin-nav-inner">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="admin-logo"
            onClick={() => navigate('/')}
            whileHover={{ x: 3 }}
          >
            <motion.div
              className="admin-logo-icon"
              whileHover={{ scale: 1.12, boxShadow: '0 16px 40px rgba(220,38,38,.4)' }}
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            >
              <svg viewBox="0 0 100 130">
                <defs>
                  <linearGradient id="adminBlood" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="50%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                </defs>
                <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill="url(#adminBlood)" opacity="0.95" />
                <ellipse cx="32" cy="65" rx="16" ry="22" fill="#faf7f7" opacity="0.2" />
              </svg>
            </motion.div>
            <motion.div 
              className="admin-logo-text"
              animate={{ letterSpacing: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              BloodConnect
            </motion.div>
          </motion.div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 12px)' }}>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              onClick={() => navigate('/hospital-partners')}
              className="admin-btn admin-btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
            >
              Hospital Partners
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              onClick={handleLogout}
              className="admin-btn admin-btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
            >
              Sign Out
            </motion.button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="admin-main"
      >
        
        {/* TABS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="admin-glass-deep"
          style={{
            display: 'flex',
            gap: 0,
            marginBottom: 20,
            borderRadius: 16,
            padding: 0,
            overflowX: 'auto',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          {[
            { id: 'hospitals', label: 'Hospital Supply' },
            { id: 'bcc-hamra', label: 'BCC Hamra' },
            { id: 'donors', label: 'Donors' },
            { id: 'admins', label: 'Admins' },
            { id: 'settings', label: 'Settings' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`admin-tab-btn ${activeTab === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </motion.div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 24px', position: 'relative', zIndex: 10 }}>
            <div style={{ width: 40, height: 40, border: '4px solid rgba(220,38,38,.15)', borderTopColor: '#dc2626', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {!loading && activeTab === 'hospitals' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-glass-deep"
            style={{
              borderRadius: 16,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              padding: 'clamp(20px, 3vw, 32px)',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <h2 className="admin-card-title">🏥 Hospitals Needing Blood Supply</h2>
            <p className="admin-card-text" style={{ marginBottom: 'clamp(16px, 2vw, 24px)', fontSize: 'clamp(12px, 1.2vw, 14px)' }}>
              Hospitals where donors didn't show up - supply blood from BCC Hamra bank (all governorates)
            </p>
            
            {/* INFO BOX */}
            <div style={{ marginBottom: 'clamp(16px, 2vw, 24px)', padding: 'clamp(12px, 1.5vw, 16px)', background: 'linear-gradient(135deg, rgba(59,130,246,.1), rgba(191,219,254,.1))', border: '2px solid rgba(59,130,246,.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>ℹ️</span>
              <span style={{ fontSize: 'clamp(11px, 1.1vw, 12px)', fontWeight: 600, color: 'rgba(45,45,45,.7)' }}>
                <strong>Status Check:</strong> {loading ? 'Loading...' : `${noShowDonations.length} hospital${noShowDonations.length !== 1 ? 's' : ''} needing supply`}
              </span>
            </div>
            
            {noShowDonations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'clamp(32px, 5vw, 48px) 24px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                <p className="admin-card-text" style={{ fontWeight: 700 }}>No hospitals needing supply at this time.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'clamp(14px, 2.5vw, 18px)' }}>
                {noShowDonations.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'clamp(10px, 1.5vw, 14px)',
                      borderLeft: '4px solid #dc2626',
                      borderColor: '#dc2626'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>🩸</span>
                      <p style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 900, color: '#dc2626', margin: 0 }}>
                        {request.blood_type}
                      </p>
                    </div>
                    
                    <p className="admin-card-text" style={{ fontWeight: 700, color: '#dc2626' }}>
                      📋 {request.quantity_needed} unit{request.quantity_needed !== 1 ? 's' : ''} needed
                    </p>
                    
                    <div style={{ padding: '10px', background: 'rgba(220,38,38,.08)', borderRadius: 8, borderLeft: '3px solid #dc2626' }}>
                      <p className="admin-card-text" style={{ fontWeight: 900, color: 'rgba(45,45,45,.8)', margin: 0 }}>
                        🏥 {request.hospital_name}
                      </p>
                    </div>
                    
                    <p style={{ fontSize: 'clamp(10px, 1vw, 11px)', color: 'rgba(45,45,45,.5)', margin: 0, fontWeight: 600 }}>
                      📅 {new Date(request.created_at).toLocaleDateString('en-GB')}
                    </p>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleConfirmHospitalSupply(request.id)}
                      disabled={confirmingNoShowId === request.id}
                      className="admin-btn admin-btn-success"
                      style={{
                        marginTop: 'clamp(8px, 1.2vw, 12px)',
                        width: '100%',
                        opacity: confirmingNoShowId === request.id ? 0.6 : 1,
                        pointerEvents: confirmingNoShowId === request.id ? 'none' : 'auto',
                      }}
                    >
                      {confirmingNoShowId === request.id ? '⏳ Confirming...' : '✅ Confirmed'}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!loading && activeTab === 'bcc-hamra' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-glass-deep"
            style={{
              borderRadius: 16,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              padding: 'clamp(20px, 3vw, 32px)',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <h2 className="admin-card-title">BCC Hamra Center - Donors Awaiting</h2>
            <p className="admin-card-text" style={{ marginBottom: 'clamp(16px, 2vw, 24px)', fontSize: 'clamp(12px, 1.2vw, 14px)' }}>
              Donors who chose to donate at BCC Hamra center
            </p>
            
            {bccDonations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'clamp(32px, 5vw, 48px) 24px' }}>
                <p className="admin-card-text">No donors awaiting confirmation.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.5vw, 12px)' }}>
                {bccDonations.map((donation) => (
                  <motion.div
                    key={donation.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="admin-card"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)' }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 'clamp(13px, 1.4vw, 15px)', fontWeight: 900, color: '#dc2626', margin: '0 0 6px 0' }}>
                        {donation.blood_type} • {donation.donor_name || 'Anonymous'}
                      </p>
                      <p className="admin-card-text" style={{ marginBottom: '4px' }}>{donation.hospital_name || 'BCC Hamra Center'}</p>
                      <p style={{ fontSize: 'clamp(10px, 1vw, 11px)', color: 'rgba(45,45,45,.5)', margin: 0, fontWeight: 600 }}>
                        {new Date(donation.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleConfirmBccDonation(donation.id)}
                      disabled={confirmingId === donation.id}
                      className="admin-btn admin-btn-success"
                      style={{ opacity: confirmingId === donation.id ? 0.6 : 1, pointerEvents: confirmingId === donation.id ? 'none' : 'auto', whiteSpace: 'nowrap' }}
                    >
                      {confirmingId === donation.id ? 'Confirming...' : 'Confirm'}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!loading && activeTab === 'donors' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-glass-deep"
            style={{
              borderRadius: 16,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              padding: 'clamp(20px, 3vw, 32px)',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <h2 className="admin-card-title">Registered Donors ({donors.length})</h2>
            
            {donors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'clamp(32px, 5vw, 48px) 24px' }}>
                <p className="admin-card-text">No donors registered yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'clamp(12px, 2vw, 16px)' }}>
                {donors.map((donor) => (
                  <motion.div
                    key={donor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-card"
                    style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.2vw, 12px)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>
                        {donor.first_name?.charAt(0) || 'D'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 'clamp(12px, 1.3vw, 14px)', fontWeight: 900, color: '#dc2626', margin: 0 }}>
                          {donor.first_name} {donor.last_name}
                        </p>
                        <p style={{ fontSize: 'clamp(10px, 1vw, 11px)', color: 'rgba(45,45,45,.5)', margin: '2px 0 0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {donor.email}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px solid rgba(220,38,38,.1)', paddingTop: 'clamp(8px, 1vw, 10px)' }}>
                      <p className="admin-card-text">{donor.blood_type}</p>
                      <p className="admin-card-text">{donor.governorate}</p>
                      <p className="admin-card-text" style={{ marginBottom: 'clamp(8px, 1vw, 12px)' }}>{donor.phone}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!loading && activeTab === 'admins' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'clamp(16px, 3vw, 24px)', position: 'relative', zIndex: 10 }}
          >
            <div className="admin-glass-deep" style={{ padding: 'clamp(20px, 3vw, 32px)', borderRadius: 16 }}>
              <h3 className="admin-card-title">Add New Admin</h3>
              
              {adminMessage && (
                <div className={`admin-message ${adminMessage.startsWith('Email') || adminMessage.startsWith('Password') ? 'error' : adminMessage.includes('Error') ? 'error' : 'success'}`}>
                  {adminMessage}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 16px)' }}>
                <div>
                  <label className="admin-label">Email</label>
                  <input
                    type="email"
                    placeholder="admin@bloodconnect.com"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    className="admin-input"
                  />
                  <p style={{ fontSize: 'clamp(10px, 1vw, 11px)', color: 'rgba(45,45,45,.5)', margin: 'clamp(4px, 0.8vw, 6px) 0 0', fontWeight: 600 }}>
                    Must end with @bloodconnect.com
                  </p>
                </div>
                
                <div>
                  <label className="admin-label">Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    className="admin-input"
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAddAdmin}
                  className="admin-btn admin-btn-primary"
                  style={{ padding: 'clamp(12px, 2vw, 14px)', width: '100%' }}
                >
                  Create Admin
                </motion.button>
              </div>
            </div>
            
            <div className="admin-glass-deep" style={{ padding: 'clamp(20px, 3vw, 32px)', borderRadius: 16 }}>
              <h3 className="admin-card-title">Current Admins ({admins.length})</h3>
              
              {admins.length === 0 ? (
                <p className="admin-card-text">No admins yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.5vw, 12px)' }}>
                  {admins.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        borderRadius: 12,
                        padding: 'clamp(10px, 1.5vw, 14px)',
                        background: 'rgba(255,235,238,.3)',
                        border: '1px solid rgba(220,38,38,.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
                      <span style={{ fontSize: 'clamp(11px, 1.2vw, 12px)', fontWeight: 700, color: '#dc2626' }}>{a.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {!loading && activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-glass-deep"
            style={{
              borderRadius: 16,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              padding: 'clamp(20px, 3vw, 32px)',
              maxWidth: 500,
              position: 'relative',
              zIndex: 10,
            }}
          >
            <h3 className="admin-card-title">Change Password</h3>
            
            {passwordMessage && (
              <div className={`admin-message ${passwordMessage.startsWith('All') || passwordMessage.startsWith('Passwords') ? 'error' : passwordMessage.includes('Error') ? 'error' : 'success'}`}>
                {passwordMessage}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 16px)' }}>
              <div>
                <label className="admin-label">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="admin-input"
                />
              </div>
              
              <div>
                <label className="admin-label">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="admin-input"
                />
              </div>
              
              <div>
                <label className="admin-label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="admin-input"
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleChangePassword}
                className="admin-btn admin-btn-primary"
                style={{ padding: 'clamp(12px, 2vw, 14px)', width: '100%' }}
              >
                Update Password
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.main>
    </div>
  )
}

export default Admin