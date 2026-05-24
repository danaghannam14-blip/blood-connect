import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://blood-bank-eqyr.onrender.com'

function Admin() {
  const navigate = useNavigate()
  
  // ✅ STATE
  const [admin, setAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('donations')
  const [loading, setLoading] = useState(true)
  
  // Donors
  const [donors, setDonors] = useState([])
  
  // Admins
  const [admins, setAdmins] = useState([])
  const [newAdminForm, setNewAdminForm] = useState({ email: '', password: '' })
  const [adminMessage, setAdminMessage] = useState('')
  
  // Donations
  const [bccDonations, setBccDonations] = useState([])
  const [noShowDonations, setNoShowDonations] = useState([])
  const [confirmingId, setConfirmingId] = useState(null)
  
  // Password change
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [passwordMessage, setPasswordMessage] = useState('')

  // ✅ INIT
  useEffect(() => {
    const data = localStorage.getItem('adminData')
    
    if (!data) {
      navigate('/admin/login')
      return
    }
    
    setAdmin(JSON.parse(data))
    loadData()
  }, [navigate])

  // ✅ LOAD ALL DATA
  const loadData = async () => {
    setLoading(true)
    try {
      // Load donors (registered donors only)
      const donorsRes = await axios.get(`${API}/api/admin/donors`)
      setDonors(donorsRes.data || [])
      
      // Load admins
      const adminsRes = await axios.get(`${API}/api/admin/admins`)
      setAdmins(adminsRes.data || [])
      
      // Load BCC Hamra donations (awaiting_confirmation or confirmed)
      const bccRes = await axios.get(`${API}/api/blood-requests/center-donations`)
      const bccData = bccRes.data || []
      setBccDonations(bccData.filter(d => d.status === 'awaiting_confirmation'))
      
      // Load no-show donations (from blood_requests where status = 'ns')
      const noShowRes = await axios.get(`${API}/api/admin/requests`)
      setNoShowDonations(noShowRes.data.filter(r => r.status === 'ns') || [])
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ DELETE DONOR
  const handleDeleteDonor = async (donorId) => {
    if (!window.confirm('Delete this donor? This action cannot be undone.')) return
    try {
      await axios.delete(`${API}/api/admin/donors/${donorId}`)
      setDonors(donors.filter(d => d.id !== donorId))
      alert('✅ Donor deleted successfully!')
    } catch (err) {
      console.error('Delete error:', err)
      alert(`❌ Error: ${err.response?.data?.error || err.message}`)
    }
  }

  // ✅ ADD NEW ADMIN
  const handleAddAdmin = async () => {
    setAdminMessage('')
    
    if (!newAdminForm.email || !newAdminForm.password) {
      setAdminMessage('❌ Email and password required')
      return
    }
    
    // Validate email ends with @bloodconnect.com
    if (!newAdminForm.email.endsWith('@bloodconnect.com')) {
      setAdminMessage('❌ Email must end with @bloodconnect.com')
      return
    }
    
    if (newAdminForm.password.length < 6) {
      setAdminMessage('❌ Password must be at least 6 characters')
      return
    }
    
    try {
      const res = await axios.post(`${API}/api/admin/add-admin`, {
        email: newAdminForm.email,
        password: newAdminForm.password
      })
      setAdminMessage('✅ Admin created successfully!')
      setNewAdminForm({ email: '', password: '' })
      loadData()
    } catch (err) {
      setAdminMessage(`❌ Error: ${err.response?.data?.error || err.message}`)
    }
  }

  // ✅ CHANGE PASSWORD
  const handleChangePassword = async () => {
    setPasswordMessage('')
    
    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setPasswordMessage('❌ All fields required')
      return
    }
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage('❌ Passwords do not match')
      return
    }
    
    try {
      await axios.put(`${API}/api/admin/change-password`, {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      })
      setPasswordMessage('✅ Password changed!')
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPasswordMessage(`❌ Error: ${err.response?.data?.error || err.message}`)
    }
  }

  // ✅ CONFIRM BCC HAMRA DONATION
  const handleConfirmBccDonation = async (donationId) => {
    setConfirmingId(donationId)
    try {
      const donation = bccDonations.find(d => d.id === donationId)
      
      if (!donation || !donation.patient_email) {
        alert('❌ Donation or patient email missing')
        setConfirmingId(null)
        return
      }
      
      // Call admin-confirm endpoint
      const res = await axios.post(`${API}/api/blood-requests/admin-confirm`, {
        donationId: donationId,
        bloodType: donation.blood_type,
        patientEmail: donation.patient_email
      })
      
      alert('✅ Donation confirmed! Patient and donor notified.')
      loadData()
    } catch (err) {
      console.error('Confirm error:', err)
      alert(`❌ Error: ${err.response?.data?.error || err.message}`)
    } finally {
      setConfirmingId(null)
    }
  }

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('adminData')
    navigate('/')
  }

  if (!admin) return null

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
              A
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', margin: 0 }}>BloodConnect Admin</h1>
              <p style={{ fontSize: 10, color: 'rgba(211,47,47,.5)', margin: '4px 0 0', fontWeight: 700 }}>{admin.email}</p>
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

      {/* MAIN */}
      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* TABS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}
        >
          {[
            { id: 'hospitals', label: '🏥 Hospitals Need Supply' },
            { id: 'bcc-hamra', label: '🩸 BCC Hamra Donors' },
            { id: 'donors', label: '👥 Registered Donors' },
            { id: 'admins', label: '🔑 Admins' },
            { id: 'settings', label: '⚙️ Settings' }
          ].map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '10px 18px',
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 900,
                background: activeTab === t.id ? 'linear-gradient(135deg,#dc2626,#ff6b6b)' : 'rgba(255,255,255,.7)',
                color: activeTab === t.id ? '#fff' : '#dc2626',
                border: activeTab === t.id ? 'none' : '2px solid rgba(211,47,47,.2)',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </motion.button>
          ))}
        </motion.div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ width: 40, height: 40, border: '4px solid rgba(211,47,47,.2)', borderTopColor: '#dc2626', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {!loading && activeTab === 'hospitals' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: 'rgba(255,235,238,.5)', borderRadius: 28, padding: 32, border: '2px solid #ef4444' }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#ef4444', margin: '0 0 20px 0' }}>🏥 Hospitals Needing Blood Supply</h2>
            <p style={{ fontSize: 13, color: 'rgba(211,47,47,.65)', margin: '0 0 20px 0', fontWeight: 600 }}>Hospitals where donors didn't show up - supply blood from BCC Hamra bank</p>
            
            {noShowDonations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(211,47,47,.4)', margin: 0 }}>No hospitals needing supply.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {noShowDonations.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      background: 'rgba(254,226,226,.5)',
                      borderRadius: 18,
                      padding: 18,
                      border: '2px solid rgba(220,38,38,.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 900, color: '#dc2626', margin: 0 }}>🩸 {request.blood_type}</p>
                    <p style={{ fontSize: 11, color: 'rgba(211,47,47,.65)', margin: 0, fontWeight: 700 }}>
                      📋 {request.quantity_needed} units needed
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(211,47,47,.65)', margin: 0, fontWeight: 700 }}>
                      🏥 Hospital ID: {request.hospital_id}
                    </p>
                    <p style={{ fontSize: 10, color: 'rgba(211,47,47,.5)', margin: 0, fontWeight: 600 }}>
                      📅 {new Date(request.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!loading && activeTab === 'bcc-hamra' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: 'linear-gradient(135deg, rgba(220,38,38,.08), rgba(255,107,107,.04))', borderRadius: 28, padding: 32, border: '2px solid #dc2626' }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 20px 0' }}>🩸 BCC Hamra Center - Donors Awaiting Confirmation</h2>
            <p style={{ fontSize: 13, color: 'rgba(211,47,47,.65)', margin: '0 0 20px 0', fontWeight: 600 }}>Donors who chose to donate at BCC Hamra center</p>
            
            {bccDonations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(211,47,47,.4)', margin: 0 }}>No donors awaiting confirmation.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bccDonations.map((donation) => (
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
                        {donation.blood_type} • {donation.donor_name || 'Anonymous'}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(211,47,47,.65)', margin: '0 0 4px 0', fontWeight: 700 }}>
                        🏥 {donation.hospital_name || 'BCC Hamra Center'}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(211,47,47,.65)', margin: 0, fontWeight: 700 }}>
                        📅 {new Date(donation.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleConfirmBccDonation(donation.id)}
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
            )}
          </motion.div>
        )}

        {!loading && activeTab === 'donors' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: 'rgba(255,255,255,.7)', borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)' }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', margin: '0 0 20px 0' }}>👥 Registered Donors ({donors.length})</h2>
            
            {donors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(211,47,47,.4)', margin: 0 }}>No donors registered yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {donors.map((donor) => (
                  <div
                    key={donor.id}
                    style={{
                      background: 'rgba(255,255,255,.5)',
                      borderRadius: 18,
                      padding: 20,
                      border: '2px solid rgba(211,47,47,.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>
                        {donor.first_name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 900, color: '#dc2626', margin: 0 }}>
                          {donor.first_name} {donor.last_name}
                        </p>
                        <p style={{ fontSize: 10, color: 'rgba(211,47,47,.5)', margin: '2px 0 0', fontWeight: 700 }}>
                          {donor.email}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px solid rgba(211,47,47,.1)', paddingTop: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(211,47,47,.65)', margin: '0 0 6px 0' }}>
                        🩸 Blood Type: <span style={{ color: '#dc2626', fontWeight: 900 }}>{donor.blood_type}</span>
                      </p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(211,47,47,.65)', margin: '0 0 6px 0' }}>
                        📍 Governorate: {donor.governorate}
                      </p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(211,47,47,.65)', margin: '0 0 12px 0' }}>
                        📞 {donor.phone}
                      </p>
                    </div>


                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!loading && activeTab === 'admins' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
          >
            {/* Add Admin Form */}
            <div style={{ background: 'rgba(255,255,255,.7)', borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', margin: '0 0 20px 0' }}>➕ Add New Admin</h3>
              
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
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8, display: 'block' }}>Email</label>
                  <input
                    type="email"
                    placeholder="admin@bloodconnect.com"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(211,47,47,.15)', background: 'rgba(255,255,255,.5)', color: '#dc2626' }}
                  />
                  <p style={{ fontSize: 10, color: 'rgba(211,47,47,.5)', margin: '6px 0 0', fontWeight: 600 }}>Must end with @bloodconnect.com</p>
                </div>
                
                <div>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8, display: 'block' }}>Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(211,47,47,.15)', background: 'rgba(255,255,255,.5)', color: '#dc2626' }}
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddAdmin}
                  style={{
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
                  Create Admin
                </motion.button>
              </div>
            </div>
            
            {/* Admins List */}
            <div style={{ background: 'rgba(255,255,255,.7)', borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', margin: '0 0 20px 0' }}>🔑 Current Admins ({admins.length})</h3>
              
              {admins.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'rgba(211,47,47,.4)', fontSize: 13 }}>No admins yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {admins.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        borderRadius: 14,
                        padding: 14,
                        background: 'rgba(255,235,238,.4)',
                        border: '2px solid rgba(211,47,47,.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                      }}
                    >
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626' }} />
                      <span style={{ fontSize: 12, fontWeight: 900, color: '#dc2626', flex: 1 }}>{a.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {!loading && activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: 'rgba(255,255,255,.7)', borderRadius: 28, padding: 32, border: '2px solid rgba(211,47,47,.2)', maxWidth: 500 }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', margin: '0 0 20px 0' }}>🔐 Change Password</h3>
            
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8, display: 'block' }}>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(211,47,47,.15)', background: 'rgba(255,255,255,.5)', color: '#dc2626' }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8, display: 'block' }}>New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(211,47,47,.15)', background: 'rgba(255,255,255,.5)', color: '#dc2626' }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: 10, fontWeight: 900, color: 'rgba(211,47,47,.5)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8, display: 'block' }}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, border: '2px solid rgba(211,47,47,.15)', background: 'rgba(255,255,255,.5)', color: '#dc2626' }}
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleChangePassword}
                style={{
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
                Update Password
              </motion.button>
            </div>
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

export default Admin