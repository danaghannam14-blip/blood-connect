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
  @keyframes bc-blood-float { 0%,100% { transform:translateY(0) rotate(0deg); } 25% { transform:translateY(-40px) rotate(90deg); } 50% { transform:translateY(-20px) rotate(180deg); } 75% { transform:translateY(-60px) rotate(270deg); } }
  @keyframes bc-dna-spin { to { transform:translateY(-100%) rotate(360deg); } }
  @keyframes bc-heartbeat { 0%,100% { transform:scale(1) translateY(0); opacity:.6; } 10% { transform:scale(1.3) translateY(-5px); opacity:1; } 20% { transform:scale(1) translateY(0); opacity:.6; } 30% { transform:scale(1.15) translateY(-3px); opacity:.9; } }

  .bc-register-root {
    min-height:100vh;
    background:linear-gradient(-45deg,#f8f8f8,#efefef,#e8e8e8,rgba(136,189,242,.25),#f2f2f2);
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
    color:#dc2626;
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
    background:linear-gradient(135deg,#dc2626,#ff6b6b);
    color:#faf7f7;
    box-shadow:0 12px 32px rgba(211,47,47,.32);
  }
  .bc-btn-primary:hover { box-shadow:0 18px 48px rgba(211,47,47,.44); }
`

if (typeof document !== 'undefined' && !document.getElementById('bc-forgot-styles')) {
  const s = document.createElement('style')
  s.id = 'bc-forgot-styles'
  s.textContent = STYLES
  document.head.appendChild(s)
}

/* ─── Animated Background Elements ───────────────────────── */
function AnimatedBackground() {
  const bloodCells = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 30 + 40,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: (Math.random() * 8 + 10).toFixed(1),
    delay: -(Math.random() * 8).toFixed(1),
  }))

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

      {[...Array(3)].map((_, i) => (
        <div
          key={`dna-${i}`}
          style={{
            position:'fixed',
            left:`${20 + i * 30}%`,
            top:0,
            width:2,
            height:'100vh',
            background:'linear-gradient(180deg,transparent,rgba#991b1b,transparent,rgba(136,189,242,.1),transparent)',
            animation:`bc-dna-spin ${25 + i * 5}s linear infinite`,
            animationDelay:`-${i * 8}s`,
          }}
        />
      ))}

      <svg viewBox="0 0 1200 200" style={{ position:'fixed', top:'15%', left:0, width:'100%', height:'200px', opacity:.15, zIndex:-1 }}>
        <path d="M0,100 L200,100 L220,60 L240,140 L260,100 L1200,100" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" from="0" to="2400" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".3;.6;.3" dur="1.5s" repeatCount="indefinite"/>
        </path>
      </svg>

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

      <div style={{ position:'fixed', bottom:0, left:0, width:'200%', height:300, opacity:.4, zIndex:-1 }}>
        <svg viewBox="0 0 2400 300" style={{ width:'100%', height:'100%' }}>
          <path d="M0,100 Q300,50 600,100 T1200,100 T1800,100 T2400,100 L2400,300 L0,300 Z" fill="url(#waveGrad1)" opacity=".3">
            <animate attributeName="d" dur="12s" repeatCount="indefinite"
              values="M0,100 Q300,50 600,100 T1200,100 T1800,100 T2400,100 L2400,300 L0,300 Z;M0,100 Q300,150 600,100 T1200,100 T1800,100 T2400,100 L2400,300 L0,300 Z;M0,100 Q300,50 600,100 T1200,100 T1800,100 T2400,100 L2400,300 L0,300 Z"/>
          </path>
          <path d="M0,150 Q400,100 800,150 T1600,150 T2400,150 L2400,300 L0,300 Z" fill="url(#waveGrad2)" opacity=".2">
            <animate attributeName="d" dur="15s" repeatCount="indefinite"
              values="M0,150 Q400,100 800,150 T1600,150 T2400,150 L2400,300 L0,300 Z;M0,150 Q400,200 800,150 T1600,150 T2400,150 L2400,300 L0,300 Z;M0,150 Q400,100 800,150 T1600,150 T2400,150 L2400,300 L0,300 Z"/>
          </path>
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity=".2"/>
              <stop offset="100%" stopColor="#ff6b6b" stopOpacity=".05"/>
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#88bdf2" stopOpacity=".15"/>
              <stop offset="100%" stopColor="#88bdf2" stopOpacity=".02"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

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

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await axios.post(`${API}/api/password/forgot`, { email })
      // Success - immediately show success view
      setSubmitted(true)
      setEmail('')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bc-register-root">
      <AnimatedBackground />

      <div style={{ position:'relative', zIndex:10, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(20px,4vw,60px) clamp(16px,3vw,40px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
          transition={{ duration: 0.6 }}
          style={{ width:'100%', maxWidth:600 }}
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
              <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg viewBox="0 0 100 130" style={{ width:32, height:32, fill:'#faf7f7' }}>
                  <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z"/>
                </svg>
              </div>
            </motion.div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(32px,5vw,52px)', fontWeight:900, color:'#dc2626', margin:0, lineHeight:1.1 }}>
              Reset Password
            </h1>
            <p style={{ fontSize:'clamp(13px,1.3vw,15px)', color:'rgba(211,47,47,.65)', fontWeight:700, marginTop:12, letterSpacing:'.04em' }}>
              Enter your email to receive a reset link
            </p>
          </div>

          {/* Main Card */}
          <div className="bc-glass-deep" style={{ borderRadius:'clamp(28px,4vw,44px)', padding:'clamp(28px,4vw,48px)', border:'2px solid rgba#991b1b', position:'relative', overflow:'hidden' }}>
            
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,#dc2626,#88bdf2,transparent)' }}/>
            <div style={{ position:'absolute', top:-40, right:-40, width:140, height:140, background:'rgba(255,235,238,.6)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' }}/>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bc-glass"
                      style={{ background:'rgba(255,235,238,.8)', border:'2px solid rgba(211,47,47,.4)', padding:14, borderRadius:16, marginBottom:20, textAlign:'center' }}
                    >
                      <p style={{ fontSize:13, fontWeight:700, color:'#dc2626', margin:0 }}>{error}</p>
                    </motion.div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    style={{ display:'flex', flexDirection:'column', gap:18, position:'relative', zIndex:1 }}
                  >
                    <div>
                      <label style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:8, display:'block' }}>Email Address *</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bc-input"
                        disabled={loading}
                        required
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bc-btn bc-btn-primary"
                      style={{
                        padding:'14px 24px',
                        borderRadius:14,
                        fontSize:14,
                        fontWeight:900,
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        gap:10,
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ width:18, height:18, border:'3px solid rgba(255,255,255,.3)', borderTopColor:'#faf7f7', borderRadius:'50%' }}
                          />
                          Sending Link...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => navigate('/login')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bc-btn"
                      style={{
                        padding:'12px 20px',
                        borderRadius:14,
                        fontSize:13,
                        fontWeight:700,
                        color:'#dc2626',
                        background:'rgba(255,255,255,.5)',
                        border:'2px solid rgba(211,47,47,.2)',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        gap:8,
                      }}
                    >
                      ← Back to Login
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, position:'relative', zIndex:1, textAlign:'center' }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width:80,
                      height:80,
                      borderRadius:'50%',
                      background:'linear-gradient(135deg, #22c55e, #22c55e40)',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      fontSize:40,
                      boxShadow:'0 12px 32px rgba(34,197,94,.3)',
                    }}
                  >
                    ✓
                  </motion.div>

                  <div>
                    <h3 style={{ fontSize:20, fontWeight:900, color:'#dc2626', margin:'0 0 8px', fontFamily:"'Fraunces',serif" }}>Check Your Email</h3>
                    <p style={{ fontSize:13, color:'rgba(211,47,47,.65)', fontWeight:600, margin:0, lineHeight:1.6 }}>
                      We've sent a password reset link to your email. Click it to create a new password.
                    </p>
                  </div>

                  <div className="bc-glass" style={{ background:'rgba(255,235,238,.4)', border:'2px solid rgba(211,47,47,.15)', borderRadius:16, padding:14, width:'100%' }}>
                    <p style={{ fontSize:11, color:'rgba(211,47,47,.6)', margin:0, fontWeight:700 }}>Didn't receive it? Check spam or try again with another email.</p>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bc-btn"
                    style={{
                      padding:'12px 20px',
                      borderRadius:14,
                      fontSize:13,
                      fontWeight:700,
                      color:'#dc2626',
                      background:'rgba(255,255,255,.5)',
                      border:'2px solid rgba(211,47,47,.2)',
                      width:'100%',
                    }}
                  >
                    Try Another Email
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bc-btn bc-btn-primary"
                    style={{
                      padding:'12px 20px',
                      borderRadius:14,
                      fontSize:13,
                      fontWeight:700,
                      width:'100%',
                    }}
                  >
                    Back to Login
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(180deg,transparent,rgba(255,235,238,.2))', pointerEvents:'none', borderRadius:'0 0 clamp(28px,4vw,44px) clamp(28px,4vw,44px)' }}/>
          </div>

        </motion.div>
      </div>
    </div>
  )
}

export default ForgotPassword