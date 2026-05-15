import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export function PremiumHamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

    @keyframes nm-slideIn { from { transform: translateX(-320px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes nm-slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-320px); opacity: 0; } }
    @keyframes nm-itemSlide { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes nm-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    @keyframes nm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes nm-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes nm-glow { 0%, 100% { box-shadow: 0 0 20px rgba(211,47,47,0.2); } 50% { box-shadow: 0 0 40px rgba(211,47,47,0.4); } }
    @keyframes nm-orb { 0%, 100% { transform: translateY(0) translateX(0) scale(1); } 33% { transform: translateY(-20px) translateX(15px) scale(1.1); } 66% { transform: translateY(8px) translateX(-10px) scale(0.95); } }
    @keyframes nm-particle { 0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; } 50% { transform: translateY(-20px) translateX(var(--px,4px)) scale(1.1); opacity: 0.8; } }

    .nm-hamburger {
      display: flex;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      width: 28px;
      height: 24px;
      position: relative;
      z-index: 45;
    }

    .nm-hamburger span {
      width: 100%;
      height: 2.5px;
      background: linear-gradient(90deg, #D32F2F, #405878);
      border-radius: 2px;
      transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: center;
    }

    .nm-hamburger.active span:nth-child(1) {
      transform: rotate(45deg) translateY(12px);
    }

    .nm-hamburger.active span:nth-child(2) {
      opacity: 0;
      transform: translateX(-10px);
    }

    .nm-hamburger.active span:nth-child(3) {
      transform: rotate(-45deg) translateY(-12px);
    }

    .nm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 40;
      animation: fadeIn 0.28s ease;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .nm-menu {
      position: fixed;
      top: 0;
      left: 0;
      width: 320px;
      height: 100vh;
      background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,245,247,0.98) 100%);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border-right: 2px solid rgba(211,47,47,0.12);
      z-index: 50;
      padding: 32px 0;
      overflow-y: auto;
      box-shadow: -24px 0 64px rgba(211,47,47,0.08);
      animation: nm-slideIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .nm-menu.close {
      animation: nm-slideOut 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* Orbs in menu */
    .nm-menu::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 300px;
      height: 300px;
      background: rgba(211,47,47,0.15);
      border-radius: 50%;
      filter: blur(80px);
      animation: nm-orb 8s ease-in-out infinite;
      pointer-events: none;
    }

    .nm-menu::after {
      content: '';
      position: absolute;
      bottom: 10%;
      left: -30%;
      width: 250px;
      height: 250px;
      background: rgba(64,88,120,0.12);
      border-radius: 50%;
      filter: blur(70px);
      animation: nm-orb 10s ease-in-out infinite reverse;
      pointer-events: none;
    }

    .nm-menu-inner {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .nm-header {
      padding: 0 24px;
      margin-bottom: 32px;
      border-bottom: 2px solid rgba(211,47,47,0.1);
      padding-bottom: 24px;
    }

    .nm-logo {
      font-family: 'Fraunces', serif;
      font-size: 28px;
      font-weight: 900;
      color: #D32F2F;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nm-logo-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(211,47,47,0.1);
      border-radius: 999px;
      border: 1px solid rgba(211,47,47,0.2);
    }

    .nm-logo-dot {
      width: 6px;
      height: 6px;
      background: #16a34a;
      border-radius: 50%;
      animation: nm-pulse 2s ease-in-out infinite;
      box-shadow: 0 0 8px #16a34a;
    }

    .nm-logo-text {
      font-size: 10px;
      font-weight: 700;
      color: #16a34a;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    .nm-items {
      flex: 1;
      padding: 0 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nm-item {
      position: relative;
      padding: 14px 20px;
      border-radius: 16px;
      cursor: pointer;
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 14px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
    }

    .nm-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(211,47,47,0.08) 0%, rgba(64,88,120,0.04) 100%);
      opacity: 0;
      transition: opacity 0.22s;
      border-radius: 16px;
    }

    .nm-item::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      border: 2px solid transparent;
      background: linear-gradient(135deg, rgba(211,47,47,0.2), rgba(64,88,120,0.1)) border-box;
      opacity: 0;
      transition: opacity 0.22s;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }

    .nm-item:hover::before { opacity: 1; }
    .nm-item:hover::after { opacity: 1; }
    .nm-item:hover { transform: translateX(6px); }

    .nm-item-icon {
      font-size: 20px;
      flex-shrink: 0;
      animation: nm-float 2s ease-in-out infinite;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nm-item-content {
      display: flex;
      flex-direction: column;
      gap: 3px;
      position: relative;
      z-index: 1;
    }

    .nm-item-label {
      font-size: 13px;
      font-weight: 800;
      color: #D32F2F;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0;
    }

    .nm-item-desc {
      font-size: 11px;
      color: rgba(211,47,47,0.55);
      font-weight: 500;
      margin: 0;
    }

    .nm-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(211,47,47,0.15), transparent);
      margin: 16px 20px;
    }

    .nm-footer {
      padding: 20px 24px;
      border-top: 2px solid rgba(211,47,47,0.1);
      margin-top: auto;
    }

    .nm-cta {
      width: 100%;
      padding: 14px 20px;
      background: linear-gradient(135deg, #D32F2F, #ff6b6b);
      color: white;
      border: none;
      border-radius: 16px;
      font-weight: 900;
      font-size: 13px;
      cursor: pointer;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      box-shadow: 0 12px 28px rgba(211,47,47,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .nm-cta::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255,255,255,0.3);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.4s, height 0.4s;
    }

    .nm-cta:hover::before { width: 300px; height: 300px; }
    .nm-cta:hover { transform: translateY(-3px); box-shadow: 0 18px 44px rgba(211,47,47,0.4); }

    .nm-social {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      justify-content: center;
    }

    .nm-social-link {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(211,47,47,0.1);
      border: 1px solid rgba(211,47,47,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.22s;
      color: #D32F2F;
      font-size: 14px;
    }

    .nm-social-link:hover { 
      background: rgba(211,47,47,0.2);
      transform: translateY(-3px);
    }

    @media (max-width: 768px) {
      .nm-menu { width: 100vw; }
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(211,47,47,0.2);
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(211,47,47,0.4);
    }
  `

  if (typeof document !== 'undefined' && !document.getElementById('nm-styles')) {
    const s = document.createElement('style')
    s.id = 'nm-styles'
    s.textContent = STYLES
    document.head.appendChild(s)
  }

  const menuItems = [
    {
      icon: '🔄',
      label: 'How It Works',
      desc: 'Smart matching system',
      action: () => { navigate('/#how-it-works'); setIsOpen(false) },
      delay: 0,
    },
    {
      icon: '💚',
      label: 'Our Impact',
      desc: 'Lives saved, stories told',
      action: () => { navigate('/#impact'); setIsOpen(false) },
      delay: 0.08,
    },
    {
      icon: '⚡',
      label: 'Live Network',
      desc: 'Real-time blood tracking',
      action: () => { navigate('/inventory'); setIsOpen(false) },
      delay: 0.16,
    },
    {
      icon: '🏥',
      label: 'Hospital Partners',
      desc: 'Trusted centers nationwide',
      action: () => { navigate('/#hospitals'); setIsOpen(false) },
      delay: 0.24,
    },
    {
      icon: '📊',
      label: 'Analytics',
      desc: 'Donor insights & trends',
      action: () => { navigate('/#analytics'); setIsOpen(false) },
      delay: 0.32,
    },
    {
      icon: '🌍',
      label: 'Community',
      desc: 'Join Lebanon\'s network',
      action: () => { navigate('/#community'); setIsOpen(false) },
      delay: 0.4,
    },
  ]

  return (
    <>
      {/* Hamburger Button */}
      <button
        className={`nm-hamburger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
        style={{ cursor: 'pointer' }}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="nm-overlay"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          />
        )}
      </AnimatePresence>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="nm-menu"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.28, type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="nm-menu-inner">
              {/* Header */}
              <div className="nm-header">
                <h1 className="nm-logo">
                  🩸 BloodConnect
                </h1>
                <div style={{ marginTop: 12 }}>
                  <div className="nm-logo-badge">
                    <div className="nm-logo-dot" />
                    <span className="nm-logo-text">Active Network</span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="nm-items">
                {menuItems.map((item, idx) => (
                  <motion.button
                    key={idx}
                    className="nm-item"
                    onClick={item.action}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: item.delay, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="nm-item-icon">{item.icon}</span>
                    <div className="nm-item-content">
                      <p className="nm-item-label">{item.label}</p>
                      <p className="nm-item-desc">{item.desc}</p>
                    </div>
                  </motion.button>
                ))}

                <div className="nm-divider" />

                {/* Secondary Items */}
                <motion.button
                  className="nm-item"
                  onClick={() => { navigate('/login'); setIsOpen(false) }}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.48, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="nm-item-icon">🔐</span>
                  <div className="nm-item-content">
                    <p className="nm-item-label">Sign In</p>
                    <p className="nm-item-desc">Access your account</p>
                  </div>
                </motion.button>

                <motion.button
                  className="nm-item"
                  onClick={() => { navigate('/donor/register'); setIsOpen(false) }}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.56, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="nm-item-icon">✨</span>
                  <div className="nm-item-content">
                    <p className="nm-item-label">Join Network</p>
                    <p className="nm-item-desc">Become a hero donor</p>
                  </div>
                </motion.button>
              </div>

              {/* Footer */}
              <div className="nm-footer">
                <button
                  className="nm-cta"
                  onClick={() => { navigate('/emergency'); setIsOpen(false) }}
                >
                  <span>🚨</span>
                  Emergency
                </button>

                <div className="nm-social">
                  <a href="#" className="nm-social-link" title="Facebook">f</a>
                  <a href="#" className="nm-social-link" title="Twitter">𝕏</a>
                  <a href="#" className="nm-social-link" title="LinkedIn">in</a>
                  <a href="#" className="nm-social-link" title="Instagram">📷</a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default PremiumHamburgerMenu