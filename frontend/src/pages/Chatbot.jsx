import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const SCREENING_QUESTIONS = [
  {
    id: 1,
    key: 'feeling_healthy',
    text: 'Are you currently feeling healthy with no acute symptoms?',
    hint: 'No fever, cough, or shortness of breath'
  },
  {
    id: 2,
    key: 'chronic_illness',
    text: 'Do you have any chronic medical conditions?',
    hint: 'Diabetes, hypertension, heart disease, cancer, etc.'
  },
  {
    id: 3,
    key: 'recent_surgery',
    text: 'Have you had any surgery in the last 12 months?',
    hint: 'Major or minor surgical procedures'
  },
  {
    id: 4,
    key: 'medications',
    text: 'Are you currently taking any medications?',
    hint: 'Prescription or over-the-counter drugs'
  },
  {
    id: 5,
    key: 'recent_travel',
    text: 'Have you traveled internationally in the last 3 months?',
    hint: 'To countries with endemic diseases'
  },
  {
    id: 6,
    key: 'transfusions_tattoos',
    text: 'Have you had blood transfusions or tattoos recently?',
    hint: 'In the last 6 months - potential exposure risks'
  },
  {
    id: 7,
    key: 'willing_donate',
    text: 'Are you ready to become a lifesaver today?',
    hint: 'Final confirmation of your donation intent'
  }
]

