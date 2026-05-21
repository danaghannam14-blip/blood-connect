import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Injected Styles (matching Home.jsx) ─────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  @keyframes bc-ping      { 75%,100% { transform:scale(2.2); opacity:0; } }
  @keyframes bc-pulse     { 0%,100%  { opacity:1; } 50% { opacity:.4; } }
  @keyframes bc-float     { 0%,100%  { transform:translateY(0) translateX(0); } 33% { transform:translateY(-18px) translateX(10px); } 66% { transform:translateY(10px) translateX(-12px); } }
  @keyframes bc-float-b   { 0%,100%  { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes bc-float-c   { 0%,100%  { transform:translateY(0); } 50% { transform:translateY(8px); } }
  @keyframes bc-spin8     { to { transform:rotate(360deg); } }
  @keyframes bc-spin30    { to { transform:rotate(360deg); } }
  @keyframes bc-hb        { 0%,100% { transform:scale(1); } 14% { transform:scale(1.18); } 28% { transform:scale(1); } 42% { transform:scale(1.15); } }
  @keyframes bc-particle  { 0%,100% { transform:translateY(0) translateX(0) scale(1); opacity:.3; } 50% { transform:translateY(-28px) translateX(var(--px,6px)) scale(1.2); opacity:.8; } }
  @keyframes bc-orb       { 0%,100% { transform:translateY(0) translateX(0) scale(1); } 33% { transform:translateY(-30px) translateX(20px) scale(1.08); } 66% { transform:translateY(8px) translateX(-10px) scale(.96); } }
  @keyframes bc-shimmer   { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
  @keyframes bc-gradient  { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes bc-heartbeat-path { to { stroke-dashoffset:0; } }
  @keyframes bc-drop-bob  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes bc-orbit { 0% { transform:rotate(0deg) translateX(60px) rotate(0deg); } 100% { transform:rotate(360deg) translateX(60px) rotate(-360deg); } }

  .bc-login-root {
    min-height:100vh;
    background:linear-gradient(-45deg,#f8f8f8,#efefef,#f8f8f8,rgba(64,88,120,.2));
    background-size:400% 400%;
    animation:bc-gradient 14s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
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
    position:absolute;
    border-radius:50%;
    filter:blur(100px);
    pointer-events:none;
    animation:bc-orb var(--dur,8s) ease-in-out infinite; 
  }

  .bc-particle { 
    position:absolute;
    border-radius:50%;
    pointer-events:none;
    animation:bc-particle var(--dur,5s) ease-in-out infinite; 
  }

  .bc-input-wrap {
    position:relative;
    transition:all .28s cubic-bezier(.22,1,.36,1);
  }

  .bc-input-wrap:hover { transform:translateY(-2px); }

  .bc-input {
    width:100%;
    padding:clamp(14px,1.5vw,18px) clamp(18px,2vw,22px);
    border-radius:clamp(14px,1.8vw,18px);
    border:2px solid rgba(211,47,47,.15);
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
    font-size:clamp(13px,1.2vw,15px);
    color:#dc2626;
    outline:none;
    transition:all .28s cubic-bezier(.22,1,.36,1);
    box-shadow:inset 0 2px 8px rgba(211,47,47,.04);
  }

  .bc-input::placeholder { color:rgba(211,47,47,.35); }

  .bc-input:focus {
    border-color:rgba(211,47,47,.5);
    background:rgba(255,255,255,.72);
    box-shadow:0 8px 24px rgba(211,47,47,.12),inset 0 2px 8px rgba(211,47,47,.06);
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
    background:linear-gradient(135deg,#dc2626,#ff6b6b);
    color:#faf7f7;
    box-shadow:0 12px 32px rgba(211,47,47,.32);
  }
  .bc-btn-primary:hover { box-shadow:0 18px 48px rgba(211,47,47,.44); }

  .bc-card-hover { 
    transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s; 
  }
  .bc-card-hover:hover { 
    transform:translateY(-4px) scale(1.01);
    box-shadow:0 20px 50px rgba(211,47,47,.15) !important; 
  }
`

if (typeof document !== 'undefined' && !document.getElementById('bc-login-styles')) {
  const s = document.createElement('style')
  s.id = 'bc-login-styles'
  s.textContent = STYLES
  document.head.appendChild(s)
}

/* ─── Particle Field ─────────────────────────────────────── */
function ParticleField() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    w: Math.random() * 5 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: (Math.random() * 4 + 3).toFixed(1),
    delay: -(Math.random() * 4).toFixed(1),
    px: ((Math.random() * 20 - 10).toFixed(0)) + 'px',
    color: i % 3 === 0 ? 'rgba(211,47,47,.35)' : i % 3 === 1 ? 'rgba(64,88,120,.45)' : 'rgba(255,235,238,.7)',
  }))

  return (
    <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {particles.map(p => (
        <div
          key={p.id}
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
    </div>
  )
}

/* ─── Creative Animated Blood Drop ──────────────────────────── */
function BloodDropMini() {
  return (
    <div style={{ position:'relative', width:140, height:160, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <circle cx="50%" cy="50%" r="20" fill="none" stroke="rgba(211,47,47,.25)" strokeWidth="2" opacity="0.8">
          <animate attributeName="r" values="20;55;20" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50%" cy="50%" r="20" fill="none" stroke="rgba(211,47,47,.15)" strokeWidth="2" opacity="0.5">
          <animate attributeName="r" values="15;50;15" dur="3.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0;0.8" dur="3.5s" repeatCount="indefinite"/>
        </circle>
      </svg>

      <div style={{ position:'relative', zIndex:2, animation:'bc-drop-bob 3s ease-in-out infinite' }}>
        <svg viewBox="0 0 100 130" style={{ width:80, height:100, filter:'drop-shadow(0 12px 28px rgba(211,47,47,.4))' }}>
          <defs>
            <linearGradient id="bcBloodGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b"/>
              <stop offset="50%" stopColor="#dc2626"/>
              <stop offset="100%" stopColor="#7f1d1d"/>
            </linearGradient>
            <linearGradient id="bcHighlightLogin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#faf7f7" stopOpacity=".7"/>
              <stop offset="100%" stopColor="#faf7f7" stopOpacity="0"/>
            </linearGradient>
            <radialGradient id="bcDropGlow" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#faf7f7" stopOpacity=".4"/>
              <stop offset="100%" stopColor="#faf7f7" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill="url(#bcBloodGradLogin)"/>
          <ellipse cx="32" cy="65" rx="18" ry="25" fill="url(#bcHighlightLogin)"/>
          <ellipse cx="50" cy="50" rx="28" ry="35" fill="url(#bcDropGlow)"/>
          <path d="M50 15 C50 15 85 65 85 85 C85 105 70 120 50 120 C30 120 15 105 15 85 C15 65 50 15 50 15 Z" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>
        </svg>
      </div>

      <div style={{ position:'absolute', inset:'30%', borderRadius:'50%', background:'radial-gradient(circle, rgba(211,47,47,.3), transparent)', filter:'blur(20px)', animation:'bc-hb 2s ease-in-out infinite', zIndex:1 }}/>
    </div>
  )
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon, value, label, color = '#dc2626', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      className="bc-glass bc-card-hover"
      style={{ borderRadius:'clamp(18px,2.5vw,28px)', padding:'clamp(16px,2vw,24px)', border:'2px solid rgba#991b1b', position:'relative', overflow:'hidden' }}
    >
      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, background:'rgba(255,235,238,.5)', borderRadius:'50%', filter:'blur(30px)', pointerEvents:'none' }}/>
      <div style={{ display:'flex', alignItems:'center', gap:14, position:'relative', zIndex:1 }}>
        <div style={{ width:48, height:48, background:`rgba(${color === '#dc2626' ? '211,47,47' : '64,88,120'},.1)`, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize:'clamp(20px,2.5vw,28px)', fontWeight:900, color, margin:0, lineHeight:1 }}>{value}</p>
          <p style={{ fontSize:9, fontWeight:900, color:'rgba(211,47,47,.4)', textTransform:'uppercase', letterSpacing:'.2em', margin:'4px 0 0', lineHeight:1 }}>{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main Login Component ───────────────────────────────── */
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

    // Admin login
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

    // Hospital login
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

    // Donor login — redirect to chatbot for health screening every session
    try {
      const res = await axios.post('https://blood-bank-eqyr.onrender.com/api/donors/login', {
        email: form.email,
        password: form.password
      })
      localStorage.setItem('donorToken', res.data.token)
      // is_eligible is always false from the server after login reset,
      // but set it explicitly so the chatbot guard works correctly
      const donorData = { ...res.data.donor, is_eligible: false }
      localStorage.setItem('donorData', JSON.stringify(donorData))

      // Track donor login for analytics
      try {
        await axios.post('https://blood-bank-eqyr.onrender.com/api/analytics/event', {
          eventType: 'donor_login'
        })
        console.log('✅ Donor login tracked for analytics')
      } catch (analyticsErr) {
        console.error('Analytics tracking failed:', analyticsErr)
        // Don't block login if analytics fails
      }

      // Always route donors through health screening before dashboard
      navigate('/chatbot')
      setIsLoading(false)
      return
    } catch {
      setError('Invalid credentials. Please try again.')
      setIsLoading(false)
    }
  }

  const fadeUp = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
  })

  return (
    <div className="bc-login-root">
      <ParticleField />

      {/* Orbs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[
          { t:'8%', l:'8%', w:'min(420px,36vw)', c:'rgba(211,47,47,.17)', d:'0s' },
          { b:'18%', r:'8%', w:'min(480px,40vw)', c:'rgba(64,88,120,.15)', d:'-2s' },
          { t:'45%', r:'18%', w:'min(320px,28vw)', c:'rgba(255,235,238,.45)', d:'-5s' },
        ].map((o, i) => (
          <div key={i} className="bc-orb" style={{ '--dur':'8s', width:o.w, height:o.w, background:o.c, top:o.t, bottom:o.b, left:o.l, right:o.r, animationDelay:o.d }}/>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ position:'relative', zIndex:10, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(16px,3vw,44px)' }}>
        <div style={{ width:'100%', maxWidth:1180, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(32px,5vw,80px)', alignItems:'center' }}>

          {/* Left Column - Hero Content */}
          <div style={{ display:'flex', flexDirection:'column', gap:'clamp(20px,3vw,40px)' }}>
            
            {/* Badge */}
            <div style={fadeUp(0)}>
              <div className="bc-glass" style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'8px 20px', borderRadius:9999, width:'fit-content', border:'1px solid rgba(211,47,47,.15)' }}>
                <span style={{ position:'relative', display:'inline-flex', width:12, height:12 }}>
                  <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#dc2626', opacity:.75, animation:'bc-ping 1.2s cubic-bezier(0,0,.2,1) infinite' }}/>
                  <span style={{ position:'relative', display:'inline-flex', width:12, height:12, borderRadius:'50%', background:'#dc2626', boxShadow:'0 0 12px #dc2626' }}/>
                </span>
                <span style={{ color:'#dc2626', fontWeight:900, fontSize:'clamp(8px,.85vw,10px)', letterSpacing:'.2em', textTransform:'uppercase' }}>ENCRYPTED LOGIN</span>
              </div>
            </div>

            {/* Title */}
            <div style={fadeUp(.1)}>
              <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(36px,5vw,64px)', lineHeight:.95, fontWeight:900, color:'#dc2626', margin:0 }}>
                Welcome Back,<br/>
                <em style={{ color:'#991b1b', fontStyle:'italic' }}>Hero</em>
              </h1>
            </div>

            <div style={fadeUp(.2)}>
              <p style={{ fontSize:'clamp(13px,1.3vw,16px)', color:'rgba(211,47,47,.7)', fontWeight:600, maxWidth:480, lineHeight:1.65, margin:0 }}>
                Access your dashboard to track donations, schedule appointments, and see your life-saving impact in real-time.
              </p>
            </div>

            {/* Health screening notice */}
            <div style={fadeUp(.25)}>
              <div className="bc-glass" style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'10px 18px', borderRadius:14, border:'1.5px solid rgba(211,47,47,.18)', width:'fit-content' }}>
                <span style={{ fontSize:16 }}>🩺</span>
                <span style={{ fontSize:'clamp(10px,1vw,12px)', fontWeight:700, color:'rgba(211,47,47,.7)', lineHeight:1.4 }}>
                  A quick health screening is required<br/>each login before you can donate.
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ ...fadeUp(.3), display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(12px,1.5vw,18px)' }}>
              <StatCard
                icon={<svg viewBox="0 0 24 24" style={{ width:22, height:22, fill:'#dc2626' }}><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>}
                value="24k+"
                label="Active Users"
                delay={0.4}
              />
              <StatCard
                icon={<svg viewBox="0 0 24 24" style={{ width:22, height:22, fill:'#991b1b' }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
                value="142"
                label="Lives Saved Today"
                color="#991b1b"
                delay={0.5}
              />
            </div>

            {/* Visual Element */}
            <div style={{ ...fadeUp(.4), display:'flex', alignItems:'center', gap:16, paddingTop:8 }}>
              <div style={{ display:'flex' }}>
                {['A+','O-','B+','AB+'].map((t, i) => (
                  <div key={t} className="bc-glass" style={{ width:44, height:44, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(211,47,47,.2)', fontWeight:900, fontSize:11, color:'#dc2626', marginLeft: i === 0 ? 0 : -12, zIndex:4 - i, boxShadow:'0 4px 12px rgba#991b1b' }}>{t}</div>
                ))}
              </div>
              <span style={{ fontSize:9, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.18em' }}>Network Match Active</span>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div style={fadeUp(.2)}>
            <div className="bc-glass-deep bc-card-hover" style={{ borderRadius:'clamp(32px,4vw,48px)', padding:'clamp(32px,4.5vw,56px)', border:'2px solid rgba(211,47,47,.12)', position:'relative', overflow:'hidden' }}>
              
              {/* Top gradient accent */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#dc2626,transparent)' }}/>

              {/* Floating orb inside card */}
              <div style={{ position:'absolute', top:-40, right:-40, width:140, height:140, background:'rgba(255,235,238,.6)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' }}/>

              {/* Creative Blood Drop Icon */}
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'clamp(20px,3vw,32px)' }}>
                <BloodDropMini />
              </div>

              {/* Title */}
              <div style={{ textAlign:'center', marginBottom:'clamp(24px,3.5vw,36px)' }}>
                <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(26px,3.5vw,38px)', fontWeight:900, color:'#dc2626', margin:'0 0 8px', lineHeight:1.1 }}>Welcome Back</h2>
                <p style={{ fontSize:'clamp(11px,1.1vw,13px)', color:'rgba(211,47,47,.6)', fontWeight:700, margin:0, letterSpacing:'.06em' }}>Sign in to your account</p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    style={{ marginBottom:'clamp(16px,2vw,24px)', overflow:'hidden' }}
                  >
                    <div className="bc-glass" style={{ background:'rgba(255,235,238,.7)', border:'2px solid rgba(211,47,47,.3)', padding:'12px 18px', borderRadius:14, textAlign:'center' }}>
                      <p style={{ fontSize:'clamp(12px,1.1vw,14px)', fontWeight:700, color:'#dc2626', margin:0 }}>{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'clamp(14px,1.8vw,20px)' }}>
                
                {/* Email */}
                <div className="bc-input-wrap">
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

                {/* Password */}
                <div className="bc-input-wrap" style={{ position:'relative' }}>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="bc-input"
                    style={{ paddingRight:50 }}
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

                {/* Forgot password */}
                <div style={{ textAlign:'right', marginTop:-6 }}>
                  <button 
                    type="button" 
                    onClick={() => navigate('/forgot-password')}
                    style={{ background:'none', border:'none', color:'#dc2626', fontSize:11, fontWeight:700, cursor:'pointer', textDecoration:'underline', fontFamily:"'Plus Jakarta Sans',sans-serif" }}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bc-btn bc-btn-primary"
                  style={{ padding:'clamp(14px,1.6vw,18px) clamp(22px,3vw,32px)', borderRadius:'clamp(14px,1.8vw,18px)', fontSize:'clamp(13px,1.2vw,15px)', fontWeight:900, position:'relative', marginTop:4 }}
                >
                  <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                    {isLoading ? (
                      <>
                        <svg viewBox="0 0 24 24" style={{ width:18, height:18, animation:'bc-spin8 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" fill="none" stroke="#faf7f7" strokeWidth="3" strokeDasharray="50" strokeLinecap="round"/>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In to Dashboard
                        <span style={{ fontSize:16 }}>→</span>
                      </>
                    )}
                  </span>
                </button>

                {/* Divider */}
                <div style={{ display:'flex', alignItems:'center', gap:12, margin:'clamp(6px,1vw,12px) 0' }}>
                  <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,rgba(211,47,47,.15),transparent)' }}/>
                  <span style={{ fontSize:9, fontWeight:900, color:'rgba(211,47,47,.3)', textTransform:'uppercase', letterSpacing:'.2em' }}>or</span>
                  <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,rgba(211,47,47,.15),transparent)' }}/>
                </div>

                {/* Register */}
                <p style={{ textAlign:'center', fontSize:'clamp(12px,1.1vw,14px)', color:'rgba(211,47,47,.65)', fontWeight:700, margin:0 }}>
                  Don't have an account?{' '}
                  <span onClick={() => navigate('/donor/register')} style={{ color:'#dc2626', cursor:'pointer', fontWeight:900, textDecoration:'underline' }}>
                    Register as Donor
                  </span>
                </p>
              </form>

              {/* Emergency Link */}
              <div style={{ marginTop:'clamp(16px,2vw,24px)', textAlign:'center' }}>
                <button onClick={() => navigate('/emergency')} style={{ background:'none', border:'none', color:'#dc2626', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  🚨 Emergency? Find nearest hospital
                </button>
              </div>

              {/* Bottom decoration */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(180deg,transparent,rgba(255,235,238,.2))', pointerEvents:'none', borderRadius:'0 0 clamp(32px,4vw,48px) clamp(32px,4vw,48px)' }}/>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 960px) {
          .bc-login-root > div > div > div:first-child {
            display: none !important;
          }
          .bc-login-root > div > div {
            grid-template-columns: 1fr !important;
            max-width: 520px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Login