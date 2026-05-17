import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const API = 'https://blood-bank-eqyr.onrender.com'

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
  @keyframes bc-hb        { 0%,100% { transform:scale(1); } 14% { transform:scale(1.18); } 28% { transform:scale(1); } 42% { transform:scale(1.15); } }
  @keyframes bc-shimmer   { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes bc-progress  { from { width:0%; } to { width:100%; } }
  @keyframes bc-blood-float { 0%,100% { transform:translateY(0) rotate(0deg); } 25% { transform:translateY(-40px) rotate(90deg); } 50% { transform:translateY(-20px) rotate(180deg); } 75% { transform:translateY(-60px) rotate(270deg); } }
  @keyframes bc-dna-spin { to { transform:translateY(-100%) rotate(360deg); } }
  @keyframes bc-heartbeat { 0%,100% { transform:scale(1) translateY(0); opacity:.6; } 10% { transform:scale(1.3) translateY(-5px); opacity:1; } 20% { transform:scale(1) translateY(0); opacity:.6; } 30% { transform:scale(1.15) translateY(-3px); opacity:.9; } }
  @keyframes bc-wave { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }

  .bc-register-root {
    min-height:100vh;
    background:linear-gradient(-45deg,#FFEBEE,#F8F9FA,#FFE5E8,rgba(136,189,242,.25),#FFF5F7);
    background-size:400% 400%;
    animation:bc-gradient 14s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
  }

  body, html {
    margin: 0;
    padding: 0;
  }

  .bc-glass {
    background:rgba(255,255,255,.42);
    backdrop-filter:blur(28px) saturate(180%);
    -webkit-backdrop-filter:blur(28px) saturate(180%);
    border:1px solid rgba(255,255,255,.72);
    box-shadow:0 8px 32px rgba(211,47,47,.07),inset 0 0 20px rgba(255,255,255,.6);
  }

  .bc-glass-deep {
    background:rgba(255,255,255,.35);
    backdrop-filter:blur(40px) contrast(1.1);
    -webkit-backdrop-filter:blur(40px) contrast(1.1);
    border:1px solid rgba(255,255,255,.8);
    box-shadow:0 24px 56px -12px rgba(211,47,47,.08),inset 0 0 36px rgba(255,255,255,.6);
  }

  .bc-orb { 
    position:fixed;
    border-radius:50%;
    filter:blur(100px);
    pointer-events:none;
    animation:bc-orb var(--dur,8s) ease-in-out infinite; 
  }

  .bc-particle { 
    position:fixed;
    border-radius:50%;
    pointer-events:none;
    animation:bc-particle var(--dur,5s) ease-in-out infinite; 
  }

  .bc-blood-cell {
    position:fixed;
    width:60px;
    height:60px;
    border-radius:50%;
    background:radial-gradient(circle at 30% 30%,rgba(255,107,107,.4),rgba(211,47,47,.25));
    border:2px solid rgba(211,47,47,.3);
    animation:bc-blood-float var(--dur,12s) ease-in-out infinite;
    pointer-events:none;
  }

  .bc-blood-cell::before {
    content:'';
    position:absolute;
    inset:12px;
    border-radius:50%;
    background:radial-gradient(circle at 40% 40%,rgba(255,255,255,.3),transparent);
  }

  .bc-input {
    width:100%;
    padding:14px 18px;
    border-radius:14px;
    border:2px solid rgba(211,47,47,.15);
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
    font-size:13px;
    color:#D32F2F;
    outline:none;
    transition:all .28s cubic-bezier(.22,1,.36,1);
    box-sizing:border-box;
  }

  .bc-input::placeholder { color:rgba(211,47,47,.35); }

  .bc-input:focus {
    border-color:rgba(211,47,47,.5);
    background:rgba(255,255,255,.72);
    box-shadow:0 8px 24px rgba(211,47,47,.12);
    transform:translateY(-2px);
  }

  .bc-btn {
    position:relative;
    overflow:hidden;
    cursor:pointer;
    border:none;
    outline:none;
    transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s;
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  .bc-btn::after {
    content:'';
    position:absolute;
    top:50%;
    left:50%;
    width:0;
    height:0;
    background:rgba(255,255,255,.28);
    border-radius:50%;
    transform:translate(-50%,-50%);
    transition:width .4s,height .4s;
  }

  .bc-btn:hover::after { width:300px; height:300px; }
  .bc-btn:hover { transform:translateY(-3px) scale(1.05); }
  .bc-btn:active { transform:scale(.97); }

  .bc-btn-primary {
    background:linear-gradient(135deg,#D32F2F,#ff6b6b);
    color:white;
    box-shadow:0 12px 32px rgba(211,47,47,.32);
  }
  .bc-btn-primary:hover { box-shadow:0 18px 48px rgba(211,47,47,.44); }

  .bc-step-indicator {
    width:40px;
    height:40px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:900;
    font-size:14px;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
  }

  .bc-step-indicator.active {
    background:linear-gradient(135deg,#D32F2F,#ff6b6b);
    color:white;
    box-shadow:0 8px 24px rgba(211,47,47,.4);
    transform:scale(1.15);
  }

  .bc-step-indicator.completed {
    background:rgba(34,197,94,.15);
    color:#22c55e;
    border:2px solid #22c55e;
  }

  .bc-step-indicator.inactive {
    background:rgba(211,47,47,.08);
    color:rgba(211,47,47,.4);
    border:2px solid rgba(211,47,47,.15);
  }

  .bc-upload-zone {
    border:2px dashed rgba(211,47,47,.3);
    border-radius:20px;
    background:rgba(255,235,238,.3);
    transition:all .3s;
    cursor:pointer;
  }

  .bc-upload-zone:hover {
    border-color:#D32F2F;
    background:rgba(255,235,238,.5);
    transform:translateY(-2px);
  }

  .bc-progress-bar {
    height:6px;
    background:rgba(211,47,47,.15);
    border-radius:999px;
    overflow:hidden;
    position:relative;
  }

  .bc-progress-fill {
    height:100%;
    background:linear-gradient(90deg,#D32F2F,#ff6b6b,#88bdf2);
    background-size:200% 100%;
    animation:bc-shimmer 2s linear infinite;
    border-radius:999px;
    transition:width .5s cubic-bezier(.34,1.56,.64,1);
  }

  .bc-blood-type-btn {
    padding:12px 20px;
    border-radius:14px;
    border:2px solid rgba(211,47,47,.2);
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(10px);
    font-weight:900;
    font-size:15px;
    color:rgba(211,47,47,.6);
    cursor:pointer;
    transition:all .2s cubic-bezier(.34,1.56,.64,1);
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  .bc-blood-type-btn:hover {
    transform:translateY(-3px) scale(1.05);
    box-shadow:0 8px 20px rgba(211,47,47,.15);
  }

  .bc-blood-type-btn.selected {
    background:linear-gradient(135deg,#D32F2F,#ff6b6b);
    color:white;
    border-color:transparent;
    box-shadow:0 10px 28px rgba(211,47,47,.35);
    transform:scale(1.08);
  }
`

if (typeof document !== 'undefined' && !document.getElementById('bc-register-styles')) {
  const s = document.createElement('style')
  s.id = 'bc-register-styles'
  s.textContent = STYLES
  document.head.appendChild(s)
}

/* ─── Animated Background Elements ───────────────────────── */
function AnimatedBackground() {
  // Floating blood cells
  const bloodCells = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 30 + 40,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: (Math.random() * 8 + 10).toFixed(1),
    delay: -(Math.random() * 8).toFixed(1),
  }))

  // Particles
  const particles = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    w: Math.random() * 4 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: (Math.random() * 4 + 3).toFixed(1),
    delay: -(Math.random() * 4).toFixed(1),
    px: ((Math.random() * 20 - 10).toFixed(0)) + 'px',
    color: i % 3 === 0 ? 'rgba(211,47,47,.35)' : i % 3 === 1 ? 'rgba(136,189,242,.45)' : 'rgba(255,235,238,.7)',
  }))

  return (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {/* Blood Cells */}
      {bloodCells.map(cell => (
        <div
          key={`cell-${cell.id}`}
          className="bc-blood-cell"
          style={{
            '--dur': `${cell.dur}s`,
            width: cell.size,
            height: cell.size,
            left: `${cell.left}%`,
            top: `${cell.top}%`,
            animationDelay: `${cell.delay}s`,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map(p => (
        <div
          key={`p-${p.id}`}
          className="bc-particle"
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

      {/* DNA Helix Lines */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`dna-${i}`}
          style={{
            position:'fixed',
            left:`${20 + i * 30}%`,
            top:0,
            width:2,
            height:'100vh',
            background:'linear-gradient(180deg,transparent,rgba(211,47,47,.1),transparent,rgba(136,189,242,.1),transparent)',
            animation:`bc-dna-spin ${25 + i * 5}s linear infinite`,
            animationDelay:`-${i * 8}s`,
          }}
        />
      ))}

      {/* Heartbeat Lines */}
      <svg viewBox="0 0 1200 200" style={{ position:'fixed', top:'15%', left:0, width:'100%', height:'200px', opacity:.15, zIndex:-1 }}>
        <path d="M0,100 L200,100 L220,60 L240,140 L260,100 L1200,100" stroke="#D32F2F" strokeWidth="3" fill="none" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" from="0" to="2400" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".3;.6;.3" dur="1.5s" repeatCount="indefinite"/>
        </path>
      </svg>

      {/* Pulse Rings */}
      {[...Array(4)].map((_, i) => (
        <div
          key={`ring-${i}`}
          style={{
            position:'fixed',
            width:200,
            height:200,
            borderRadius:'50%',
            border:'2px solid rgba(211,47,47,.15)',
            top:`${30 + i * 20}%`,
            right:`${10 + i * 15}%`,
            animation:`bc-heartbeat ${2 + i * .5}s ease-in-out infinite`,
            animationDelay:`${i * .3}s`,
            zIndex:-1,
          }}
        />
      ))}

      {/* Gradient Waves */}
      <div style={{ position:'fixed', bottom:0, left:0, width:'200%', height:300, opacity:.4, zIndex:-1 }}>
        <svg viewBox="0 0 2400 300" style={{ width:'100%', height:'100%' }}>
          <path d="M0,100 Q300,50 600,100 T1200,100 T1800,100 T2400,100 L2400,300 L0,300 Z" fill="url(#waveGrad1)" opacity=".3">
            <animate attributeName="d" dur="12s" repeatCount="indefinite"
              values="M0,100 Q300,50 600,100 T1200,100 T1800,100 T2400,100 L2400,300 L0,300 Z;
                      M0,100 Q300,150 600,100 T1200,100 T1800,100 T2400,100 L2400,300 L0,300 Z;
                      M0,100 Q300,50 600,100 T1200,100 T1800,100 T2400,100 L2400,300 L0,300 Z"/>
          </path>
          <path d="M0,150 Q400,100 800,150 T1600,150 T2400,150 L2400,300 L0,300 Z" fill="url(#waveGrad2)" opacity=".2">
            <animate attributeName="d" dur="15s" repeatCount="indefinite"
              values="M0,150 Q400,100 800,150 T1600,150 T2400,150 L2400,300 L0,300 Z;
                      M0,150 Q400,200 800,150 T1600,150 T2400,150 L2400,300 L0,300 Z;
                      M0,150 Q400,100 800,150 T1600,150 T2400,150 L2400,300 L0,300 Z"/>
          </path>
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D32F2F" stopOpacity=".2"/>
              <stop offset="100%" stopColor="#ff6b6b" stopOpacity=".05"/>
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#88bdf2" stopOpacity=".15"/>
              <stop offset="100%" stopColor="#88bdf2" stopOpacity=".02"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Orbs */}
      {[
        { t:'8%', l:'5%', w:'min(420px,36vw)', c:'rgba(211,47,47,.17)', d:'0s' },
        { b:'15%', r:'10%', w:'min(480px,40vw)', c:'rgba(136,189,242,.22)', d:'-3s' },
        { t:'50%', r:'8%', w:'min(320px,28vw)', c:'rgba(255,235,238,.45)', d:'-6s' },
      ].map((o, i) => (
        <div key={`orb-${i}`} className="bc-orb" style={{ '--dur':'9s', width:o.w, height:o.w, background:o.c, top:o.t, bottom:o.b, left:o.l, right:o.r, animationDelay:o.d, zIndex:-1 }}/>
      ))}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────── */
function DonorRegister() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '',
    blood_type: '', date_of_birth: '', gender: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [idFile, setIdFile] = useState(null)
  const [idStatus, setIdStatus] = useState(null)
  const [idMessage, setIdMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePhoneChange = (e) => {
    let value = e.target.value
    // Remove all non-digits
    value = value.replace(/\D/g, '')
    // Ensure it doesn't exceed the limit (961 + 8 digits = 11 total)
    if (value.length > 11) {
      value = value.slice(0, 11)
    }
    // Format as +961 XXXX XXXX
    let formatted = '+961'
    if (value.length > 3) {
      formatted += ' ' + value.slice(3, 7)
    }
    if (value.length > 7) {
      formatted += ' ' + value.slice(7)
    }
    setForm({ ...form, phone: formatted })
  }

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxWidth = 1200
          const scale = Math.min(1, maxWidth / img.width)
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleScanId = async () => {
    if (!idFile) { 
      setIdMessage('Please select your ID photo first.') 
      setIdStatus('failed')
      return 
    }
    setIdStatus('scanning')
    setIdMessage('')
    try {
      const compressed = await compressImage(idFile)
      const formData = new FormData()
      formData.append('id_photo', compressed, 'id.jpg')
      
      const res = await axios.post(`${API}/api/idcheck/scan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })
      
      if (res.data.eligible) {
        setIdStatus('verified')
        setIdMessage(`Age verified! You are ${res.data.age} years old.`)
        setForm(prev => ({ ...prev, date_of_birth: res.data.date_of_birth }))
      } else {
        setIdStatus('failed')
        setIdMessage(res.data.message || 'You must be 18 years or older to donate.')
      }
    } catch (err) {
      setIdStatus('failed')
      const errorMsg = err.response?.data?.message || err.message || 'Could not scan ID. Please try a clearer photo.'
      setIdMessage(errorMsg)
      console.error('ID scan error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (idStatus !== 'verified') {
      setError('Please upload and verify your ID before registering.')
      return
    }
    setMessage('')
    setError('')
    setSubmitting(true)
    try {
      const res = await axios.post(`${API}/api/donors/register`, form)
      setMessage(res.data.message || 'Registration successful! Redirecting to login...')
      
      // Track donor registration for analytics
      try {
        await axios.post(`${API}/api/analytics/event`, {
          eventType: 'donor_login' // Using same event as login to increment donor count
        })
        console.log('✅ Donor registration tracked for analytics')
      } catch (analyticsErr) {
        console.error('Analytics tracking failed:', analyticsErr)
        // Don't block registration if analytics fails
      }
      
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
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
      if (!form.blood_type || !form.gender) {
        setError('Please select your blood type and gender')
        return
      }
    }
    setError('')
    setCurrentStep(s => Math.min(s + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep(s => Math.max(s - 1, 1))
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="bc-register-root">
      <AnimatedBackground />

      {/* Main Container */}
      <div style={{ position:'relative', zIndex:10, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(20px,4vw,60px) clamp(16px,3vw,40px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
          transition={{ duration: 0.6 }}
          style={{ width:'100%', maxWidth:700 }}
        >

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:'clamp(28px,4vw,48px)' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:80, height:80, marginBottom:16, position:'relative' }}
            >
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid rgba(211,47,47,.15)', animation:'bc-ping 2s infinite' }}/>
              <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#D32F2F,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg viewBox="0 0 100 130" style={{ width:32, height:32, fill:'white' }}>
                  <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z"/>
                </svg>
              </div>
            </motion.div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(32px,5vw,52px)', fontWeight:900, color:'#D32F2F', margin:0, lineHeight:1.1 }}>
              Join the Heroes
            </h1>
            <p style={{ fontSize:'clamp(13px,1.3vw,15px)', color:'rgba(211,47,47,.65)', fontWeight:700, marginTop:12, letterSpacing:'.04em' }}>
              Register to save lives across Lebanon
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom:'clamp(32px,4.5vw,56px)' }}>
            <div className="bc-progress-bar">
              <div className="bc-progress-fill" style={{ width:`${progress}%` }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:20 }}>
              {[
                { num: 1, label: 'Account' },
                { num: 2, label: 'Details' },
                { num: 3, label: 'Verification' },
              ].map(step => (
                <div key={step.num} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                  <div className={`bc-step-indicator ${currentStep === step.num ? 'active' : currentStep > step.num ? 'completed' : 'inactive'}`}>
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span style={{ fontSize:10, fontWeight:900, color: currentStep >= step.num ? '#D32F2F' : 'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.15em' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Card */}
          <div className="bc-glass-deep" style={{ borderRadius:'clamp(28px,4vw,44px)', padding:'clamp(28px,4vw,48px)', border:'2px solid rgba(211,47,47,.1)', position:'relative', overflow:'hidden' }}>
            
            {/* Top accent */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,#D32F2F,#88bdf2,transparent)' }}/>

            {/* Messages */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bc-glass"
                  style={{ background:'rgba(34,197,94,.15)', border:'2px solid #22c55e', padding:14, borderRadius:16, marginBottom:20, textAlign:'center' }}
                >
                  <p style={{ fontSize:13, fontWeight:700, color:'#22c55e', margin:0 }}>{message}</p>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bc-glass"
                  style={{ background:'rgba(255,235,238,.8)', border:'2px solid rgba(211,47,47,.4)', padding:14, borderRadius:16, marginBottom:20, textAlign:'center' }}
                >
                  <p style={{ fontSize:13, fontWeight:700, color:'#D32F2F', margin:0 }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">

                {/* STEP 1: Account Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ display:'flex', flexDirection:'column', gap:18 }}
                  >
                    <div>
                      <label style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:8, display:'block' }}>Full Name *</label>
                      <input
                        name="full_name"
                        placeholder="Your full name"
                        value={form.full_name}
                        onChange={handleChange}
                        className="bc-input"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:8, display:'block' }}>Email *</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="bc-input"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:8, display:'block' }}>Password *</label>
                      <div style={{ position:'relative' }}>
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={form.password}
                          onChange={handleChange}
                          className="bc-input"
                          style={{ paddingRight:50 }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4 }}
                        >
                          <svg viewBox="0 0 24 24" style={{ width:20, height:20, fill:'rgba(211,47,47,.5)' }}>
                            {showPassword ? (
                              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                            ) : (
                              <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z"/>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:8, display:'block' }}>Phone Number</label>
                      <div style={{ position:'relative' }}>
                        <input
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          placeholder="+961 XXXX XXXX"
                          value={form.phone}
                          onChange={handlePhoneChange}
                          className="bc-input"
                        />
                        {form.phone && (
                          <span style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'rgba(211,47,47,.5)', fontWeight:700 }}>
                            {form.phone.replace(/\D/g, '').length}/11
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Personal Details */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ display:'flex', flexDirection:'column', gap:24 }}
                  >
                    <div>
                      <label style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:14, display:'block' }}>Blood Type *</label>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
                          <button
                            key={bt}
                            type="button"
                            onClick={() => setForm({...form, blood_type: bt})}
                            className={`bc-blood-type-btn ${form.blood_type === bt ? 'selected' : ''}`}
                          >
                            {bt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:8, display:'block' }}>Gender *</label>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        {['Male', 'Female'].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setForm({...form, gender: g})}
                            className="bc-btn"
                            style={{
                              padding:14,
                              borderRadius:14,
                              background: form.gender === g ? 'linear-gradient(135deg,#D32F2F,#ff6b6b)' : 'rgba(255,255,255,.5)',
                              color: form.gender === g ? 'white' : 'rgba(211,47,47,.6)',
                              border: `2px solid ${form.gender === g ? 'transparent' : 'rgba(211,47,47,.2)'}`,
                              fontWeight:900,
                              fontSize:14,
                              boxShadow: form.gender === g ? '0 10px 28px rgba(211,47,47,.35)' : 'none',
                            }}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: ID Verification */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ display:'flex', flexDirection:'column', gap:20 }}
                  >
                    <div className="bc-glass" style={{ background:'rgba(255,235,238,.4)', border:'2px solid rgba(211,47,47,.15)', borderRadius:20, padding:20 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#D32F2F,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <svg viewBox="0 0 24 24" style={{ width:24, height:24, fill:'white' }}>
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 style={{ fontSize:16, fontWeight:900, color:'#D32F2F', margin:0 }}>Lebanese ID Verification</h3>
                          <p style={{ fontSize:11, color:'rgba(211,47,47,.6)', margin:'4px 0 0', fontWeight:600 }}>Confirm you're 18+ years old</p>
                        </div>
                      </div>

                      <label className="bc-upload-zone" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, marginBottom:16 }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display:'none' }}
                          onChange={e => { setIdFile(e.target.files?.[0] || null); setIdStatus(null); setIdMessage('') }}
                        />
                        {idFile ? (
                          <>
                            <svg viewBox="0 0 24 24" style={{ width:48, height:48, fill:'#D32F2F', marginBottom:8 }}>
                              <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                            </svg>
                            <p style={{ fontSize:13, fontWeight:900, color:'#D32F2F', margin:0, textAlign:'center' }}>{idFile.name}</p>
                            <p style={{ fontSize:11, color:'rgba(211,47,47,.5)', marginTop:4 }}>Tap to change</p>
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" style={{ width:56, height:56, fill:'rgba(211,47,47,.4)', marginBottom:12 }}>
                              <path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"/>
                            </svg>
                            <p style={{ fontSize:14, fontWeight:900, color:'#D32F2F', margin:0 }}>Upload Your ID Photo</p>
                            <p style={{ fontSize:11, color:'rgba(211,47,47,.5)', marginTop:6 }}>JPG or PNG • Clear & readable</p>
                          </>
                        )}
                      </label>

                      <button
                        type="button"
                        onClick={handleScanId}
                        disabled={idStatus === 'scanning' || !idFile}
                        className="bc-btn bc-btn-primary"
                        style={{ width:'100%', padding:14, borderRadius:14, fontSize:14, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity: idStatus === 'scanning' || !idFile ? 0.6 : 1 }}
                      >
                        {idStatus === 'scanning' ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              style={{ width:18, height:18, border:'3px solid rgba(255,255,255,.3)', borderTopColor:'white', borderRadius:'50%' }}
                            />
                            Scanning ID...
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" style={{ width:18, height:18, fill:'white' }}>
                              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                            </svg>
                            Verify My Age
                          </>
                        )}
                      </button>

                      {idMessage && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bc-glass"
                          style={{
                            marginTop:16,
                            padding:14,
                            borderRadius:14,
                            background: idStatus === 'verified' ? 'rgba(34,197,94,.15)' : 'rgba(255,235,238,.8)',
                            border: `2px solid ${idStatus === 'verified' ? '#22c55e' : 'rgba(211,47,47,.4)'}`,
                            textAlign:'center',
                          }}
                        >
                          <p style={{ fontSize:13, fontWeight:700, color: idStatus === 'verified' ? '#22c55e' : '#D32F2F', margin:0 }}>
                            {idMessage}
                          </p>
                        </motion.div>
                      )}

                      {form.date_of_birth && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bc-glass"
                          style={{ marginTop:16, padding:14, borderRadius:14, background:'rgba(34,197,94,.1)', border:'2px solid #22c55e', textAlign:'center' }}
                        >
                          <p style={{ fontSize:13, fontWeight:900, color:'#22c55e', margin:0 }}>
                            Date of Birth: {form.date_of_birth}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Navigation Buttons */}
              <div style={{ display:'flex', gap:12, marginTop:32 }}>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bc-btn"
                    style={{ flex:1, padding:14, borderRadius:14, fontSize:14, fontWeight:900, background:'rgba(255,255,255,.6)', color:'#D32F2F', border:'2px solid rgba(211,47,47,.2)' }}
                  >
                    ← Back
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bc-btn bc-btn-primary"
                    style={{ flex:1, padding:14, borderRadius:14, fontSize:14, fontWeight:900 }}
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting || idStatus !== 'verified'}
                    className="bc-btn bc-btn-primary"
                    style={{ flex:1, padding:14, borderRadius:14, fontSize:14, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity: submitting || idStatus !== 'verified' ? 0.6 : 1 }}
                  >
                    {submitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          style={{ width:18, height:18, border:'3px solid rgba(255,255,255,.3)', borderTopColor:'white', borderRadius:'50%' }}
                        />
                        Creating Account...
                      </>
                    ) : (
                      'Become a Hero'
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Footer */}
            <p style={{ textAlign:'center', fontSize:12, color:'rgba(211,47,47,.6)', fontWeight:700, marginTop:24, marginBottom:0 }}>
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} style={{ color:'#D32F2F', cursor:'pointer', fontWeight:900, textDecoration:'underline' }}>
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