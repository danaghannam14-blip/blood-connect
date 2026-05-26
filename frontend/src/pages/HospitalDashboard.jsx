import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

// ✅ API Auto-Detection (localhost vs production)
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://blood-bank-eqyr.onrender.com'

const MODERN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

  .hospital-root {
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

  .hospital-float-orb {
    position:absolute;border-radius:50%;filter:blur(80px);
    pointer-events:none;animation:float-orb 6s ease-in-out infinite;
  }

  .hospital-glass {
    background:rgba(255,255,255,.6);backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(180,180,180,.2);box-shadow:0 8px 32px rgba(0,0,0,.08);
  }

  .hospital-glass-deep {
    background:rgba(255,255,255,.65);backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(180,180,180,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.05),inset 0 1px 1px rgba(255,255,255,.4);
  }

  .hospital-nav {
    position:sticky;top:0;z-index:40;
    background:rgba(248,248,248,.85);backdrop-filter:blur(20px) saturate(200%);
    -webkit-backdrop-filter:blur(20px) saturate(200%);
    border-bottom:1px solid rgba(180,180,180,.15);box-shadow:0 4px 30px rgba(0,0,0,.08);
  }

  .hospital-btn {
    position:relative;overflow:hidden;cursor:pointer;border:none;outline:none;
    transition:all .35s cubic-bezier(.25,1,.5,1);
    font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;border-radius:10px;
    letter-spacing:.5px;font-size:13px;
  }

  .hospital-btn::before {
    content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transition:left .5s;
  }

  .hospital-btn:hover::before { left:100%; }

  .hospital-btn-primary {
    background:linear-gradient(135deg,#dc2626 0%,#991b1b 100%);
    color:#ffffff;box-shadow:0 6px 18px rgba(220,38,38,.22);padding:10px 24px;
  }

  .hospital-btn-primary:hover {
    transform:translateY(-2px);box-shadow:0 10px 30px rgba(220,38,38,.28);
  }

  .hospital-btn-success {
    background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);
    color:#ffffff;box-shadow:0 6px 18px rgba(34,197,94,.22);padding:9px 18px;
  }

  .hospital-btn-success:hover {
    transform:translateY(-2px);box-shadow:0 10px 30px rgba(34,197,94,.28);
  }

  .hospital-tab-btn {
    padding:10px 18px;font-size:13px;font-weight:700;border:none;
    background:transparent;cursor:pointer;color:rgba(61,61,61,.6);
    transition:all .3s ease;border-bottom:2px solid transparent;
    letter-spacing:.3px;text-transform:uppercase;
  }

  .hospital-tab-btn.active {
    color:#dc2626;border-bottom-color:#dc2626;
    background:rgba(255,255,255,.5);border-radius:8px;border-bottom:none;
  }

  .hospital-input {
    width:100%;padding:10px 16px;
    border:1px solid rgba(150,150,150,.25);border-radius:10px;
    font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;
    background:rgba(255,255,255,.7);color:#dc2626;transition:all .3s ease;
  }

  .hospital-input:focus {
    outline:none;border-color:rgba(220,38,38,.4);
    background:rgba(255,255,255,.95);box-shadow:0 0 0 3px rgba(220,38,38,.1);
  }

  .hospital-label {
    font-size:10px;font-weight:900;color:rgba(45,45,45,.6);
    text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;display:block;
  }

  .hospital-card-title {
    font-family:'Fraunces',serif;font-size:18px;font-weight:900;
    color:#6e2016;margin:0 0 12px 0;
  }

  .hospital-message {
    border-radius:12px;padding:12px 16px;text-align:center;
    color:#dc2626;font-weight:700;font-size:13px;margin-bottom:20px;
  }

  .hospital-message.success {
    background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);color:#22c55e;
  }

  .hospital-message.error {
    background:rgba(255,235,238,.8);border:1px solid rgba(220,38,38,.3);color:#dc2626;
  }
