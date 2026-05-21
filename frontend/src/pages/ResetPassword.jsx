import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const API = 'https://blood-bank-eqyr.onrender.com'

/* ─── Premium Reset Password Styles ───────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  @keyframes rp-gradient  { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes rp-particle  { 0%,100% { transform:translateY(0) translateX(0) scale(1); opacity:.25; } 50% { transform:translateY(-22px) translateX(var(--px,6px)) scale(1.15); opacity:.65; } }
  @keyframes rp-orb       { 0%,100% { transform:translateY(0) translateX(0) scale(1); } 33% { transform:translateY(-25px) translateX(18px) scale(1.06); } 66% { transform:translateY(10px) translateX(-12px) scale(.94); } }
  @keyframes rp-pulse     { 0%,100%  { opacity:1; } 50% { opacity:.4; } }
  @keyframes rp-float     { 0%,100%  { transform:translateY(0); } 50% { transform:translateY(-8px); } }
  
  @keyframes rp-blood-spiral {
    0% { transform: translateY(-100%) translateX(0) rotate(0deg); opacity: 0; }
    15% { opacity: 0.7; }
    85% { opacity: 0.7; }
    100% { transform: translateY(100vh) translateX(60px) rotate(360deg); opacity: 0; }
  }
  
  @keyframes rp-blood-helix {
    0% { transform: translateY(-100%) scaleX(0.8); opacity: 0; }
    20% { opacity: 0.6; }
    80% { opacity: 0.6; }
    100% { transform: translateY(100vh) scaleX(1.2); opacity: 0; }
  }
  
  @keyframes rp-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .rp-root {
    min-height:100vh;
    background:linear-gradient(-45deg,#f8f8f8,#efefef,#f8f8f8,rgba(14,165,233,.25));
    background-size:400% 400%;
    animation:rp-gradient 14s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
  }

  .rp-glass {
    background:rgba(255,255,255,.42);
    backdrop-filter:blur(28px) saturate(180%);
    -webkit-backdrop-filter:blur(28px) saturate(180%);
    border:1px solid rgba(255,255,255,.72);
    box-shadow:0 8px 32px rgba(211,47,47,.07),inset 0 0 20px rgba(255,255,255,.6);
  }

  .rp-glass-deep {
    background:rgba(255,255,255,.35);
    backdrop-filter:blur(40px) contrast(1.1);
    -webkit-backdrop-filter:blur(40px) contrast(1.1);
    border:1px solid rgba(255,255,255,.8);
    box-shadow:0 24px 56px -12px rgba(211,47,47,.08),inset 0 0 36px rgba(255,255,255,.6);
  }

  .rp-orb { 
    position:fixed;
    border-radius:50%;
    filter:blur(100px);
    pointer-events:none;
    animation:rp-orb var(--dur,8s) ease-in-out infinite; 
  }

  .rp-particle { 
    position:fixed;
    border-radius:50%;
    pointer-events:none;
    animation:rp-particle var(--dur,5s) ease-in-out infinite; 
  }

  .rp-blood-drop {
    position:fixed;
    width:10px;
    height:14px;
    border-radius:50% 50% 50% 0;
    pointer-events:none;
    animation:rp-blood-spiral var(--dur,10s) linear infinite;
    transform-origin:center;
  }

  .rp-input {
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

  .rp-input::placeholder { color:rgba(211,47,47,.35); }

  .rp-input:focus {
    border-color:rgba(211,47,47,.5);
    background:rgba(255,255,255,.72);
    box-shadow:0 8px 24px rgba(211,47,47,.12);
    transform:translateY(-2px);
  }

  .rp-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .rp-btn {
    position:relative;
    overflow:hidden;
    cursor:pointer;
    border:none;
    outline:none;
    transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s;
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  .rp-btn::after {
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

  .rp-btn:hover:not(:disabled)::after { width:300px;height:300px; }
  .rp-btn:hover:not(:disabled) { transform:translateY(-3px) scale(1.05); }
  .rp-btn:active:not(:disabled) { transform:scale(.97); }

  .rp-btn-primary {
    background:linear-gradient(135deg,#dc2626,#ff6b6b);
    color:#faf7f7;
    box-shadow:0 12px 32px rgba(211,47,47,.32);
  }

  .rp-btn-primary:hover:not(:disabled) { box-shadow:0 18px 48px rgba(211,47,47,.44); }
  .rp-btn-primary:disabled { opacity:.6; cursor:not-allowed; }

  .rp-error-badge {
    animation: slideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

/* ─── Style Injection (Safe) ───────────────────────── */
function useStyleInjection() {
  useEffect(() => {
    if (typeof document === 'undefined') return
    
    if (!document.getElementById('rp-styles-premium')) {
      const styleElement = document.createElement('style')
      styleElement.id = 'rp-styles-premium'
      styleElement.textContent = STYLES
      document.head.appendChild(styleElement)
      
      return () => {
        styleElement.remove()
      }
    }
  }, [])
}

