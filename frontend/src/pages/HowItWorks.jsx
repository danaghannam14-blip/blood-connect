import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'


function HowItWorks() {
  const navigate = useNavigate()

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
    
    @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
    @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }
    @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(220,38,38,.3); } 50% { box-shadow: 0 0 40px rgba(220,38,38,.5); } }

    .hiw-root {
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

    .hiw-orbs {
      position:fixed;
      inset:0;
      overflow:hidden;
      pointer-events:none;
      z-index:0;
    }

    .hiw-orb {
      position:absolute;
      border-radius:50%;
      filter:blur(80px);
      animation:float-orb 6s ease-in-out infinite;
    }

    .hiw-dots {
      position:fixed;
      width:100%;
      height:100%;
      inset:0;
      pointer-events:none;
      z-index:0;
    }

    .hiw-dot {
      position:fixed;
      border-radius:50%;
      pointer-events:none;
    }

    .hiw-nav {
      position:sticky;top:0;z-index:50;
      background:rgba(248,248,248,.85);
      backdrop-filter:blur(20px) saturate(200%);
      -webkit-backdrop-filter:blur(20px) saturate(200%);
      border-bottom:1px solid rgba(180,180,180,.15);
      box-shadow:0 4px 30px rgba(0,0,0,.08);
    }

    .hiw-nav-inner {
      max-width:1360px;margin:0 auto;
      display:flex;justify-content:space-between;align-items:center;
      padding:14px clamp(16px,3.5vw,44px);
      gap:clamp(16px,2.5vw,32px);
    }

    .hiw-logo {
      display:flex;align-items:center;gap:14px;cursor:pointer;
    }

    .hiw-logo-icon {
      width:50px;height:50px;
      background:linear-gradient(135deg,#dc2626,#991b1b);
      border-radius:14px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 12px 32px rgba(220,38,38,.3);
      position:relative;
      overflow:hidden;
    }

    .hiw-logo-icon svg {
      width:28px;height:38px;
    }

    .hiw-logo-text {
      font-size:22px;font-weight:900;color:#dc2626;
      font-family:'Fraunces',serif;
      letter-spacing:0.5px;
    }

    @keyframes logoGlow {
      0%, 100% { letter-spacing:0.5px; }
      50% { letter-spacing:1px; }
    }

    .hiw-hero {
      padding:60px clamp(20px,3vw,44px);
      text-align:center;
      max-width:900px;
      margin:0 auto;
      position:relative;
      z-index:10;
    }

    .hiw-hero h1 {
      font-family:'Fraunces',serif;
      font-size:clamp(32px,5vw,56px);
      font-weight:900;
      color:#6e2016;
      margin:0 0 16px;
      line-height:1.1;
      letter-spacing:-0.5px;
    }

    .hiw-hero-subtitle {
      font-size:clamp(9px,1.2vw,11px);
      color:#dc2626;
      font-weight:900;
      margin:0 0 12px;
      text-transform:uppercase;
      letter-spacing:2px;
    }

    .hiw-hero p {
      font-size:clamp(13px,1.5vw,16px);
      color:rgba(42,42,42,.65);
      font-weight:500;
      margin:0;
      line-height:1.8;
      max-width:650px;
      margin-left:auto;
      margin-right:auto;
    }

    .hiw-stats {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));
      gap:20px;
      max-width:1000px;
      margin:50px auto;
      padding:0 clamp(20px,3vw,44px);
      position:relative;
      z-index:10;
    }

    .hiw-stat-box {
      background:rgba(255,255,255,.6);
      backdrop-filter:blur(20px) saturate(180%);
      border:1px solid rgba(180,180,180,.2);
      border-radius:16px;
      padding:clamp(16px,2vw,24px);
      text-align:center;
      transition:all .3s ease;
    }

    .hiw-stat-box:hover {
      transform:translateY(-4px);
      box-shadow:0 16px 40px rgba(220,38,38,.15);
      border-color:rgba(220,38,38,.25);
    }

    .hiw-stat-number {
      font-size:clamp(24px,4vw,36px);
      font-weight:900;
      color:#dc2626;
      margin:0 0 8px;
    }

    .hiw-stat-label {
      font-size:clamp(11px,1.1vw,12px);
      color:rgba(45,45,45,.6);
      text-transform:uppercase;
      font-weight:700;
      letter-spacing:1px;
      margin:0;
    }

    .hiw-section-title {
      font-family:'Fraunces',serif;
      font-size:clamp(28px,4vw,42px);
      font-weight:900;
      color:#6e2016;
      margin:50px clamp(20px,3vw,44px) 16px;
      text-align:center;
      position:relative;
      z-index:10;
      letter-spacing:-0.3px;
    }

    .hiw-section-desc {
      text-align:center;
      font-size:clamp(13px,1.3vw,15px);
      color:#3d3d3d;
      margin:0 clamp(20px,3vw,44px) 40px;
      max-width:650px;
      margin-left:auto;
      margin-right:auto;
      position:relative;
      z-index:10;
      line-height:1.7;
      font-weight:600;
    }

    .hiw-steps {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));
      gap:20px;
      max-width:1300px;
      margin:0 auto;
      padding:0 clamp(20px,3vw,44px) 60px;
      position:relative;
      z-index:10;
    }

    .hiw-step-card {
      background:rgba(255,255,255,.6);
      backdrop-filter:blur(20px) saturate(180%);
      border:1px solid rgba(180,180,180,.2);
      border-radius:16px;
      padding:clamp(20px,3vw,32px);
      text-align:center;
      transition:all .4s cubic-bezier(.22,1,.36,1);
      position:relative;
      overflow:hidden;
    }

    .hiw-step-card::before {
      content:'';
      position:absolute;
      top:0;left:0;right:0;bottom:0;
      background:radial-gradient(circle at top right, rgba(220,38,38,.04), transparent);
      pointer-events:none;
    }

    .hiw-step-card:hover {
      transform:translateY(-6px);
      box-shadow:0 20px 50px rgba(220,38,38,.12);
      border-color:rgba(220,38,38,.2);
    }

    .hiw-step-number {
      width:60px;height:60px;
      background:linear-gradient(135deg,#dc2626,#991b1b);
      color:#ffffff;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:clamp(22px,3vw,28px);font-weight:900;
      margin:0 auto 16px;
      position:relative;
      z-index:1;
      box-shadow:0 8px 24px rgba(220,38,38,.3);
      animation:pulse-glow 3s ease-in-out infinite;
    }

    .hiw-step-card h3 {
      font-family:'Fraunces',serif;
      font-size:clamp(16px,2.2vw,22px);
      font-weight:900;
      color:#6e2016;
      margin:0 0 12px;
      position:relative;
      z-index:1;
      letter-spacing:-0.3px;
    }

    .hiw-step-card p {
      font-size:clamp(12px,1.3vw,14px);
      color:#2d2d2d;
      margin:0;
      line-height:1.6;
      position:relative;
      z-index:1;
      font-weight:500;
    }

    .hiw-cta {
      text-align:center;
      padding:clamp(40px,6vw,60px) clamp(20px,3vw,44px);
      background:rgba(255,255,255,.5);
      backdrop-filter:blur(20px) saturate(180%);
      margin:40px clamp(20px,3vw,44px);
      border:1px solid rgba(180,180,180,.15);
      border-radius:20px;
      position:relative;
      z-index:10;
    }

    .hiw-cta h2 {
      font-family:'Fraunces',serif;
      font-size:clamp(28px,4vw,42px);
      font-weight:900;
      color:#6e2016;
      margin:0 0 12px;
      letter-spacing:-0.3px;
    }

    .hiw-cta-subtitle {
      font-size:clamp(13px,1.3vw,15px);
      color:#3d3d3d;
      margin:0 0 24px;
      font-weight:600;
    }

    .hiw-cta-btn {
      background:linear-gradient(135deg,#dc2626 0%,#991b1b 100%);
      color:#ffffff;
      border:none;
      padding:clamp(12px,2vw,15px) clamp(24px,4vw,40px);
      border-radius:10px;
      font-weight:900;
      cursor:pointer;
      transition:all .35s cubic-bezier(.25,1,.5,1);
      font-size:clamp(12px,1.2vw,14px);
      text-transform:uppercase;
      letter-spacing:1px;
      box-shadow:0 10px 30px rgba(220,38,38,.25);
      position:relative;
      overflow:hidden;
    }

    .hiw-cta-btn::before {
      content:'';
      position:absolute;
      top:0;left:-100%;width:100%;height:100%;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
      transition:left .5s;
    }

    .hiw-cta-btn:hover {
      transform:translateY(-2px);
      box-shadow:0 16px 48px rgba(220,38,38,.35);
    }

    .hiw-cta-btn:hover::before {
      left:100%;
    }

    .hiw-footer {
      background:rgba(255,255,255,.3);
      backdrop-filter:blur(12px);
      border-top:1px solid rgba(180,180,180,.15);
      padding:clamp(16px,2vw,32px) clamp(20px,3vw,44px);
      text-align:center;
      font-size:clamp(10px,1vw,12px);
      color:rgba(45,45,45,.55);
      font-weight:600;
      position:relative;
      z-index:10;
    }

    @media (max-width:960px) {
      .hiw-nav { padding:12px clamp(12px,2vw,20px); }
      .hiw-logo-icon { width:40px; height:40px; }
      .hiw-logo-icon svg { width:22px; height:30px; }
      .hiw-logo-text { font-size:18px; }
    }
  `

  if (typeof document !== 'undefined' && !document.getElementById('hiw-styles')) {
    const s = document.createElement('style')
    s.id = 'hiw-styles'
    s.textContent = STYLES
    document.head.appendChild(s)
  }

  const steps = [
    {
      number: '1',
      title: 'Create Profile',
      description: 'Register with your health info. Quick, secure, and protected with medical-grade encryption.'
    },
    {
      number: '2',
      title: 'Get Matched',
      description: 'Our system matches you with patients who need your blood type. Real-time notifications.'
    },
    {
      number: '3',
      title: 'Choose Location',
      description: 'Donate at our Hamra center or 189+ hospital partners across Lebanon.'
    },
    {
      number: '4',
      title: 'Make Donation',
      description: 'Complete the process with our medical professionals. 30-45 minutes to save lives.'
    },
    {
      number: '5',
      title: 'Track Impact',
      description: 'See your donation in action. Track who your blood helps.'
    },
    {
      number: '6',
      title: 'Earn Recognition',
      description: 'Build your donor profile, earn badges, and become a hero.'
    }
  ]

  const stats = [
    { number: '189+', label: 'Hospital Partners' },
    { number: '50K+', label: 'Active Donors' },
    { number: '150K+', label: 'Lives Saved' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
    }
  }

  // Generate animated dots
  const dots = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1.5,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 2,
  }))

  return (
    <div className="hiw-root">
      {/* ANIMATED ORBS */}
      <div className="hiw-orbs">
        <motion.div
          className="hiw-orb"
          style={{
            width: 'min(200px,20vw)',
            height: 'min(200px,20vw)',
            background: 'rgba(220,38,38,.08)',
            top: '-5%',
            left: '-3%',
          }}
          animate={{ y: [0, -50, 0], x: [0, 40, 0], scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hiw-orb"
          style={{
            width: 'min(180px,18vw)',
            height: 'min(180px,18vw)',
            background: 'rgba(180,180,180,.06)',
            top: '20%',
            right: '-8%',
          }}
          animate={{ y: [0, -50, 0], x: [0, 40, 0], scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hiw-orb"
          style={{
            width: 'min(190px,19vw)',
            height: 'min(190px,19vw)',
            background: 'rgba(220,38,38,.07)',
            bottom: '-10%',
            left: '5%',
          }}
          animate={{ y: [0, -50, 0], x: [0, 40, 0], scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ANIMATED DOTS */}
      <div className="hiw-dots">
        {dots.map((dot) => (
          <motion.div
            key={`dot-${dot.id}`}
            className="hiw-dot"
            style={{
              width: dot.size,
              height: dot.size,
              background: `rgba(220, 38, 38, ${0.4 + Math.random() * 0.3})`,
              left: `${dot.startX}%`,
              top: `${dot.startY}%`,
              boxShadow: `0 0 ${dot.size * 1.5}px rgba(220, 38, 38, ${0.5 + Math.random() * 0.3})`,
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
      </div>

      {/* NAV */}
      <header className="hiw-nav" style={{ transform: 'translateY(0)', transition: 'transform .6s cubic-bezier(.22,1,.36,1)' }}>
        <div className="hiw-nav-inner">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
            onClick={() => navigate('/')}
            whileHover={{ x: 3 }}
          >
            <motion.div
              style={{
                width: 50,
                height: 50,
                background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 32px rgba(220,38,38,.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
              whileHover={{ scale: 1.12, boxShadow: '0 16px 40px rgba(220,38,38,.4)' }}
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            >
              <svg viewBox="0 0 100 130" style={{ width: 28, height: 38 }}>
                <defs>
                  <linearGradient id="navBlood2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="50%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                </defs>
                <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill="url(#navBlood2)" opacity="0.95" />
                <ellipse cx="32" cy="65" rx="16" ry="22" fill="#faf7f7" opacity="0.2" />
              </svg>
            </motion.div>
            <motion.div 
              style={{ fontSize: 22, fontWeight: 900, color: '#dc2626' }}
              animate={{ letterSpacing: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              BloodConnect
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="hiw-hero"
      >
        <p className="hiw-hero-subtitle">How It Works</p>
        <h1>Your Blood Saves Lives</h1>
        <p>
          BloodConnect connects compassionate donors with patients in critical need through intelligent matching. Together, we're building a more connected and efficient blood banking system for Lebanon.
        </p>
      </motion.section>

      {/* STATS */}
      <motion.div 
        className="hiw-stats"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {stats.map((stat, idx) => (
          <motion.div key={idx} className="hiw-stat-box" variants={itemVariants}>
            <div className="hiw-stat-number">{stat.number}</div>
            <p className="hiw-stat-label">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* STEPS SECTION */}
      <h2 className="hiw-section-title">The Journey</h2>
      <p className="hiw-section-desc">
        Six simple steps to become a hero in your community
      </p>

      {/* STEPS CARDS */}
      <motion.div
        className="hiw-steps"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            className="hiw-step-card"
            variants={itemVariants}
            whileHover={{ y: -4 }}
          >
            <div className="hiw-step-number">{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="hiw-cta"
      >
        <h2>Ready to Save Lives Today?</h2>
        <p className="hiw-cta-subtitle">
          Join thousands of donors making a real difference in Lebanon. Every drop counts.
        </p>
        <motion.button
          className="hiw-cta-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/donor/register')}
        >
          Start Your Donor Journey
        </motion.button>
      </motion.section>

      {/* FOOTER */}
      <footer className="hiw-footer">
        © 2026 BloodConnect. Smart Donor Matching System. All rights reserved.
      </footer>
    </div>
  )
}

export default HowItWorks