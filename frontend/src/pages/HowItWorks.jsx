import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function HowItWorks() {
  const navigate = useNavigate()

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
    
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

    .hiw-cards-grid {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));
      gap:clamp(16px, 2vw, 24px);
      max-width:1200px;
      margin:0 auto;
      padding:0 clamp(16px, 2vw, 40px) 60px;
      position:relative;
      z-index:10;
    }

    .hiw-card {
      background:rgba(255,255,255,.6);
      backdrop-filter:blur(20px) saturate(180%);
      border:1px solid rgba(180,180,180,.2);
      border-radius:16px;
      padding:clamp(24px,3vw,32px);
      text-align:left;
      transition:all .4s cubic-bezier(.22,1,.36,1);
      position:relative;
      overflow:hidden;
    }

    .hiw-card::before {
      content:'';
      position:absolute;
      top:0;left:0;right:0;bottom:0;
      background:radial-gradient(circle at top right, rgba(220,38,38,.04), transparent);
      pointer-events:none;
    }

    .hiw-card:hover {
      transform:translateY(-6px);
      box-shadow:0 20px 50px rgba(220,38,38,.12);
      border-color:rgba(220,38,38,.2);
    }

    .hiw-card-icon {
      width:56px;height:56px;
      background:linear-gradient(135deg,#dc2626,#991b1b);
      border-radius:12px;
      display:flex;align-items:center;justify-content:center;
      margin:0 0 16px;
      position:relative;
      z-index:1;
      box-shadow:0 8px 24px rgba(220,38,38,.2);
      font-size:28px;
    }

    .hiw-card h3 {
      font-family:'Fraunces',serif;
      font-size:clamp(18px,2.2vw,24px);
      font-weight:900;
      color:#6e2016;
      margin:0 0 12px;
      position:relative;
      z-index:1;
      letter-spacing:-0.3px;
    }

    .hiw-card p {
      font-size:clamp(12px,1.3vw,14px);
      color:#2d2d2d;
      margin:0;
      line-height:1.7;
      position:relative;
      z-index:1;
      font-weight:500;
    }

    .hiw-timeline {
      max-width:900px;
      margin:60px auto;
      padding:0 clamp(20px,3vw,44px);
      position:relative;
      z-index:10;
    }

    .hiw-timeline-item {
      display:grid;
      grid-template-columns:80px 1fr;
      gap:clamp(20px,3vw,32px);
      margin-bottom:clamp(24px,3vw,32px);
      position:relative;
    }

    .hiw-timeline-dot {
      width:80px;
      height:80px;
      background:linear-gradient(135deg,#dc2626,#ff6b6b);
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:900;
      color:#ffffff;
      font-size:clamp(14px,1.8vw,18px);
      box-shadow:0 8px 24px rgba(220,38,38,.3);
      position:sticky;
      top:100px;
    }

    .hiw-timeline-content {
      background:rgba(255,255,255,.6);
      backdrop-filter:blur(20px) saturate(180%);
      border:1px solid rgba(180,180,180,.2);
      border-radius:16px;
      padding:clamp(20px,3vw,28px);
      position:relative;
      z-index:1;
    }

    .hiw-timeline-content h4 {
      font-size:clamp(16px,2vw,20px);
      font-weight:900;
      color:#dc2626;
      margin:0 0 12px;
      font-family:'Fraunces',serif;
    }

    .hiw-timeline-content p {
      font-size:clamp(12px,1.2vw,14px);
      color:#2d2d2d;
      margin:0;
      line-height:1.7;
      font-weight:500;
    }

    .hiw-do-donts {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));
      gap:clamp(20px, 2.5vw, 28px);
      max-width:1200px;
      margin:40px auto;
      padding:0 clamp(16px, 2vw, 40px) 60px;
      position:relative;
      z-index:10;
    }

    .hiw-do, .hiw-dont {
      border-radius:16px;
      padding:clamp(20px,3vw,28px);
      backdrop-filter:blur(20px) saturate(180%);
      border:1.5px solid;
      transition:all .3s ease;
    }

    .hiw-do {
      background:rgba(34,197,94,.1);
      border-color:rgba(34,197,94,.3);
    }

    .hiw-do:hover {
      transform:translateY(-4px);
      box-shadow:0 16px 40px rgba(34,197,94,.15);
    }

    .hiw-dont {
      background:rgba(220,38,38,.08);
      border-color:rgba(220,38,38,.3);
    }

    .hiw-dont:hover {
      transform:translateY(-4px);
      box-shadow:0 16px 40px rgba(220,38,38,.15);
    }

    .hiw-do h4, .hiw-dont h4 {
      font-size:clamp(14px,1.8vw,18px);
      font-weight:900;
      margin:0 0 12px;
      font-family:'Fraunces',serif;
    }

    .hiw-do h4 {
      color:#22c55e;
    }

    .hiw-dont h4 {
      color:#dc2626;
    }

    .hiw-do ul, .hiw-dont ul {
      margin:0;
      padding:0 0 0 20px;
      list-style:none;
    }

    .hiw-do li, .hiw-dont li {
      font-size:clamp(12px,1.2vw,13px);
      color:#2d2d2d;
      margin-bottom:8px;
      line-height:1.6;
      font-weight:500;
      position:relative;
      padding-left:12px;
    }

    .hiw-do li::before {
      content:'';
      position:absolute;
      left:0;
      top:6px;
      width:6px;
      height:6px;
      background:#22c55e;
      border-radius:50%;
    }

    .hiw-dont li::before {
      content:'';
      position:absolute;
      left:0;
      top:6px;
      width:6px;
      height:6px;
      background:#dc2626;
      border-radius:50%;
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
      .hiw-timeline-item {
        grid-template-columns:1fr;
      }
      .hiw-timeline-dot {
        position:static;
      }
    }
  `

  if (typeof document !== 'undefined' && !document.getElementById('hiw-styles')) {
    const s = document.createElement('style')
    s.id = 'hiw-styles'
    s.textContent = STYLES
    document.head.appendChild(s)
  }

  const eligibilityCriteria = [
    {
      title: 'Age & Weight',
      description: 'Must be 18 years or older and weigh at least 50 kg. Your body needs sufficient mass to safely donate blood.'
    },
    {
      title: 'Health Status',
      description: 'Be in good general health with no active infections, fever, or chronic conditions that could affect donation safety.'
    },
    {
      title: 'Blood Type',
      description: 'Possess one of the eight major blood types: O, A, B, or AB with Rh positive or negative factors.'
    },
    {
      title: 'Hemoglobin Levels',
      description: 'Have adequate hemoglobin count. We screen during registration to ensure your blood iron levels are healthy.'
    },
    {
      title: 'Medications',
      description: 'Not taking medications that could affect blood safety. Some medications require a waiting period before donation.'
    },
    {
      title: 'Lifestyle Factors',
      description: 'Maintain responsible habits - adequate sleep, proper nutrition, and avoid substance abuse to maintain donor eligibility.'
    }
  ]

  const recoveryTimeline = [
    {
      time: '0-30 Minutes',
      title: 'The Donation',
      description: 'A trained phlebotomist will collect approximately 450ml of blood. The process is quick and safe with medical professionals monitoring your vitals throughout.'
    },
    {
      time: '30 Minutes - 2 Hours',
      title: 'Recovery Station',
      description: 'Rest in our recovery area. Enjoy refreshments including juice, water, and snacks. Your body begins replacing lost fluids immediately.'
    },
    {
      time: '2-24 Hours',
      title: 'First Day',
      description: 'Light activities are fine. Stay hydrated and maintain normal eating patterns. Avoid strenuous exercise and heavy lifting for the rest of the day.'
    },
    {
      time: '1-7 Days',
      title: 'First Week',
      description: 'Your body continues replenishing blood cells. Drink plenty of fluids, eat iron-rich foods, and get adequate sleep. Most donors feel completely normal within 48 hours.'
    },
    {
      time: '1-3 Months',
      title: 'Full Recovery',
      description: 'Your body fully replaces the donated blood volume. Red blood cells take about 4-6 weeks to recover completely. You can donate again after 8 weeks.'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
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

  const dots = Array.from({ length: 12 }, (_, i) => ({
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
        <p className="hiw-hero-subtitle">Be A Responsible Donor</p>
        <h1>Your Health Matters</h1>
        <p>
          Learn who can donate, what makes you eligible, and how to care for yourself after giving blood. A healthy donor saves more lives.
        </p>
      </motion.section>

      {/* ELIGIBILITY SECTION */}
      <h2 className="hiw-section-title">Who Can Donate</h2>
      <p className="hiw-section-desc">
        Blood donation requires meeting specific health and physical criteria to ensure the safety of both donors and recipients
      </p>

      <motion.div
        className="hiw-cards-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {eligibilityCriteria.map((item, idx) => (
          <motion.div
            key={idx}
            className="hiw-card"
            variants={itemVariants}
            whileHover={{ y: -4 }}
          >
            <div className="hiw-card-icon">
              {idx === 0 ? '18+' : idx === 1 ? 'OK' : idx === 2 ? 'AB' : idx === 3 ? 'RBC' : idx === 4 ? 'Rx' : 'Fit'}
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* POST-DONATION TIMELINE */}
      <h2 className="hiw-section-title">Your Recovery Journey</h2>
      <p className="hiw-section-desc">
        What to expect after donating and how your body bounces back
      </p>

      <motion.div
        className="hiw-timeline"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {recoveryTimeline.map((item, idx) => (
          <motion.div
            key={idx}
            className="hiw-timeline-item"
            variants={itemVariants}
          >
            <div className="hiw-timeline-dot">{idx + 1}</div>
            <div className="hiw-timeline-content">
              <h4>{item.title}</h4>
              <p style={{ fontSize: 'clamp(11px,1.1vw,12px)', color: '#666', fontWeight: 600, marginBottom: 8 }}>
                {item.time}
              </p>
              <p>{item.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* DO'S AND DON'TS */}
      <h2 className="hiw-section-title">After Donation</h2>
      <p className="hiw-section-desc">
        Simple guidelines to help your body recover quickly and safely
      </p>

      <motion.div
        className="hiw-do-donts"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.div className="hiw-do" variants={itemVariants}>
          <h4>What To Do</h4>
          <ul>
            <li>Stay hydrated - drink plenty of water and fluids</li>
            <li>Eat iron-rich foods like red meat, spinach, beans</li>
            <li>Rest for at least 24 hours after donation</li>
            <li>Keep the donation site clean and dry</li>
            <li>Return for follow-up screening if advised</li>
            <li>Wear loose, comfortable clothing for 24 hours</li>
          </ul>
        </motion.div>

        <motion.div className="hiw-dont" variants={itemVariants}>
          <h4>What To Avoid</h4>
          <ul>
            <li>Strenuous exercise or heavy lifting for 24-48 hours</li>
            <li>Driving or operating machinery for 15 minutes post-donation</li>
            <li>Smoking and alcohol for at least 48 hours</li>
            <li>Hot baths or saunas for 24 hours</li>
            <li>Removing the bandage for at least 4 hours</li>
            <li>Donating plasma for 48 hours after blood donation</li>
          </ul>
        </motion.div>
      </motion.div>

      {/* IMPORTANT INFO */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="hiw-cta"
        style={{ background: 'rgba(220,38,38,.08)' }}
      >
        <h2 style={{ color: '#dc2626' }}>Critical Health Information</h2>
        <p className="hiw-cta-subtitle" style={{ color: '#666' }}>
          You cannot donate if you have: active infections or fever, hepatitis or HIV, bleeding disorders, recent vaccinations within the specified timeframe, or are pregnant. Always inform medical staff of your complete medical history.
        </p>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="hiw-cta"
      >
        <h2>Ready To Become A Hero</h2>
        <p className="hiw-cta-subtitle">
          If you meet the eligibility criteria and feel healthy, start your donation journey today. Your commitment saves lives.
        </p>
        <motion.button
          className="hiw-cta-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/donor/register')}
        >
          Register As A Donor
        </motion.button>
      </motion.section>

      {/* FOOTER */}
      <footer className="hiw-footer">
        BloodConnect Health Guidelines 2026. Always consult healthcare professionals before donating. Your health and safety come first.
      </footer>
    </div>
  )
}

export default HowItWorks