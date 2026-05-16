import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PremiumHamburgerMenu } from '../components/NavbarHamburger-Premium'

function Impact() {
  const navigate = useNavigate()

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
    
    @keyframes gradient { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
    @keyframes pulse-number { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

    .imp-root {
      min-height:100vh;
      background:linear-gradient(-45deg,#FFEBEE,#F8F9FA,#FFEBEE,rgba(14,165,233,.35));
      background-size:400% 400%;
      animation:gradient 14s ease infinite;
      font-family:'Plus Jakarta Sans',sans-serif;
      overflow-x:hidden;
    }

    .imp-nav {
      position:sticky;top:0;z-index:50;
      background:rgba(255,255,255,.85);
      backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(211,47,47,.08);
      padding:16px 44px;
      display:flex;justify-content:space-between;align-items:center;
    }

    .imp-logo {
      display:flex;flex-direction:column;gap:2px;cursor:pointer;
    }

    .imp-logo-main {
      font-size:16px;font-weight:900;color:#D32F2F;
    }

    .imp-logo-sub {
      font-size:10px;font-weight:700;color:rgba(211,47,47,.6);font-style:italic;
    }

    .imp-hero {
      padding:100px 44px;
      text-align:center;
      max-width:1200px;
      margin:0 auto;
    }

    .imp-hero h1 {
      font-family:'Fraunces',serif;
      font-size:56px;
      font-weight:900;
      color:#D32F2F;
      margin:0 0 24px;
      line-height:1.1;
    }

    .imp-hero p {
      font-size:16px;
      color:rgba(211,47,47,.65);
      font-weight:600;
      margin:0 0 40px;
      line-height:1.7;
    }

    .imp-stats {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));
      gap:32px;
      max-width:1200px;
      margin:60px auto;
      padding:0 44px;
    }

    .imp-stat-card {
      background:rgba(255,255,255,.5);
      backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,.8);
      border-radius:24px;
      padding:40px 32px;
      text-align:center;
      transition:all .3s ease;
    }

    .imp-stat-card:hover {
      transform:translateY(-8px);
      box-shadow:0 20px 40px rgba(211,47,47,.1);
    }

    .imp-stat-number {
      font-family:'Fraunces',serif;
      font-size:48px;
      font-weight:900;
      color:#D32F2F;
      margin:0 0 8px;
      animation:pulse-number 2s ease-in-out infinite;
    }

    .imp-stat-label {
      font-size:14px;
      font-weight:700;
      color:rgba(211,47,47,.65);
      text-transform:uppercase;
      letter-spacing:0.1em;
      margin:0;
    }

    .imp-stat-description {
      font-size:12px;
      color:rgba(211,47,47,.5);
      margin-top:12px;
    }

    .imp-stories {
      max-width:1200px;
      margin:100px auto;
      padding:0 44px;
    }

    .imp-stories h2 {
      font-family:'Fraunces',serif;
      font-size:36px;
      font-weight:900;
      color:#D32F2F;
      text-align:center;
      margin:0 0 60px;
    }

    .imp-story-grid {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));
      gap:32px;
    }

    .imp-story-card {
      background:rgba(255,255,255,.5);
      backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,.8);
      border-radius:24px;
      padding:32px;
      transition:all .3s ease;
    }

    .imp-story-card:hover {
      transform:translateY(-8px);
      box-shadow:0 20px 40px rgba(211,47,47,.1);
    }

    .imp-story-card h3 {
      font-family:'Fraunces',serif;
      font-size:18px;
      font-weight:900;
      color:#D32F2F;
      margin:0 0 12px;
    }

    .imp-story-card p {
      font-size:14px;
      color:rgba(211,47,47,.65);
      line-height:1.6;
      margin:0;
    }

    .imp-cta {
      text-align:center;
      padding:60px 44px;
      background:rgba(211,47,47,.05);
      margin-top:80px;
    }

    .imp-cta h2 {
      font-family:'Fraunces',serif;
      font-size:36px;
      font-weight:900;
      color:#D32F2F;
      margin:0 0 20px;
    }

    .imp-cta-btn {
      background:linear-gradient(135deg,#D32F2F,#ff6b6b);
      color:white;
      border:none;
      padding:16px 48px;
      border-radius:24px;
      font-weight:900;
      cursor:pointer;
      transition:all .3s ease;
      font-size:15px;
    }

    .imp-cta-btn:hover {
      transform:translateY(-3px);
      box-shadow:0 12px 24px rgba(211,47,47,.3);
    }

    @media (max-width:960px) {
      .imp-nav { padding:12px 20px; }
      .imp-hero { padding:60px 20px; }
      .imp-hero h1 { font-size:36px; }
      .imp-stats { padding:0 20px; }
      .imp-stories { padding:0 20px; }
    }
  `

  if (typeof document !== 'undefined' && !document.getElementById('imp-styles')) {
    const s = document.createElement('style')
    s.id = 'imp-styles'
    s.textContent = STYLES
    document.head.appendChild(s)
  }

  const stats = [
    { number: '189+', label: 'Hospital Partners', desc: 'Across Lebanon' },
    { number: '2500+', label: 'Active Donors', desc: 'Lives in action' },
    { number: '15K+', label: 'Units Donated', desc: 'In 2025' },
    { number: '45K+', label: 'Lives Impacted', desc: 'Patients helped' },
  ]

  return (
    <div className="imp-root">
      {/* NAV */}
      <nav className="imp-nav">
        <div className="imp-logo" onClick={() => navigate('/')}>
          <div className="imp-logo-main">BloodConnect</div>
          <div className="imp-logo-sub">Smart Donor Matching System</div>
        </div>
        <PremiumHamburgerMenu />
      </nav>

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="imp-hero"
      >
        <h1>Our Impact</h1>
        <p>
          Since our launch, BloodConnect has transformed how Lebanon approaches 
          blood donation. Here's what we've accomplished together.
        </p>
      </motion.section>

      {/* STATS */}
      <div className="imp-stats">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="imp-stat-card"
          >
            <div className="imp-stat-number">{stat.number}</div>
            <p className="imp-stat-label">{stat.label}</p>
            <p className="imp-stat-description">{stat.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* STORIES */}
      <section className="imp-stories">
        <h2>Donor Stories</h2>
        <div className="imp-story-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="imp-story-card"
          >
            <h3>Fatima's First Donation</h3>
            <p>
              "I was nervous about donating, but BloodConnect made it so easy. 
              Knowing my blood helped 3 patients in the first month is incredible."
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="imp-story-card"
          >
            <h3>Hospital Partnership Success</h3>
            <p>
              "BloodConnect has streamlined our blood management. We can now 
              predict demand and reduce waste by 40%."
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="imp-story-card"
          >
            <h3>Emergency Response</h3>
            <p>
              "During the hospital crisis, BloodConnect helped us find O- blood 
              donors in 30 minutes. Literally life-saving."
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="imp-cta"
      >
        <h2>Join the Movement</h2>
        <p style={{ fontSize: '16px', color: 'rgba(211,47,47,.65)', marginBottom: '24px' }}>
          Every donation counts. Be part of Lebanon's blood revolution.
        </p>
        <button className="imp-cta-btn" onClick={() => navigate('/donor/register')}>
          Become a Donor Today
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

export default Impact