`

if (typeof document !== 'undefined' && !document.getElementById('hospital-modern-styles')) {
  const s = document.createElement('style')
  s.id = 'hospital-modern-styles'
  s.textContent = MODERN_STYLES
  document.head.appendChild(s)
}

function AnimatedBackgroundOrbs() {
  const orbs = [
    { size: 'min(200px,20vw)', color: 'rgba(220,38,38,.1)', top: '-5%', left: '-3%', duration: 8 },
    { size: 'min(180px,18vw)', color: 'rgba(180,180,180,.08)', top: '20%', right: '-8%', duration: 11 },
    { size: 'min(190px,19vw)', color: 'rgba(220,38,38,.08)', bottom: '-10%', left: '5%', duration: 13 },
    { size: 'min(160px,16vw)', color: 'rgba(180,180,180,.06)', bottom: '15%', right: '-5%', duration: 9 },
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
          className="hospital-float-orb"
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

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: '#DC2626', light: 'rgba(220,38,38,.15)' },
  urgent: { label: 'Urgent', color: '#EA580C', light: 'rgba(234,88,12,.15)' },
  medium: { label: 'Medium', color: '#FBBF24', light: 'rgba(251,191,36,.15)' },
  low: { label: 'Low', color: '#6B7280', light: 'rgba(107,114,128,.15)' }
}

function HospitalDashboard() {
  const navigate = useNavigate()

  const [hospital, setHospital] = useState(null)
  const [requests, setRequests] = useState([])
  const [bloodStock, setBloodStock] = useState({})
  const [transfusions, setTransfusions] = useState([])
  const [emergencyDonations, setEmergencyDonations] = useState([])
  
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ blood_type: '', quantity_needed: '', urgency: 'urgent' })
  const [stockMessage, setStockMessage] = useState('')
  const [transfusionMessage, setTransfusionMessage] = useState('')
  const [transfusionForm, setTransfusionForm] = useState({ blood_type: '', units: 1 })
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('post')
  const [visible, setVisible] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)
  const [confirmingSupplyId, setConfirmingSupplyId] = useState(null)
  const [noShowIds, setNoShowIds] = useState([])

  const [awaitingDonations, setAwaitingDonations] = useState([])
  const [okDonations, setConfirmedDonations] = useState([])

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  useEffect(() => {
    const data = localStorage.getItem('hospitalData')
    if (!data) {
      navigate('/login')
      return
    }
    setHospital(JSON.parse(data))
  }, [navigate])

  useEffect(() => {
    if (!hospital) return
    loadData()
  }, [hospital])

  const loadData = async () => {
    setLoading(true)
    try {
      const reqRes = await axios.get(`${API}/api/requests/hospital/${hospital.id}`)
      setRequests(reqRes.data || [])

      const stockRes = await axios.get(`${API}/api/hospitals/stock/${hospital.id}`)
      const stockMap = {}
      if (stockRes.data && Array.isArray(stockRes.data)) {
        stockRes.data.forEach(s => {
          stockMap[s.blood_type] = s.units_available
        })
      }
      setBloodStock(stockMap)

      const transfusionRes = await axios.get(`${API}/api/hospitals/transfusions/${hospital.id}`)
      setTransfusions(transfusionRes.data || [])

      const emergencyRes = await axios.get(`${API}/api/blood-requests/hospital/${hospital.id}`)
      const donations = emergencyRes.data || []
      setAwaitingDonations(donations.filter(d => d.status === 'awaiting_confirmation'))
      setConfirmedDonations(donations.filter(d => d.status === 'ok'))
      setEmergencyDonations(donations)

    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    
    if (!form.blood_type || !form.quantity_needed) {
      setMessage('Please fill all fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await axios.post(`${API}/api/requests/create`, {
        hospital_id: hospital.id,
        blood_type: form.blood_type,
        quantity_needed: parseInt(form.quantity_needed),
        urgency: form.urgency
      })

      if (response.data.success) {
        setMessage('Request posted successfully. Donors notified.')
        setForm({ blood_type: '', quantity_needed: '', urgency: 'urgent' })
        setTimeout(() => loadData(), 1000)
      }
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmReceived = async (requestId) => {
    try {
      await axios.delete(`${API}/api/requests/${requestId}`)
      alert('Request confirmed. Removed from donor dashboard.')
      loadData()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleDidntShowUp = async (requestId) => {
    if (!window.confirm('Mark as not shown? Request removed from donor dashboard and appears in admin Hospital Supply.')) return
    setConfirmingId(requestId)
    try {
      await axios.put(`${API}/api/requests/${requestId}`, { status: 'ns' })
      
      setNoShowIds([...noShowIds, requestId])
      alert('Marked as not shown. Admin will provide supply from BCC Hamra.')
      setTimeout(() => loadData(), 500)
    } catch (err) {
      alert(`Error: ${err.message}`)
      setConfirmingId(null)
    }
  }

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Delete this request permanently?')) return
    
    try {
      await axios.delete(`${API}/api/requests/${requestId}`)
      setRequests(requests.filter(r => r.id !== requestId))
      alert('Request deleted.')
      loadData()
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`)
    }
  }

  const handleConfirmSupplyReceived = async (requestId) => {
    setConfirmingSupplyId(requestId)
    try {
      const request = requests.find(r => r.id === requestId)
      
      if (!request) {
        alert('Request not found')
        setConfirmingSupplyId(null)
        return
      }
      
      await axios.delete(`${API}/api/requests/${requestId}`)
      
      alert('Supply confirmed and received.')
      loadData()
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`)
    } finally {
      setConfirmingSupplyId(null)
    }
  }

  // ✅ ONLY called when hospital clicks CONFIRM button
  // This is the ONLY action that removes from both dashboards
  const handleConfirmDonation = async (donationId) => {
    setConfirmingId(donationId)
    try {
      const donation = awaitingDonations.find(d => d.id === donationId)
      
      if (!donation) {
        alert('Donation not found')
        setConfirmingId(null)
        return
      }

      console.log('=== HOSPITAL CONFIRMING DONATION ===')
      console.log('Donation ID:', donationId)
      console.log('Deleting from blood_requests to remove from all dashboards')

      // Delete from blood_requests removes from:
      // - Hospital Emergency Donations tab ✅
      // - Donor Emergency Donations tab ✅  
      await axios.delete(`${API}/api/requests/${donationId}`)
      
      alert('Donation confirmed! Removed from all dashboards.')
      loadData()
    } catch (err) {
      console.error('Error confirming donation:', err.response?.data || err.message)
      alert(`Error: ${err.response?.data?.error || err.message}`)
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
            units_available: parseInt(units)
          })
        )
      )
      setStockMessage('Stock updated successfully.')
    } catch (err) {
      setStockMessage(`Error: ${err.message}`)
    }
  }

  const handleRecordTransfusion = async () => {
    if (!transfusionForm.blood_type) {
      setTransfusionMessage('Select blood type')
      return
    }

    setTransfusionMessage('')
    try {
      const res = await axios.post(`${API}/api/hospitals/transfusion/${hospital.id}`, transfusionForm)
      setTransfusionMessage(`Recorded. ${res.data.remaining} units remaining.`)
      setTransfusionForm({ blood_type: '', units: 1 })
      loadData()
    } catch (err) {
      setTransfusionMessage(`Error: ${err.response?.data?.message || err.message}`)
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
  const awaitingCount = awaitingDonations.length
  const supplyComingCount = requests.filter(r => r.status === 'supply_coming').length

  return (
    <div className="hospital-root">
      <AnimatedBackgroundOrbs />
      
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hospital-nav"
      >
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <motion.div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: 22,
              }}
              whileHover={{ scale: 1.12 }}
            >
              H
            </motion.div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', margin: 0 }}>{hospital.name}</h1>
              <p style={{ fontSize: 10, color: 'rgba(211,47,47,.5)', margin: '4px 0 0', fontWeight: 700 }}>{hospital.email}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="hospital-btn hospital-btn-primary"
          >
            Logout
          </motion.button>
        </div>
      </motion.div>

      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 10 }}>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ staggerChildren: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 44 }}
        >
          <motion.div className="hospital-glass" style={{ borderRadius: 20, padding: 24, border: '2px solid rgba(211,47,47,.2)' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#EA580C', margin: 0 }}>{pendingCount}</p>
            <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.4)', textTransform: 'uppercase', margin: '6px 0 0', lineHeight: 1 }}>Active Requests</p>
          </motion.div>
          <motion.div className="hospital-glass" style={{ borderRadius: 20, padding: 24, border: '2px solid rgba(211,47,47,.2)' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#22C55E', margin: 0 }}>{fulfilledCount}</p>
            <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.4)', textTransform: 'uppercase', margin: '6px 0 0', lineHeight: 1 }}>Fulfilled</p>
          </motion.div>
          <motion.div className="hospital-glass" style={{ borderRadius: 20, padding: 24, border: '2px solid rgba(211,47,47,.2)' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#3b82f6', margin: 0 }}>{supplyComingCount}</p>
            <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.4)', textTransform: 'uppercase', margin: '6px 0 0', lineHeight: 1 }}>Supply Coming</p>
          </motion.div>
          <motion.div className="hospital-glass" style={{ borderRadius: 20, padding: 24, border: '2px solid rgba(211,47,47,.2)' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#DC2626', margin: 0 }}>{awaitingCount}</p>
            <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.4)', textTransform: 'uppercase', margin: '6px 0 0', lineHeight: 1 }}>Emergency Awaiting</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ delay: 0.3 }}
          className="hospital-glass-deep"
          style={{
            display: 'flex',
            gap: 0,
            marginBottom: 20,
            borderRadius: 16,
            padding: 0,
            overflowX: 'auto',
          }}
        >
          {['post', 'emergency', 'stock', 'transfusions'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`hospital-tab-btn ${activeTab === t ? 'active' : ''}`}
            >
              {t === 'post' ? 'Post Request' : t === 'stock' ? 'Blood Stock' : t === 'transfusions' ? 'Blood Used' : 'Emergency Donations'}
            </button>
          ))}
        </motion.div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 24px', position: 'relative', zIndex: 10 }}>
            <div style={{ width: 40, height: 40, border: '4px solid rgba(220,38,38,.15)', borderTopColor: '#dc2626', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {!loading && activeTab === 'post' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
          >
            <motion.div
              className="hospital-glass-deep"
              style={{ borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)' }}
            >
              <h2 className="hospital-card-title">Post Blood Request</h2>

              {message && (
                <div className={`hospital-message ${message.includes('successfully') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="hospital-label">Blood Type</label>
                  <select
                    value={form.blood_type}
                    onChange={e => setForm({ ...form, blood_type: e.target.value })}
                    className="hospital-input"
                    required
                  >
                    <option value="">Select Blood Type</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="hospital-label">Units Needed</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    min="1"
                    value={form.quantity_needed}
                    onChange={e => setForm({ ...form, quantity_needed: e.target.value })}
                    className="hospital-input"
                    required
                  />
                </div>

                <div>
                  <label className="hospital-label">Urgency Level</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {Object.entries(URGENCY_CONFIG).map(([key, val]) => (
                      <motion.button
                        key={key}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setForm({ ...form, urgency: key })}
                        style={{
                          padding: 12,
                          borderRadius: 14,
                          border: `2px solid ${form.urgency === key ? val.color : 'rgba(211,47,47,.15)'}`,
                          background: form.urgency === key ? `linear-gradient(135deg, ${val.color}, ${val.color}40)` : undefined,
                          color: form.urgency === key ? '#fff' : val.color,
                          fontWeight: 900,
                          fontSize: 11,
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          letterSpacing: '.1em',
                          cursor: 'pointer'
                        }}
                      >
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
                  className="hospital-btn hospital-btn-primary"
                  style={{
                    padding: 14,
                    width: '100%',
                    marginTop: 8,
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? 'Posting...' : 'Post Request and Notify Donors'}
                </motion.button>
              </form>
            </motion.div>

            <motion.div
              className="hospital-glass-deep"
              style={{ borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)' }}
            >
              <h2 className="hospital-card-title">Your Posted Requests ({requests.length})</h2>

              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <p style={{ fontSize: 13, color: 'rgba(45,45,45,.7)', fontWeight: 700 }}>No requests posted yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {requests.map((r) => {
                    const urg = URGENCY_CONFIG[r.urgency] || URGENCY_CONFIG.urgent
                    
                    if (r.status === 'ok') {
                      return (
                        <div
                          key={r.id}
                          style={{
                            borderRadius: 18,
                            padding: 18,
                            border: '1px solid rgba(34,197,94,.3)',
                            background: 'rgba(240,253,244,.6)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                              <span style={{ fontSize: 20, fontWeight: 900, color: '#059669' }}>{r.blood_type}</span>
                              <span style={{
                                fontSize: 9,
                                fontWeight: 900,
                                padding: '4px 10px',
                                borderRadius: 8,
                                background: 'rgba(34,197,94,.2)',
                                color: '#047857',
                                textTransform: 'uppercase',
                                letterSpacing: '.1em'
                              }}>
                                CONFIRMED
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: '#047857', margin: '0 0 6px 0', fontWeight: 600 }}>{r.quantity_needed} units needed</p>
                            <p style={{ fontSize: 11, color: 'rgba(5,102,82,.6)', margin: 0, fontWeight: 500 }}>
                              {new Date(r.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                          <div style={{ padding: '12px', background: 'rgba(34,197,94,.08)', borderRadius: 10, textAlign: 'center', fontWeight: 700, color: '#047857', fontSize: 13 }}>
                            Confirmed and Ready
                          </div>
                        </div>
                      )
                    }
                    
                    if (r.status === 'supply_coming') {
                      return (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            borderRadius: 18,
                            padding: 18,
                            border: '1px solid rgba(96,165,250,.3)',
                            background: 'rgba(240,249,255,.6)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            boxShadow: '0 4px 12px rgba(59,130,246,.08)'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                              <span style={{ fontSize: 20, fontWeight: 900, color: '#1d4ed8' }}>{r.blood_type}</span>
                              <span style={{
                                fontSize: 9,
                                fontWeight: 900,
                                padding: '4px 10px',
                                borderRadius: 8,
                                background: 'rgba(96,165,250,.2)',
                                color: '#1e40af',
                                textTransform: 'uppercase',
                                letterSpacing: '.1em'
                              }}>
                                COMING
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: '#1e40af', margin: '0 0 6px 0', fontWeight: 600 }}>{r.quantity_needed} units needed</p>
                            <p style={{ fontSize: 11, color: 'rgba(30,64,175,.6)', margin: 0, fontWeight: 500 }}>
                              {new Date(r.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                          <div style={{ padding: '12px', background: 'rgba(96,165,250,.08)', borderRadius: 10, textAlign: 'center', fontWeight: 700, color: '#1e40af', fontSize: 13 }}>
                            Supply coming from BCC Hamra
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleConfirmSupplyReceived(r.id)}
                            disabled={confirmingSupplyId === r.id}
                            className="hospital-btn hospital-btn-success"
                            style={{
                              marginTop: 8,
                              width: '100%',
                              opacity: confirmingSupplyId === r.id ? 0.6 : 1
                            }}
                          >
                            {confirmingSupplyId === r.id ? 'Confirming Received...' : 'Supply Confirmed and Received'}
                          </motion.button>
                        </motion.div>
                      )
                    }
                    
                    return (
                      <div
                        key={r.id}
                        style={{
                          borderRadius: 18,
                          padding: 18,
                          border: '1px solid rgba(200,150,120,.2)',
                          background: 'rgba(250,240,230,.5)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <span style={{ fontSize: 20, fontWeight: 900, color: '#7c2d12' }}>{r.blood_type}</span>
                            <span style={{
                              fontSize: 9,
                              fontWeight: 900,
                              padding: '4px 10px',
                              borderRadius: 8,
                              background: 'rgba(120,150,120,.15)',
                              color: '#78350f',
                              textTransform: 'uppercase',
                              letterSpacing: '.1em'
                            }}>
                              {r.status === 'ns' ? 'NOT SHOWN' : URGENCY_CONFIG[r.urgency]?.label}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: '#78350f', margin: '0 0 6px 0', fontWeight: 600 }}>{r.quantity_needed} units needed</p>
                          <p style={{ fontSize: 11, color: 'rgba(120,53,15,.6)', margin: 0, fontWeight: 500 }}>
                            {new Date(r.created_at).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleConfirmReceived(r.id)}
                            className="hospital-btn hospital-btn-success"
                            style={{ flex: 1, padding: '8px 12px', fontSize: 11 }}
                          >
                            Confirmed
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDidntShowUp(r.id)}
                            style={{
                              flex: 1,
                              fontSize: 11,
                              fontWeight: 900,
                              color: noShowIds.includes(r.id) ? '#fff' : '#a04432',
                              background: noShowIds.includes(r.id) ? '#a04432' : 'rgba(200,120,100,.12)',
                              padding: '8px 12px',
                              borderRadius: 10,
                              border: noShowIds.includes(r.id) ? 'none' : '1px solid rgba(160,68,50,.2)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {noShowIds.includes(r.id) ? 'No-Show Sent' : 'Did Not Show Up'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteRequest(r.id)}
                            style={{
                              flex: 1,
                              fontSize: 11,
                              fontWeight: 900,
                              color: '#fff',
                              background: '#b4451f',
                              padding: '8px 12px',
                              borderRadius: 10,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {!loading && activeTab === 'emergency' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hospital-glass-deep"
            style={{
              borderRadius: 28,
              padding: 32,
              border: '2px solid #dc2626',
              background: 'linear-gradient(135deg, rgba(220,38,38,.08), rgba(255,107,107,.04))'
            }}
          >
            <h2 className="hospital-card-title">Emergency Donations From Donors</h2>
            
            {emergencyDonations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ fontSize: 13, color: 'rgba(45,45,45,.7)', fontWeight: 700 }}>No emergency donations yet.</p>
              </div>
            ) : (
              <div>
                {awaitingDonations.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#dc2626', margin: '0 0 16px 0' }}>Awaiting Confirmation ({awaitingDonations.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {awaitingDonations.map((donation) => (
                        <div
                          key={donation.id}
                          style={{
                            background: 'rgba(254,226,226,.5)',
                            borderRadius: 18,
                            padding: 18,
                            border: '2px solid rgba(220,38,38,.3)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 900, color: '#dc2626', margin: '0 0 6px 0' }}>
                              {donation.blood_type} - {donation.donor_name || 'Anonymous'}
                            </p>
                            <p style={{ fontSize: 11, color: 'rgba(211,47,47,.65)', margin: '0', fontWeight: 700 }}>
                              Awaiting confirmation - {new Date(donation.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleConfirmDonation(donation.id)}
                            disabled={confirmingId === donation.id}
                            className="hospital-btn hospital-btn-success"
                            style={{ opacity: confirmingId === donation.id ? 0.7 : 1 }}
                          >
                            {confirmingId === donation.id ? 'Confirming...' : 'Confirm'}
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {okDonations.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#22c55e', margin: '0 0 16px 0' }}>Confirmed ({okDonations.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {okDonations.map((donation) => (
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
                              {donation.blood_type} - {donation.donor_name || 'Anonymous'}
                            </p>
                            <p style={{ fontSize: 11, color: 'rgba(34,197,94,.65)', margin: '0', fontWeight: 700 }}>
                              Confirmed - {new Date(donation.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 900, color: '#22c55e', padding: '8px 16px', background: 'rgba(34,197,94,.15)', borderRadius: 10 }}>
                            Ready
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {!loading && activeTab === 'stock' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hospital-glass-deep"
            style={{ borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)' }}
          >
            <h2 className="hospital-card-title">Current Blood Stock</h2>

            {stockMessage && (
              <div className={`hospital-message ${stockMessage.includes('successfully') ? 'success' : 'error'}`}>
                {stockMessage}
              </div>
            )}

            <motion.div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => {
                const units = bloodStock[bt] ?? 0
                const dotColor = units === 0 ? '#DC2626' : units <= 5 ? '#EA580C' : '#22C55E'
                const bgColor = units === 0 ? 'rgba(220,38,38,.15)' : units <= 5 ? 'rgba(234,88,12,.15)' : 'rgba(34,197,94,.15)'
                
                return (
                  <div
                    key={bt}
                    style={{
                      borderRadius: 16,
                      padding: 14,
                      border: `2px solid ${dotColor}40`,
                      background: bgColor,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: dotColor,
                        boxShadow: `0 0 12px ${dotColor}80`
                      }} />
                      <span style={{ fontSize: 16, fontWeight: 900, color: dotColor }}>{bt}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={units}
                      onChange={e => setBloodStock(prev => ({ ...prev, [bt]: parseInt(e.target.value) || 0 }))}
                      className="hospital-input"
                    />
                    <span style={{ fontSize: 9, color: 'rgba(211,47,47,.4)', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '.1em' }}>units</span>
                  </div>
                )
              })}
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveStock}
              className="hospital-btn hospital-btn-primary"
              style={{ width: '100%', padding: 14 }}
            >
              Save Blood Stock
            </motion.button>
          </motion.div>
        )}

        {!loading && activeTab === 'transfusions' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hospital-glass-deep"
            style={{ borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)' }}
          >
            <h2 className="hospital-card-title">Record Blood Usage</h2>

            {transfusionMessage && (
              <div className={`hospital-message ${transfusionMessage.includes('Recorded') ? 'success' : 'error'}`}>
                {transfusionMessage}
              </div>
            )}

            <div style={{ background: 'rgba(255,235,238,.4)', border: '2px solid rgba(211,47,47,.15)', borderRadius: 18, padding: 18, marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 900, color: '#dc2626', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '.1em' }}>Record New Transfusion</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="hospital-label">Blood Type Used</label>
                  <select
                    value={transfusionForm.blood_type}
                    onChange={e => setTransfusionForm({ ...transfusionForm, blood_type: e.target.value })}
                    className="hospital-input"
                  >
                    <option value="">Select blood type</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                      <option key={bt} value={bt}>{bt} - {bloodStock[bt] ?? 0} units available</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="hospital-label">Units Used</label>
                  <input
                    type="number"
                    min="1"
                    value={transfusionForm.units}
                    onChange={e => setTransfusionForm({ ...transfusionForm, units: parseInt(e.target.value) || 1 })}
                    className="hospital-input"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRecordTransfusion}
                  disabled={!transfusionForm.blood_type}
                  className="hospital-btn hospital-btn-primary"
                  style={{
                    padding: 12,
                    opacity: !transfusionForm.blood_type ? 0.5 : 1,
                    pointerEvents: !transfusionForm.blood_type ? 'none' : 'auto'
                  }}
                >
                  Record Blood Usage
                </motion.button>
              </div>
            </div>

            <p style={{ fontSize: 13, fontWeight: 900, color: '#dc2626', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '.1em' }}>Recent Transfusions</p>
            {transfusions.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'rgba(211,47,47,.4)', fontSize: 13, padding: '24px 16px' }}>No transfusions recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {transfusions.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      borderRadius: 14,
                      padding: 12,
                      background: 'rgba(255,235,238,.4)',
                      border: '2px solid rgba(211,47,47,.2)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <span style={{ color: '#dc2626', fontWeight: 900, fontSize: 13 }}>{t.blood_type}</span>
                      <span style={{ color: 'rgba(211,47,47,.5)', fontSize: 11, marginLeft: 12, fontWeight: 700 }}>{t.units} unit(s) used</span>
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(211,47,47,.4)', fontWeight: 700 }}>{new Date(t.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

export default HospitalDashboard