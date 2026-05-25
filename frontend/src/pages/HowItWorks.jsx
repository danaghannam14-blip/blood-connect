import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'


function HowItWorks() {
  const navigate = useNavigate()

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&family=Cinzel:wght@400;600;700;900&display=swap');
    
    @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
    @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }
    @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(220,38,38,.3); } 50% { box-shadow: 0 0 40px rgba(220,38,38,.5); } }
    @keyframes slide-in { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }

    .hiw-root {
      min-height:100vh;
      background:linear-gradient(135deg,#f5f1ed 0%,#ede8e2 25%,#e8dfd5 50%,#f0ebe5 75%,#f5f1ed 100%);
      background-size:400% 400%;
      animation:gradient-shift 15s ease infinite;
      font-family:'Plus Jakarta Sans',sans-serif;
      overflow-x:hidden;
      position:relative;
      color:#3d3d3d;
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

    .hiw-nav {
      position:sticky;top:0;z-index:50;
      background:rgba(255,255,255,.85);
      backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(200,180,160,.2);
      padding:16px 44px;
      display:flex;justify-content:space-between;align-items:center;
    }

    .hiw-logo {
      display:flex;flex-direction:column;gap:4px;cursor:pointer;
      transition:all .3s ease;
    }

    .hiw-logo:hover {
      transform:scale(1.05);
    }

    .hiw-logo-main {
      font-size:18px;font-weight:900;color:#c92a2a;
      font-family:'Fraunces',serif;
      letter-spacing:1px;
    }

    .hiw-logo-sub {
      font-size:11px;font-weight:700;color:rgba(61,61,61,.6);font-style:italic;
      font-family:'Fraunces',serif;
      letter-spacing:0.5px;
    }

    .hiw-hero {
      padding:120px 44px;
      text-align:center;
      max-width:1000px;
      margin:0 auto;
      position:relative;
      z-index:10;
    }

    .hiw-hero h1 {
      font-family:'Fraunces',serif;
      font-size:clamp(42px,6vw,72px);
      font-weight:900;
      color:#8B0000;
      margin:0 0 20px;
      line-height:1.1;
      letter-spacing:-1px;
      text-shadow:3px 3px 6px rgba(0,0,0,.15);
    }

    .hiw-hero-subtitle {
      font-size:16px;
      color:#c92a2a;
      font-weight:900;
      margin:0 0 12px;
      text-transform:uppercase;
      letter-spacing:2px;
      font-family:'Fraunces',serif;
    }

    .hiw-hero p {
      font-size:18px;
      color:#2d2d2d;
      font-weight:600;
      margin:0 0 40px;
      line-height:1.8;
      max-width:700px;
      margin-left:auto;
      margin-right:auto;
    }

    .hiw-stats {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));
      gap:24px;
      max-width:1000px;
      margin:60px auto;
      padding:0 44px;
      position:relative;
      z-index:10;
    }

    .hiw-stat-box {
      background:rgba(255,255,255,.7);
      backdrop-filter:blur(20px);
      border:1px solid rgba(200,180,160,.2);
      border-radius:16px;
      padding:24px;
      text-align:center;
      transition:all .3s ease;
    }

    .hiw-stat-box:hover {
      transform:translateY(-6px);
      box-shadow:0 20px 40px rgba(201,42,42,.1);
      border-color:rgba(201,42,42,.3);
    }

    .hiw-stat-number {
      font-size:clamp(32px,5vw,48px);
      font-weight:900;
      color:#c92a2a;
      font-family:'Cinzel',serif;
      margin:0 0 8px;
    }

    .hiw-stat-label {
      font-size:13px;
      color:rgba(61,61,61,.6);
      text-transform:uppercase;
      font-weight:700;
      letter-spacing:1px;
      margin:0;
    }

    .hiw-section-title {
      font-family:'Fraunces',serif;
      font-size:clamp(36px,5vw,52px);
      font-weight:900;
      color:#8B0000;
      margin:80px 44px 0;
      text-align:center;
      position:relative;
      z-index:10;
      letter-spacing:-0.5px;
      text-shadow:2px 2px 4px rgba(0,0,0,.1);
    }

    .hiw-section-desc {
      text-align:center;
      font-size:16px;
      color:#3d3d3d;
      margin:16px 44px 60px;
      max-width:700px;
      margin-left:auto;
      margin-right:auto;
      position:relative;
      z-index:10;
      line-height:1.8;
      font-weight:600;
    }

    .hiw-steps {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));
      gap:28px;
      max-width:1300px;
      margin:0 auto;
      padding:0 44px 80px;
      position:relative;
      z-index:10;
    }

    .hiw-step-card {
      background:rgba(255,255,255,.65);
      backdrop-filter:blur(20px);
      border:1px solid rgba(200,180,160,.25);
      border-radius:20px;
      padding:40px;
      text-align:center;
      transition:all .4s cubic-bezier(.22,1,.36,1);
      position:relative;
      overflow:hidden;
    }

    .hiw-step-card::before {
      content:'';
      position:absolute;
      top:0;left:0;right:0;bottom:0;
      background:radial-gradient(circle at top right, rgba(201,42,42,.05), transparent);
      pointer-events:none;
    }

    .hiw-step-card:hover {
      transform:translateY(-12px);
      box-shadow:0 30px 60px rgba(201,42,42,.12);
      border-color:rgba(201,42,42,.3);
    }

    .hiw-step-number {
      width:70px;height:70px;
      background:linear-gradient(135deg,#c92a2a 0%,#a01e1e 100%);
      color:#ffffff;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:32px;font-weight:900;
      margin:0 auto 24px;
      position:relative;
      z-index:1;
      box-shadow:0 8px 24px rgba(201,42,42,.3);
      font-family:'Cinzel',serif;
      animation:pulse-glow 3s ease-in-out infinite;
    }

    .hiw-step-card h3 {
      font-family:'Fraunces',serif;
      font-size:clamp(20px,2.5vw,28px);
      font-weight:900;
      color:#8B0000;
      margin:0 0 16px;
      position:relative;
      z-index:1;
      letter-spacing:-0.3px;
      text-shadow:1px 1px 2px rgba(0,0,0,.08);
    }

    .hiw-step-card p {
      font-size:15px;
      color:#2d2d2d;
      margin:0;
      line-height:1.7;
      position:relative;
      z-index:1;
      font-weight:600;
    }

    .hiw-timeline {
      position:relative;
      max-width:1200px;
      margin:80px auto;
      padding:0 44px;
      z-index:10;
    }

    .hiw-timeline::before {
      content:'';
      position:absolute;
      left:50%;
      transform:translateX(-50%);
      width:2px;
      height:100%;
      background:linear-gradient(180deg, rgba(201,42,42,.3), transparent);
    }

    @media (max-width:1024px) {
      .hiw-timeline::before {
        display:none;
      }
      
      .hiw-section-title {
        margin:60px 20px 0;
      }

      .hiw-section-desc {
        margin:16px 20px 40px;
      }
    }

    .hiw-cta {
      text-align:center;
      padding:100px 44px;
      background:linear-gradient(135deg, rgba(255,255,255,.8) 0%, rgba(255,255,255,.6) 100%);
      margin-top:80px;
      border-top:2px solid rgba(201,42,42,.1);
      border-bottom:2px solid rgba(201,42,42,.1);
      position:relative;
      z-index:10;
    }

    .hiw-cta h2 {
      font-family:'Fraunces',serif;
      font-size:clamp(36px,5vw,56px);
      font-weight:900;
      color:#8B0000;
      margin:0 0 16px;
      letter-spacing:-0.5px;
      text-shadow:2px 2px 4px rgba(0,0,0,.1);
    }

    .hiw-cta-subtitle {
      font-size:16px;
      color:#3d3d3d;
      margin:0 0 32px;
      font-weight:600;
    }

    .hiw-cta-btn {
      background:linear-gradient(135deg,#c92a2a 0%,#a01e1e 100%);
      color:#ffffff;
      border:none;
      padding:14px 48px;
      border-radius:10px;
      font-weight:900;
      cursor:pointer;
      transition:all .35s cubic-bezier(.25,1,.5,1);
      font-size:14px;
      text-transform:uppercase;
      letter-spacing:1px;
      box-shadow:0 10px 30px rgba(201,42,42,.25);
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
      transform:translateY(-4px);
      box-shadow:0 16px 48px rgba(201,42,42,.35);
    }

    .hiw-cta-btn:hover::before {
      left:100%;
    }

    .hiw-footer {
      background:rgba(255,255,255,.6);
      backdrop-filter:blur(12px);
      border-top:1px solid rgba(200,180,160,.25);
      padding:32px 44px;
      text-align:center;
      font-size:13px;
      color:rgba(61,61,61,.6);
      font-weight:600;
      position:relative;
      z-index:10;
    }

    @media (max-width:960px) {
      .hiw-nav { padding:12px 20px; }
      .hiw-hero { padding:60px 20px; }
      .hiw-steps { padding:0 20px 60px; gap:20px; }
      .hiw-cta { padding:60px 20px; }
      .hiw-footer { padding:20px; }
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
      title: 'Create Your Profile',
      description: 'Register with your health information. Quick, secure, and takes just 5 minutes. Your data is protected with medical-grade encryption.'
    },
    {
      number: '2',
      title: 'Get Matched',
      description: 'Our intelligent system matches you with patients who need your blood type urgently. Real-time notifications keep you in the loop.'
    },
    {
      number: '3',
      title: 'Choose Location',
      description: 'Donate at our BCC Hamra center or any of our 189+ hospital partners across Lebanon. Flexibility that works for you.'
    },
    {
      number: '4',
      title: 'Make Your Donation',
      description: 'Complete the donation process with our medical professionals. 30-45 minutes to save lives. Professional care guaranteed.'
    },
    {
      number: '5',
      title: 'Track Impact',
      description: 'See your donation in action. Track who your blood helps and the lives you\'ve saved. Real impact, real stories.'
    },
    {
      number: '6',
      title: 'Earn Recognition',
      description: 'Build your donor profile, earn badges, and become part of Lebanon\'s hero community. Your contribution matters.'
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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
    }
  }

  return (
    <div className="hiw-root">
      {/* ANIMATED ORBS */}
      <div className="hiw-orbs">
        <motion.div
          className="hiw-orb"
          style={{
            width: 'min(400px,35vw)',
            height: 'min(400px,35vw)',
            background: 'rgba(220,38,38,.06)',
            top: '-10%',
            left: '-8%',
          }}
          animate={{ y: [0, -60, 0], x: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hiw-orb"
          style={{
            width: 'min(350px,30vw)',
            height: 'min(350px,30vw)',
            background: 'rgba(155,155,155,.04)',
            top: '25%',
            right: '-10%',
          }}
          animate={{ y: [0, -60, 0], x: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hiw-orb"
          style={{
            width: 'min(380px,32vw)',
            height: 'min(380px,32vw)',
            background: 'rgba(220,38,38,.05)',
            bottom: '-15%',
            left: '10%',
          }}
          animate={{ y: [0, -60, 0], x: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* NAV */}
      <nav className="hiw-nav">
        <motion.div 
          className="hiw-logo" 
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="hiw-logo-main">BloodConnect</div>
          <div className="hiw-logo-sub">Save Lives, Every Day</div>
        </motion.div>
      </nav>

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="hiw-hero"
      >
        <p className="hiw-hero-subtitle">How It Works</p>
        <h1>Your Blood Saves Lives</h1>
        <p>
          BloodConnect revolutionizes blood donation and distribution in Lebanon. Our smart matching system connects compassionate donors like you with patients in critical need. Together, we're building a more connected, efficient, and life-saving blood banking future.
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
            whileHover={{ y: -12 }}
          >
            <div className="hiw-step-number">{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
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
        © 2026 BloodConnect. Smart Donor Matching System. Saving Lives Together. All rights reserved.
      </footer>
    </div>
  )
}

export default HowItWorks