import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function NotFound() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

    @keyframes nf-gradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes nf-float { 0%,100% { transform: translateY(0) translateX(0); } 33% { transform: translateY(-30px) translateX(20px); } 66% { transform: translateY(8px) translateX(-10px); } }
    @keyframes nf-particle { 0%,100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; } 50% { transform: translateY(-28px) translateX(var(--px,6px)) scale(1.2); opacity: 0.8; } }
    @keyframes nf-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes nf-ping { 75%,100% { transform: scale(2.2); opacity: 0; } }
    @keyframes nf-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    @keyframes nf-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
    @keyframes nf-spin { to { transform: rotate(360deg); } }
    @keyframes nf-orb { 0%,100% { transform: translateY(0) translateX(0) scale(1); } 33% { transform: translateY(-40px) translateX(24px) scale(1.1); } 66% { transform: translateY(12px) translateX(-14px) scale(0.94); } }

    .nf-root {
      min-height: 100vh;
      background: linear-gradient(-45deg, #FFEBEE, #F8F9FA, #FFE5E8, rgba(64,88,120,0.18), #FFF5F7);
      background-size: 400% 400%;
      animation: nf-gradient 14s ease infinite;
      font-family: 'Plus Jakarta Sans', sans-serif;
      overflow-x: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nf-glass {
      background: rgba(255,255,255,0.42);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.72);
      box-shadow: 0 8px 32px rgba(211,47,47,0.07), inset 0 0 20px rgba(255,255,255,0.6);
    }

    .nf-glass-deep {
      background: rgba(255,255,255,0.35);
      backdrop-filter: blur(40px) contrast(1.1);
      -webkit-backdrop-filter: blur(40px) contrast(1.1);
      border: 1px solid rgba(255,255,255,0.8);
      box-shadow: 0 24px 56px -12px rgba(211,47,47,0.08), inset 0 0 36px rgba(255,255,255,0.6);
    }

    .nf-orb { position: fixed; border-radius: 50%; filter: blur(110px); pointer-events: none; animation: nf-orb 8s ease-in-out infinite; }
    .nf-particle { position: fixed; border-radius: 50%; pointer-events: none; animation: nf-particle 5s ease-in-out infinite; }

    .nf-btn {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      border: none;
      outline: none;
      transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .nf-btn::after {
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

    .nf-btn:hover::after { width: 320px; height: 320px; }
    .nf-btn:hover { transform: translateY(-3px) scale(1.05); }
    .nf-btn:active { transform: scale(0.97); }

    .nf-btn-primary {
      background: linear-gradient(135deg, #D32F2F, #ff6b6b);
      color: white;
      box-shadow: 0 12px 32px rgba(211,47,47,0.32);
    }

    .nf-btn-primary:hover { box-shadow: 0 20px 52px rgba(211,47,47,0.48); }

    .nf-btn-secondary {
      background: rgba(255,255,255,0.5);
      backdrop-filter: blur(20px);
      border: 2px solid rgba(211,47,47,0.2) !important;
      color: #D32F2F;
    }

    .nf-btn-secondary:hover { background: rgba(255,255,255,0.72); border-color: rgba(211,47,47,0.42) !important; }

    @media (max-width: 960px) {
      .nf-grid { grid-template-columns: 1fr !important; }
      .nf-visual { display: none !important; }
    }
  `

  if (typeof document !== 'undefined' && !document.getElementById('nf-styles')) {
    const s = document.createElement('style')
    s.id = 'nf-styles'
    s.textContent = STYLES
    document.head.appendChild(s)
  }

  // Particles
  function ParticleField() {
    const particles = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      w: Math.random() * 5 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      dur: (Math.random() * 4 + 3).toFixed(1),
      delay: -(Math.random() * 4).toFixed(1),
      px: ((Math.random() * 20 - 10).toFixed(0)) + 'px',
      color: i % 3 === 0 ? 'rgba(211,47,47,.35)' : i % 3 === 1 ? 'rgba(14,165,233,.45)' : 'rgba(255,235,238,.7)',
    }))

    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {particles.map(p => (
          <div
            key={p.id}
            className="nf-particle"
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
          { t: '8%', l: '8%', w: 'min(420px,36vw)', c: 'rgba(211,47,47,.17)', d: '0s' },
          { b: '18%', r: '8%', w: 'min(480px,40vw)', c: 'rgba(64,88,120,.22)', d: '-2s' },
          { t: '45%', r: '18%', w: 'min(320px,28vw)', c: 'rgba(255,235,238,.45)', d: '-5s' },
          { b: '4%', l: '12%', w: 'min(220px,20vw)', c: 'rgba(64,88,120,.28)', d: '-3s' },
        ].map((o, i) => (
          <div
            key={i}
            className="nf-orb"
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

  // 404 Number Animation
  function FourOFour() {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          margin: '0 0 24px',
        }}
      >
        {[4, 0, 4].map((num, idx) => (
          <motion.div
            key={idx}
            initial={{ rotateZ: -20, opacity: 0 }}
            animate={{ rotateZ: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.6, type: 'spring' }}
            whileHover={{ scale: 1.1, rotateZ: 5 }}
          >
            <div
              style={{
                fontSize: 'clamp(64px,14vw,140px)',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #D32F2F, #ff6b6b)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Fraunces, serif',
                lineHeight: 1,
              }}
            >
              {num}
            </div>
          </motion.div>
        ))}

        {/* Spinning circle */}
        <motion.div
          style={{
            position: 'absolute',
            inset: -40,
            borderRadius: '50%',
            border: '2px solid rgba(211,47,47,0.1)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    )
  }

  // Blood Drop - Falling Animation
  function FallingBloodDrop() {
    return (
      <motion.div
        style={{
          position: 'relative',
          width: 80,
          height: 100,
        }}
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 100 130" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 12px 24px rgba(211,47,47,0.4))' }}>
          <defs>
            <linearGradient id="nfBloodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="50%" stopColor="#D32F2F" />
              <stop offset="100%" stopColor="#b71c1c" />
            </linearGradient>
            <linearGradient id="nfHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity=".6" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill="url(#nfBloodGrad)" />
          <ellipse cx="35" cy="70" rx="15" ry="20" fill="url(#nfHighlight)" />
          <path d="M50 20 C50 20 80 65 80 85 C80 100 65 115 50 115 C35 115 20 100 20 85 C20 65 50 20 50 20 Z" fill="none" stroke="white" strokeWidth=".5" strokeOpacity=".3" />
        </svg>

        {/* Glow */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'rgba(211,47,47,0.2)',
            filter: 'blur(40px)',
          }}
          animate={{ scale: [1, 1.3, 1] }}
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
    <div className="nf-root">
      <ParticleField />
      <Orbs />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 600,
          margin: '0 auto',
          padding: 'clamp(20px,3.5vw,44px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
        className="nf-grid"
      >
        <div className="nf-glass-deep" style={{ borderRadius: 'clamp(32px,4vw,52px)', padding: 'clamp(32px,5vw,64px) clamp(24px,4vw,48px)', border: '2px solid rgba(211,47,47,0.12)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#D32F2F,#405878,transparent)' }} />

          {/* Floating orbs */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <motion.div
              style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: 200,
                height: 200,
                background: 'rgba(255,235,238,0.3)',
                borderRadius: '50%',
                filter: 'blur(80px)',
              }}
              animate={{ y: [0, -30, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Blood Drop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
            >
              <FallingBloodDrop />
            </motion.div>

            {/* 404 */}
            <FourOFour />

            {/* Title */}
            <div style={fadeUp(0.3)}>
              <h1 style={{
                fontFamily: 'Fraunces, serif',
                fontSize: 'clamp(24px,5vw,48px)',
                fontWeight: 900,
                color: '#D32F2F',
                margin: '0 0 12px',
                lineHeight: 1.1,
              }}>
                Page Not Found
              </h1>
            </div>

            {/* Subtitle */}
            <div style={fadeUp(0.4)}>
              <p style={{
                fontSize: 'clamp(12px,1.2vw,15px)',
                color: 'rgba(211,47,47,0.65)',
                fontWeight: 600,
                margin: 0,
                lineHeight: 1.6,
              }}>
                The page you're looking for doesn't exist. But your donation potential does — and the world needs it.
              </p>
            </div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{
                height: 1.5,
                background: 'linear-gradient(90deg, transparent, rgba(211,47,47,0.2), transparent)',
                margin: 'clamp(24px,3vw,32px) 0',
              }}
            />

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{
                display: 'flex',
                gap: 'clamp(10px,2vw,16px)',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="nf-btn nf-btn-primary"
                style={{
                  padding: 'clamp(12px,1.5vw,16px) clamp(24px,3.5vw,40px)',
                  borderRadius: 20,
                  fontSize: 'clamp(13px,1.1vw,15px)',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'white' }}>
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                Go Home
              </motion.button>

              <motion.button
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="nf-btn nf-btn-secondary"
                style={{
                  padding: 'clamp(12px,1.5vw,16px) clamp(24px,3.5vw,40px)',
                  borderRadius: 20,
                  fontSize: 'clamp(13px,1.1vw,15px)',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: '#D32F2F' }}>
                  <path d="M19 12H5m7 7l-7-7 7-7" stroke="#D32F2F" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Go Back
              </motion.button>
            </motion.div>

            {/* Extra Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="nf-glass"
              style={{
                marginTop: 'clamp(24px,3.5vw,32px)',
                borderRadius: 18,
                padding: 'clamp(12px,1.5vw,16px) clamp(16px,2vw,20px)',
                border: '2px solid rgba(211,47,47,0.1)',
              }}
            >
              <p style={{
                fontSize: 'clamp(10px,1vw,12px)',
                color: 'rgba(211,47,47,0.55)',
                margin: 0,
                fontWeight: 600,
              }}>
                Error Code: 404 | Missing in Action
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound