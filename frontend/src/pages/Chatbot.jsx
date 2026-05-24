import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const questions = [
  { key: 'feeling_healthy', text: 'Are you feeling healthy today?' },
  { key: 'chronic_illness', text: 'Do you have any chronic illnesses?' },
  { key: 'recent_surgery', text: 'Have you had any surgeries in the last 6 months?' },
  { key: 'medications', text: 'Are you currently taking any medications?' },
  { key: 'recent_travel', text: 'Have you traveled outside the country in the last month?' },
]

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes pulse-ring { 0% { transform:scale(.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }

  .cb-root {
    min-height:100vh;
    background:linear-gradient(135deg,#f8f8f8 0%,#efefef 25%,#e8e8e8 50%,#f2f2f2 75%,#f8f8f8 100%);
    background-size:400% 400%;
    animation:gradient-shift 15s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
    color:#380101;
    zoom: 0.82;
    display: flex;
  }

  .cb-glass {
    background:rgba(255,255,255,.6);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(180,180,180,.2);
    box-shadow:0 8px 32px rgba(0,0,0,.08);
  }

  .cb-glass-deep {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(180,180,180,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.1),inset 0 1px 1px rgba(255,255,255,.3);
  }

  .cb-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .cb-btn {
    position:relative;
    overflow:hidden;
    cursor:pointer;
    border:none;
    outline:none;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
    border-radius:14px;
  }

  .cb-btn::before {
    content:'';
    position:absolute;
    top:0;
    left:-100%;
    width:100%;
    height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
    transition:left .5s;
  }

  .cb-btn:hover::before { left:100%; }

  .cb-btn-yes {
    background:linear-gradient(135deg,rgba(34,197,94,.25),rgba(34,197,94,.12));
    border:1.5px solid rgba(34,197,94,.4);
    color:#16a34a;
    box-shadow:0 8px 24px rgba(34,197,94,.15);
  }

  .cb-btn-yes:hover {
    background:linear-gradient(135deg,rgba(34,197,94,.35),rgba(34,197,94,.2));
    border-color:rgba(34,197,94,.6);
    transform:translateY(-3px) scale(1.05);
  }

  .cb-btn-no {
    background:linear-gradient(135deg,rgba(220,38,38,.2),rgba(220,38,38,.08));
    border:1.5px solid rgba(220,38,38,.4);
    color:#dc2626;
    box-shadow:0 8px 24px rgba(220,38,38,.12);
  }

  .cb-btn-no:hover {
    background:linear-gradient(135deg,rgba(220,38,38,.3),rgba(220,38,38,.15));
    border-color:rgba(220,38,38,.6);
    transform:translateY(-3px) scale(1.05);
  }

  .cb-btn-cta {
    background:linear-gradient(135deg,#dc2626 0%,#991b1b 50%,#7f1d1d 100%);
    border:1px solid rgba(255,255,255,.15);
    color:#faf7f7;
    box-shadow:0 10px 30px rgba(220,38,38,.35);
  }

  .cb-btn-cta:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 20px 60px rgba(220,38,38,.5);
  }

  .cb-progress-bar {
    height:4px;
    background:rgba(220,38,38,.1);
    border-radius:9999px;
    overflow:hidden;
  }

  .cb-progress-fill {
    height:100%;
    background:linear-gradient(90deg,#dc2626,#991b1b);
    box-shadow:0 0 16px rgba(220,38,38,.5);
  }

  .cb-bubble-bot {
    background:rgba(255,255,255,.6);
    border:1px solid rgba(180,180,180,.2);
    border-radius:18px 18px 18px 4px;
    padding:clamp(12px,1.5vw,16px) clamp(14px,2vw,18px);
    box-shadow:0 4px 16px rgba(0,0,0,.06);
  }

  .cb-bubble-user {
    background:linear-gradient(135deg,rgba(220,38,38,.15),rgba(220,38,38,.08));
    border:1px solid rgba(220,38,38,.2);
    border-radius:18px 18px 4px 18px;
    padding:clamp(12px,1.5vw,16px) clamp(14px,2vw,18px);
    box-shadow:0 4px 16px rgba(0,0,0,.05);
  }

  .cb-scroll { overflow-y:auto; scroll-behavior:smooth; }
  .cb-scroll::-webkit-scrollbar { width:6px; }
  .cb-scroll::-webkit-scrollbar-track { background:transparent; }
  .cb-scroll::-webkit-scrollbar-thumb { background:rgba(220,38,38,.2); border-radius:3px; }

  .cb-status-badge {
    display:inline-flex;
    align-items:center;
    gap:6px;
    padding:8px 14px;
    background:rgba(255,255,255,.6);
    border:1px solid rgba(220,38,38,.2);
    border-radius:10px;
    font-size:clamp(9px,0.9vw,10px);
    font-weight:700;
    color:#dc2626;
    letter-spacing:.08em;
    text-transform:uppercase;
  }

  .cb-dot-pulse {
    width:6px;
    height:6px;
    border-radius:50%;
    background:#dc2626;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse { 0%,100% { opacity:.6; } 50% { opacity:1; } }

  @media (max-width:1024px) {
    .cb-left-panel { width: 100vw !important; }
    .cb-right-panel { display: none !important; }
  }

  @media (max-width:1200px) {
    .cb-root { zoom: 0.88; }
  }

  @media (max-width:768px) {
    .cb-root { zoom: 0.75; }
  }

  @media (max-width:480px) {
    .cb-root { zoom: 0.65; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('cb-styles-fixed')) {
  const s = document.createElement('style')
  s.id = 'cb-styles-fixed'
  s.textContent = STYLES
  document.head.appendChild(s)
}

/* ─── Animated Background Orbs ───────────────────────── */
function AnimatedBackgroundOrbs() {
  const orbs = [
    { size: 'min(350px,32vw)', color: 'rgba(220,38,38,.1)', top: '-8%', left: '-5%', duration: 8 },
    { size: 'min(300px,28vw)', color: 'rgba(180,180,180,.08)', top: '20%', right: '-8%', duration: 11 },
    { size: 'min(320px,30vw)', color: 'rgba(220,38,38,.08)', bottom: '-12%', left: '8%', duration: 13 },
    { size: 'min(280px,26vw)', color: 'rgba(180,180,180,.06)', bottom: '15%', right: '-5%', duration: 9 },
  ]

  const dots = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 3,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 2,
  }))

  return (
    <motion.div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="cb-float-orb"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.color,
            top: orb.top,
            right: orb.right,
            left: orb.left,
            bottom: orb.bottom,
          }}
          animate={{ y: [0, -50, 0], x: [0, 40, 0], scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {dots.map((dot) => (
        <motion.div
          key={`dot-${dot.id}`}
          style={{
            position: 'fixed',
            width: dot.size,
            height: dot.size,
            borderRadius: '50%',
            background: `rgba(220, 38, 38, ${0.4 + Math.random() * 0.3})`,
            left: `${dot.startX}%`,
            top: `${dot.startY}%`,
            boxShadow: `0 0 ${dot.size * 2}px rgba(220, 38, 38, ${0.5 + Math.random() * 0.3})`,
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
    </motion.div>
  )
}

/* ─── Animated Heart Pulse ────────────────────────────── */
function AnimatedHeartPulse({ size = 72 }) {
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
          border: '2px solid rgba(220,38,38,.15)',
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
          background: 'conic-gradient(from 0deg, rgba(220,38,38,.2), rgba(220,38,38,.05), transparent)',
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
            filter="drop-shadow(0 8px 20px rgba(220,38,38,.4))"
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
          background: 'radial-gradient(circle, rgba(220,38,38,.3), transparent)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

/* ─── Health Status Indicator ────────────────────────────── */
function HealthIndicator({ step, total, done, eligible }) {
  const pct = Math.round((step / total) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.25, type: 'spring', stiffness: 120 }}
      className="cb-glass"
      style={{
        borderRadius: 18,
        padding: 'clamp(16px,2vw,20px)',
        marginBottom: 18,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ position: 'relative', width: 9, height: 9, flexShrink: 0 }}>
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: done ? (eligible ? '#22c55e' : '#dc2626') : '#dc2626',
              boxShadow: `0 0 12px ${done && eligible ? 'rgba(34,197,94,.8)' : 'rgba(220,38,38,.8)'}`,
            }}
          />
        </div>
        <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(56,1,1,.6)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          {done ? (eligible ? 'Cleared' : 'Restricted') : 'Screening Active'}
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(56,1,1,.5)' }}>Progress</span>
          <motion.span
            key={pct}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 11, fontWeight: 900, color: '#dc2626' }}
          >
            {done ? '100' : pct}%
          </motion.span>
        </div>
        <div className="cb-progress-bar">
          <motion.div
            className="cb-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: done ? '100%' : `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === step && !done ? 14 : 4,
              background: i < step || done ? '#22c55e' : i === step ? '#dc2626' : 'rgba(220,38,38,.1)',
            }}
            transition={{ duration: 0.3 }}
            style={{ height: 3, borderRadius: 9999 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Main Chatbot ───────────────────────────────────────── */
function Chatbot() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello. I will ask you a few health questions to determine your eligibility to donate blood.' },
    { from: 'bot', text: questions[0].text },
  ])
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [eligible, setEligible] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleAnswer = async answer => {
    const currentQuestion = questions[step]
    const newAnswers = { ...answers, [currentQuestion.key]: answer }
    setAnswers(newAnswers)
    setMessages(prev => [...prev, { from: 'user', text: answer }])

    if (step + 1 < questions.length) {
      setStep(step + 1)
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: questions[step + 1].text }])
      }, 500)
    } else {
      setLoading(true)
      const donorData = JSON.parse(localStorage.getItem('donorData'))
      try {
        const baseURL = 'https://blood-bank-eqyr.onrender.com/api'
        const res = await axios.post(`${baseURL}/chatbot/screen`, {
          donor_id: donorData.id,
          answers: newAnswers,
        })
        await new Promise(resolve => setTimeout(resolve, 2000))
        setLoading(false)
        setEligible(res.data.eligible)
        if (res.data.eligible) {
          const stored = JSON.parse(localStorage.getItem('donorData'))
          stored.is_eligible = true
          localStorage.setItem('donorData', JSON.stringify(stored))
        }
        const resultText = res.data.eligible
          ? 'You are cleared to donate blood. Your vitals and responses meet our criteria. Proceed to the donation center when ready.'
          : 'You are not eligible to donate at this time. Your responses indicate a temporary restriction. Please take care of yourself and return when you recover.'
        setMessages(prev => [...prev, { from: 'bot', text: resultText }])
      } catch {
        setLoading(false)
        setMessages(prev => [...prev, { from: 'bot', text: 'A system error occurred. Please try again.' }])
      }
      setDone(true)
    }
  }

  return (
    <div className="cb-root">
      <AnimatedBackgroundOrbs />

      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        className="cb-left-panel"
        style={{
          width: 'clamp(280px,30vw,360px)',
          flexShrink: 0,
          borderRight: '1px solid rgba(180,180,180,.15)',
          padding: 'clamp(24px,3vw,32px)',
          background: 'rgba(255,255,255,.35)',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          style={{ marginBottom: 24 }}
        >
          <h1 style={{
            fontFamily: "'Fraunces',serif",
            fontSize: 'clamp(24px,3vw,32px)',
            fontWeight: 900,
            color: '#dc2626',
            margin: '0 0 6px',
            lineHeight: 1.1,
          }}>
            Health Screening
          </h1>
          <p style={{
            fontSize: '9px',
            color: 'rgba(56,1,1,.5)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.08em',
            margin: 0,
          }}>
            Donor Eligibility Assessment
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}
        >
          <AnimatedHeartPulse size={70} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <HealthIndicator step={step} total={questions.length} done={done} eligible={eligible} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="cb-glass"
          style={{
            borderRadius: 14,
            padding: 'clamp(12px,1.5vw,16px)',
            flex: 1,
          }}
        >
          <div style={{
            fontSize: '8px',
            fontWeight: 700,
            color: 'rgba(56,1,1,.35)',
            textTransform: 'uppercase',
            letterSpacing: '.1em',
            marginBottom: 10,
          }}>
            Question Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {questions.map((q, i) => {
              const isRecorded = i < step || done
              const isActive = i === step && !done
              return (
                <motion.div
                  key={i}
                  animate={{ opacity: isActive ? 1 : isRecorded ? 0.65 : 0.28 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.3 : 1,
                    }}
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      background: isRecorded ? '#22c55e' : isActive ? '#dc2626' : 'rgba(220,38,38,.1)',
                      flexShrink: 0,
                      boxShadow: isActive ? '0 0 8px rgba(220,38,38,.5)' : 'none',
                    }}
                  />
                  <span style={{
                    fontSize: '8px',
                    color: isRecorded ? '#22c55e' : isActive ? '#dc2626' : 'rgba(56,1,1,.4)',
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {isRecorded ? 'Done' : isActive ? 'Current' : 'Pending'}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Right Panel */}
      <div
        className="cb-right-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: 'rgba(255,255,255,.35)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="cb-glass"
          style={{
            padding: 'clamp(16px,2vw,22px) clamp(20px,2.5vw,32px)',
            borderRadius: 0,
            borderBottom: '1px solid rgba(180,180,180,.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{
              fontFamily: "'Fraunces',serif",
              fontSize: 'clamp(18px,2vw,24px)',
              fontWeight: 900,
              color: '#dc2626',
              margin: '0 0 4px',
              lineHeight: 1.1,
            }}>
              Assessment Chat
            </h2>
            <p style={{
              fontSize: '9px',
              color: 'rgba(56,1,1,.5)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              margin: 0,
            }}>
              {!done && `Q${Math.min(step + 1, questions.length)} of ${questions.length}`}
              {done && 'Complete'}
            </p>
          </div>

          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="cb-status-badge"
          >
            <div className="cb-dot-pulse" />
            <span>{done ? (eligible ? 'Cleared' : 'Restricted') : 'Active'}</span>
          </motion.div>
        </motion.div>

        {/* Messages */}
        <div
          className="cb-scroll"
          style={{
            flex: 1,
            padding: 'clamp(18px,2.5vw,28px) clamp(18px,2.5vw,28px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            minHeight: 0,
          }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, x: msg.from === 'user' ? 12 : -12 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'flex',
                  justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: 10,
                }}
              >
                {msg.from === 'bot' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 180 }}
                    style={{ flexShrink: 0 }}
                  >
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg,rgba(220,38,38,.15),rgba(220,38,38,.08))',
                      border: '1px solid rgba(220,38,38,.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg viewBox="0 0 24 24" style={{ width: 12, height: 12 }}>
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                          fill="#dc2626"
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}

                <div
                  className={msg.from === 'bot' ? 'cb-bubble-bot' : 'cb-bubble-user'}
                  style={{
                    maxWidth: 'min(70%, 420px)',
                    fontSize: 'clamp(12px,1vw,13px)',
                    lineHeight: 1.5,
                    color: msg.from === 'bot' ? 'rgba(56,1,1,.7)' : 'rgba(56,1,1,.75)',
                  }}
                >
                  {msg.text}
                </div>

                {msg.from === 'user' && (
                  <motion.div
                    initial={{ scale: 0, rotate: 20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 180 }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg,rgba(220,38,38,.2),rgba(220,38,38,.1))',
                      border: '1px solid rgba(220,38,38,.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: '#dc2626' }}>
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading state */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 10,
                }}
              >
                <motion.div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,rgba(220,38,38,.15),rgba(220,38,38,.08))',
                    border: '1px solid rgba(220,38,38,.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      borderRight: '2px solid #dc2626',
                      borderTop: '2px solid #dc2626',
                      borderLeft: '2px solid transparent',
                      borderBottom: '2px solid transparent',
                    }}
                  />
                </motion.div>
                <div className="cb-bubble-bot" style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          background: '#dc2626',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Action Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="cb-glass"
          style={{
            padding: 'clamp(16px,2vw,20px) clamp(18px,2.5vw,28px)',
            borderRadius: 0,
            borderTop: '1px solid rgba(180,180,180,.15)',
            flexShrink: 0,
          }}
        >
          <AnimatePresence mode="wait">
            {/* Yes / No Buttons */}
            {!done && !loading && (
              <motion.div
                key="yn"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ marginBottom: 12 }}>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: 'rgba(56,1,1,.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                  }}>
                    Question {step + 1} of {questions.length}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <motion.button
                    className="cb-btn cb-btn-yes"
                    onClick={() => handleAnswer('yes')}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      flex: 1,
                      padding: 'clamp(12px,1.4vw,14px)',
                      fontSize: 'clamp(12px,1vw,13px)',
                    }}
                  >
                    Yes
                  </motion.button>

                  <motion.button
                    className="cb-btn cb-btn-no"
                    onClick={() => handleAnswer('no')}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      flex: 1,
                      padding: 'clamp(12px,1.4vw,14px)',
                      fontSize: 'clamp(12px,1vw,13px)',
                    }}
                  >
                    No
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Eligible Result */}
            {done && eligible && (
              <motion.div
                key="eligible"
                initial={{ opacity: 0, scale: 0.93, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 130 }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  padding: '10px 12px',
                  background: 'rgba(34,197,94,.08)',
                  border: '1px solid rgba(34,197,94,.25)',
                  borderRadius: 10,
                }}>
                  <motion.div
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#22c55e',
                      boxShadow: '0 0 12px rgba(34,197,94,.7)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#16a34a',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                  }}>
                    Cleared to Donate
                  </span>
                </div>

                <motion.button
                  className="cb-btn cb-btn-cta"
                  onClick={() => navigate('/donor/dashboard')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '100%',
                    padding: 'clamp(12px,1.4vw,14px)',
                    fontSize: 'clamp(12px,1vw,13px)',
                    fontWeight: 700,
                  }}
                >
                  Proceed to Dashboard
                </motion.button>
              </motion.div>
            )}

            {/* Not Eligible Result */}
            {done && !eligible && (
              <motion.div
                key="noteligible"
                initial={{ opacity: 0, scale: 0.93, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 130 }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  padding: '10px 12px',
                  background: 'rgba(220,38,38,.08)',
                  border: '1px solid rgba(220,38,38,.25)',
                  borderRadius: 10,
                }}>
                  <motion.div
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#dc2626',
                      boxShadow: '0 0 12px rgba(220,38,38,.7)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#dc2626',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                  }}>
                    Temporary Restriction
                  </span>
                </div>

                <motion.button
                  className="cb-btn cb-btn-cta"
                  onClick={() => navigate('/')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '100%',
                    padding: 'clamp(12px,1.4vw,14px)',
                    fontSize: 'clamp(12px,1vw,13px)',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg,rgba(220,38,38,.2),rgba(220,38,38,.1))',
                    color: '#dc2626',
                    border: '1.5px solid rgba(220,38,38,.4)',
                  }}
                >
                  Return to Home
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default Chatbot