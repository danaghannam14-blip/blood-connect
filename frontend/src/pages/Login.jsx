import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const UNIFIED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }
  @keyframes pulse-glow { 0%,100% { box-shadow: 0 8px 20px rgba(220,38,38,.2); } 50% { box-shadow: 0 12px 30px rgba(220,38,38,.3); } }
  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes shimmer { 0%,100% { opacity:.5; } 50% { opacity:1; } }

  .login-root {
    min-height:100vh;
    background:linear-gradient(135deg,#f5f1ed 0%,#ede8e2 25%,#e8dfd5 50%,#f0ebe5 75%,#f5f1ed 100%);
    background-size:400% 400%;
    animation:gradient-shift 15s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
    color:#3d3d3d;
  }

  .login-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .login-glass {
    background:rgba(255,255,255,.7);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(200,180,160,.2);
    box-shadow:0 8px 32px rgba(0,0,0,.04);
  }

  .login-glass-deep {
    background:rgba(255,255,255,.65);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(200,180,160,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.05),inset 0 1px 1px rgba(255,255,255,.4);
  }

  .login-input {
    width:100%;
    padding:14px 20px;
    border-radius:12px;
    border:1.5px solid rgba(200,180,160,.2);
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:600;
    font-size:14px;
    color:#3d3d3d;
    outline:none;
    transition:all .3s cubic-bezier(.22,1,.36,1);
    box-shadow:inset 0 1px 1px rgba(255,255,255,.3);
  }

  .login-input::placeholder { color:rgba(61,61,61,.4); }

  .login-input:focus {
    border-color:rgba(201,42,42,.4);
    background:rgba(255,255,255,.75);
    box-shadow:0 8px 24px rgba(201,42,42,.15),inset 0 1px 1px rgba(255,255,255,.3);
  }

  .login-btn {
    position:relative;
    overflow:hidden;
    cursor:pointer;
    border:none;
    outline:none;
    transition:all .35s cubic-bezier(.25,1,.5,1);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
    border-radius:10px;
  }

  .login-btn::before {
    content:'';
    position:absolute;
    top:0;
    left:-100%;
    width:100%;
    height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
    transition:left .5s;
  }

  .login-btn:hover::before { left:100%; }

  .login-btn-primary {
    background:linear-gradient(135deg,#c92a2a 0%,#a01e1e 100%);
    color:#ffffff;
    box-shadow:0 10px 30px rgba(201,42,42,.3);
    border:none;
    position:relative;
    overflow:visible;
  }

  .login-btn-primary::after {
    content:'';
    position:absolute;
    inset:0;
    border-radius:10px;
    background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);
    pointer-events:none;
    opacity:0;
    transition:opacity .3s ease;
  }

  .login-btn-primary:hover {
    transform:translateY(-3px);
    box-shadow:0 16px 48px rgba(201,42,42,.35);
  }

  .login-btn-primary:hover::after {
    opacity:1;
  }

  .login-btn-secondary {
    background:rgba(255,255,255,.7);
    border:1.5px solid rgba(200,180,160,.3);
    color:#3d3d3d;
    box-shadow:0 4px 12px rgba(0,0,0,.08);
  }

  .login-btn-secondary:hover {
    background:rgba(255,255,255,.85);
    border-color:rgba(200,180,160,.5);
    transform:translateY(-2px);
  }

  .login-card-hover {
    transition:all .4s cubic-bezier(.22,1,.36,1);
  }

  .login-card-hover:hover {
    transform:translateY(-8px);
    box-shadow:0 32px 80px rgba(201,42,42,.15) !important;
  }

  @media (max-width:1024px) {
    .login-left { display:none !important; }
    .login-grid { grid-template-columns:1fr !important; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('login-styles')) {
  const s = document.createElement('style')
  s.id = 'login-styles'
  s.textContent = UNIFIED_STYLES
  document.head.appendChild(s)
}

function AnimatedBackgroundOrbs() {
  const orbs = [
    { size: 'min(400px,35vw)', color: 'rgba(220,38,38,.06)', top: '-10%', left: '-8%', duration: 12 },
    { size: 'min(350px,30vw)', color: 'rgba(155,155,155,.04)', top: '25%', right: '-10%', duration: 15 },
    { size: 'min(380px,32vw)', color: 'rgba(220,38,38,.05)', bottom: '-15%', left: '10%', duration: 18 },
    { size: 'min(320px,28vw)', color: 'rgba(155,155,155,.03)', bottom: '10%', right: '-8%', duration: 14 },
  ]

  return (
    <motion.div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="login-float-orb"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.color,
            top: orb.top,
            right: orb.right,
            left: orb.left,
            bottom: orb.bottom,
          }}
          animate={{ y: [0, -60, 0], x: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </motion.div>
  )
}

function AnimatedBloodDrop() {
  return (
    <motion.div
      style={{ position: 'relative', width: 120, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 130" style={{ width: 100, height: 130, filter: 'drop-shadow(0 12px 28px rgba(201,42,42,.35))' }}>
        <defs>
          <linearGradient id="loginBloodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="50%" stopColor="#c92a2a" />
            <stop offset="100%" stopColor="#8a1515" />
          </linearGradient>
          <linearGradient id="loginHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="loginDropGlow" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill="url(#loginBloodGrad)" />
        <ellipse cx="32" cy="65" rx="18" ry="25" fill="url(#loginHighlight)" />
        <ellipse cx="50" cy="50" rx="28" ry="35" fill="url(#loginDropGlow)" />
      </svg>

      <motion.div
        style={{
          position: 'absolute',
          inset: '20%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,42,42,.4), transparent)',
          filter: 'blur(25px)',
          zIndex: -1,
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
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
    setTimeout(() => setVisible(true), 100)
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
        setError(err.response?.data?.message || 'Invalid credentials.')
        setIsLoading(false)
        return
      }
    }

    // ✅ FIXED: Hospital login now includes governorate
    if (form.email.endsWith('@hospital.com')) {
      try {
        const res = await axios.post('https://blood-bank-eqyr.onrender.com/api/hospitals/login', {
          email: form.email,
          password: form.password
        })
        
        // ✅ Ensure hospital data includes governorate field
        const hospitalData = {
          ...res.data.hospital,
          governorate: res.data.hospital.governorate || ''
        }
        
        console.log('[Hospital Login] ✅ Hospital data with governorate:', {
          id: hospitalData.id,
          name: hospitalData.name,
          governorate: hospitalData.governorate
        })
        
        localStorage.setItem('hospitalToken', res.data.token)
        localStorage.setItem('hospitalData', JSON.stringify(hospitalData))
        navigate('/hospital/dashboard')
        setIsLoading(false)
        return
      } catch (err) {
        console.error('[Hospital Login] ❌ Error:', err)
        setError(err.response?.data?.message || 'Invalid credentials.')
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
      setError('Invalid credentials.')
      setIsLoading(false)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
    },
  }

  return (
    <div className="login-root">
      <AnimatedBackgroundOrbs />

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px,4vw,48px)' }}>
        <div className="login-grid" style={{ width: '100%', maxWidth: 1360, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 'clamp(40px,6vw,80px)', alignItems: 'center' }}>

          {/* LEFT SIDE - ELEGANT BRANDING */}
          <motion.div
            className="login-left"
            style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(28px,4vw,48px)' }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -50 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {/* Animated Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AnimatedBloodDrop />
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={item}>
              <h1 style={{
                fontFamily: "'Fraunces',serif",
                fontSize: 'clamp(42px,5vw,64px)',
                fontWeight: 900,
                color: '#6e2016',
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
              }}>
                Save Lives,
                <motion.span
                  style={{
                    display: 'block',
                    background: 'linear-gradient(135deg,#c92a2a,#ff6b6b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Every Second
                </motion.span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div variants={item}>
              <p style={{
                fontSize: 'clamp(15px,1.4vw,18px)',
                color: 'rgba(61,61,61,.7)',
                fontWeight: 500,
                maxWidth: 500,
                lineHeight: 1.8,
                margin: 0,
              }}>
                Sign in to access your donor dashboard, track your donations, and see the real impact of your compassion.
              </p>
            </motion.div>

            {/* Animated Journey Steps */}
            <motion.div
              variants={container}
              initial="hidden"
              animate={visible ? "show" : "hidden"}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {[
                { number: '01', title: 'Register', description: 'Create your profile in minutes' },
                { number: '02', title: 'Verify', description: 'Complete health screening' },
                { number: '03', title: 'Donate', description: 'Save lives in your community' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    padding: '20px 22px',
                    borderRadius: 16,
                    border: '1px solid rgba(200,180,160,.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,.4)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {/* Cute floating background */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at top right, rgba(201,42,42,.08), transparent)',
                      pointerEvents: 'none',
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                  />

                  {/* Step Number with pulse */}
                  <motion.div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: '#c92a2a',
                      fontFamily: "'Fraunces',serif",
                      position: 'relative',
                      zIndex: 1,
                      minWidth: 40,
                    }}
                    animate={{ 
                      scale: [1, 1.15, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
                  >
                    {step.number}
                  </motion.div>

                  {/* Cute divider with gradient */}
                  <motion.div
                    style={{
                      width: 2,
                      height: 45,
                      background: 'linear-gradient(180deg, rgba(201,42,42,.4), rgba(201,42,42,.1))',
                      borderRadius: 1,
                    }}
                    animate={{ 
                      scaleY: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                  />

                  {/* Text Content */}
                  <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    <motion.div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#3d3d3d',
                        marginBottom: 4,
                      }}
                      animate={{ x: [0, 2, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                    >
                      {step.title}
                    </motion.div>
                    <div style={{
                      fontSize: 12,
                      color: 'rgba(61,61,61,.55)',
                      fontWeight: 500,
                    }}>
                      {step.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE - LOGIN FORM */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 60 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="login-glass-deep login-card-hover" style={{
              borderRadius: 'clamp(24px,3vw,32px)',
              padding: 'clamp(40px,5vw,56px)',
              border: '1px solid rgba(200,180,160,.25)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative top line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#c92a2a,transparent)' }} />

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,4vw,40px)' }}>
                <motion.h2
                  style={{
                    fontFamily: "'Fraunces',serif",
                    fontSize: 'clamp(28px,3.5vw,40px)',
                    fontWeight: 900,
                    color: '#6e2016',
                    margin: '0 0 8px',
                    lineHeight: 1.1,
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Welcome Back
                </motion.h2>
                <p style={{ fontSize: 'clamp(12px,1.1vw,14px)', color: 'rgba(61,61,61,.6)', fontWeight: 600, margin: 0, letterSpacing: '0.5px' }}>
                  Sign in to continue
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -15, height: 0 }}
                    style={{ marginBottom: 'clamp(16px,2vw,24px)', overflow: 'hidden' }}
                  >
                    <div className="login-glass" style={{
                      background: 'rgba(201,42,42,.08)',
                      border: '1.5px solid rgba(201,42,42,.3)',
                      padding: '12px 16px',
                      borderRadius: 12,
                      textAlign: 'center',
                    }}>
                      <p style={{ fontSize: 'clamp(12px,1.1vw,14px)', fontWeight: 600, color: '#c92a2a', margin: 0 }}>
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,20px)' }}>
                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  style={{ position: 'relative' }}
                >
                  <label style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'rgba(61,61,61,.6)',
                    display: 'block',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="donor@bloodconnect.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="login-input"
                  />
                </motion.div>

                {/* Password Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  style={{ position: 'relative' }}
                >
                  <label style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'rgba(61,61,61,.6)',
                    display: 'block',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Password
                  </label>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="login-input"
                    style={{ paddingRight: 50 }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: 'rgba(61,61,61,.5)',
                      transition: 'all .2s',
                      fontSize: 18,
                    }}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </motion.button>
                </motion.div>

                {/* Forgot Password Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  style={{ textAlign: 'right', marginTop: -8 }}
                >
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c92a2a',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                      transition: 'all .2s',
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Forgot password?
                  </button>
                </motion.div>

                {/* Sign In Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="login-btn login-btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  style={{
                    padding: 'clamp(14px,1.8vw,18px)',
                    borderRadius: 'clamp(10px,1.2vw,12px)',
                    fontSize: 'clamp(13px,1.1vw,15px)',
                    fontWeight: 700,
                    marginTop: 8,
                    position: 'relative',
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    {isLoading ? (
                      <>
                        <motion.svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <circle cx="12" cy="12" r="10" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="50" strokeLinecap="round" />
                        </motion.svg>
                        Signing In
                      </>
                    ) : (
                      <>
                        Sign In
                        <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                          →
                        </motion.span>
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 'clamp(8px,1.5vw,16px) 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(200,180,160,.2),transparent)' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(61,61,61,.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(200,180,160,.2),transparent)' }} />
                </div>

                {/* Register Link */}
                <p style={{ textAlign: 'center', fontSize: 'clamp(12px,1.1vw,14px)', color: 'rgba(61,61,61,.6)', fontWeight: 600, margin: 0 }}>
                  Don't have an account?{' '}
                  <span
                    onClick={() => navigate('/donor/register')}
                    style={{
                      color: '#c92a2a',
                      cursor: 'pointer',
                      fontWeight: 900,
                      textDecoration: 'none',
                      transition: 'all .2s',
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Register Now
                  </span>
                </p>

              
              </form>

              {/* Decorative bottom gradient */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg,transparent,rgba(255,235,238,.05))', pointerEvents: 'none', borderRadius: '0 0 clamp(24px,3vw,32px) clamp(24px,3vw,32px)' }} />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default Login