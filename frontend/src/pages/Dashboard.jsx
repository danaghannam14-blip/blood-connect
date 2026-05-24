import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

// ✅ WORKS ON BOTH LOCALHOST AND PRODUCTION
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://blood-bank-eqyr.onrender.com'

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
    
    // ✅ Load emergency donations (hospital requests) - these are the pending donations
    axios.get(`${API}/api/blood-requests/donor/${donorData.id}`)
      .then(res => {
        console.log('[DonorDashboard] Emergency notifications:', res.data)
        const allEmergencies = res.data || []
        // Filter to only pending status for "Hospitals Requesting" section
        const pendingEmergencies = allEmergencies.filter(d => d.status === 'pending')
        setInventory(pendingEmergencies)
        // Keep all for emergency notifications section
        setEmergencyNotifications(allEmergencies)
      })
      .catch(err => {
        console.error('[DonorDashboard] Error fetching emergency notifications:', err)
        setInventory([])
        setEmergencyNotifications([])
      })
      .finally(() => setLoadingEmergency(false))
    
    // Load old regular requests (for history)
    axios.get(`${API}/api/donors/notifications/${donorData.id}`).then(res => setNotifications(res.data)).catch(console.log)
    
    // Load hospitals
    axios.get(`${API}/api/hospitals/all`).then(res => setHospitals(res.data || [])).catch(console.log)
    
    setTimeout(() => setVisible(true), 60)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('donorToken')
    localStorage.removeItem('donorData')
    navigate('/')
  }

  // ✅ Handle donor confirming donation at center
  const handleDonateAtCenter = async (notificationId) => {
    setConfirmingId(notificationId)
    try {
      await axios.post(`${API}/api/blood-requests/donor-confirm-donation`, {
        notification_id: notificationId,
        donation_location: 'center'
      })
      alert('✅ Center donation confirmed!')
      // Refresh
      const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
      setEmergencyNotifications(res.data || [])
      setInventory(res.data?.filter(d => d.status === 'pending') || [])
      setExpandedNotif(null)
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setConfirmingId(null)
    }
  }

  // ✅ Handle donor confirming donation at hospital
  const handleDonateAtHospital = async (notificationId, hospitalId) => {
    setConfirmingId(notificationId)
    try {
      await axios.post(`${API}/api/blood-requests/donor-confirm-donation`, {
        notification_id: notificationId,
        donation_location: 'hospital',
        hospital_id: hospitalId
      })
      alert('✅ Hospital donation confirmed!')
      // Refresh
      const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
      setEmergencyNotifications(res.data || [])
      setInventory(res.data?.filter(d => d.status === 'pending') || [])
      setShowHospitalSelect(null)
      setExpandedNotif(null)
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setConfirmingId(null)
    }
  }

  // ✅ Handle donor declining donation (mark as didn't show up)
  const handleDidntShowUp = async (notificationId) => {
    if (!window.confirm('Are you sure you want to decline this donation request?')) return
    setConfirmingId(notificationId)
    try {
      // Update the blood request status to didnt_show_up
      await axios.put(`${API}/api/blood-requests/${notificationId}`, { status: 'didnt_show_up' })
      alert('❌ Request marked as declined. Hospital blood bank will be notified.')
      // Refresh
      const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
      setEmergencyNotifications(res.data || [])
      setInventory(res.data?.filter(d => d.status === 'pending') || [])
      setExpandedNotif(null)
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setConfirmingId(null)
    }
  }

  // ✅ Handle donor deleting donation request
  const handleDeleteRequest = async (notificationId) => {
    if (!window.confirm('Delete this donation request?')) return
    setConfirmingId(notificationId)
    try {
      // Use blood-requests API to delete
      await axios.delete(`${API}/api/blood-requests/${notificationId}`)
      alert('✅ Request deleted!')
      // Refresh
      const res = await axios.get(`${API}/api/blood-requests/donor/${donor.id}`)
      setEmergencyNotifications(res.data || [])
      setInventory(res.data?.filter(d => d.status === 'pending') || [])
      setExpandedNotif(null)
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setConfirmingId(null)
    }
  }

  if (!donor) return null

  const totalDonations = notifications.filter(n => n.donated).length

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto', background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: '#dc2626' }}>Welcome, {donor.full_name}! 👋</h1>
            <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>Blood Type: <strong>{donor.blood_type}</strong> • Governorate: <strong>{donor.governorate}</strong></p>
          </div>
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Emergency Requests */}
      {!loadingEmergency && emergencyNotifications.length > 0 && (
        <div style={{ maxWidth: 1200, margin: '0 auto 20px', background: '#fee2e2', padding: '20px', borderRadius: '12px', border: '2px solid #dc2626' }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 16px 0' }}>🩸 Emergency Blood Requests ({emergencyNotifications.length})</h2>
          {emergencyNotifications.map((notif) => (
            <div key={notif.id} style={{ background: '#fff', padding: '16px', marginBottom: '12px', borderRadius: '8px', border: '2px solid #fca5a5', cursor: notif.status === 'pending' ? 'pointer' : 'default' }} onClick={() => notif.status === 'pending' && setExpandedNotif(expandedNotif === notif.id ? null : notif.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>{notif.blood_type} Blood Needed</p>
                  <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>📍 {notif.governorate}</p>
                  {notif.status === 'pending' && <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0' }}>Click to confirm →</p>}
                </div>
                <span style={{ background: notif.status === 'pending' ? '#FFA500' : notif.status === 'awaiting_confirmation' ? '#9CA3AF' : notif.status === 'confirmed' ? '#22c55e' : '#ef4444', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                  {notif.status === 'pending' && '⏳ Pending'}
                  {notif.status === 'awaiting_confirmation' && '⏸️ Confirming'}
                  {notif.status === 'confirmed' && '✅ Confirmed'}
                  {notif.status === 'didnt_show_up' && '❌ Declined'}
                </span>
              </div>

              {/* Expanded Options */}
              {expandedNotif === notif.id && notif.status === 'pending' && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                  {donor?.governorate === 'Beirut' && (
                    <button
                      onClick={() => handleDonateAtCenter(notif.id)}
                      disabled={confirmingId === notif.id}
                      style={{
                        width: '100%', padding: '12px', background: confirmingId === notif.id ? '#ccc' : '#dc2626', color: '#fff',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: confirmingId === notif.id ? 'not-allowed' : 'pointer', marginBottom: '8px'
                      }}
                    >
                      {confirmingId === notif.id ? '⏳ Confirming...' : '👑 Donate at BCC Hamra Center'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowHospitalSelect(showHospitalSelect === notif.id ? null : notif.id)}
                    disabled={confirmingId === notif.id}
                    style={{
                      width: '100%', padding: '12px', background: confirmingId === notif.id ? '#ccc' : '#3b82f6', color: '#fff',
                      border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: confirmingId === notif.id ? 'not-allowed' : 'pointer', marginBottom: '8px'
                    }}
                  >
                    🏥 Donate at a Hospital
                  </button>

      

                  {showHospitalSelect === notif.id && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {hospitals.filter(h => h.governorate === donor?.governorate).map(h => (
                        <button
                          key={h.id}
                          onClick={() => handleDonateAtHospital(notif.id, h.id)}
                          disabled={confirmingId === notif.id}
                          style={{
                            padding: '10px', background: '#fff', border: '2px solid #3b82f6', color: '#3b82f6',
                            borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: confirmingId === notif.id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {h.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hospital Requests - IMPROVED GRID LAYOUT */}
      <div style={{ maxWidth: 1200, margin: '0 auto 20px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
        <h2 style={{ color: '#dc2626', margin: '0 0 16px 0' }}>🏥 Hospitals Requesting Your Blood ({inventory.length})</h2>
        {inventory.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>No urgent requests for your blood type right now. 💤</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {inventory.map((item) => (
              <div key={item.id} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', border: '2px solid #fca5a5', transition: 'all 0.3s ease', cursor: 'pointer', hover: { boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)' } }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#dc2626', margin: 0, wordBreak: 'break-word', lineHeight: '1.3' }}>
                        🏥 {item.hospital_name || 'Hospital Request'}
                      </p>
                    </div>
                    <span style={{ background: '#dc2626', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {item.blood_type}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                    <div>
                      <p style={{ color: '#999', margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</p>
                      <p style={{ color: '#333', margin: '4px 0 0', fontWeight: '500' }}>📍 {item.governorate}</p>
                    </div>
                    <div>
                      <p style={{ color: '#999', margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Units Needed</p>
                      <p style={{ color: '#333', margin: '4px 0 0', fontWeight: '500' }}>📦 {item.quantity_needed || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 1200, margin: '0 auto', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
        <h2 style={{ color: '#dc2626', margin: '0 0 16px 0' }}>Your Donation Stats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>{totalDonations}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: '6px 0 0', textTransform: 'uppercase' }}>Total Donations</p>
          </div>
          <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e', margin: 0 }}>{totalDonations * 3}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: '6px 0 0', textTransform: 'uppercase' }}>Lives Saved</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard