import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const UNIFIED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes pulse-ring { 0% { transform:scale(.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }
  @keyframes glow-pulse { 0%,100% { box-shadow: 0 8px 20px rgba(220,38,38,.2); } 50% { box-shadow: 0 12px 30px rgba(220,38,38,.3); } }

  .bc-login-root {
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

  .bc-glass {
    background:rgba(255,255,255,.6);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(180,180,180,.2);
    box-shadow:0 8px 32px rgba(0,0,0,.08);
  }

  .bc-glass-deep {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(180,180,180,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.1),inset 0 1px 1px rgba(255,255,255,.3);
  }

  .bc-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .bc-input {
    width:100%;
    padding:clamp(14px,1.5vw,18px) clamp(18px,2vw,22px);
    border-radius:clamp(14px,1.8vw,18px);
    border:1.5px solid rgba(180,180,180,.2);
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:600;
    font-size:clamp(13px,1.2vw,15px);
    color:#380101;
    outline:none;
    transition:all .28s cubic-bezier(.22,1,.36,1);
    box-shadow:inset 0 1px 1px rgba(255,255,255,.3);
  }

  .bc-input::placeholder { color:rgba(56,1,1,.4); }

  .bc-input:focus {
    border-color:rgba(220,38,38,.4);
    background:rgba(255,255,255,.7);
    box-shadow:0 8px 24px rgba(220,38,38,.15),inset 0 1px 1px rgba(255,255,255,.3);
  }

  .bc-btn {
    position:relative;
    overflow:hidden;
    cursor:pointer;
    border:none;
    outline:none;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
  }

  .bc-btn::before {
    content:'';
    position:absolute;
    top:0;
    left:-100%;
    width:100%;
    height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
    transition:left .5s;
  }

  .bc-btn:hover::before { left:100%; }

  .bc-btn-primary {
    background:linear-gradient(135deg,#dc2626 0%,#991b1b 50%,#7f1d1d 100%);
    color:#faf7f7;
    box-shadow:0 10px 30px rgba(220,38,38,.35);
    border:1px solid rgba(255,255,255,.15);
  }

  .bc-btn-primary:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 20px 60px rgba(220,38,38,.5);
  }

  .bc-btn-primary:active {
    transform:scale(.97);
  }

  .bc-card-hover {
    transition:all .4s cubic-bezier(.22,1,.36,1);
  }

  .bc-card-hover:hover {
    transform:translateY(-8px) scale(1.02);
    box-shadow:0 32px 80px rgba(220,38,38,.2) !important;
  }

  @media (max-width:960px) {
    .bc-login-root { zoom: 0.9; }
    .bc-login-grid { grid-template-columns: 1fr !important; }
    .bc-left-column { display: none !important; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('bc-login-styles-unified')) {
  const s = document.createElement('style')
  s.id = 'bc-login-styles-unified'
  s.textContent = UNIFIED_STYLES
  document.head.appendChild(s)
}

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
          className="bc-float-orb"
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

function BloodDropMini() {
  return (
    <div style={{ position: 'relative', width: 140, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <circle cx="50%" cy="50%" r="20" fill="none" stroke="rgba(220,38,38,.25)" strokeWidth="2" opacity="0.8">
          <animate attributeName="r" values="20;55;20" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="50%" cy="50%" r="20" fill="none" stroke="rgba(220,38,38,.15)" strokeWidth="2" opacity="0.5">
          <animate attributeName="r" values="15;50;15" dur="3.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="3.5s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div style={{ position: 'relative', zIndex: 2, animation: 'float 3s ease-in-out infinite' }}>
        <svg viewBox="0 0 100 130" style={{ width: 80, height: 100, filter: 'drop-shadow(0 12px 28px rgba(220,38,38,.4))' }}>
          <defs>
            <linearGradient id="bcBloodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id="bcHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#faf7f7" stopOpacity=".7" />
              <stop offset="100%" stopColor="#faf7f7" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="bcDropGlow" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#faf7f7" stopOpacity=".4" />
              <stop offset="100%" stopColor="#faf7f7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill="url(#bcBloodGrad)" />
          <ellipse cx="32" cy="65" rx="18" ry="25" fill="url(#bcHighlight)" />
          <ellipse cx="50" cy="50" rx="28" ry="35" fill="url(#bcDropGlow)" />
          <path d="M50 15 C50 15 85 65 85 85 C85 105 70 120 50 120 C30 120 15 105 15 85 C15 65 50 15 50 15 Z" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" />
        </svg>
      </div>

      <div style={{ position: 'absolute', inset: '30%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,.3), transparent)', filter: 'blur(20px)', animation: 'pulse 2s ease-in-out infinite', zIndex: 1 }} />
    </div>
  )
}

function StatCard({ icon, value, label, color = '#dc2626', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      className="bc-glass bc-card-hover"
      style={{
        borderRadius: '20px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(180,180,180,.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 56,
          height: 56,
          background: `linear-gradient(135deg, ${color}15, ${color}25)`,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: '28px', fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(56,1,1,.5)', textTransform: 'uppercase', letterSpacing: '.15em', margin: '8px 0 0', lineHeight: 1 }}>{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (form.email.endsWith('@bloodconnect.com')) {
      try {
        const res = await axios.post('https://blood-bank-eqyr.onrender.com/api/admin/login', {
          email: form.email,
          password: form.password
        })
        localStorage.setItem('adminData', JSON.stringify(res.data.admin))
        navigate('/admin')
        return
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
        setIsLoading(false)
        return
      }
    }

    if (form.email.endsWith('@hospital.com')) {
      try {
        const res = await axios.post('https://blood-bank-eqyr.onrender.com/api/hospitals/login', {
          email: form.email,
          password: form.password
        })
        localStorage.setItem('hospitalToken', res.data.token)
        localStorage.setItem('hospitalData', JSON.stringify(res.data.hospital))
        navigate('/hospital/dashboard')
        setIsLoading(false)
        return
      } catch {
        setError('Invalid credentials. Please try again.')
        setIsLoading(false)
        return
      }
    }

    try {
      const res = await axios.post('https://blood-bank-eqyr.onrender.com/api/donors/login', {
        email: form.email,
        password: form.password
      })
      localStorage.setItem('donorToken', res.data.token)
      const donorData = { ...res.data.donor, is_eligible: false }
      localStorage.setItem('donorData', JSON.stringify(donorData))

      try {
        await axios.post('https://blood-bank-eqyr.onrender.com/api/analytics/event', {
          eventType: 'donor_login'
        })
      } catch (analyticsErr) {
        console.error('Analytics tracking failed:', analyticsErr)
      }

      navigate('/chatbot')
      setIsLoading(false)
      return
    } catch {
      setError('Invalid credentials. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="bc-login-root">
      <AnimatedBackgroundOrbs />

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px,3vw,44px)' }}>
        <div className="bc-login-grid" style={{ width: '100%', maxWidth: 1360, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 'clamp(32px,5vw,80px)', alignItems: 'center' }}>

          <div className="bc-left-column" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px,3vw,40px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8, y: visible ? 0 : 20 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="bc-glass" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 22px', borderRadius: 9999, width: 'fit-content' }}>
                <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#dc2626', opacity: 0.6, animation: 'pulse-ring 1.5s cubic-bezier(0,0,.2,1) infinite' }} />
                  <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10, borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 16px #dc2626' }} />
                </span>
                <span style={{ color: '#dc2626', fontWeight: 900, fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase' }}>
                  Secure Login
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            >
              <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(40px,5vw,60px)', lineHeight: 1.1, fontWeight: 900, color: '#6e2016', margin: 0 }}>
                Welcome Back,
                <motion.span
                  style={{
                    display: 'block',
                    background: 'linear-gradient(135deg,#dc2626,#fca5a5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Hero
                </motion.span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            >
              <p style={{ fontSize: 'clamp(15px,1.4vw,18px)', color: 'rgba(42,42,42,.65)', fontWeight: 500, maxWidth: 520, lineHeight: 1.8, margin: 0 }}>
                Track your blood donations, monitor your impact, and know you're saving lives in real time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="bc-glass" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 16, border: '1px solid rgba(180,180,180,.2)', width: 'fit-content' }}>
                <span style={{ fontSize: 16 }}>*</span>
                <span style={{ fontSize: 'clamp(11px,1vw,13px)', fontWeight: 600, color: 'rgba(56,1,1,.6)', lineHeight: 1.4 }}>
                  Health screening required at each login
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.25 },
                },
              }}
              initial="hidden"
              animate={visible ? "show" : "hidden"}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(12px,1.5vw,18px)' }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
                }}
              >
                <StatCard
                  icon={<svg viewBox="0 0 24 24" style={{ width: 22, height: 22, fill: '#dc2626' }}><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" /></svg>}
                  value="24k+"
                  label="Active Users"
                  delay={0}
                />
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
                }}
              >
                <StatCard
                  icon={<svg viewBox="0 0 24 24" style={{ width: 22, height: 22, fill: '#991b1b' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>}
                  value="142"
                  label="Lives Saved Today"
                  color="#991b1b"
                  delay={0.1}
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 8 }}
            >
              <div style={{ display: 'flex' }}>
                {['A+', 'O-', 'B+', 'AB+'].map((t, i) => (
                  <div key={t} className="bc-glass" style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(180,180,180,.2)', fontWeight: 900, fontSize: 11, color: '#dc2626', marginLeft: i === 0 ? 0 : -12, zIndex: 4 - i, boxShadow: '0 4px 12px rgba(220,38,38,.15)' }}>{t}</div>
                ))}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(56,1,1,.5)', textTransform: 'uppercase', letterSpacing: '.15em' }}>Network Match Active</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 60 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="bc-glass-deep bc-card-hover" style={{ borderRadius: 'clamp(28px,3.5vw,40px)', padding: 'clamp(32px,4vw,48px)', border: '1px solid rgba(91,115,151,.12)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#dc2626,transparent)' }} />

              <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'rgba(220,38,38,.08)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ display: 'flex', justifyContent: 'center', marginBottom: 'clamp(20px,3vw,32px)' }}
              >
                <BloodDropMini />
              </motion.div>

              <div style={{ textAlign: 'center', marginBottom: 'clamp(24px,3.5vw,36px)' }}>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 900, color: '#dc2626', margin: '0 0 8px', lineHeight: 1.1 }}>Welcome Back</h2>
                <p style={{ fontSize: 'clamp(11px,1.1vw,13px)', color: 'rgba(56,1,1,.6)', fontWeight: 600, margin: 0, letterSpacing: '.06em' }}>Sign in to your account</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    style={{ marginBottom: 'clamp(16px,2vw,24px)', overflow: 'hidden' }}
                  >
                    <div className="bc-glass" style={{ background: 'rgba(220,38,38,.08)', border: '1.5px solid rgba(220,38,38,.3)', padding: '12px 18px', borderRadius: 14, textAlign: 'center' }}>
                      <p style={{ fontSize: 'clamp(12px,1.1vw,14px)', fontWeight: 600, color: '#dc2626', margin: 0 }}>{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,20px)' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="bc-input"
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="bc-input"
                    style={{ paddingRight: 50 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(56,1,1,.5)', transition: 'all .2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(56,1,1,.5)'}
                  >
                    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}>
                      {showPassword ? (
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                      ) : (
                        <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
                      )}
                    </svg>
                  </button>
                </div>

                <div style={{ textAlign: 'right', marginTop: -6 }}>
                  <button 
                    type="button" 
                    onClick={() => navigate('/forgot-password')}
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", textDecoration: 'none', transition: 'all .2s' }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    Forgot password?
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="bc-btn bc-btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ padding: 'clamp(14px,1.6vw,18px) clamp(22px,3vw,32px)', borderRadius: 'clamp(14px,1.8vw,18px)', fontSize: 'clamp(13px,1.2vw,15px)', fontWeight: 700, position: 'relative', marginTop: 4 }}
                >
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    {isLoading ? (
                      <>
                        <motion.svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <circle cx="12" cy="12" r="10" fill="none" stroke="#faf7f7" strokeWidth="3" strokeDasharray="50" strokeLinecap="round" />
                        </motion.svg>
                        Signing in
                      </>
                    ) : (
                      <>
                        Sign In
                        <span>→</span>
                      </>
                    )}
                  </span>
                </motion.button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 'clamp(6px,1vw,12px) 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(180,180,180,.2),transparent)' }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(56,1,1,.4)', textTransform: 'uppercase', letterSpacing: '.15em' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(180,180,180,.2),transparent)' }} />
                </div>

                <p style={{ textAlign: 'center', fontSize: 'clamp(12px,1.1vw,14px)', color: 'rgba(56,1,1,.6)', fontWeight: 600, margin: 0 }}>
                  Don't have an account?{' '}
                  <span onClick={() => navigate('/donor/register')} style={{ color: '#dc2626', cursor: 'pointer', fontWeight: 900, textDecoration: 'none', transition: 'all .2s' }} onMouseEnter={(e) => e.target.style.textDecoration = 'underline'} onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>
                    Register as Donor
                  </span>
                </p>
              </form>

              <div style={{ marginTop: 'clamp(16px,2vw,24px)', textAlign: 'center' }}>
                <button
                  onClick={() => navigate('/emergency')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    transition: 'all .2s'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Emergency need? Find nearest hospital
                </button>
              </div>

              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg,transparent,rgba(255,235,238,.05))', pointerEvents: 'none', borderRadius: '0 0 clamp(28px,3.5vw,40px) clamp(28px,3.5vw,40px)' }} />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default Login