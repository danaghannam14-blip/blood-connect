import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function Inventory() {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    fetch('https://blood-bank-eqyr.onrender.com/api/requests/inventory/status')
      .then(res => res.json())
      .then(data => { setInventory(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const statusConfig = {
    critical: { label: 'Critical', bg: 'rgba(211,47,47,0.1)', border: 'rgba(211,47,47,0.3)', text: '#D32F2F', dot: '#D32F2F', glow: 'rgba(211,47,47,0.4)' },
    low: { label: 'Low', bg: 'rgba(234,88,12,0.1)', border: 'rgba(234,88,12,0.3)', text: '#ea580c', dot: '#ea580c', glow: 'rgba(234,88,12,0.4)' },
    available: { label: 'Available', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#16a34a', dot: '#16a34a', glow: 'rgba(34,197,94,0.4)' }
  }

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

    @keyframes inv-gradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes inv-float { 0%,100% { transform: translateY(0) translateX(0); } 33% { transform: translateY(-30px) translateX(20px); } 66% { transform: translateY(8px) translateX(-10px); } }
    @keyframes inv-particle { 0%,100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; } 50% { transform: translateY(-28px) translateX(var(--px,6px)) scale(1.2); opacity: 0.8; } }
    @keyframes inv-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes inv-ping { 75%,100% { transform: scale(2.2); opacity: 0; } }
    @keyframes inv-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    @keyframes inv-glow { 0%,100% { box-shadow: 0 0 20px currentColor, inset 0 0 10px rgba(255,255,255,0.1); } 50% { box-shadow: 0 0 40px currentColor, inset 0 0 20px rgba(255,255,255,0.2); } }
    @keyframes inv-orb { 0%,100% { transform: translateY(0) translateX(0) scale(1); } 33% { transform: translateY(-40px) translateX(24px) scale(1.1); } 66% { transform: translateY(12px) translateX(-14px) scale(0.94); } }

    .inv-root {
      min-height: 100vh;
      background: linear-gradient(-45deg, #FFEBEE, #F8F9FA, #FFE5E8, rgba(64,88,120,0.18), #FFF5F7);
      background-size: 400% 400%;
      animation: inv-gradient 14s ease infinite;
      font-family: 'Plus Jakarta Sans', sans-serif;
      overflow-x: hidden;
      position: relative;
    }

    .inv-glass {
      background: rgba(255,255,255,0.42);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.72);
      box-shadow: 0 8px 32px rgba(211,47,47,0.07), inset 0 0 20px rgba(255,255,255,0.6);
    }

    .inv-glass-deep {
      background: rgba(255,255,255,0.35);
      backdrop-filter: blur(40px) contrast(1.1);
      -webkit-backdrop-filter: blur(40px) contrast(1.1);
      border: 1px solid rgba(255,255,255,0.8);
      box-shadow: 0 24px 56px -12px rgba(211,47,47,0.08), inset 0 0 36px rgba(255,255,255,0.6);
    }

    .inv-orb { position: fixed; border-radius: 50%; filter: blur(110px); pointer-events: none; animation: inv-orb 8s ease-in-out infinite; }
    .inv-particle { position: fixed; border-radius: 50%; pointer-events: none; animation: inv-particle 5s ease-in-out infinite; }

    .inv-btn {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      border: none;
      outline: none;
      transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .inv-btn::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255,255,255,0.28);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.4s, height 0.4s;
    }

    .inv-btn:hover::after { width: 320px; height: 320px; }
    .inv-btn:hover { transform: translateY(-3px) scale(1.05); }
    .inv-btn:active { transform: scale(0.97); }

    .inv-btn-primary {
      background: linear-gradient(135deg, #D32F2F, #ff6b6b);
      color: white;
      box-shadow: 0 12px 32px rgba(211,47,47,0.32);
    }

    .inv-btn-primary:hover { box-shadow: 0 20px 52px rgba(211,47,47,0.48); }

    .inv-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border-bottom: 2px solid rgba(211,47,47,0.1);
      box-shadow: 0 4px 24px rgba(211,47,47,0.06);
    }

    .inv-nav-inner {
      max-width: 1360px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: clamp(12px, 1.4vw, 18px) clamp(16px, 3.5vw, 44px);
      background: rgba(255,255,255,0.62);
    }

    .inv-card-hover {
      transition: transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s;
    }

    .inv-card-hover:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 20px 50px rgba(211,47,47,0.15) !important;
    }

    .inv-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      border: 1px solid;
    }

    @media (max-width: 960px) {
      .inv-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
      .inv-hero-visual { display: none !important; }
    }
  `

  if (typeof document !== 'undefined' && !document.getElementById('inv-styles')) {
    const s = document.createElement('style')
    s.id = 'inv-styles'
    s.textContent = STYLES
    document.head.appendChild(s)
  }

  // Particles
  function ParticleField() {
    const particles = Array.from({ length: 32 }, (_, i) => ({
      id: i,
      w: Math.random() * 5 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      dur: (Math.random() * 4 + 3).toFixed(1),
      delay: -(Math.random() * 5).toFixed(1),
      px: ((Math.random() * 22 - 11).toFixed(0)) + 'px',
      color: i % 3 === 0 ? 'rgba(211,47,47,.35)' : i % 3 === 1 ? 'rgba(64,88,120,.45)' : 'rgba(255,235,238,.7)',
    }))

    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {particles.map(p => (
          <div
            key={p.id}
            className="inv-particle"
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

  // Orbs
  function Orbs() {
    return (
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {[
          { t: '4%', l: '4%', w: 'min(500px,42vw)', c: 'rgba(211,47,47,.18)', d: '0s' },
          { b: '8%', r: '6%', w: 'min(560px,46vw)', c: 'rgba(64,88,120,.14)', d: '-3s' },
          { t: '40%', r: '12%', w: 'min(340px,30vw)', c: 'rgba(255,235,238,.55)', d: '-6s' },
          { b: '2%', l: '15%', w: 'min(260px,22vw)', c: 'rgba(64,88,120,.2)', d: '-4s' },
        ].map((o, i) => (
          <div
            key={i}
            className="inv-orb"
            style={{
              '--dur': '8s',
              width: o.w,
              height: o.w,
              background: o.c,
              top: o.t,
              bottom: o.b,
              left: o.l,
              right: o.r,
              animationDelay: o.d,
            }}
          />
        ))}
      </div>
    )
  }

  // Blood Drop Animation (NEW - Pulsing Orb)
  function BloodDropPulse() {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{
          position: 'relative',
          width: 160,
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer rings */}
        {[80, 100, 120].map((size, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              border: `2px solid rgba(211,47,47,${0.15 - i * 0.04})`,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20 - i * 4, repeat: Infinity, linear: true }}
          />
        ))}

        {/* Center pulsing drop */}
        <motion.div
          style={{
            width: 64,
            height: 80,
            background: 'linear-gradient(135deg, #ff6b6b, #D32F2F)',
            borderRadius: '50% 50% 50% 0',
            boxShadow: '0 12px 24px rgba(211,47,47,0.4)',
            filter: 'drop-shadow(0 0 20px rgba(211,47,47,0.3))',
            position: 'relative',
            zIndex: 2,
          }}
          animate={{
            scale: [1, 1.15, 1],
            boxShadow: ['0 12px 24px rgba(211,47,47,0.4)', '0 12px 40px rgba(211,47,47,0.7)', '0 12px 24px rgba(211,47,47,0.4)'],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50% 50% 50% 0',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
            }}
          />
        </motion.div>

        {/* Glow pulse */}
        <motion.div
          style={{
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(211,47,47,0.2)',
            filter: 'blur(40px)',
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    )
  }

  const fadeUp = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  })

  return (
    <div className="inv-root">
      <ParticleField />
      <Orbs />

      {/* NAV */}
      <nav className="inv-nav">
        <div className="inv-nav-inner">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <span style={{ fontSize: 'clamp(16px,1.8vw,22px)', fontWeight: 800, color: '#D32F2F', fontFamily: 'Plus Jakarta Sans' }}>
              BloodConnect
            </span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate('/emergency')}
            className="inv-btn inv-glass inv-btn-primary"
            style={{
              padding: 'clamp(10px,1.2vw,14px) clamp(18px,2.5vw,28px)',
              borderRadius: 18,
              fontSize: 'clamp(12px,1.1vw,14px)',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ animation: 'inv-ping 1.2s cubic-bezier(0,0,.2,1) infinite', display: 'inline-block' }}>🚨</span>
            Emergency
          </motion.button>
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 10, maxWidth: 1360, margin: '0 auto', padding: 'clamp(24px,4vw,56px) clamp(16px,3.5vw,44px)' }}>

        {/* HEADER */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 'clamp(40px,6vw,80px)' }}
        >
          <div className="inv-glass-deep" style={{ borderRadius: 'clamp(28px,4vw,44px)', padding: 'clamp(28px,4vw,52px)', border: '2px solid rgba(211,47,47,0.12)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#D32F2F,#405878,transparent)' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(28px,5vw,80px)', alignItems: 'center' }}>
              {/* Left */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, type: 'spring' }}
                style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.5vw,32px)' }}
              >
                <div style={fadeUp(0)}>
                  <div className="inv-glass" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 9999, width: 'fit-content', border: '1px solid rgba(211,47,47,0.18)' }}>
                    <span style={{ position: 'relative', display: 'inline-flex', width: 12, height: 12 }}>
                      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#D32F2F', opacity: 0.75, animation: 'inv-ping 1.2s cubic-bezier(0,0,.2,1) infinite' }} />
                      <span style={{ position: 'relative', width: 12, height: 12, borderRadius: '50%', background: '#D32F2F', boxShadow: '0 0 12px #D32F2F', display: 'inline-flex' }} />
                    </span>
                    <span style={{ color: '#D32F2F', fontWeight: 900, fontSize: 'clamp(8px,.85vw,10px)', letterSpacing: '.2em', textTransform: 'uppercase' }}>Live Inventory Status</span>
                  </div>
                </div>

                <div style={fadeUp(0.1)}>
                  <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(36px,5.5vw,72px)', lineHeight: 0.93, fontWeight: 900, color: '#D32F2F', margin: 0 }}>
                    Blood<br />
                    <em style={{ color: '#405878', fontStyle: 'italic' }}>Availability Map</em>
                  </h1>
                </div>

                <div style={fadeUp(0.2)}>
                  <p style={{ fontSize: 'clamp(13px,1.3vw,16px)', color: 'rgba(211,47,47,0.7)', fontWeight: 600, maxWidth: 480, lineHeight: 1.65, margin: 0 }}>
                    Real-time tracking of blood supply across Lebanese hospitals. See availability status and request critical blood types.
                  </p>
                </div>

                {/* Legend */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inv-glass"
                  style={{ borderRadius: 22, padding: '16px 20px', border: '2px solid rgba(211,47,47,0.12)', marginTop: 8 }}
                >
                  <p style={{ fontSize: 9, fontWeight: 900, color: 'rgba(211,47,47,0.4)', letterSpacing: '.2em', textTransform: 'uppercase', margin: '0 0 12px' }}>Status Legend</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: val.dot, boxShadow: `0 0 8px ${val.dot}`, animation: 'inv-pulse 1.5s infinite' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(211,47,47,0.6)', textTransform: 'capitalize' }}>{val.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>

              {/* Right - Blood Drop */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, type: 'spring', delay: 0.1 }}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <BloodDropPulse />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* INVENTORY GRID */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ marginBottom: 'clamp(44px,6vw,100px)' }}
        >
          <div style={{ marginBottom: 'clamp(20px,3vw,32px)' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(24px,3.8vw,46px)', fontWeight: 900, color: '#D32F2F', margin: 0 }}>Current Supply Status</h2>
            <p style={{ fontSize: 'clamp(12px,1.2vw,15px)', color: 'rgba(211,47,47,0.65)', fontWeight: 600, marginTop: 8 }}>Updated in real-time across all centers</p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: '4px solid rgba(211,47,47,0.15)',
                  borderTopColor: '#D32F2F',
                }}
              />
            </div>
          ) : (
            <div className="inv-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'clamp(12px,1.5vw,18px)' }}>
              <AnimatePresence>
                {inventory.map((item, idx) => {
                  const config = statusConfig[item.status]
                  return (
                    <motion.div
                      key={item.blood_type}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                      className="inv-glass inv-card-hover"
                      style={{
                        borderRadius: 'clamp(20px,2.5vw,28px)',
                        padding: 'clamp(16px,1.8vw,24px)',
                        border: `2px solid ${config.border}`,
                        background: config.bg,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Glow on hover */}
                      <motion.div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 'clamp(20px,2.5vw,28px)',
                          opacity: 0,
                        }}
                        whileHover={{
                          opacity: 0.1,
                          boxShadow: `0 0 40px ${config.glow}`,
                        }}
                      />

                      <motion.p
                        style={{
                          fontSize: 'clamp(32px,4vw,48px)',
                          fontWeight: 900,
                          color: '#D32F2F',
                          margin: 0,
                          position: 'relative',
                          zIndex: 1,
                          textAlign: 'center',
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {item.blood_type}
                      </motion.p>

                      <motion.div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '8px 12px',
                          borderRadius: 12,
                          background: `${config.bg}`,
                          border: `1.5px solid ${config.border}`,
                          marginTop: 12,
                          position: 'relative',
                          zIndex: 1,
                          width: 'fit-content',
                          margin: '12px auto 0',
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: config.dot,
                          }}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span style={{ fontSize: 10, fontWeight: 900, color: config.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {config.label}
                        </span>
                      </motion.div>

                      <motion.p
                        style={{
                          fontSize: 'clamp(10px,1.1vw,12px)',
                          color: 'rgba(211,47,47,0.55)',
                          margin: '12px 0 0',
                          textAlign: 'center',
                          fontWeight: 600,
                          position: 'relative',
                          zIndex: 1,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                      >
                        {item.units_needed === 0 ? 'No requests' : `${item.units_needed} units needed`}
                      </motion.p>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="inv-glass-deep" style={{ borderRadius: 'clamp(28px,4vw,56px)', padding: 'clamp(36px,5.5vw,80px) clamp(20px,4.5vw,52px)', textAlign: 'center', border: '2px solid rgba(211,47,47,0.1)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: -40, top: 0, width: 180, height: 180, background: 'rgba(255,235,238,0.7)', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.6, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: -40, bottom: -20, width: 150, height: 150, background: 'rgba(64,88,120,0.3)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px,5.5vw,62px)', fontWeight: 900, color: '#D32F2F', position: 'relative', zIndex: 1, lineHeight: 1.1, margin: 0 }}>See a critical need?</h2>
            <p style={{ fontSize: 'clamp(12px,1.4vw,16px)', color: 'rgba(211,47,47,0.65)', fontWeight: 600, margin: 'clamp(12px,1.8vw,24px) auto 0', maxWidth: 520, position: 'relative', zIndex: 1, lineHeight: 1.65 }}>
              Your donation can save up to three lives. Register now and become part of Lebanon's most innovative blood donation network.
            </p>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => navigate('/donor/register')}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="inv-btn inv-btn-primary"
              style={{
                padding: 'clamp(14px,1.8vw,20px) clamp(28px,4vw,52px)',
                borderRadius: 28,
                fontSize: 'clamp(14px,1.4vw,18px)',
                marginTop: 'clamp(24px,3vw,36px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                position: 'relative',
                zIndex: 1,
              }}
            >
              Register as Donor
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'white' }}>
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
              </svg>
            </motion.button>
          </div>
        </motion.section>
      </main>
    </div>
  )
}

export default Inventory