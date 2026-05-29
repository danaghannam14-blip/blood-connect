import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE_URL as API } from '../config/apiConfig'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes pulse-ring { 0% { transform:scale(.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }
  @keyframes shimmer { 0%,100% { opacity:.5; } 50% { opacity:1; } }

  .rp-root {
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

  .rp-glass {
    background:rgba(255,255,255,.6);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(180,180,180,.2);
    box-shadow:0 8px 32px rgba(0,0,0,.08);
  }

  .rp-glass-deep {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(180,180,180,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.1),inset 0 1px 1px rgba(255,255,255,.3);
  }

  .rp-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .rp-input {
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

  .rp-input::placeholder { color:rgba(56,1,1,.4); }

  .rp-input:focus {
    border-color:rgba(220,38,38,.4);
    background:rgba(255,255,255,.7);
    box-shadow:0 8px 24px rgba(220,38,38,.15),inset 0 1px 1px rgba(255,255,255,.3);
    transform:translateY(-2px);
  }

  .rp-btn {
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

  .rp-btn::before {
    content:'';
    position:absolute;
    top:0;
    left:-100%;
    width:100%;
    height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
    transition:left .5s;
  }

  .rp-btn:hover::before { left:100%; }

  .rp-btn-primary {
    background:linear-gradient(135deg,#dc2626 0%,#991b1b 50%,#7f1d1d 100%);
    color:#faf7f7;
    box-shadow:0 10px 30px rgba(220,38,38,.35);
    border:1px solid rgba(255,255,255,.15);
  }

  .rp-btn-primary:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 20px 60px rgba(220,38,38,.5);
  }

  .rp-btn-secondary {
    background:rgba(255,255,255,.7);
    backdrop-filter:blur(10px);
    border:1.5px solid rgba(180,180,180,.3);
    color:#380101;
  }

  .rp-btn-secondary:hover {
    background:rgba(255,255,255,.85);
    border-color:rgba(180,180,180,.5);
    transform:translateY(-2px);
  }

  @media (max-width:1200px) {
    .rp-root { zoom: 0.88; }
  }

  @media (max-width:1024px) {
    .rp-root { zoom: 0.85; }
  }

  @media (max-width:768px) {
    .rp-root { zoom: 0.75; }
  }

  @media (max-width:480px) {
    .rp-root { zoom: 0.65; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('rp-styles-unified')) {
  const s = document.createElement('style')
  s.id = 'rp-styles-unified'
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
          className="rp-float-orb"
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
      console.log('[ResetPassword] 🔑 Resetting password with token:', token)
      const res = await axios.post(`${API}/api/password/reset`, {
        token,
        new_password: form.new_password
      })
      console.log('[ResetPassword] ✅ Password reset successful:', res.data)
      setSubmitted(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      console.error('[ResetPassword] ❌ Error:', err.response?.data)
      const errorMsg = err.response?.data?.message || 'Failed to reset password. Please try again.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === false) {
    return (
      <div className="rp-root">
        <AnimatedBackgroundOrbs />

        <div style={{ position:'relative', zIndex:10, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(16px,2.5vw,32px)' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width:'100%', maxWidth: 'clamp(320px,90vw,500px)' }}
          >
            <div className="rp-glass-deep" style={{ borderRadius:'clamp(20px,3vw,28px)', padding:'clamp(24px,3.5vw,36px)', textAlign:'center', border:'1px solid rgba(180,180,180,.15)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#dc2626,transparent)' }}/>

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

              <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(20px,3.5vw,32px)', fontWeight:900, color:'#dc2626', margin:'0 0 clamp(8px,1.2vw,12px)', lineHeight:1.1 }}>
                Invalid Reset Link
              </h2>
              
              <p style={{ fontSize:'clamp(11px,1vw,13px)', color:'rgba(56,1,1,.6)', fontWeight:600, margin:'0 0 clamp(16px,2.5vw,24px)' }}>
                The password reset link is missing or invalid. Please request a new one.
              </p>

              <motion.button
                onClick={() => navigate('/login')}
                className="rp-btn rp-btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                style={{ width:'100%', padding:'clamp(12px,1.5vw,16px)', fontSize:'clamp(12px,1.1vw,14px)', fontWeight:700 }}
              >
                Back to Login
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="rp-root">
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
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid rgba(220,38,38,.15)' }}
              />
              <div style={{ width:'85%', height:'85%', borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <motion.svg
                  viewBox="0 0 100 130"
                  style={{ width:'55%', height:'55%', fill:'#faf7f7' }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z"/>
                </motion.svg>
              </div>
            </motion.div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(28px,4vw,48px)', fontWeight:900, color:'#dc2626', margin:0, lineHeight:1.1 }}>
              Reset Password
            </h1>
            <p style={{ fontSize:'clamp(12px,1.2vw,14px)', color:'rgba(56,1,1,.6)', fontWeight:700, marginTop:'clamp(8px,1vw,12px)', letterSpacing:'.06em', textTransform:'uppercase' }}>
              Create a strong new password
            </p>
          </div>

          {/* Form Card */}
          <div className="rp-glass-deep" style={{ borderRadius:'clamp(20px,3vw,28px)', padding:'clamp(24px,3.5vw,36px)', border:'1px solid rgba(180,180,180,.15)', position:'relative', overflow:'hidden' }}>
            
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#dc2626,transparent)' }}/>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rp-glass"
                  style={{ background:'rgba(220,38,38,.08)', border:'1.5px solid rgba(220,38,38,.3)', padding:'clamp(12px,1.5vw,16px)', borderRadius:'clamp(12px,1.5vw,16px)', marginBottom:'clamp(16px,2vw,20px)', textAlign:'center' }}
                >
                  <p style={{ fontSize:'clamp(12px,1.1vw,13px)', fontWeight:700, color:'#dc2626', margin:0 }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ display:'flex', flexDirection:'column', gap:'clamp(14px,2vw,18px)' }}
                  >
                    <div>
                      <label style={{ fontSize:'clamp(9px,0.9vw,10px)', fontWeight:700, color:'rgba(56,1,1,.5)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'clamp(6px,1vw,8px)', display:'block' }}>New Password</label>
                      <input
                        type="password"
                        placeholder="Enter your new password"
                        value={form.new_password}
                        onChange={e => setForm({...form, new_password: e.target.value})}
                        className="rp-input"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize:'clamp(9px,0.9vw,10px)', fontWeight:700, color:'rgba(56,1,1,.5)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'clamp(6px,1vw,8px)', display:'block' }}>Confirm Password</label>
                      <input
                        type="password"
                        placeholder="Confirm your password"
                        value={form.confirm_password}
                        onChange={e => setForm({...form, confirm_password: e.target.value})}
                        className="rp-input"
                        required
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="rp-btn rp-btn-primary"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ width:'100%', padding:'clamp(12px,1.5vw,16px)', fontSize:'clamp(12px,1.1vw,14px)', fontWeight:700, marginTop:'clamp(8px,1.5vw,12px)', display:'flex', alignItems:'center', justifyContent:'center', gap:'clamp(8px,1vw,10px)', opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ width:'clamp(14px,1.5vw,16px)', height:'clamp(14px,1.5vw,16px)', border:'2.5px solid rgba(255,255,255,.3)', borderTopColor:'#faf7f7', borderRadius:'50%' }}
                          />
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ display:'flex', flexDirection:'column', gap:'clamp(12px,2vw,16px)', textAlign:'center' }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width: 'clamp(56px,7vw,72px)', height: 'clamp(56px,7vw,72px)', borderRadius:'50%', background:'linear-gradient(135deg,rgba(34,197,94,.2),rgba(34,197,94,.1))', border:'2px solid rgba(34,197,94,.3)', margin:'0 auto', position:'relative' }}
                    >
                      <div style={{ fontSize:'clamp(28px,4vw,36px)', fontWeight:900, color:'#22c55e' }}>
                        <svg viewBox="0 0 24 24" style={{ width:'65%', height:'65%', fill:'#22c55e' }}>
                          <path d="M9,20.42L4.6,16.02C4.2,15.62 3.56,15.62 3.16,16.02C2.76,16.42 2.76,17.06 3.16,17.46L8.5,22.8C8.9,23.2 9.54,23.2 9.94,22.8L20.84,11.9C21.24,11.5 21.24,10.86 20.84,10.46C20.44,10.06 19.8,10.06 19.4,10.46L9,20.42Z"/>
                        </svg>
                      </div>
                    </motion.div>

                    <div>
                      <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(20px,3.5vw,32px)', fontWeight:900, color:'#dc2626', margin:'0 0 clamp(6px,1vw,8px)' }}>Password Reset</h2>
                      <p style={{ fontSize:'clamp(11px,1vw,13px)', color:'rgba(56,1,1,.6)', fontWeight:600, margin:0 }}>Your password has been successfully reset</p>
                    </div>

                    <div className="rp-glass" style={{ background:'rgba(34,197,94,.15)', border:'1.5px solid rgba(34,197,94,.3)', padding:'clamp(12px,1.5vw,16px)', borderRadius:'clamp(12px,1.5vw,16px)' }}>
                      <p style={{ fontSize:'clamp(11px,1vw,12px)', color:'#22c55e', fontWeight:700, margin:0 }}>You can now sign in with your new password</p>
                    </div>

                    <p style={{ fontSize:'clamp(10px,0.9vw,11px)', color:'rgba(56,1,1,.5)', fontWeight:600, margin:'0' }}>Redirecting to login...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {!submitted && (
              <p style={{ textAlign:'center', fontSize:'clamp(11px,1vw,12px)', color:'rgba(56,1,1,.6)', fontWeight:700, marginTop:'clamp(20px,2.5vw,28px)', marginBottom:0 }}>
                Remember your password?{' '}
                <span onClick={() => navigate('/login')} style={{ color:'#dc2626', cursor:'pointer', fontWeight:900, textDecoration:'none', transition:'all .2s' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                  Sign In
                </span>
              </p>
            )}

          </div>

        </motion.div>
      </div>
    </div>
  )
}

export default ResetPassword