const PREMIUM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }
  @keyframes pulse-ring { 0% { transform:scale(.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes glow-pulse { 0%,100% { box-shadow: 0 20px 60px rgba(220,38,38,.2), inset 0 1px 1px rgba(255,255,255,.3); } 50% { box-shadow: 0 30px 80px rgba(220,38,38,.3), inset 0 1px 1px rgba(255,255,255,.3); } }

  .prem-root {
    min-height:100vh;
    background:linear-gradient(135deg,#f8f8f8 0%,#efefef 25%,#e8e8e8 50%,#f2f2f2 75%,#f8f8f8 100%);
    background-size:400% 400%;
    animation:gradient-shift 15s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
    color:#380101;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(8px, 1.5vw, 16px);
  }

  .prem-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .prem-container {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 400px;
    height: auto;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    border-radius: 18px;
  }

  .prem-glass-deep {
    background:rgba(255,255,255,.55);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1.5px solid rgba(180,180,180,.25);
    box-shadow:0 25px 80px rgba(0,0,0,.12), inset 0 1px 1px rgba(255,255,255,.4);
    animation: glow-pulse 3s ease-in-out infinite;
  }

  .prem-header {
    padding: clamp(14px, 2vw, 18px);
    border-bottom: 1.5px solid rgba(180,180,180,.2);
    text-align: center;
    flex-shrink: 0;
  }

  .prem-header-title {
    font-family: 'Fraunces', serif;
    font-size: clamp(18px, 3.2vw, 24px);
    font-weight: 900;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 2px;
    letter-spacing: -0.3px;
  }

  .prem-header-subtitle {
    font-size: 8px;
    color: rgba(56,1,1,.55);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .07em;
    margin: 0;
  }

  .prem-messages {
    flex: 1;
    overflow-y: auto;
    padding: clamp(12px, 1.8vw, 16px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    scroll-behavior: smooth;
    min-height: 160px;
  }

  .prem-messages::-webkit-scrollbar {
    width: 6px;
  }

  .prem-messages::-webkit-scrollbar-track {
    background: transparent;
  }

  .prem-messages::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(220,38,38,.3), rgba(220,38,38,.15));
    border-radius: 3px;
  }

  .prem-bubble-bot {
    background: rgba(255,255,255,.65);
    border: 1.5px solid rgba(180,180,180,.25);
    border-radius: 20px 20px 20px 4px;
    padding: clamp(12px, 2vw, 16px) clamp(16px, 2vw, 20px);
    box-shadow: 0 8px 24px rgba(0,0,0,.08);
    max-width: 85%;
    word-wrap: break-word;
  }

  .prem-bubble-user {
    border-radius: 16px 16px 4px 16px;
    padding: clamp(10px, 1.8vw, 14px) clamp(14px, 1.8vw, 18px);
    max-width: 85%;
    word-wrap: break-word;
    font-weight: 600;
  }

  .prem-bubble-user-yes {
    background: linear-gradient(135deg, rgba(22,163,74,.3), rgba(22,163,74,.15));
    border: 1.5px solid rgba(22,163,74,.5);
    color: #16a34a;
    box-shadow: 0 6px 20px rgba(22,163,74,.2);
  }

  .prem-bubble-user-no {
    background: linear-gradient(135deg, rgba(220,38,38,.25), rgba(220,38,38,.12));
    border: 1.5px solid rgba(220,38,38,.4);
    color: #dc2626;
    box-shadow: 0 6px 20px rgba(220,38,38,.15);
  }

  .prem-bubble-text {
    font-size: clamp(12px, 1vw, 14px);
    line-height: 1.5;
    color: rgba(56,1,1,.78);
  }

  .prem-bubble-user .prem-bubble-text {
    color: inherit;
  }

  .prem-bubble-hint {
    margin-top: 8px;
    font-size: 11px;
    color: rgba(56,1,1,.55);
    font-style: italic;
    border-left: 2.5px solid rgba(220,38,38,.25);
    padding-left: 10px;
    opacity: 0.9;
  }

  .prem-footer {
    padding: clamp(12px, 1.8vw, 16px);
    border-top: 1.5px solid rgba(180,180,180,.2);
    flex-shrink: 0;
  }

  .prem-button-group {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .prem-btn {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border: none;
    outline: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    border-radius: 14px;
    transition: all .3s cubic-bezier(.34,1.56,.64,1);
    font-size: clamp(12px, 1.1vw, 14px);
    flex: 1;
    padding: clamp(12px, 1.5vw, 14px);
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .prem-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
    transition: left .5s;
  }

  .prem-btn:hover::before { left: 100%; }

  .prem-btn-yes {
    background: linear-gradient(135deg, rgba(34,197,94,.3), rgba(34,197,94,.15));
    border: 2px solid rgba(34,197,94,.5);
    color: #16a34a;
    box-shadow: 0 10px 30px rgba(34,197,94,.15);
  }

  .prem-btn-yes:hover {
    background: linear-gradient(135deg, rgba(34,197,94,.4), rgba(34,197,94,.25));
    border-color: rgba(34,197,94,.7);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 14px 40px rgba(34,197,94,.25);
  }

  .prem-btn-no {
    background: linear-gradient(135deg, rgba(220,38,38,.25), rgba(220,38,38,.12));
    border: 2px solid rgba(220,38,38,.5);
    color: #dc2626;
    box-shadow: 0 10px 30px rgba(220,38,38,.15);
  }

  .prem-btn-no:hover {
    background: linear-gradient(135deg, rgba(220,38,38,.35), rgba(220,38,38,.2));
    border-color: rgba(220,38,38,.7);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 14px 40px rgba(220,38,38,.25);
  }

  .prem-btn-cta {
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%);
    border: 1.5px solid rgba(255,255,255,.2);
    color: #faf7f7;
    box-shadow: 0 12px 40px rgba(220,38,38,.3);
  }

  .prem-btn-cta:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 18px 50px rgba(220,38,38,.4);
  }

  .prem-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255,255,255,.7);
    border: 1.5px solid rgba(220,38,38,.3);
    border-radius: 12px;
    font-size: 10px;
    font-weight: 800;
    color: #dc2626;
    letter-spacing: .1em;
    text-transform: uppercase;
    backdrop-filter: blur(10px);
    box-shadow: 0 6px 20px rgba(220,38,38,.1);
  }

  .prem-dot-pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #dc2626;
    animation: pulse 1.5s ease-in-out infinite;
    box-shadow: 0 0 10px rgba(220,38,38,.5);
  }

  @keyframes pulse { 0%,100% { opacity: .6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }

  .prem-progress {
    width: 100%;
    height: 4px;
    background: rgba(220,38,38,.12);
    border-radius: 9999px;
    overflow: hidden;
    margin-top: 12px;
  }

  .prem-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #dc2626, #991b1b);
    box-shadow: 0 0 16px rgba(220,38,38,.5);
  }

  .prem-loader {
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
  }

  .prem-loader-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #dc2626;
  }

  .prem-result-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 12px;
    margin-bottom: 12px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .1em;
  }

  .prem-result-success {
    background: rgba(34,197,94,.12);
    border: 1.5px solid rgba(34,197,94,.35);
    color: #16a34a;
  }

  .prem-result-restriction {
    background: rgba(220,38,38,.12);
    border: 1.5px solid rgba(220,38,38,.35);
    color: #dc2626;
  }

  .prem-dot-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .prem-dot-success {
    background: #22c55e;
    box-shadow: 0 0 10px rgba(34,197,94,.5);
  }

  .prem-dot-restriction {
    background: #dc2626;
    box-shadow: 0 0 10px rgba(220,38,38,.5);
  }

  @media (max-width: 640px) {
    .prem-container {
      max-width: 100%;
      max-height: none;
      border-radius: 20px;
    }

    .prem-header {
      padding: clamp(16px, 2vw, 20px);
    }

    .prem-messages {
      max-height: 50vh;
      gap: 12px;
    }

    .prem-footer {
      padding: clamp(14px, 2vw, 20px);
    }

    .prem-bubble-bot,
    .prem-bubble-user {
      max-width: 90%;
    }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('prem-styles')) {
  const s = document.createElement('style')
  s.id = 'prem-styles'
  s.textContent = PREMIUM_STYLES
  document.head.appendChild(s)
}