/* ─── Advanced Background with Unique Animations ───────────────────────── */
function AdvancedBackground() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    w: Math.random() * 5 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: (Math.random() * 4 + 3).toFixed(1),
    delay: -(Math.random() * 4).toFixed(1),
    px: ((Math.random() * 20 - 10).toFixed(0)) + 'px',
    color: i % 3 === 0 ? 'rgba(211,47,47,.35)' : i % 3 === 1 ? 'rgba(14,165,233,.45)' : 'rgba(255,235,238,.7)',
  }))

  const bloodDrops = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: `${15 + i * 13}%`,
    dur: (Math.random() * 6 + 9).toFixed(1),
    delay: -(Math.random() * 10).toFixed(1),
    opacity: 0.3 + Math.random() * 0.4,
  }))

  return (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {/* Particles */}
      {particles.map(p => (
        <div
          key={`p-${p.id}`}
          className="rp-particle"
          style={{
            '--dur': `${p.dur}s`,
            '--px': p.px,
            width: p.w, height: p.w,
            left: `${p.left}%`, top: `${p.top}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Spiral Blood Drops - Unique Animation */}
      {bloodDrops.map((drop) => (
        <div
          key={`blood-${drop.id}`}
          className="rp-blood-drop"
          style={{
            '--dur': `${drop.dur}s`,
            left: drop.left,
            top: '-20px',
            background: `linear-gradient(180deg, rgba(211,47,47,${drop.opacity}), rgba(255,107,107,${drop.opacity * 0.5}))`,
            filter: 'drop-shadow(0 4px 8px rgba(211,47,47,.3))',
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}

      {/* Floating Orbs */}
      {[
        { t:'8%', l:'8%', w:'min(420px,36vw)', c:'rgba(211,47,47,.17)', d:'0s' },
        { b:'18%', r:'8%', w:'min(480px,40vw)', c:'rgba(14,165,233,.22)', d:'-2s' },
        { t:'50%', r:'10%', w:'min(320px,28vw)', c:'rgba(255,235,238,.35)', d:'-5s' },
      ].map((o, i) => (
        <div
          key={`orb-${i}`}
          className="rp-orb"
          style={{
            '--dur': '12s',
            width: o.w,
            height: o.w,
            background: o.c,
            top: o.t,
            bottom: o.b,
            left: o.l,
            right: o.r,
            animationDelay: o.d,
            zIndex: -1,
          }}
        />
      ))}

      {/* Gradient Wave Layer */}
      <svg
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 250,
          opacity: 0.3,
          zIndex: -1,
          pointerEvents: 'none',
        }}
        viewBox="0 0 1200 250"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="rpWaveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d="M0,80 Q300,40 600,80 T1200,80 L1200,250 L0,250 Z"
          fill="url(#rpWaveGrad1)"
          style={{ animation: 'rp-shimmer 12s linear infinite', transformOrigin: 'center' }}
        />
      </svg>
    </div>
  )
}

function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [form, setForm] = useState({ new_password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [tokenValid, setTokenValid] = useState(null)
  const errorTimeoutRef = useRef(null)

  // Inject styles safely
  useStyleInjection()

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. No token found.')
      setTokenValid(false)
      return
    }
    setTokenValid(true)
    setTimeout(() => setVisible(true), 60)

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [token])

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      errorTimeoutRef.current = setTimeout(() => {
        setError('')
      }, 5000)
      return () => clearTimeout(errorTimeoutRef.current)
    }
  }, [error])

  const validatePasswords = () => {
    if (!form.new_password || !form.confirm_password) {
      setError('Please fill in all fields')
      return false
    }
    if (form.new_password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    if (form.new_password !== form.confirm_password) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswords()) return

    setLoading(true)
    setError('')
    
    try {
      const res = await axios.post(`${API}/api/password/reset`, {
        token,
        new_password: form.new_password
      })
      setSubmitted(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password. Please try again.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Don't render if token is invalid
  if (tokenValid === false) {
    return (
      <div className="rp-root">
        <AdvancedBackground />
        <div style={{ position:'relative', zIndex:10, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(20px,4vw,60px)' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rp-glass-deep"
            style={{ maxWidth: 500, padding: 'clamp(28px,4vw,48px)', borderRadius: 'clamp(28px,4vw,44px)', textAlign: 'center' }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 900, color: '#dc2626', margin: '0 0 12px' }}>Invalid Reset Link</h2>
            <p style={{ fontSize: 14, color: 'rgba(211,47,47,.65)', margin: '0 0 20px', lineHeight: 1.6 }}>
              The password reset link is missing or invalid. Please request a new one.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="rp-btn rp-btn-primary"
              style={{ padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 900, width: '100%' }}
            >
              Request New Link
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="rp-root">
      <AdvancedBackground />

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
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid rgba(211,47,47,.2)' }}
              />
              <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(211,47,47,.4)' }}>
                <svg viewBox="0 0 100 130" style={{ width:32, height:32, fill:'#faf7f7' }}>
                  <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z"/>
                </svg>
              </div>
            </motion.div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(32px,5vw,52px)', fontWeight:900, color:'#dc2626', margin:0, lineHeight:1.1 }}>
              Create New Password
            </h1>
            <p style={{ fontSize:'clamp(13px,1.3vw,15px)', color:'rgba(211,47,47,.65)', fontWeight:700, marginTop:12, letterSpacing:'.04em' }}>
              Enter a strong password to secure your account
            </p>
          </div>

          {/* Main Card */}
          <div className="rp-glass-deep" style={{ borderRadius:'clamp(28px,4vw,44px)', padding:'clamp(28px,4vw,48px)', border:'2px solid rgba#991b1b', position:'relative', overflow:'hidden' }}>
            
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
                      className="rp-glass rp-error-badge"
                      style={{ background:'rgba(255,235,238,.8)', border:'2px solid rgba(211,47,47,.4)', padding:14, borderRadius:16, marginBottom:20, textAlign:'center' }}
                      role="alert"
                      aria-live="polite"
                    >
                      <p style={{ fontSize:13, fontWeight:700, color:'#dc2626', margin:0 }}>⚠️ {error}</p>
                    </motion.div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    style={{ display:'flex', flexDirection:'column', gap:18, position:'relative', zIndex:1 }}
                    noValidate
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label 
                        htmlFor="new-password"
                        style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:8, display:'block' }}>
                        New Password *
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        placeholder="Enter strong password (min. 8 chars)"
                        value={form.new_password}
                        onChange={e => setForm({...form, new_password: e.target.value})}
                        className="rp-input"
                        disabled={loading}
                        required
                        minLength="8"
                        aria-label="New password"
                        aria-required="true"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label 
                        htmlFor="confirm-password"
                        style={{ fontSize:10, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.2em', marginBottom:8, display:'block' }}>
                        Confirm Password *
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={form.confirm_password}
                        onChange={e => setForm({...form, confirm_password: e.target.value})}
                        className="rp-input"
                        disabled={loading}
                        required
                        minLength="8"
                        aria-label="Confirm password"
                        aria-required="true"
                      />
                    </motion.div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rp-btn rp-btn-primary"
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
                        marginTop: 8,
                      }}
                      aria-busy={loading}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ width:18, height:18, border:'3px solid rgba(255,255,255,.3)', borderTopColor:'#faf7f7', borderRadius:'50%' }}
                            aria-hidden="true"
                          />
                          Resetting...
                        </>
                      ) : (
                        '🔐 Reset Password'
                      )}
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
                  role="status"
                  aria-live="polite"
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
                    aria-hidden="true"
                  >
                    ✓
                  </motion.div>

                  <div>
                    <h3 style={{ fontSize:20, fontWeight:900, color:'#dc2626', margin:'0 0 8px', fontFamily:"'Fraunces',serif" }}>Password Reset!</h3>
                    <p style={{ fontSize:13, color:'rgba(211,47,47,.65)', fontWeight:600, margin:0, lineHeight:1.6 }}>
                      Your password has been successfully reset. Redirecting to login...
                    </p>
                  </div>

                  <div className="rp-glass" style={{ background:'rgba(34,197,94,.15)', border:'2px solid #22c55e', borderRadius:16, padding:14, width:'100%' }}>
                    <p style={{ fontSize:11, color:'#22c55e', margin:0, fontWeight:700 }}>You can now log in with your new password</p>
                  </div>

                  <motion.div
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 3, ease: 'linear' }}
                    style={{
                      height: 2,
                      background: 'linear-gradient(90deg, #dc2626, #ff6b6b)',
                      borderRadius: 1,
                      width: '100%',
                    }}
                    aria-hidden="true"
                  />
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

export default ResetPassword