import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { PremiumHamburgerMenu } from '../components/NavbarHamburger-Premium'

function HowItWorks() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 60) }, [])

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
    
    @keyframes hw-gradient { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
    @keyframes hw-pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }

    .hw-root {
      min-height:100vh;
      background:linear-gradient(-45deg,#FFEBEE,#F8F9FA,#FFEBEE,rgba(14,165,233,.25));
      background-size:400% 400%;
      animation:hw-gradient 14s ease infinite;
      font-family:'Plus Jakarta Sans',sans-serif;
      overflow-x:hidden;
    }

    .hw-nav {
      position:sticky;top:0;z-index:50;
      background:rgba(255,255,255,.85);
      backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(211,47,47,.08);
      box-shadow:0 2px 12px rgba(211,47,47,.04);
    }

    .hw-nav-inner {
      max-width:1360px;margin:0 auto;
      display:flex;justify-content:space-between;align-items:center;
      padding:16px 44px;
      gap:32px;
    }

    .hw-logo {
      display:flex;flex-direction:column;gap:2px;cursor:pointer;
    }

    .hw-logo-main {
      font-size:16px;font-weight:900;color:#D32F2F;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.1;
    }

    .hw-logo-sub {
      font-size:10px;font-weight:700;color:rgba(211,47,47,.6);font-style:italic;
    }

    .hw-emergency-btn {
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

    .hw-emergency-btn:hover {
      transform:translateY(-2px);
      box-shadow:0 12px 32px rgba(211,47,47,.35);
    }

    .hw-step {
      display:flex;gap:24px;align-items:flex-start;
      padding:32px;
      border-radius:24px;
      background:rgba(255,255,255,.5);
      backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,.8);
      transition:all .28s cubic-bezier(.22,1,.36,1);
    }

    .hw-step:hover {
      transform:translateY(-4px);
      box-shadow:0 16px 40px rgba(211,47,47,.08);
    }

    .hw-number {
      width:56px;
      height:56px;
      border-radius:50%;
      background:linear-gradient(135deg,#D32F2F,#ff6b6b);
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:24px;
      font-weight:900;
      flex-shrink:0;
      box-shadow:0 8px 20px rgba(211,47,47,.25);
    }

    .hw-title {
      font-family:'Fraunces',serif;
      font-size:20px;
      font-weight:900;
      color:#D32F2F;
      margin:0 0 8px;
    }

    .hw-desc {
      font-size:14px;
      color:rgba(211,47,47,.65);
      font-weight:500;
      line-height:1.7;
      margin:0;
    }

    .hw-cta {
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

    .hw-cta:hover {
      transform:translateY(-3px);
      box-shadow:0 14px 36px rgba(211,47,47,.35);
    }

    .hw-footer {
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
      .hw-nav-inner { padding:12px 20px;gap:12px; }
      .hw-logo-main { font-size:13px; }
      .hw-step { gap:16px;padding:20px; }
      .hw-number { width:44px;height:44px;font-size:18px; }
      .hw-title { font-size:16px; }
      .hw-desc { font-size:13px; }
    }
  `

  if (typeof document !== 'undefined' && !document.getElementById('hw-styles')) {
    const s = document.createElement('style')
    s.id = 'hw-styles'
    s.textContent = STYLES
    document.head.appendChild(s)
  }

  const steps = [
    {
      number: '1',
      title: 'Register as a Donor',
      desc: 'Create your account by providing your personal information, blood type, and contact details. Registration takes less than 2 minutes.',
    },
    {
      number: '2',
      title: 'Complete Health Screening',
      desc: 'Answer a few health questions through our intelligent system. The system instantly determines your eligibility to donate blood safely.',
    },
    {
      number: '3',
      title: 'Get Matched with Nearby Hospitals',
      desc: 'Our smart matching system finds hospitals near you that urgently need your blood type. View them on an interactive map.',
    },
    {
      number: '4',
      title: 'Donate and Save Lives',
      desc: 'Visit the matched hospital and donate. One pint of blood can save up to 3 lives. Track your donation history through your dashboard.',
    },
    {
      number: 'S',
      title: 'Emergency Blood Search',
      desc: 'No login needed. Anyone in an emergency can instantly find the nearest hospital with available blood using our emergency map.',
    },
  ]

  return (
    <div className="hw-root">
      {/* NAV */}
      <header className="hw-nav" style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)', transition:'transform .6s cubic-bezier(.22,1,.36,1)' }}>
        <div className="hw-nav-inner">
          {/* Left: Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hw-logo"
            onClick={() => navigate('/')}
          >
            <div className="hw-logo-main">BloodConnect</div>
            <div className="hw-logo-sub">Smart Donor Matching System</div>
          </motion.div>

          {/* Center: Emergency Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => navigate('/emergency')}
            className="hw-emergency-btn"
          >
            <span style={{ animation: 'hw-pulse 1.2s cubic-bezier(0,0,.2,1) infinite', display: 'inline-block', fontWeight:900 }}>!</span>
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
          How BloodConnect Works
        </h1>
        <p style={{ fontSize:'15px', color:'rgba(211,47,47,.65)', fontWeight:600, maxWidth:540, margin:'0 auto', lineHeight:1.7 }}>
          A simple, smart, and life-saving process connecting donors with hospitals in real-time.
        </p>
      </motion.section>

      {/* STEPS */}
      <section style={{ maxWidth:900, margin:'0 auto', padding:'0 44px 100px', display:'flex', flexDirection:'column', gap:'24px' }}>
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            className="hw-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
          >
            <div className="hw-number">{step.number}</div>
            <div>
              <h3 className="hw-title">{step.title}</h3>
              <p className="hw-desc">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{ padding:'60px 44px', textAlign:'center', margin:'40px 0 0' }}
      >
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'48px', fontWeight:900, color:'#D32F2F', margin:'0 0 16px', lineHeight:1.1 }}>
          Ready to Save a Life?
        </h2>
        <p style={{ fontSize:'14px', color:'rgba(211,47,47,.65)', fontWeight:600, margin:'0 0 24px' }}>
          Join thousands of donors making a difference every day.
        </p>
        <button
          onClick={() => navigate('/donor/register')}
          className="hw-cta"
        >
          Register as Donor
        </button>
      </motion.section>

      {/* FOOTER - Clean and minimal */}
      <footer className="hw-footer">
        © 2024 BloodConnect. Smart Donor Matching System. All rights reserved.
      </footer>
    </div>
  )
}

export default HowItWorks