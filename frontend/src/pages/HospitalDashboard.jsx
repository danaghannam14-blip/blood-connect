import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

// ✅ API Auto-Detection (localhost vs production)
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://blood-bank-eqyr.onrender.com'

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: '#DC2626', light: 'rgba(220,38,38,.15)' },
  urgent: { label: 'Urgent', color: '#EA580C', light: 'rgba(234,88,12,.15)' },
  medium: { label: 'Medium', color: '#FBBF24', light: 'rgba(251,191,36,.15)' },
  low: { label: 'Low', color: '#6B7280', light: 'rgba(107,114,128,.15)' }
}

function HospitalDashboard() {
  const navigate = useNavigate()

  // ✅ ALL STATE DECLARATIONS
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

  // Emergency donations split
  const [awaitingDonations, setAwaitingDonations] = useState([])
  const [okDonations, setConfirmedDonations] = useState([])

  // ✅ INITIALIZATION
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

  // ✅ LOAD DATA WHEN HOSPITAL IS SET
  useEffect(() => {
    if (!hospital) return
    loadData()
  }, [hospital])

  // ✅ LOAD ALL DATA
  const loadData = async () => {
    setLoading(true)
    try {
      // Request 1: Get blood requests (posted by hospital)
      const reqRes = await axios.get(`${API}/api/requests/hospital/${hospital.id}`)
      console.log('[HospitalDashboard] Requests loaded:', reqRes.data)
      setRequests(reqRes.data || [])

      // Request 2: Get blood stock
      const stockRes = await axios.get(`${API}/api/hospitals/stock/${hospital.id}`)
      const stockMap = {}
      if (stockRes.data && Array.isArray(stockRes.data)) {
        stockRes.data.forEach(s => {
          stockMap[s.blood_type] = s.units_available
        })
      }
      setBloodStock(stockMap)

      // Request 3: Get transfusions
      const transfusionRes = await axios.get(`${API}/api/hospitals/transfusions/${hospital.id}`)
      setTransfusions(transfusionRes.data || [])

      // Request 4: Get emergency donations (NEW SYSTEM)
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

  // ✅ POST BLOOD REQUEST
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    
    if (!form.blood_type || !form.quantity_needed) {
      setMessage('❌ Please fill all fields')
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
        setMessage('✅ Request posted! Donors notified.')
        setForm({ blood_type: '', quantity_needed: '', urgency: 'urgent' })
        setTimeout(() => loadData(), 1000)
      }
    } catch (err) {
      console.error('Error:', err)
      setMessage(`❌ Error: ${err.response?.data?.error || err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  // ✅ CONFIRM REQUEST (sync to donor dashboard)
  const handleConfirmReceived = async (requestId) => {
    try {
      await axios.put(`${API}/api/requests/${requestId}`, { status: 'ok' })
      alert('✅ Request ok! Donor will see this on their dashboard.')
      loadData()
    } catch (err) {
      alert(`❌ Error: ${err.message}`)
    }
  }

  // ✅ DONOR DIDN'T SHOW UP (changes status to 'ns' - keeps it visible)
  const handleDidntShowUp = async (requestId) => {
    if (!window.confirm('Mark as "didn\'t show up"? This will notify admin that blood is needed from BCC Hamra.')) return
    try {
      await axios.put(`${API}/api/requests/${requestId}`, { status: 'ns' })
      alert('✅ Request marked as "didn\'t show up". Admin will provide blood from BCC Hamra.')
      loadData()
    } catch (err) {
      alert(`❌ Error: ${err.message}`)
    }
  }

  // ✅ DELETE REQUEST COMPLETELY (removes from everywhere)
  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Delete this request? This will remove it from donor dashboards too.')) return
    
    try {
      // Delete from blood_requests
      await axios.delete(`${API}/api/requests/${requestId}`)
      console.log('[HospitalDashboard] Request deleted:', requestId)
      
      // Immediately remove from local state
      setRequests(requests.filter(r => r.id !== requestId))
      alert('✅ Request deleted from all dashboards!')
      
      // Refresh data
      loadData()
    } catch (err) {
      console.error('[HospitalDashboard] Delete error:', err)
      alert(`❌ Error: ${err.response?.data?.error || err.message}`)
    }
  }

  // ✅ CONFIRM DONATION - Now also DELETES from donor dashboard
  const handleConfirmDonation = async (donationId) => {
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

      const response = await axios.post(`${API}/api/blood-requests/hospital-confirm`, {
        donationId: donationId,
        hospitalId: hospital.id,
        bloodType: donation.blood_type,
        patientEmail: donation.patient_email
      })
      console.log('Confirm response:', response.data)
      
      // ✅ No need to delete - hospital-confirm already updates status to 'ok'
      // The donor query filters out status != 'pending'/'awaiting_confirmation'
      // So it will disappear from donor dashboard automatically
      
      alert('✅ Donation confirmed! Removed from donor dashboard.')
      loadData()
    } catch (err) {
      console.error('Confirm error:', err)
      alert(`❌ Error: ${err.response?.data?.error || err.message}`)
    } finally {
      setConfirmingId(null)
    }
  }

  // ✅ CONFIRM SUPPLY RECEIVED - Removes request from hospital dashboard
  const handleConfirmSupplyReceived = async (requestId) => {
    setConfirmingSupplyId(requestId)
    try {
      const request = requests.find(r => r.id === requestId)
      
      if (!request) {
        alert('❌ Request not found')
        setConfirmingSupplyId(null)
        return
      }
      
      // Delete the request completely
      await axios.delete(`${API}/api/requests/${requestId}`)
      
      alert('✅ Supply received and confirmed! Request removed.')
      loadData()
    } catch (err) {
      console.error('Error confirming supply:', err)
      alert(`❌ Error: ${err.response?.data?.error || err.message}`)
    } finally {
      setConfirmingSupplyId(null)
    }
  }

  // ✅ SAVE BLOOD STOCK
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
      setStockMessage('✅ Stock updated!')
    } catch (err) {
      setStockMessage(`❌ Error: ${err.message}`)
    }
  }

  // ✅ RECORD TRANSFUSION
  const handleRecordTransfusion = async () => {
    if (!transfusionForm.blood_type) {
      setTransfusionMessage('❌ Select blood type')
      return
    }

    setTransfusionMessage('')
    try {
      const res = await axios.post(`${API}/api/hospitals/transfusion/${hospital.id}`, transfusionForm)
      setTransfusionMessage(`✅ Recorded! ${res.data.remaining} units remaining`)
      setTransfusionForm({ blood_type: '', units: 1 })
      loadData()
    } catch (err) {
      setTransfusionMessage(`❌ Error: ${err.response?.data?.message || err.message}`)
    }
  }

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('hospitalToken')
    localStorage.removeItem('hospitalData')
    navigate('/')
  }

  if (!hospital) return null

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const fulfilledCount = requests.filter(r => r.status === 'fulfilled').length
  const awaitingCount = awaitingDonations.length
  const bccComingCount = requests.filter(r => r.status === 'ns').length

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(-45deg,#f8f8f8,#efefef,#f8f8f8)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* HEADER */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,.9)', borderBottom: '2px solid rgba(211,47,47,.2)', backdropFilter: 'blur(40px)' }}
      >
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#dc2626,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 22 }}>
              H
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', margin: 0 }}>{hospital.name}</h1>
              <p style={{ fontSize: 10, color: 'rgba(211,47,47,.5)', margin: '4px 0 0', fontWeight: 700 }}>{hospital.email}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            style={{ background: 'linear-gradient(135deg,#dc2626,#ff6b6b)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 14, fontSize: 13, fontWeight: 900, cursor: 'pointer' }}
          >
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '32px 24px' }}>

        {/* STATS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ staggerChildren: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 44 }}
        >
          <div style={{ background: 'rgba(255,255,255,.7)', borderRadius: 20, padding: 24, border: '2px solid rgba(211,47,47,.2)' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#EA580C', margin: 0 }}>{pendingCount}</p>
            <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.4)', textTransform: 'uppercase', margin: '6px 0 0', lineHeight: 1 }}>Active Requests</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,.7)', borderRadius: 20, padding: 24, border: '2px solid rgba(211,47,47,.2)' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#22C55E', margin: 0 }}>{fulfilledCount}</p>
            <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.4)', textTransform: 'uppercase', margin: '6px 0 0', lineHeight: 1 }}>Fulfilled</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,.7)', borderRadius: 20, padding: 24, border: '2px solid rgba(211,47,47,.2)' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b', margin: 0 }}>{bccComingCount}</p>
            <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.4)', textTransform: 'uppercase', margin: '6px 0 0', lineHeight: 1 }}>BCC Coming</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,.7)', borderRadius: 20, padding: 24, border: '2px solid rgba(211,47,47,.2)' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#DC2626', margin: 0 }}>{awaitingCount}</p>
            <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.4)', textTransform: 'uppercase', margin: '6px 0 0', lineHeight: 1 }}>Emergency Awaiting</p>
          </div>
        </motion.div>

        {/* TABS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}
        >
          {['post', 'emergency', 'stock', 'transfusions'].map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(t)}
              style={{
                padding: '10px 18px',
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 900,
                background: activeTab === t ? 'linear-gradient(135deg,#dc2626,#ff6b6b)' : 'rgba(255,255,255,.7)',
                color: activeTab === t ? '#fff' : '#dc2626',
                border: activeTab === t ? 'none' : '2px solid rgba(211,47,47,.2)',
                cursor: 'pointer'
              }}
            >
              {t === 'post' ? '+ Post Request' : t === 'stock' ? 'Blood Stock' : t === 'transfusions' ? 'Blood Used' : '🩸 Emergency Donations'}
            </motion.button>
          ))}
        </motion.div>

        {/* TAB CONTENT */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ width: 40, height: 40, border: '4px solid rgba(211,47,47,.2)', borderTopColor: '#dc2626', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {!loading && activeTab === 'post' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
          >
            {/* Form Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ background: 'rgba(255,255,255,.7)', borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)' }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 20px 0' }}>Post Blood Request</h2>

              {message && (
                <div style={{
                  background: message.startsWith('✅') ? 'rgba(34,197,94,.15)' : 'rgba(255,235,238,.8)',
                  border: `2px solid ${message.startsWith('✅') ? '#22c55e' : 'rgba(211,47,47,.4)'}`,
                  padding: 14,
                  borderRadius: 14,
                  marginBottom: 20,
                  textAlign: 'center',
                  color: message.startsWith('✅') ? '#22c55e' : '#dc2626',
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8, display: 'block' }}>Blood Type</label>
                  <select
                    value={form.blood_type}
                    onChange={e => setForm({ ...form, blood_type: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(211,47,47,.15)', background: 'rgba(255,255,255,.5)', color: '#dc2626' }}
                    required
                  >
                    <option value="">Select Blood Type</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
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
                    onChange={e => setForm({ ...form, quantity_needed: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(211,47,47,.15)', background: 'rgba(255,255,255,.5)', color: '#dc2626' }}
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
                  style={{
                    background: 'linear-gradient(135deg,#dc2626,#ff6b6b)',
                    color: '#fff',
                    border: 'none',
                    padding: 14,
                    borderRadius: 16,
                    fontSize: 14,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    marginTop: 8,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? '⏳ Posting...' : 'Post Request & Notify Donors'}
                </motion.button>
              </form>
            </motion.div>

            {/* Requests List Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ background: 'rgba(255,255,255,.7)', borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)' }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 20px 0' }}>Your Posted Requests ({requests.length})</h2>

              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(211,47,47,.4)', margin: 0 }}>No requests posted yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {requests.map((r) => {
                    const urg = URGENCY_CONFIG[r.urgency] || URGENCY_CONFIG.urgent
                    
                    // Show different UI based on status
                    if (r.status === 'ok') {
                      return (
                        <div
                          key={r.id}
                          style={{
                            borderRadius: 18,
                            padding: 18,
                            border: '2px solid #22c55e',
                            background: 'rgba(236,253,245,.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                              <span style={{ fontSize: 20, fontWeight: 900, color: '#22c55e' }}>{r.blood_type}</span>
                              <span style={{
                                fontSize: 9,
                                fontWeight: 900,
                                padding: '4px 10px',
                                borderRadius: 8,
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                color: '#fff',
                                textTransform: 'uppercase',
                                letterSpacing: '.1em'
                              }}>
                                ✅ CONFIRMED
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: '#22c55e', margin: '0 0 6px 0', fontWeight: 700 }}>{r.quantity_needed} units needed</p>
                            <p style={{ fontSize: 11, color: 'rgba(34,197,94,.65)', margin: 0, fontWeight: 600 }}>
                              📅 {new Date(r.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                          <div style={{ padding: '12px', background: 'rgba(34,197,94,.1)', borderRadius: 10, textAlign: 'center', fontWeight: 900, color: '#22c55e', fontSize: 13 }}>
                            ✅ Confirmed & Ready
                          </div>
                        </div>
                      )
                    }
                    
                    if (r.status === 'supply_coming') {
                      return (
                        <div
                          key={r.id}
                          style={{
                            borderRadius: 18,
                            padding: 18,
                            border: '2px solid #3b82f6',
                            background: 'rgba(219,234,254,.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                              <span style={{ fontSize: 20, fontWeight: 900, color: '#3b82f6' }}>{r.blood_type}</span>
                              <span style={{
                                fontSize: 9,
                                fontWeight: 900,
                                padding: '4px 10px',
                                borderRadius: 8,
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                color: '#fff',
                                textTransform: 'uppercase',
                                letterSpacing: '.1em'
                              }}>
                                ✈️ COMING
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: '#3b82f6', margin: '0 0 6px 0', fontWeight: 700 }}>{r.quantity_needed} units needed</p>
                            <p style={{ fontSize: 11, color: 'rgba(59,130,246,.65)', margin: 0, fontWeight: 600 }}>
                              📅 {new Date(r.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                          <div style={{ padding: '12px', background: 'rgba(59,130,246,.1)', borderRadius: 10, textAlign: 'center', fontWeight: 900, color: '#3b82f6', fontSize: 13 }}>
                            ✈️ Coming for Supply from BCC Hamra
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleConfirmSupplyReceived(r.id)}
                            disabled={confirmingSupplyId === r.id}
                            style={{
                              marginTop: 8,
                              padding: '10px 14px',
                              background: confirmingSupplyId === r.id ? '#ccc' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 900,
                              cursor: confirmingSupplyId === r.id ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {confirmingSupplyId === r.id ? '⏳ Confirming...' : '✅ Supply Confirmed'}
                          </motion.button>
                        </div>
                      )
                    }
                    
                    // ✅ NEW: Status 'ns' - Didn't Show Up (stays visible with orange color)
                    if (r.status === 'ns') {
                      return (
                        <div
                          key={r.id}
                          style={{
                            borderRadius: 18,
                            padding: 18,
                            border: '2px solid #f59e0b',
                            background: 'rgba(245,158,11,.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                              <span style={{ fontSize: 20, fontWeight: 900, color: '#f59e0b' }}>{r.blood_type}</span>
                              <span style={{
                                fontSize: 9,
                                fontWeight: 900,
                                padding: '4px 10px',
                                borderRadius: 8,
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                color: '#fff',
                                textTransform: 'uppercase',
                                letterSpacing: '.1em'
                              }}>
                                🏥 BCC COMING
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: '#f59e0b', margin: '0 0 6px 0', fontWeight: 700 }}>{r.quantity_needed} units needed</p>
                            <p style={{ fontSize: 11, color: 'rgba(245,158,11,.65)', margin: 0, fontWeight: 600 }}>
                              📅 {new Date(r.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                          <div style={{ padding: '12px', background: 'rgba(245,158,11,.1)', borderRadius: 10, textAlign: 'center', fontWeight: 900, color: '#f59e0b', fontSize: 13 }}>
                            🏥 BCC Hamra is coming for supply
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDeleteRequest(r.id)}
                            disabled={confirmingId === r.id}
                            style={{
                              marginTop: 8,
                              padding: '10px 14px',
                              background: confirmingId === r.id ? '#ccc' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 900,
                              cursor: confirmingId === r.id ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {confirmingId === r.id ? '⏳ Confirming...' : '✅ Received & Confirmed'}
                          </motion.button>
                        </div>
                      )
                    }
                    
                    // Default pending state
                    return (
                      <div
                        key={r.id}
                        style={{
                          borderRadius: 18,
                          padding: 18,
                          border: `2px solid ${urg.color}40`,
                          background: urg.light,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <span style={{ fontSize: 20, fontWeight: 900, color: urg.color }}>{r.blood_type}</span>
                            <span style={{
                              fontSize: 9,
                              fontWeight: 900,
                              padding: '4px 10px',
                              borderRadius: 8,
                              background: `linear-gradient(135deg, ${urg.color}, ${urg.color}80)`,
                              color: '#fff',
                              textTransform: 'uppercase',
                              letterSpacing: '.1em'
                            }}>
                              {URGENCY_CONFIG[r.urgency]?.label}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: '#333', margin: '0 0 6px 0', fontWeight: 700 }}>{r.quantity_needed} units needed</p>
                          <p style={{ fontSize: 11, color: 'rgba(211,47,47,.65)', margin: 0, fontWeight: 600 }}>
                            📅 {new Date(r.created_at).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleConfirmReceived(r.id)}
                            style={{
                              flex: 1,
                              fontSize: 11,
                              fontWeight: 900,
                              color: '#fff',
                              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                              padding: '8px 12px',
                              borderRadius: 10,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            ✅ Confirmed
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDidntShowUp(r.id)}
                            style={{
                              flex: 1,
                              fontSize: 11,
                              fontWeight: 900,
                              color: '#dc2626',
                              background: 'rgba(255,235,238,.7)',
                              padding: '8px 12px',
                              borderRadius: 10,
                              border: '2px solid rgba(211,47,47,.2)',
                              cursor: 'pointer'
                            }}
                          >
                            ❌ Didn't Show Up
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
                              background: '#ef4444',
                              padding: '8px 12px',
                              borderRadius: 10,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️ Delete
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
            style={{ background: 'linear-gradient(135deg, rgba(220,38,38,.08), rgba(255,107,107,.04))', borderRadius: 28, padding: 32, border: '2px solid #dc2626' }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 20px 0' }}>🩸 Emergency Donations From Donors</h2>
            
            {emergencyDonations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(211,47,47,.4)', margin: 0 }}>No emergency donations yet.</p>
              </div>
            ) : (
              <div>
                {awaitingDonations.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#dc2626', margin: '0 0 16px 0' }}>⏳ Awaiting Confirmation ({awaitingDonations.length})</h3>
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
                              {donation.blood_type} • {donation.donor_name || 'Anonymous Donor'}
                            </p>
                            <p style={{ fontSize: 11, color: 'rgba(211,47,47,.65)', margin: '0', fontWeight: 700 }}>
                              ⏳ Awaiting confirmation • {new Date(donation.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleConfirmDonation(donation.id)}
                            disabled={confirmingId === donation.id}
                            style={{
                              background: confirmingId === donation.id ? '#ccc' : 'linear-gradient(135deg, #22c55e, #16a34a)',
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
                            {confirmingId === donation.id ? '⏳ Confirming...' : '✅ Confirm'}
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {okDonations.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#22c55e', margin: '0 0 16px 0' }}>✅ Confirmed ({okDonations.length})</h3>
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
                              {donation.blood_type} • {donation.donor_name || 'Anonymous Donor'}
                            </p>
                            <p style={{ fontSize: 11, color: 'rgba(34,197,94,.65)', margin: '0', fontWeight: 700 }}>
                              ✅ Confirmed • {new Date(donation.created_at).toLocaleDateString('en-GB')}
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
            style={{ background: 'rgba(255,255,255,.7)', borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)' }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 8px 0' }}>Current Blood Stock</h2>

            {stockMessage && (
              <div style={{
                marginBottom: 20,
                padding: 14,
                borderRadius: 14,
                background: stockMessage.startsWith('✅') ? 'rgba(34,197,94,.15)' : 'rgba(255,235,238,.8)',
                border: `2px solid ${stockMessage.startsWith('✅') ? '#22c55e' : 'rgba(211,47,47,.4)'}`,
                color: stockMessage.startsWith('✅') ? '#22c55e' : '#dc2626',
                fontWeight: 700,
                fontSize: 13,
                textAlign: 'center'
              }}>
                {stockMessage}
              </div>
            )}

            <motion.div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt, idx) => {
                const units = bloodStock[bt] ?? 0
                const dotColor = units === 0 ? '#DC2626' : units <= 5 ? '#EA580C' : '#22C55E'
                const bgColor = units === 0 ? 'rgba(220,38,38,.15)' : units <= 5 ? 'rgba(234,88,12,.15)' : 'rgba(34,197,94,.15)'
                
                return (
                  <div
                    key={`blood-stock-${bt}-${idx}`}
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
                      style={{
                        padding: '8px 10px',
                        fontSize: 13,
                        borderRadius: 10,
                        textAlign: 'center',
                        fontWeight: 900,
                        border: '2px solid rgba(211,47,47,.15)',
                        background: 'rgba(255,255,255,.5)',
                        color: '#dc2626'
                      }}
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
              style={{
                width: '100%',
                background: 'linear-gradient(135deg,#dc2626,#ff6b6b)',
                color: '#fff',
                border: 'none',
                padding: 14,
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              Save Blood Stock
            </motion.button>
          </motion.div>
        )}

        {!loading && activeTab === 'transfusions' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: 'rgba(255,255,255,.7)', borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)' }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 8px 0' }}>Record Blood Usage</h2>

            {transfusionMessage && (
              <div style={{
                marginBottom: 20,
                padding: 14,
                borderRadius: 14,
                background: transfusionMessage.startsWith('✅') ? 'rgba(34,197,94,.15)' : 'rgba(255,235,238,.8)',
                border: `2px solid ${transfusionMessage.startsWith('✅') ? '#22c55e' : 'rgba(211,47,47,.4)'}`,
                color: transfusionMessage.startsWith('✅') ? '#22c55e' : '#dc2626',
                fontWeight: 700,
                fontSize: 13,
                textAlign: 'center'
              }}>
                {transfusionMessage}
              </div>
            )}

            <div style={{ background: 'rgba(255,235,238,.4)', border: '2px solid rgba(211,47,47,.15)', borderRadius: 18, padding: 18, marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 900, color: '#dc2626', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '.1em' }}>Record New Transfusion</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8, display: 'block' }}>Blood Type Used</label>
                  <select
                    value={transfusionForm.blood_type}
                    onChange={e => setTransfusionForm({ ...transfusionForm, blood_type: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(211,47,47,.15)', background: 'rgba(255,255,255,.5)', color: '#dc2626' }}
                  >
                    <option value="">Select blood type</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
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
                    onChange={e => setTransfusionForm({ ...transfusionForm, units: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(211,47,47,.15)', background: 'rgba(255,255,255,.5)', color: '#dc2626' }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRecordTransfusion}
                  disabled={!transfusionForm.blood_type}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    fontSize: 13,
                    fontWeight: 900,
                    background: transfusionForm.blood_type ? 'linear-gradient(135deg,#dc2626,#ff6b6b)' : '#ccc',
                    color: '#fff',
                    border: 'none',
                    cursor: transfusionForm.blood_type ? 'pointer' : 'not-allowed'
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
      `}</style>
    </div>
  )
}

export default HospitalDashboard