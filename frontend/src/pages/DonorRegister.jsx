import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const API = 'https://blood-bank-eqyr.onrender.com'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes pulse-ring { 0% { transform:scale(.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }
  @keyframes shimmer { 0%,100% { opacity:.5; } 50% { opacity:1; } }

  .dr-root {
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

  .dr-glass {
    background:rgba(255,255,255,.6);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(180,180,180,.2);
    box-shadow:0 8px 32px rgba(0,0,0,.08);
  }

  .dr-glass-deep {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(180,180,180,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.1),inset 0 1px 1px rgba(255,255,255,.3);
  }

  .dr-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .dr-input {
    width:100%;
    padding:clamp(13px,1.5vw,16px) clamp(16px,2vw,20px);
    border-radius:clamp(12px,1.5vw,16px);
    border:1.5px solid rgba(180,180,180,.2);
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:600;
    font-size:clamp(12px,1.1vw,14px);
    color:#380101;
    outline:none;
    transition:all .28s cubic-bezier(.22,1,.36,1);
    box-shadow:inset 0 1px 1px rgba(255,255,255,.3);
  }

  .dr-input::placeholder { color:rgba(56,1,1,.4); }

  .dr-input:focus {
    border-color:rgba(220,38,38,.4);
    background:rgba(255,255,255,.7);
    box-shadow:0 8px 24px rgba(220,38,38,.15),inset 0 1px 1px rgba(255,255,255,.3);
    transform:translateY(-2px);
  }

  .dr-select {
    width:100%;
    padding:clamp(13px,1.5vw,16px) clamp(16px,2vw,20px);
    border-radius:clamp(12px,1.5vw,16px);
    border:1.5px solid rgba(180,180,180,.2);
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:600;
    font-size:clamp(12px,1.1vw,14px);
    color:#380101;
    outline:none;
    transition:all .28s cubic-bezier(.22,1,.36,1);
    box-shadow:inset 0 1px 1px rgba(255,255,255,.3);
    cursor:pointer;
  }

  .dr-select:focus {
    border-color:rgba(220,38,38,.4);
    background:rgba(255,255,255,.7);
    box-shadow:0 8px 24px rgba(220,38,38,.15),inset 0 1px 1px rgba(255,255,255,.3);
    transform:translateY(-2px);
  }

  .dr-btn {
    position:relative;
    overflow:hidden;
    cursor:pointer;
    border:none;
    outline:none;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
    border-radius:clamp(12px,1.5vw,16px);
  }

  .dr-btn::before {
    content:'';
    position:absolute;
    top:0;
    left:-100%;
    width:100%;
    height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
    transition:left .5s;
  }

  .dr-btn:hover::before { left:100%; }

  .dr-btn-primary {
    background:linear-gradient(135deg,#dc2626 0%,#991b1b 50%,#7f1d1d 100%);
    color:#faf7f7;
    box-shadow:0 10px 30px rgba(220,38,38,.35);
    border:1px solid rgba(255,255,255,.15);
  }

  .dr-btn-primary:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 20px 60px rgba(220,38,38,.5);
  }

  .dr-btn-secondary {
    background:rgba(255,255,255,.7);
    backdrop-filter:blur(10px);
    border:1.5px solid rgba(180,180,180,.3);
    color:#380101;
  }

  .dr-btn-secondary:hover {
    background:rgba(255,255,255,.85);
    border-color:rgba(180,180,180,.5);
    transform:translateY(-2px);
  }

  .dr-step-indicator {
    width:clamp(36px,4vw,44px);
    height:clamp(36px,4vw,44px);
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:900;
    font-size:clamp(12px,1.2vw,14px);
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
  }

  .dr-step-indicator.active {
    background:linear-gradient(135deg,#dc2626,#ff6b6b);
    color:#faf7f7;
    box-shadow:0 8px 24px rgba(220,38,38,.4);
    transform:scale(1.15);
  }

  .dr-step-indicator.completed {
    background:rgba(34,197,94,.15);
    color:#22c55e;
    border:2px solid #22c55e;
  }

  .dr-step-indicator.inactive {
    background:rgba(220,38,38,.08);
    color:rgba(220,38,38,.4);
    border:2px solid rgba(220,38,38,.15);
  }

  .dr-upload-zone {
    border:2px dashed rgba(220,38,38,.3);
    border-radius:clamp(16px,2vw,22px);
    background:rgba(255,235,238,.3);
    transition:all .3s;
    cursor:pointer;
  }

  .dr-upload-zone:hover {
    border-color:#dc2626;
    background:rgba(255,235,238,.5);
    transform:translateY(-2px);
  }

  .dr-progress-bar {
    height:5px;
    background:rgba(220,38,38,.1);
    border-radius:9999px;
    overflow:hidden;
    position:relative;
  }

  .dr-progress-fill {
    height:100%;
    background:linear-gradient(90deg,#dc2626,#991b1b);
    border-radius:9999px;
    box-shadow:0 0 16px rgba(220,38,38,.5);
    transition:width .5s cubic-bezier(.34,1.56,.64,1);
  }

  @media (max-width:1200px) {
    .dr-root { zoom: 0.88; }
  }

  @media (max-width:1024px) {
    .dr-root { zoom: 0.85; }
  }

  @media (max-width:768px) {
    .dr-root { zoom: 0.75; }
  }

  @media (max-width:480px) {
    .dr-root { zoom: 0.65; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('dr-styles-unified')) {
  const s = document.createElement('style')
  s.id = 'dr-styles-unified'
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
          className="dr-float-orb"
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

function DonorRegister() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    blood_type: '', date_of_birth: '', gender: 'Male', governorate: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [frontFile, setFrontFile] = useState(null)
  const [backFile, setBackFile] = useState(null)
  const [frontStatus, setFrontStatus] = useState(null)
  const [backStatus, setBackStatus] = useState(null)
  const [ageData, setAgeData] = useState({ age: null, dob: null })
  const [bloodData, setBloodData] = useState({ type: null })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [visible, setVisible] = useState(false)

  const GOVERNORATES = [
    'Beirut',
    'Mount Lebanon',
    'North Lebanon',
    'Keserwan-Jbeil',
    'South Lebanon',
    'Nabatiyeh',
    'Beqaa',
    'Baalbek-Hermel',
    'Akkar'
  ]

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }


  const scanIdFront = async () => {
    if (!frontFile) { 
      setError('Please select ID front photo') 
      return 
    }
    setFrontStatus('scanning')
    setError('')
    try {
      const formData = new FormData()
      formData.append('id_photo', frontFile)
      formData.append('side', 'front')
      
      const res = await axios.post(`${API}/api/idcheck/scan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })
      
      if (res.data.eligible) {
        setFrontStatus('verified')
        setForm(prev => ({ ...prev, date_of_birth: res.data.date_of_birth }))
        setAgeData({ age: res.data.age, dob: res.data.date_of_birth })
      } else {
        setFrontStatus('failed')
        setError(res.data.message || 'Age verification failed')
      }
    } catch (err) {
      setFrontStatus('failed')
      setError(err.response?.data?.message || 'Could not scan ID front')
      console.error('Front scan error:', err)
    }
  }

  const scanIdBack = async () => {
    if (!backFile) { 
      setError('Please select ID back photo') 
      return 
    }
    setBackStatus('scanning')
    setError('')
    try {
      const formData = new FormData()
      formData.append('id_photo', backFile)
      formData.append('side', 'back')
      
      const res = await axios.post(`${API}/api/idcheck/scan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })
      
      if (res.data.blood_type) {
        setBackStatus('verified')
        setForm(prev => ({ ...prev, blood_type: res.data.blood_type }))
        setBloodData({ type: res.data.blood_type })
      } else {
        setBackStatus('failed')
        setError('Blood type not detected on ID back. Please upload a clearer photo.')
      }
    } catch (err) {
      setBackStatus('failed')
      setError(err.response?.data?.message || 'Could not scan ID back')
      console.error('Back scan error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (frontStatus !== 'verified' || backStatus !== 'verified') {
      setError('Please verify both ID front and back before registering.')
      return
    }
    if (!form.blood_type) {
      setError('Blood type could not be detected from ID.')
      return
    }
    if (!form.governorate) {
      setError('Please select your governorate.')
      return
    }
    setMessage('')
    setError('')
    setSubmitting(true)
    try {
      const res = await axios.post(`${API}/api/donors/register`, form)
      setMessage(res.data.message || 'Registration successful! Redirecting to login...')
      
      try {
        await axios.post(`${API}/api/analytics/event`, {
          eventType: 'donor_login'
        })
        console.log('Donor registration tracked')
      } catch (analyticsErr) {
        console.error('Analytics error:', analyticsErr)
      }
      
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
      console.error('Registration error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 1) {
      if (!form.full_name || !form.email || !form.password) {
        setError('Please fill all required fields')
        return
      }
    }
    if (currentStep === 2) {
      if (frontStatus !== 'verified') {
        setError('Please verify ID front first')
        return
      }
    }
    if (currentStep === 3) {
      if (backStatus !== 'verified') {
        setError('Please verify ID back first')
        return
      }
    }
    setError('')
    setCurrentStep(s => Math.min(s + 1, 4))
  }

  const prevStep = () => {
    setCurrentStep(s => Math.max(s - 1, 1))
  }

  const progress = (currentStep / 4) * 100

  return (
    <div className="dr-root">
      <AnimatedBackgroundOrbs />

      <div style={{ position:'relative', zIndex:10, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(16px,2.5vw,32px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
          transition={{ duration: 0.6 }}
          style={{ width:'100%', maxWidth: 'clamp(320px,90vw,700px)' }}
        >

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:'clamp(24px,3.5vw,40px)' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width: 'clamp(60px,8vw,80px)', height: 'clamp(60px,8vw,80px)', marginBottom:'clamp(12px,1.5vw,16px)', position:'relative' }}
            >
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid rgba(220,38,38,.15)', animation:'pulse-ring 2s infinite' }}/>
              <div style={{ width:'85%', height:'85%', borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg viewBox="0 0 100 130" style={{ width:'55%', height:'55%', fill:'#faf7f7' }}>
                  <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z"/>
                </svg>
              </div>
            </motion.div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(28px,4vw,48px)', fontWeight:900, color:'#dc2626', margin:0, lineHeight:1.1 }}>
              Join as a Hero
            </h1>
            <p style={{ fontSize:'clamp(12px,1.2vw,14px)', color:'rgba(56,1,1,.6)', fontWeight:700, marginTop:'clamp(8px,1vw,12px)', letterSpacing:'.06em', textTransform:'uppercase' }}>
              Register to save lives
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom:'clamp(24px,3.5vw,40px)' }}>
            <div className="dr-progress-bar">
              <div className="dr-progress-fill" style={{ width:`${progress}%` }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'clamp(16px,2vw,24px)', gap:'clamp(6px,1vw,12px)' }}>
              {[
                { num: 1, label: 'Account' },
                { num: 2, label: 'Age' },
                { num: 3, label: 'Blood' },
                { num: 4, label: 'Location' },
              ].map(step => (
                <div key={step.num} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'clamp(6px,0.8vw,8px)', flex: 1 }}>
                  <div className={`dr-step-indicator ${currentStep === step.num ? 'active' : currentStep > step.num ? 'completed' : 'inactive'}`}>
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span style={{ fontSize:'clamp(9px,0.9vw,10px)', fontWeight:700, color: currentStep >= step.num ? '#dc2626' : 'rgba(220,38,38,.4)', textTransform:'uppercase', letterSpacing:'.1em', textAlign:'center' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="dr-glass-deep" style={{ borderRadius:'clamp(20px,3vw,28px)', padding:'clamp(24px,3.5vw,36px)', border:'1px solid rgba(180,180,180,.15)', position:'relative', overflow:'hidden' }}>
            
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#dc2626,transparent)' }}/>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="dr-glass"
                  style={{ background:'rgba(34,197,94,.15)', border:'1.5px solid rgba(34,197,94,.3)', padding:'clamp(12px,1.5vw,16px)', borderRadius:'clamp(12px,1.5vw,16px)', marginBottom:'clamp(16px,2vw,20px)', textAlign:'center' }}
                >
                  <p style={{ fontSize:'clamp(12px,1.1vw,13px)', fontWeight:700, color:'#22c55e', margin:0 }}>{message}</p>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="dr-glass"
                  style={{ background:'rgba(220,38,38,.08)', border:'1.5px solid rgba(220,38,38,.3)', padding:'clamp(12px,1.5vw,16px)', borderRadius:'clamp(12px,1.5vw,16px)', marginBottom:'clamp(16px,2vw,20px)', textAlign:'center' }}
                >
                  <p style={{ fontSize:'clamp(12px,1.1vw,13px)', fontWeight:700, color:'#dc2626', margin:0 }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">

                {/* STEP 1: ACCOUNT */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ display:'flex', flexDirection:'column', gap:'clamp(14px,2vw,18px)' }}
                  >
                    <div>
                      <label style={{ fontSize:'clamp(9px,0.9vw,10px)', fontWeight:700, color:'rgba(56,1,1,.5)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'clamp(6px,1vw,8px)', display:'block' }}>Full Name</label>
                      <input
                        name="full_name"
                        placeholder="Your full name"
                        value={form.full_name}
                        onChange={handleChange}
                        className="dr-input"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize:'clamp(9px,0.9vw,10px)', fontWeight:700, color:'rgba(56,1,1,.5)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'clamp(6px,1vw,8px)', display:'block' }}>Email</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="dr-input"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize:'clamp(9px,0.9vw,10px)', fontWeight:700, color:'rgba(56,1,1,.5)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'clamp(6px,1vw,8px)', display:'block' }}>Password</label>
                      <div style={{ position:'relative' }}>
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={form.password}
                          onChange={handleChange}
                          className="dr-input"
                          style={{ paddingRight: 'clamp(40px,5vw,50px)' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ position:'absolute', right:'clamp(12px,1.5vw,16px)', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', alignItems:'center', justifyContent:'center' }}
                        >
                          <svg viewBox="0 0 24 24" style={{ width:'clamp(18px,2vw,20px)', height:'clamp(18px,2vw,20px)', fill:'rgba(56,1,1,.5)' }}>
                            {showPassword ? (
                              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                            ) : (
                              <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z"/>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                  
                  </motion.div>
                )}

                {/* STEP 2: ID FRONT (AGE) */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ display:'flex', flexDirection:'column', gap:'clamp(12px,1.8vw,16px)' }}
                  >
                    <div className="dr-glass" style={{ background:'rgba(255,235,238,.4)', border:'1.5px solid rgba(220,38,38,.15)', borderRadius:'clamp(16px,2vw,20px)', padding:'clamp(16px,2vw,20px)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'clamp(10px,1.5vw,12px)', marginBottom:'clamp(12px,1.5vw,16px)' }}>
                        <div style={{ width:'clamp(36px,5vw,44px)', height:'clamp(36px,5vw,44px)', borderRadius:'10px', background:'linear-gradient(135deg,#dc2626,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
                          <svg viewBox="0 0 24 24" style={{ width:'65%', height:'65%', fill:'#faf7f7' }}>
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 style={{ fontSize:'clamp(14px,1.3vw,16px)', fontWeight:700, color:'#dc2626', margin:0 }}>ID Front</h3>
                          <p style={{ fontSize:'clamp(10px,0.9vw,11px)', color:'rgba(56,1,1,.6)', margin:'clamp(4px,0.5vw,6px) 0 0', fontWeight:600 }}>Verify your age</p>
                        </div>
                      </div>

                      <label className="dr-upload-zone" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'clamp(24px,3vw,32px)', marginBottom:'clamp(12px,1.5vw,16px)' }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display:'none' }}
                          onChange={e => { setFrontFile(e.target.files?.[0] || null); setFrontStatus(null); setError('') }}
                        />
                        {frontFile ? (
                          <>
                            <svg viewBox="0 0 24 24" style={{ width:'clamp(32px,4vw,40px)', height:'clamp(32px,4vw,40px)', fill:'#dc2626', marginBottom:'clamp(8px,1vw,12px)' }}>
                              <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                            </svg>
                            <p style={{ fontSize:'clamp(12px,1.1vw,13px)', fontWeight:700, color:'#dc2626', margin:0, textAlign:'center', wordBreak:'break-word' }}>{frontFile.name}</p>
                            <p style={{ fontSize:'clamp(10px,0.9vw,11px)', color:'rgba(56,1,1,.5)', marginTop:'clamp(4px,0.5vw,6px)' }}>Tap to change</p>
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" style={{ width:'clamp(40px,5vw,48px)', height:'clamp(40px,5vw,48px)', fill:'rgba(56,1,1,.3)', marginBottom:'clamp(8px,1vw,12px)' }}>
                              <path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"/>
                            </svg>
                            <p style={{ fontSize:'clamp(13px,1.2vw,14px)', fontWeight:700, color:'#dc2626', margin:0 }}>Upload ID Front</p>
                            <p style={{ fontSize:'clamp(10px,0.9vw,11px)', color:'rgba(56,1,1,.5)', marginTop:'clamp(4px,0.5vw,6px)' }}>Show your face and age</p>
                          </>
                        )}
                      </label>

                      <motion.button
                        type="button"
                        onClick={scanIdFront}
                        disabled={frontStatus === 'scanning' || !frontFile}
                        className="dr-btn dr-btn-primary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ width:'100%', padding:'clamp(12px,1.5vw,16px)', fontSize:'clamp(12px,1.1vw,14px)', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'clamp(8px,1vw,10px)', opacity: frontStatus === 'scanning' || !frontFile ? 0.6 : 1, pointerEvents: frontStatus === 'scanning' || !frontFile ? 'none' : 'auto' }}
                      >
                        {frontStatus === 'scanning' ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              style={{ width:'clamp(14px,1.5vw,16px)', height:'clamp(14px,1.5vw,16px)', border:'2.5px solid rgba(255,255,255,.3)', borderTopColor:'#faf7f7', borderRadius:'50%' }}
                            />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" style={{ width:'clamp(14px,1.5vw,16px)', height:'clamp(14px,1.5vw,16px)', fill:'#faf7f7' }}>
                              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                            </svg>
                            Scan Front
                          </>
                        )}
                      </motion.button>
                    </div>

                    {frontStatus === 'verified' && ageData.age && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="dr-glass"
                        style={{ padding:'clamp(16px,2vw,20px)', borderRadius:'clamp(12px,1.5vw,16px)', background:'rgba(34,197,94,.15)', border:'1.5px solid rgba(34,197,94,.3)' }}
                      >
                        <p style={{ fontSize:'clamp(12px,1.1vw,13px)', fontWeight:700, color:'#22c55e', margin:'0 0 clamp(8px,1vw,12px) 0', textAlign:'center', textTransform:'uppercase', letterSpacing:'.05em' }}>
                          Age Verified
                        </p>
                        <div style={{ textAlign:'center' }}>
                          <p style={{ fontSize:'clamp(24px,3.5vw,32px)', fontWeight:900, color:'#22c55e', margin:'0 0 clamp(6px,1vw,8px) 0' }}>
                            {ageData.age}
                          </p>
                          <p style={{ fontSize:'clamp(10px,0.9vw,11px)', color:'rgba(34,197,94,.75)', margin:0, fontWeight:600 }}>
                            years old
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3: ID BACK (BLOOD TYPE) */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ display:'flex', flexDirection:'column', gap:'clamp(12px,1.8vw,16px)' }}
                  >
                    <div className="dr-glass" style={{ background:'rgba(255,235,238,.4)', border:'1.5px solid rgba(220,38,38,.15)', borderRadius:'clamp(16px,2vw,20px)', padding:'clamp(16px,2vw,20px)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'clamp(10px,1.5vw,12px)', marginBottom:'clamp(12px,1.5vw,16px)' }}>
                        <div style={{ width:'clamp(36px,5vw,44px)', height:'clamp(36px,5vw,44px)', borderRadius:'10px', background:'linear-gradient(135deg,#dc2626,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
                          <svg viewBox="0 0 24 24" style={{ width:'65%', height:'65%', fill:'#faf7f7' }}>
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 style={{ fontSize:'clamp(14px,1.3vw,16px)', fontWeight:700, color:'#dc2626', margin:0 }}>ID Back</h3>
                          <p style={{ fontSize:'clamp(10px,0.9vw,11px)', color:'rgba(56,1,1,.6)', margin:'clamp(4px,0.5vw,6px) 0 0', fontWeight:600 }}>Extract blood type</p>
                        </div>
                      </div>

                      <label className="dr-upload-zone" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'clamp(24px,3vw,32px)', marginBottom:'clamp(12px,1.5vw,16px)' }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display:'none' }}
                          onChange={e => { setBackFile(e.target.files?.[0] || null); setBackStatus(null); setError('') }}
                        />
                        {backFile ? (
                          <>
                            <svg viewBox="0 0 24 24" style={{ width:'clamp(32px,4vw,40px)', height:'clamp(32px,4vw,40px)', fill:'#dc2626', marginBottom:'clamp(8px,1vw,12px)' }}>
                              <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                            </svg>
                            <p style={{ fontSize:'clamp(12px,1.1vw,13px)', fontWeight:700, color:'#dc2626', margin:0, textAlign:'center', wordBreak:'break-word' }}>{backFile.name}</p>
                            <p style={{ fontSize:'clamp(10px,0.9vw,11px)', color:'rgba(56,1,1,.5)', marginTop:'clamp(4px,0.5vw,6px)' }}>Tap to change</p>
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" style={{ width:'clamp(40px,5vw,48px)', height:'clamp(40px,5vw,48px)', fill:'rgba(56,1,1,.3)', marginBottom:'clamp(8px,1vw,12px)' }}>
                              <path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"/>
                            </svg>
                            <p style={{ fontSize:'clamp(13px,1.2vw,14px)', fontWeight:700, color:'#dc2626', margin:0 }}>Upload ID Back</p>
                            <p style={{ fontSize:'clamp(10px,0.9vw,11px)', color:'rgba(56,1,1,.5)', marginTop:'clamp(4px,0.5vw,6px)' }}>Show blood type and info</p>
                          </>
                        )}
                      </label>

                      <motion.button
                        type="button"
                        onClick={scanIdBack}
                        disabled={backStatus === 'scanning' || !backFile}
                        className="dr-btn dr-btn-primary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ width:'100%', padding:'clamp(12px,1.5vw,16px)', fontSize:'clamp(12px,1.1vw,14px)', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'clamp(8px,1vw,10px)', opacity: backStatus === 'scanning' || !backFile ? 0.6 : 1, pointerEvents: backStatus === 'scanning' || !backFile ? 'none' : 'auto' }}
                      >
                        {backStatus === 'scanning' ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              style={{ width:'clamp(14px,1.5vw,16px)', height:'clamp(14px,1.5vw,16px)', border:'2.5px solid rgba(255,255,255,.3)', borderTopColor:'#faf7f7', borderRadius:'50%' }}
                            />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" style={{ width:'clamp(14px,1.5vw,16px)', height:'clamp(14px,1.5vw,16px)', fill:'#faf7f7' }}>
                              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                            </svg>
                            Scan Back
                          </>
                        )}
                      </motion.button>
                    </div>

                    {backStatus === 'verified' && form.blood_type && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ padding:'clamp(20px,2.5vw,24px)', borderRadius:'clamp(12px,1.5vw,16px)', background:'linear-gradient(135deg,rgba(220,38,38,.08),rgba(220,38,38,.04))', border:'1.5px solid rgba(220,38,38,.2)', textAlign:'center' }}
                      >
                        <p style={{ fontSize:'clamp(10px,0.9vw,11px)', color:'rgba(56,1,1,.6)', fontWeight:700, margin:'0 0 clamp(10px,1.5vw,14px) 0', textTransform:'uppercase', letterSpacing:'.1em' }}>
                          Blood Type
                        </p>
                        <p style={{ fontSize:'clamp(40px,6vw,56px)', fontWeight:900, color:'#dc2626', margin:0, lineHeight:1 }}>
                          {form.blood_type}
                        </p>
                        <p style={{ fontSize:'clamp(10px,0.9vw,11px)', color:'rgba(56,1,1,.6)', fontWeight:700, margin:'clamp(6px,1vw,10px) 0 0', textTransform:'uppercase', letterSpacing:'.1em' }}>
                          Extracted from ID
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* STEP 4: LOCATION (GOVERNORATE) */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ display:'flex', flexDirection:'column', gap:'clamp(14px,2vw,18px)' }}
                  >
                    <div>
                      <label style={{ fontSize:'clamp(9px,0.9vw,10px)', fontWeight:700, color:'rgba(56,1,1,.5)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'clamp(6px,1vw,8px)', display:'block' }}>Select Your Governorate</label>
                      <select
                        name="governorate"
                        value={form.governorate}
                        onChange={handleChange}
                        className="dr-select"
                        required
                      >
                        <option value="">Choose a governorate...</option>
                        {GOVERNORATES.map(gov => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                    </div>

                    {form.governorate && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="dr-glass"
                        style={{ padding:'clamp(16px,2vw,20px)', borderRadius:'clamp(12px,1.5vw,16px)', background:'rgba(64,88,120,.08)', border:'1.5px solid rgba(64,88,120,.2)', textAlign:'center' }}
                      >
                        <p style={{ fontSize:'clamp(11px,1vw,12px)', fontWeight:700, color:'rgba(64,88,120,.7)', margin:'0 0 clamp(8px,1vw,12px) 0', textTransform:'uppercase', letterSpacing:'.05em' }}>
                          Location Selected
                        </p>
                        <p style={{ fontSize:'clamp(18px,2.5vw,24px)', fontWeight:900, color:'rgba(64,88,120,.9)', margin:0 }}>
                          {form.governorate}
                        </p>
                      </motion.div>
                    )}

                    <div className="dr-glass" style={{ background:'rgba(64,88,120,.08)', border:'1.5px solid rgba(64,88,120,.2)', borderRadius:'clamp(12px,1.5vw,16px)', padding:'clamp(12px,1.5vw,16px)' }}>
                      <p style={{ fontSize:'clamp(11px,1vw,12px)', color:'rgba(56,1,1,.65)', fontWeight:600, margin:0, lineHeight:1.6 }}>
                        Your location helps us connect you with the nearest blood banks and donation centers in your area.
                      </p>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Navigation Buttons */}
              <div style={{ display:'flex', gap:'clamp(10px,1.5vw,14px)', marginTop:'clamp(24px,3.5vw,32px)', flexWrap:'wrap' }}>
                {currentStep > 1 && (
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className="dr-btn dr-btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ flex: currentStep === 4 ? 1 : '0 1 auto', padding:'clamp(12px,1.5vw,16px) clamp(16px,2vw,20px)', fontSize:'clamp(12px,1.1vw,14px)', fontWeight:700 }}
                  >
                    Back
                  </motion.button>
                )}
                
                {currentStep < 4 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="dr-btn dr-btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ flex: 1, padding:'clamp(12px,1.5vw,16px)', fontSize:'clamp(12px,1.1vw,14px)', fontWeight:700, opacity: (currentStep === 2 && frontStatus !== 'verified') || (currentStep === 3 && backStatus !== 'verified') ? 0.6 : 1, pointerEvents: (currentStep === 2 && frontStatus !== 'verified') || (currentStep === 3 && backStatus !== 'verified') ? 'none' : 'auto' }}
                  >
                    Continue
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={submitting || frontStatus !== 'verified' || backStatus !== 'verified' || !form.blood_type || !form.governorate}
                    className="dr-btn dr-btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ flex: 1, padding:'clamp(12px,1.5vw,16px)', fontSize:'clamp(12px,1.1vw,14px)', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'clamp(8px,1vw,10px)', opacity: submitting || frontStatus !== 'verified' || backStatus !== 'verified' || !form.blood_type || !form.governorate ? 0.6 : 1, pointerEvents: submitting || frontStatus !== 'verified' || backStatus !== 'verified' || !form.blood_type || !form.governorate ? 'none' : 'auto' }}
                  >
                    {submitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          style={{ width:'clamp(14px,1.5vw,16px)', height:'clamp(14px,1.5vw,16px)', border:'2.5px solid rgba(255,255,255,.3)', borderTopColor:'#faf7f7', borderRadius:'50%' }}
                        />
                        Creating...
                      </>
                    ) : (
                      'Become a Hero'
                    )}
                  </motion.button>
                )}
              </div>
            </form>

            <p style={{ textAlign:'center', fontSize:'clamp(11px,1vw,12px)', color:'rgba(56,1,1,.6)', fontWeight:700, marginTop:'clamp(20px,2.5vw,28px)', marginBottom:0 }}>
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} style={{ color:'#dc2626', cursor:'pointer', fontWeight:900, textDecoration:'none', transition:'all .2s' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                Sign In
              </span>
            </p>

          </div>

        </motion.div>
      </div>
    </div>
  )
}

export default DonorRegister