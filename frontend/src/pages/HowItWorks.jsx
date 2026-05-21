import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'


function HowItWorks() {
  const navigate = useNavigate()

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
    
    @keyframes gradient { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }

    .hiw-root {
      min-height:100vh;
      background:linear-gradient(-45deg,#f8f8f8,#efefef,#f8f8f8,rgba(14,165,233,.35));
      background-size:400% 400%;
      animation:gradient 14s ease infinite;
      font-family:'Plus Jakarta Sans',sans-serif;
      overflow-x:hidden;
    }

    .hiw-nav {
      position:sticky;top:0;z-index:50;
      background:rgba(255,255,255,.85);
      backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(211,47,47,.08);
      padding:16px 44px;
      display:flex;justify-content:space-between;align-items:center;
    }

    .hiw-logo {
      display:flex;flex-direction:column;gap:2px;cursor:pointer;
    }

    .hiw-logo-main {
      font-size:16px;font-weight:900;color:#dc2626;
    }

    .hiw-logo-sub {
      font-size:10px;font-weight:700;color:rgba(211,47,47,.6);font-style:italic;
    }

    .hiw-hero {
      padding:100px 44px;
      text-align:center;
      max-width:1200px;
      margin:0 auto;
    }

    .hiw-hero h1 {
      font-family:'Fraunces',serif;
      font-size:56px;
      font-weight:900;
      color:#dc2626;
      margin:0 0 24px;
      line-height:1.1;
    }

    .hiw-hero p {
      font-size:16px;
      color:rgba(211,47,47,.65);
      font-weight:600;
      margin:0 0 40px;
      line-height:1.7;
    }

    .hiw-steps {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));
      gap:32px;
      max-width:1200px;
      margin:60px auto;
      padding:0 44px;
    }

    .hiw-step-card {
      background:rgba(255,255,255,.5);
      backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,.8);
      border-radius:24px;
      padding:32px;
      text-align:center;
      transition:all .3s ease;
    }

    .hiw-step-card:hover {
      transform:translateY(-8px);
      box-shadow:0 20px 40px rgba#991b1b;
    }

    .hiw-step-number {
      width:60px;height:60px;
      background:linear-gradient(135deg,#dc2626,#ff6b6b);
      color:#faf7f7;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:28px;font-weight:900;
      margin:0 auto 16px;
    }

    .hiw-step-card h3 {
      font-family:'Fraunces',serif;
      font-size:20px;
      font-weight:900;
      color:#dc2626;
      margin:0 0 12px;
    }

    .hiw-step-card p {
      font-size:14px;
      color:rgba(211,47,47,.65);
      margin:0;
      line-height:1.6;
    }

    .hiw-cta {
      text-align:center;
      padding:60px 44px;
      background:rgba(211,47,47,.05);
      margin-top:80px;
    }

    .hiw-cta h2 {
      font-family:'Fraunces',serif;
      font-size:36px;
      font-weight:900;
      color:#dc2626;
      margin:0 0 20px;
    }

    .hiw-cta-btn {
      background:linear-gradient(135deg,#dc2626,#ff6b6b);
      color:#faf7f7;
      border:none;
      padding:16px 48px;
      border-radius:24px;
      font-weight:900;
      cursor:pointer;
      transition:all .3s ease;
      font-size:15px;
    }

    .hiw-cta-btn:hover {
      transform:translateY(-3px);
      box-shadow:0 12px 24px rgba(211,47,47,.3);
    }

    @media (max-width:960px) {
      .hiw-nav { padding:12px 20px; }
      .hiw-hero { padding:60px 20px; }
      .hiw-hero h1 { font-size:36px; }
      .hiw-steps { padding:0 20px; }
    }
  `

  if (typeof document !== 'undefined' && !document.getElementById('hiw-styles')) {
    const s = document.createElement('style')
    s.id = 'hiw-styles'
    s.textContent = STYLES
    document.head.appendChild(s)
  }

  return (
    <div className="hiw-root">
      {/* NAV */}
      <nav className="hiw-nav">
        <div className="hiw-logo" onClick={() => navigate('/')}>
          <div className="hiw-logo-main">BloodConnect</div>
          <div className="hiw-logo-sub">Smart Donor Matching System</div>
        </div>
       
      </nav>

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="hiw-hero"
      >
        <h1>How It Works</h1>
        <p>
          BloodConnect makes blood donation and distribution simple, transparent, 
          and life-saving. Here's how we're transforming Lebanon's blood banking system.
        </p>
      </motion.section>

      {/* STEPS */}
      <div className="hiw-steps">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hiw-step-card"
        >
          <div className="hiw-step-number">1</div>
          <h3>Register as Donor</h3>
          <p>
            Create your profile and provide basic health information. 
            Takes less than 5 minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hiw-step-card"
        >
          <div className="hiw-step-number">2</div>
          <h3>Find Hospital Partner</h3>
          <p>
            Browse our network of 189+ trusted hospitals across Lebanon. 
            Find the one nearest to you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hiw-step-card"
        >
          <div className="hiw-step-number">3</div>
         
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hiw-step-card"
        >
          <div className="hiw-step-number">4</div>
          <h3>Donate Blood</h3>
          <p>
            Complete your donation with our medical professionals. 
            Takes 30-45 minutes total.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="hiw-step-card"
        >
          <div className="hiw-step-number">5</div>
          <h3>Track Impact</h3>
          <p>
            See your donation in action. Track who your blood helps 
            and the lives you've saved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="hiw-step-card"
        >
          <div className="hiw-step-number">6</div>
          <h3>Earn Recognition</h3>
          <p>
            Build your donor profile and receive recognition for 
            your contribution to saving lives.
          </p>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="hiw-cta"
      >
        <h2>Ready to Save Lives?</h2>
        <p style={{ fontSize: '16px', color: 'rgba(211,47,47,.65)', marginBottom: '24px' }}>
          Join thousands of donors making a difference in Lebanon
        </p>
        <button className="hiw-cta-btn" onClick={() => navigate('/donor/register')}>
          Start Your Donation Journey
        </button>
      </motion.section>

      {/* FOOTER */}
      <footer style={{ 
        background: 'rgba(255,255,255,.4)', 
        backdropFilter: 'blur(12px)', 
        borderTop: '1px solid rgba(211,47,47,.08)', 
        padding: '24px 44px', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: 'rgba(211,47,47,.5)', 
        fontWeight: '500' 
      }}>
        © 2026 BloodConnect. Smart Donor Matching System. All rights reserved.
      </footer>
    </div>
  )
}

export default HowItWorks