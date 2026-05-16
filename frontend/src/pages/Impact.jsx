import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { PremiumHamburgerMenu } from '../components/NavbarHamburger-Premium'

function Impact() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 60) }, [])

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
    
    @keyframes im-gradient { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
    @keyframes im-pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }

    .im-root {
      min-height:100vh;
      background:linear-gradient(-45deg,#FFEBEE,#F8F9FA,#FFEBEE,rgba(14,165,233,.25));
      background-size:400% 400%;
      animation:im-gradient 14s ease infinite;
      font-family:'Plus Jakarta Sans',sans-serif;
      overflow-x:hidden;
    }

    .im-nav {
      position:sticky;top:0;z-index:50;
      background:rgba(255,255,255,.85);
      backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(211,47,47,.08);
      box-shadow:0 2px 12px rgba(211,47,47,.04);
    }

    .im-nav-inner {
      max-width:1360px;margin:0 auto;
      display:flex;justify-content:space-between;align-items:center;
      padding:16px 44px;
      gap:32px;
    }

    .im-logo {
      display:flex;flex-direction:column;gap:2px;cursor:pointer;
    }

    .im-logo-main {
      font-size:16px;font-weight:900;color:#D32F2F;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.1;
    }

    .im-logo-sub {
      font-size:10px;font-weight:700;color:rgba(211,47,47,.6);font-style:italic;
    }

    .im-emergency-btn {
      background:linear-gradient(135deg,#D32F2F,#ff6b6b);
      color:white;
      border:none;
      cursor:pointer;
      padding:12px 28px;
      border-radius:20px;
      font-weight:900;
      font-size:13px;
      font-family:'Plus Jakarta Sans',sans-serif;
      box-shadow:0 8px 24px rgba(211,47,47,.25);
      transition:all .22s cubic-bezier(.34,1.56,.64,1);
      display:flex;align-items:center;gap:6px;
    }

    .im-emergency-btn:hover {
      transform:translateY(-2px);
      box-shadow:0 12px 32px rgba(211,47,47,.35);
    }

    .im-stat {
      text-align:center;
      padding:32px 24px;
      border-radius:20px;
      background:rgba(255,255,255,.5);
      backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,.8);
    }

    .im-stat-value {
      font-family:'Fraunces',serif;
      font-size:48px;
      font-weight:900;
      color:#D32F2F;
      margin:0 0 12px;
      text-shadow:0 4px 16px rgba(211,47,47,.15);
    }

    .im-stat-label {
      font-size:13px;
      color:rgba(211,47,47,.65);
      font-weight:600;
      margin:0;
      line-height:1.6;
    }

    .im-fact {
      padding:28px 24px;
      border-radius:20px;
      background:rgba(255,235,238,.35);
      backdrop-filter:blur(12px);
      border:1px solid rgba(211,47,47,.12);
      transition:all .28s cubic-bezier(.22,1,.36,1);
    }

    .im-fact:hover {
      transform:translateY(-4px);
      box-shadow:0 12px 32px rgba(211,47,47,.1);
    }

    .im-fact-icon {
      width:44px;
      height:44px;
      border-radius:50%;
      background:linear-gradient(135deg,#D32F2F,#ff6b6b);
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:900;
      font-size:18px;
      margin-bottom:12px;
      box-shadow:0 6px 16px rgba(211,47,47,.2);
    }

    .im-fact-title {
      font-size:16px;
      font-weight:900;
      color:#D32F2F;
      margin:0 0 8px;
    }

    .im-fact-desc {
      font-size:13px;
      color:rgba(211,47,47,.65);
      font-weight:500;
      margin:0;
      line-height:1.65;
    }

    .im-cta {
      background:linear-gradient(135deg,#D32F2F,#ff6b6b);
      color:white;
      border:none;
      cursor:pointer;
      padding:16px 48px;
      border-radius:24px;
      font-weight:900;
      font-size:15px;
      font-family:'Plus Jakarta Sans',sans-serif;
      box-shadow:0 10px 28px rgba(211,47,47,.25);
      transition:all .22s cubic-bezier(.34,1.56,.64,1);
    }

    .im-cta:hover {
      transform:translateY(-3px);
      box-shadow:0 14px 36px rgba(211,47,47,.35);
    }

    .im-footer {
      background:rgba(255,255,255,.4);
      backdrop-filter:blur(12px);
      border-top:1px solid rgba(211,47,47,.08);
      padding:24px 44px;
      text-align:center;
      font-size:12px;
      color:rgba(211,47,47,.5);
      font-weight:500;
    }

    @media (max-width:960px) {
      .im-nav-inner { padding:12px 20px;gap:12px; }
      .im-logo-main { font-size:13px; }
      .im-stat-value { font-size:36px; }
      .im-fact-title { font-size:14px; }
      .im-fact-desc { font-size:12px; }
    }
  `

  if (typeof document !== 'undefined' && !document.getElementById('im-styles')) {
    const s = document.createElement('style')
    s.id = 'im-styles'
    s.textContent = STYLES
    document.head.appendChild(s)
  }

  const stats = [
    { value: '1 in 3', label: 'People will need blood in their lifetime' },
    { value: '4.5M', label: 'People need blood transfusions each year' },
    { value: '1 Pint', label: 'Can save up to 3 lives' },
  ]

  const facts = [
    {
      icon: 'H',
      title: 'Hospitals Always Need Blood',
      desc: 'Blood cannot be manufactured — it can only come from donors. Hospitals need a constant supply for surgeries, emergencies, and treatments.',
    },
    {
      icon: 'T',
      title: 'Blood Has a Short Shelf Life',
      desc: 'Red blood cells last only 42 days. Platelets last just 5 days. Regular donations are essential to maintain a stable blood supply.',
    },
    {
      icon: 'G',
      title: 'Global Shortage',
      desc: 'Many countries face chronic blood shortages. In Lebanon, the demand for blood is especially high due to accidents and medical conditions.',
    },
    {
      icon: 'S',
      title: 'Safe and Easy to Donate',
      desc: 'Donating blood is safe, takes about 10 minutes, and your body replenishes the blood within weeks. You can donate every 3 months.',
    },
  ]

  return (
    <div className="im-root">
      {/* NAV */}
      <header className="im-nav" style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)', transition:'transform .6s cubic-bezier(.22,1,.36,1)' }}>
        <div className="im-nav-inner">
          {/* Left: Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="im-logo"
            onClick={() => navigate('/')}
          >
            <div className="im-logo-main">BloodConnect</div>
            <div className="im-logo-sub">Smart Donor Matching System</div>
          </motion.div>

          {/* Center: Emergency Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => navigate('/emergency')}
            className="im-emergency-btn"
          >
            <span style={{ animation: 'im-pulse 1.2s cubic-bezier(0,0,.2,1) infinite', display: 'inline-block', fontWeight:900 }}>!</span>
            Emergency
          </motion.button>

          {/* Right: Hamburger Menu */}
          <PremiumHamburgerMenu />
        </div>
      </header>

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ padding:'60px 44px 80px', textAlign:'center' }}
      >
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'56px', fontWeight:900, color:'#D32F2F', lineHeight:1.1, margin:'0 0 16px' }}>
          Our Impact
        </h1>
        <p style={{ fontSize:'15px', color:'rgba(211,47,47,.65)', fontWeight:600, maxWidth:540, margin:'0 auto', lineHeight:1.7 }}>
          Every donation matters. Here's why blood donation is one of the most powerful things you can do.
        </p>
      </motion.section>

      {/* STATS */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'40px 44px 80px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'24px' }}>
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            className="im-stat"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
          >
            <p className="im-stat-value">{stat.value}</p>
            <p className="im-stat-label">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* FACTS */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'40px 44px 100px' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontFamily:"'Fraunces',serif", fontSize:'48px', fontWeight:900, color:'#D32F2F', textAlign:'center', margin:'0 0 60px', lineHeight:1.1 }}
        >
          Why Blood Donation Matters
        </motion.h2>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'24px' }}>
          {facts.map((fact, idx) => (
            <motion.div
              key={idx}
              className="im-fact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
            >
              <div className="im-fact-icon">{fact.icon}</div>
              <h3 className="im-fact-title">{fact.title}</h3>
              <p className="im-fact-desc">{fact.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{ padding:'60px 44px', textAlign:'center', margin:'40px 0 0' }}
      >
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'48px', fontWeight:900, color:'#D32F2F', margin:'0 0 16px', lineHeight:1.1 }}>
          Be the Reason Someone Survives
        </h2>
        <p style={{ fontSize:'14px', color:'rgba(211,47,47,.65)', fontWeight:600, margin:'0 0 24px' }}>
          Register today and become a lifesaver in your community.
        </p>
        <button
          onClick={() => navigate('/donor/register')}
          className="im-cta"
        >
          Register as Donor
        </button>
      </motion.section>

      {/* FOOTER - Clean and minimal */}
      <footer className="im-footer">
        © 2024 BloodConnect. Smart Donor Matching System. All rights reserved.
      </footer>
    </div>
  )
}

export default Impact