function AnimatedBackgroundOrbs() {
  const orbs = [
    { size: 'min(300px,40vw)', color: 'rgba(220,38,38,.12)', top: '-15%', left: '-10%', duration: 10 },
    { size: 'min(250px,35vw)', color: 'rgba(180,180,180,.1)', top: '10%', right: '-12%', duration: 13 },
    { size: 'min(280px,38vw)', color: 'rgba(220,38,38,.1)', bottom: '-15%', left: '5%', duration: 15 },
    { size: 'min(240px,32vw)', color: 'rgba(180,180,180,.08)', bottom: '10%', right: '-8%', duration: 11 },
  ]

  return (
    <motion.div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="prem-float-orb"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.color,
            top: orb.top,
            right: orb.right,
            left: orb.left,
            bottom: orb.bottom,
          }}
          animate={{ y: [0, -60, 0], x: [0, 50, 0], scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </motion.div>
  )
}

function EnhancedHeartPulse({ size = 56 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <motion.div
        animate={{ scale: [0.8, 1.2], opacity: [0.4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: '-15%',
          borderRadius: '50%',
          border: '2px solid rgba(220,38,38,.3)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [0.6, 1.4], opacity: [0.6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
        style={{
          position: 'absolute',
          inset: '-25%',
          borderRadius: '50%',
          border: '2px solid rgba(220,38,38,.2)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, rgba(220,38,38,.25), rgba(220,38,38,.05), transparent)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        animate={{ scale: [0.95, 1.1, 0.95], rotate: [0, 5, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill="url(#heartGrad)"
            filter="drop-shadow(0 8px 20px rgba(220,38,38,.35))"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: '-20%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,38,38,.35), transparent)',
          filter: 'blur(18px)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

function PremiumChatbot() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome to your health screening.' },
    { from: 'bot', text: 'I\'ll ask you a series of important questions to ensure your safety and the safety of those who receive your donation.' },
    { from: 'bot', text: SCREENING_QUESTIONS[0].text, hint: SCREENING_QUESTIONS[0].hint },
  ])
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [eligible, setEligible] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleAnswer = async (answer) => {
    const currentQuestion = SCREENING_QUESTIONS[step]
    const newAnswers = { ...answers, [currentQuestion.key]: answer }
    setAnswers(newAnswers)

    setMessages(prev => [...prev, { from: 'user', text: answer === 'yes' ? 'Yes' : 'No', answerType: answer }])

    if (step + 1 < SCREENING_QUESTIONS.length) {
      setStep(step + 1)
      setTimeout(() => {
        const nextQ = SCREENING_QUESTIONS[step + 1]
        setMessages(prev => [...prev, { from: 'bot', text: nextQ.text, hint: nextQ.hint }])
      }, 600)
    } else {
      setLoading(true)
      const donorData = JSON.parse(localStorage.getItem('donorData') || '{}')
      try {
        const baseURL = 'https://blood-bank-eqyr.onrender.com/api'
        const res = await axios.post(`${baseURL}/chatbot/screen`, {
          donor_id: donorData.id,
          answers: newAnswers,
        })
        await new Promise(resolve => setTimeout(resolve, 1800))
        setLoading(false)
        setEligible(res.data.eligible)
        if (res.data.eligible) {
          const stored = JSON.parse(localStorage.getItem('donorData') || '{}')
          stored.is_eligible = true
          localStorage.setItem('donorData', JSON.stringify(stored))
        }
        const resultText = res.data.eligible
          ? 'Excellent news! You\'ve passed all screening criteria and are cleared to donate blood. Your health profile meets our safety standards.'
          : 'Thank you for your honesty. Based on your responses, we need to restrict your donation at this time. Please take care and return when you\'re fully recovered.'
        setMessages(prev => [...prev, { from: 'bot', text: resultText }])
      } catch (error) {
        setLoading(false)
        setMessages(prev => [...prev, { from: 'bot', text: 'We encountered a system error. Please try again later.' }])
      }
      setDone(true)
    }
  }

  const progressPercent = Math.round((step / SCREENING_QUESTIONS.length) * 100)

  return (
    <div className="prem-root">
      <AnimatedBackgroundOrbs />

      <motion.div
        className="prem-container prem-glass-deep"
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
      >
        <motion.div
          className="prem-header"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <EnhancedHeartPulse size={40} />
            <div className="prem-header-title">Blood Screening</div>
          </div>
          <p className="prem-header-subtitle">Eligibility Assessment</p>

          {!done && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ marginTop: 14 }}
            >
              <motion.div
                className="prem-status-badge"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ justifyContent: 'center', marginBottom: 10 }}
              >
                <div className="prem-dot-pulse" />
                <span>Q {step + 1} of {SCREENING_QUESTIONS.length}</span>
              </motion.div>

              <div className="prem-progress">
                <motion.div
                  className="prem-progress-fill"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.div>
          )}

          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={eligible ? 'prem-result-badge prem-result-success' : 'prem-result-badge prem-result-restriction'}>
                <motion.div
                  className={eligible ? 'prem-dot-indicator prem-dot-success' : 'prem-dot-indicator prem-dot-restriction'}
                />
                <span>{eligible ? 'Cleared to Donate' : 'Temporary Restriction'}</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="prem-messages">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, x: msg.from === 'user' ? 15 : -15 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'flex',
                  justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                {msg.from === 'bot' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    style={{ flexShrink: 0, marginTop: 1 }}
                  >
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(220,38,38,.2), rgba(220,38,38,.1))',
                      border: '1.5px solid rgba(220,38,38,.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(220,38,38,.12)',
                    }}>
                      <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                          fill="#dc2626"
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div className={msg.from === 'bot' ? 'prem-bubble-bot' : `prem-bubble-user ${msg.answerType === 'yes' ? 'prem-bubble-user-yes' : 'prem-bubble-user-no'}`}>
                    <div className="prem-bubble-text">{msg.text}</div>
                    {msg.hint && msg.from === 'bot' && (
                      <motion.div
                        className="prem-bubble-hint"
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.3 }}
                      >
                        {msg.hint}
                      </motion.div>
                    )}
                  </div>
                </div>

                {msg.from === 'user' && (
                  <motion.div
                    initial={{ scale: 0, rotate: 25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: msg.answerType === 'yes' 
                        ? 'linear-gradient(135deg, rgba(22,163,74,.3), rgba(22,163,74,.15))'
                        : 'linear-gradient(135deg, rgba(220,38,38,.25), rgba(220,38,38,.12))',
                      border: msg.answerType === 'yes'
                        ? '1.5px solid rgba(22,163,74,.5)'
                        : '1.5px solid rgba(220,38,38,.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: msg.answerType === 'yes'
                        ? '0 4px 12px rgba(22,163,74,.2)'
                        : '0 4px 12px rgba(220,38,38,.15)',
                      marginTop: 1,
                    }}
                  >
                    <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: msg.answerType === 'yes' ? '#16a34a' : '#dc2626' }}>
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <motion.div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(220,38,38,.2), rgba(220,38,38,.1))',
                    border: '1.5px solid rgba(220,38,38,.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      borderRight: '2px solid #dc2626',
                      borderTop: '2px solid #dc2626',
                      borderLeft: '2px solid transparent',
                      borderBottom: '2px solid transparent',
                    }}
                  />
                </motion.div>
                <div className="prem-bubble-bot" style={{ padding: '10px 14px' }}>
                  <div className="prem-loader">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="prem-loader-dot"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        <motion.div
          className="prem-footer"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {!done && !loading && (
              <motion.div
                key="buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="prem-button-group">
                  <motion.button
                    className="prem-btn prem-btn-yes"
                    onClick={() => handleAnswer('yes')}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Yes
                  </motion.button>
                  <motion.button
                    className="prem-btn prem-btn-no"
                    onClick={() => handleAnswer('no')}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    No
                  </motion.button>
                </div>
              </motion.div>
            )}

            {done && eligible && (
              <motion.div
                key="eligible"
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 130 }}
              >
                <motion.button
                  className="prem-btn prem-btn-cta"
                  onClick={() => navigate('/donor/dashboard')}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.93 }}
                >
                  Go to Dashboard
                </motion.button>
              </motion.div>
            )}

            {done && !eligible && (
              <motion.div
                key="restricted"
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 130 }}
              >
                <motion.button
                  className="prem-btn prem-btn-cta"
                  onClick={() => navigate('/')}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.93 }}
                >
                  Return Home
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default PremiumChatbot