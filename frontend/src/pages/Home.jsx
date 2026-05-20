import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiumHamburgerMenu } from "../components/NavbarHamburger-Premium"
import lebanonMap from '../assets/lebanon-map.png'

const BLOOD_DATA = {
  'A+':  { canReceive: ['A+','A-','O+','O-'],                          canDonateTo: ['A+','AB+'],                         reach: '34%' },
  'A-':  { canReceive: ['A-','O-'],                                    canDonateTo: ['A+','A-','AB+','AB-'],              reach: '6%'  },
  'B+':  { canReceive: ['B+','B-','O+','O-'],                          canDonateTo: ['B+','AB+'],                         reach: '9%'  },
  'B-':  { canReceive: ['B-','O-'],                                    canDonateTo: ['B+','B-','AB+','AB-'],              reach: '2%'  },
  'AB+': { canReceive: ['A+','A-','B+','B-','AB+','AB-','O+','O-'],    canDonateTo: ['AB+'],                              reach: '3%'  },
  'AB-': { canReceive: ['A-','B-','AB-','O-'],                         canDonateTo: ['AB+','AB-'],                        reach: '1%'  },
  'O+':  { canReceive: ['O+','O-'],                                    canDonateTo: ['A+','B+','O+','AB+'],               reach: '38%' },
  'O-':  { canReceive: ['O-'],                                         canDonateTo: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], reach: '7%' },
}
const ALL_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes bc-ping      { 75%,100% { transform:scale(2.2); opacity:0; } }
  @keyframes bc-pulse     { 0%,100%  { opacity:1; } 50% { opacity:.4; } }
  @keyframes bc-float     { 0%,100%  { transform:translateY(0) translateX(0); } 33% { transform:translateY(-18px) translateX(10px); } 66% { transform:translateY(10px) translateX(-12px); } }
  @keyframes bc-float-b   { 0%,100%  { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes bc-float-c   { 0%,100%  { transform:translateY(0); } 50% { transform:translateY(8px); } }
  @keyframes bc-spin8     { to { transform:rotate(360deg); } }
  @keyframes bc-spin30    { to { transform:rotate(360deg); } }
  @keyframes bc-spin30r   { to { transform:rotate(-360deg); } }
  @keyframes bc-hb        { 0%,100% { transform:scale(1); } 14% { transform:scale(1.18); } 28% { transform:scale(1); } 42% { transform:scale(1.15); } }
  @keyframes bc-cell      { 0%,100% { transform:translateY(0) scale(1); opacity:.6; } 50% { transform:translateY(-18px) scale(1.2); opacity:1; } }
  @keyframes bc-particle  { 0%,100% { transform:translateY(0) translateX(0) scale(1); opacity:.3; } 50% { transform:translateY(-28px) translateX(var(--px,6px)) scale(1.2); opacity:.8; } }
  @keyframes bc-orb       { 0%,100% { transform:translateY(0) translateX(0) scale(1); } 33% { transform:translateY(-30px) translateX(20px) scale(1.08); } 66% { transform:translateY(8px) translateX(-10px) scale(.96); } }
  @keyframes bc-vitfill   { from { width:0; } to { width:92%; } }
  @keyframes bc-pop       { 0% { transform:scale(.8); opacity:0; } 60% { transform:scale(1.05); } 100% { transform:scale(1); opacity:1; } }
  @keyframes bc-glow-ring { 0%,100% { box-shadow:0 0 16px rgba(211,47,47,.2),inset 0 0 8px rgba(211,47,47,.08); } 50% { box-shadow:0 0 40px rgba(211,47,47,.55),inset 0 0 20px rgba(211,47,47,.22); } }
  @keyframes bc-gradient  { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes bc-heartbeat { 0%,100%  { transform:scale(1); } 14% { transform:scale(1.15); } 28% { transform:scale(1); } 42% { transform:scale(1.15); } }
  @keyframes bc-drop-bob  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }

  .bc-root {
    min-height:100vh;
    background:linear-gradient(-45deg,#FFEBEE,#F8F9FA,#FFEBEE,rgba(14,165,233,.35));
    background-size:400% 400%;
    animation:bc-gradient 14s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
  }

  .bc-glass {
    background:rgba(255,255,255,.42);
    backdrop-filter:blur(28px) saturate(180%);
    -webkit-backdrop-filter:blur(28px) saturate(180%);
    border:1px solid rgba(211,47,47,.2);
    box-shadow:0 8px 32px rgba(211,47,47,.07),inset 0 0 20px rgba(255,255,255,.6);
  }
  .bc-glass-deep {
    background:rgba(255,255,255,.35);
    backdrop-filter:blur(40px) contrast(1.1);
    -webkit-backdrop-filter:blur(40px) contrast(1.1);
    border:1px solid rgba(211,47,47,.2);
    box-shadow:0 24px 56px -12px rgba(211,47,47,.08),inset 0 0 36px rgba(255,255,255,.6);
  }

  .bc-nav {
    position:sticky;top:0;z-index:50;
    background:rgba(255,255,255,.62);
    backdrop-filter:blur(40px);
    -webkit-backdrop-filter:blur(40px);
    border-bottom:2px solid rgba(211,47,47,.2);
    box-shadow:0 4px 24px rgba(211,47,47,.06);
  }
  .bc-nav-inner {
    max-width:1360px;margin:0 auto;
    display:flex;justify-content:space-between;align-items:center;
    padding:clamp(10px,1.4vw,16px) clamp(16px,3.5vw,44px);
    gap:clamp(16px,2.5vw,32px);
  }

  .bc-btn {
    position:relative;overflow:hidden;cursor:pointer;
    border:none;outline:none;
    transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s;
    font-family:'Plus Jakarta Sans',sans-serif;
  }
  .bc-btn::after {
    content:'';position:absolute;top:50%;left:50%;
    width:0;height:0;background:rgba(255,255,255,.28);border-radius:50%;
    transform:translate(-50%,-50%);transition:width .4s,height .4s;
  }
  .bc-btn:hover::after { width:300px;height:300px; }
  .bc-btn:hover  { transform:translateY(-3px) scale(1.05); }
  .bc-btn:active { transform:scale(.97); }

  .bc-btn-primary {
    background:linear-gradient(135deg,#D32F2F,#ff6b6b);
    color:white;
    box-shadow:0 12px 32px rgba(211,47,47,.32);
  }
  .bc-btn-primary:hover { box-shadow:0 18px 48px rgba(211,47,47,.44); }

  .bc-btn-secondary {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(20px);
    border:2px solid rgba(211,47,47,.2) !important;
    color:#D32F2F;
  }
  .bc-btn-secondary:hover { background:rgba(255,255,255,.72);border-color:rgba(211,47,47,.2) !important; }

  .bc-chip {
    cursor:pointer;border:none;outline:none;
    transition:all .22s cubic-bezier(.34,1.56,.64,1);
    font-family:'Plus Jakarta Sans',sans-serif;font-weight:900;
  }
  .bc-chip:hover { transform:scale(1.08) translateY(-2px);box-shadow:0 10px 28px rgba(211,47,47,.18); }
  .bc-chip.active {
    background:linear-gradient(135deg,#D32F2F,#ff6b6b);
    color:white;
    box-shadow:0 10px 28px rgba(211,47,47,.3);
    transform:scale(1.05);
  }

  .bc-cell-receive {
    cursor:pointer;
    background:#d2e2f7;
    border:2px solid rgba(211,47,47,.2);
    border-radius:clamp(10px,1.3vw,14px);
    aspect-ratio:1;
    display:flex;align-items:center;justify-content:center;
    font-weight:900;font-size:clamp(12px,1.4vw,17px);color:#405878;
    position:relative;transition:transform .18s;
  }
  .bc-cell-receive:hover { transform:scale(1.1); }

  .bc-cell-donate {
    cursor:pointer;
    background:rgba(255,235,238,.5);
    border:2px solid rgba(211,47,47,.2);
    border-radius:clamp(10px,1.3vw,14px);
    aspect-ratio:1;
    display:flex;align-items:center;justify-content:center;
    font-weight:900;font-size:clamp(12px,1.4vw,17px);color:#D32F2F;
    position:relative;transition:transform .18s;
  }
  .bc-cell-donate:hover { transform:scale(1.1); }

  .bc-badge {
    position:absolute;top:-6px;right:-6px;
    width:20px;height:20px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:8px;font-weight:900;color:white;
    box-shadow:0 2px 8px rgba(0,0,0,.2);
  }

  .bc-map-wrap {
    border-radius:clamp(24px,3.5vw,44px);overflow:hidden;
    border:2px solid rgba(211,47,47,.2);
    box-shadow:0 24px 56px -12px rgba(211,47,47,.1),inset 0 0 40px rgba(255,255,255,.6);
    background:rgba(255,255,255,.4);
    backdrop-filter:blur(40px) contrast(1.1);
    display:flex;flex-direction:column;
    height:100%;
  }
  
  .bc-map-svg-wrap {
    width:100%;flex:1;display:flex;align-items:center;justify-content:center;
    padding:0;overflow:hidden;
    background:linear-gradient(180deg,rgba(14,165,233,.05),rgba(255,235,238,.1));
  }
  .bc-map-svg-wrap img { width:100%;height:100%;object-fit:cover;display:block;filter:drop-shadow(0 4px 20px rgba(211,47,47,.1)); }

  .bc-hero-grid    { display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2vw,32px);align-items:center;min-height:74vh; }
  .bc-network-grid { display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2vw,24px);align-items:stretch;height:100%; }
  .bc-compat-grid  { display:grid;grid-template-columns:1fr 1.1fr;gap:clamp(20px,2.5vw,40px);align-items:start; }
  .bc-type-grid    { display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(6px,.6vw,8px); }

  @media (max-width:960px) {
    .bc-hero-grid    { grid-template-columns:1fr;min-height:unset; }
    .bc-network-grid { grid-template-columns:1fr; }
    .bc-compat-grid  { grid-template-columns:1fr; }
    .bc-hero-visual  { display:none !important; }
    .bc-nav-desktop  { display:none !important; }
  }

  .bc-orb { position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;animation:bc-orb var(--dur,8s) ease-in-out infinite; }
  .bc-particle { position:absolute;border-radius:50%;pointer-events:none;animation:bc-particle var(--dur,5s) ease-in-out infinite; }

  .bc-stat-card-a { animation:bc-float-b 3s ease-in-out infinite; }
  .bc-stat-card-b { animation:bc-float-c 3.5s ease-in-out infinite; }
  .bc-drop-wrap { animation:bc-drop-bob 3s ease-in-out infinite; }

  .bc-fab-wrap { position:fixed;bottom:clamp(18px,2.5vw,36px);right:clamp(18px,2.5vw,36px);z-index:60; }
  .bc-fab-ring {
    position:absolute;inset:0;border-radius:50%;background:#D32F2F;
    animation:bc-ping 2s cubic-bezier(0,0,.2,1) infinite;
  }
  .bc-fab-ring2 {
    position:absolute;inset:0;border-radius:50%;background:#D32F2F;
    animation:bc-ping 2s cubic-bezier(0,0,.2,1) infinite;
    animation-delay:.5s;opacity:.6;
  }
  .bc-fab {
    position:relative;
    width:clamp(56px,5vw,76px);height:clamp(56px,5vw,76px);
    border-radius:50%;
    background:linear-gradient(135deg,#D32F2F,#ff6b6b);
    color:white;border:4px solid rgba(255,255,255,.6);
    box-shadow:0 14px 44px rgba(211,47,47,.5);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;outline:none;
    animation:bc-drop-bob 2s ease-in-out infinite;
    transition:transform .2s;font-size:clamp(22px,2.8vw,36px);
  }
  .bc-fab:hover { transform:scale(1.15);animation:none; }

  .bc-pop { animation:bc-pop .32s cubic-bezier(.34,1.56,.64,1) both; }

  .bc-heartpath {
    stroke-dasharray:1000;stroke-dashoffset:1000;
    animation:bc-heartbeat-path 3s linear infinite;
  }
  @keyframes bc-heartbeat-path { to { stroke-dashoffset:0; } }

  .bc-card-hover { transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s; }
  .bc-card-hover:hover { transform:translateY(-4px) scale(1.01);box-shadow:0 20px 50px rgba(211,47,47,.15) !important; }
`

if (typeof document !== 'undefined' && !document.getElementById('bc-styles-v1')) {
  const s = document.createElement('style')
  s.id = 'bc-styles-v1'
  s.textContent = STYLES
  document.head.appendChild(s)
}

function ParticleField() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    w: Math.random() * 5 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: (Math.random() * 4 + 3).toFixed(1),
    delay: -(Math.random() * 4).toFixed(1),
    px: ((Math.random() * 20 - 10).toFixed(0)) + 'px',
    color: i % 3 === 0 ? 'rgba(211,47,47,.35)' : i % 3 === 1 ? 'rgba(14,165,233,.45)' : 'rgba(255,235,238,.7)',
  }))

  return (
    <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="bc-particle"
          style={{
            '--dur': `${p.dur}s`,
            '--px': p.px,
            width: p.w, height: p.w,
            left: `${p.left}%`, top: `${p.top}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function LebanonMap() {
  return (
    <div className="bc-map-wrap">
      <div className="bc-map-svg-wrap">
        <img 
          src={lebanonMap}
          alt="Lebanon Blood Network Map" 
        />
      </div>
    </div>
  )
}

function BloodDropVisual() {
  const cells = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: 20 + Math.random() * 60,
    top: 20 + Math.random() * 60,
    dur: (2 + Math.random() * 2).toFixed(1),
    delay: -(Math.random() * 2).toFixed(1),
  }))

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      {[70, 85, 100].map((pct, i) => (
        <div key={i} style={{
          position:'absolute', borderRadius:'50%',
          width:`${pct}%`, height:`${pct}%`,
          border:'2px solid rgba(211,47,47,.18)',
          animationName:`bc-spin${i % 2 === 0 ? '30' : '8'}`,
          animationDuration:`${20 + i * 6}s`,
          animationTimingFunction:'linear',
          animationIterationCount:'infinite',
        }}/>
      ))}

      <div className="bc-drop-wrap" style={{ position:'relative', width:192, height:240 }}>
        <svg viewBox="0 0 100 130" style={{ width:'100%', height:'100%', filter:'drop-shadow(0 12px 24px rgba(211,47,47,.4))' }}>
          <defs>
            <linearGradient id="bcBloodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b"/>
              <stop offset="50%" stopColor="#D32F2F"/>
              <stop offset="100%" stopColor="#b71c1c"/>
            </linearGradient>
            <linearGradient id="bcHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity=".6"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill="url(#bcBloodGrad)"/>
          <ellipse cx="35" cy="70" rx="15" ry="20" fill="url(#bcHighlight)"/>
          <path d="M50 20 C50 20 80 65 80 85 C80 100 65 115 50 115 C35 115 20 100 20 85 C20 65 50 20 50 20 Z" fill="none" stroke="white" strokeWidth=".5" strokeOpacity=".3"/>
        </svg>
        <div style={{
          position:'absolute', inset:0, borderRadius:'50%',
          background:'rgba(211,47,47,.18)', filter:'blur(48px)',
          animation:'bc-hb 2s ease-in-out infinite',
        }}/>
      </div>

      {cells.map(c => (
        <div
          key={c.id}
          style={{
            position:'absolute', width:14, height:14, borderRadius:'50%',
            background:'linear-gradient(135deg,#ff6b6b,#D32F2F)',
            left:`${c.left}%`, top:`${c.top}%`,
            animationName:'bc-cell',
            animationDuration:`${c.dur}s`,
            animationTimingFunction:'ease-in-out',
            animationIterationCount:'infinite',
            animationDelay:`${c.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [bloodType, setBloodType] = useState('A+')
  const [animKey, setAnimKey] = useState(0)
  const [sosHover, setSosHover] = useState(false)
  const [visible, setVisible] = useState(false)
  const [analytics, setAnalytics] = useState({
    donors: 0,
    emergencies: 0,
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const baseURL = 'https://blood-bank-eqyr.onrender.com/api'
        const res = await fetch(`${baseURL}/analytics/dashboard`)
        if (res.ok) {
          const data = await res.json()
          setAnalytics({
            donors: data.donors || 0,
            emergencies: data.emergencies || 0,
          })
        }
      } catch (err) {
        console.log('Analytics fetch failed')
      }
    }

    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 5000)
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => { setTimeout(() => setVisible(true), 60) }, [])
  
  const go = (path) => { 
    if (path === '/emergency') {
      const baseURL = 'https://blood-bank-eqyr.onrender.com/api'
      fetch(`${baseURL}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'emergency' })
      }).catch(err => console.error('Tracking failed:', err))
    }
    navigate(path)
  }

  const selectType = (t) => { if (t === bloodType) return; setBloodType(t); setAnimKey(k => k + 1) }
  const data = BLOOD_DATA[bloodType]

  const fadeUp = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
  })

  const floatBadges = [
    { type:'O-', style:{ top:0, left:'50%', transform:'translate(-50%,-10%)', animation:'bc-float-b 3s ease-in-out infinite' } },
    { type:'AB+', style:{ top:'18%', right:0, transform:'translateX(30%)', animation:'bc-float 6s ease-in-out infinite' } },
    { type:'B-', style:{ bottom:0, left:'22%', transform:'translateY(10%)', animation:'bc-float-c 3.5s ease-in-out infinite' } },
  ]

  return (
    <div className="bc-root">
      <ParticleField />

      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[
          { t:'8%', l:'8%', w:'min(420px,36vw)', c:'rgba(211,47,47,.17)', d:'0s' },
          { b:'18%', r:'8%', w:'min(480px,40vw)', c:'rgba(64,88,120,.22)', d:'-2s' },
          { t:'45%', r:'18%', w:'min(320px,28vw)', c:'rgba(255,235,238,.45)', d:'-5s' },
          { b:'4%', l:'12%', w:'min(220px,20vw)', c:'rgba(64,88,120,.28)', d:'-3s' },
        ].map((o, i) => (
          <div key={i} className="bc-orb" style={{ '--dur':'8s', width:o.w, height:o.w, background:o.c, top:o.t, bottom:o.b, left:o.l, right:o.r, animationDelay:o.d }}/>
        ))}
      </div>

      <header className="bc-nav" style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)', transition:'transform .6s cubic-bezier(.22,1,.36,1)' }}>
        <div className="bc-nav-inner">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}
            onClick={() => go('/')}
          >
            <span style={{ fontSize:'clamp(13px,1.6vw,16px)', fontWeight:900, color:'#D32F2F', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              BloodConnect: Smart Donor Matching System
            </span>
          </motion.div>
      
          <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => go('/emergency')}
              className="bc-btn bc-btn-primary"
              style={{ padding:'10px 24px', borderRadius:20, fontSize:13, display:'flex', alignItems:'center', gap:8 }}
            >
              <span style={{ animation: 'bc-pulse 1.2s cubic-bezier(0,0,.2,1) infinite', display: 'inline-block', fontWeight:900 }}>!</span>
              Emergency
            </motion.button>
          </div>
      
          <PremiumHamburgerMenu />
        </div>
      </header>

      <main style={{ position:'relative', zIndex:10, maxWidth:1360, margin:'0 auto', padding:'clamp(14px,2vw,28px) clamp(16px,3.5vw,44px)', display:'flex', flexDirection:'column', gap:'clamp(36px,4vw,64px)' }}>

        <section className="bc-hero-grid">
          <div style={{ display:'flex', flexDirection:'column', gap:'clamp(10px,1.2vw,16px)' }}>
            <div style={fadeUp(0)}>
              <div className="bc-glass" style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'8px 20px', borderRadius:9999, width:'fit-content', border:'1px solid rgba(211,47,47,.15)' }}>
                <span style={{ position:'relative', display:'inline-flex', width:12, height:12 }}>
                  <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#D32F2F', opacity:.75, animation:'bc-ping 1.2s cubic-bezier(0,0,.2,1) infinite' }}/>
                  <span style={{ position:'relative', display:'inline-flex', width:12, height:12, borderRadius:'50%', background:'#D32F2F', boxShadow:'0 0 12px #D32F2F' }}/>
                </span>
                <span style={{ color:'#D32F2F', fontWeight:900, fontSize:'clamp(8px,.85vw,10px)', letterSpacing:'.2em', textTransform:'uppercase' }}>Real-Time Lifeline System</span>
              </div>
            </div>

            <div style={fadeUp(.1)}>
              <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(28px,3.8vw,48px)', lineHeight:.93, fontWeight:900, color:'#D32F2F', margin:0 }}>
                Connected by <span style={{ color:'#D32F2F', textShadow:'0 4px 20px rgba(211,47,47,.35)' }}> Blood</span>  <br/>
                <em style={{ color:'#405878', fontStyle:'italic' }}>United by Hope</em>
              </h1>
            </div>

            <div style={fadeUp(.2)}>
              <p style={{ fontSize:'clamp(13px,1.3vw,17px)', color:'rgba(211,47,47,.7)', fontWeight:600, maxWidth:480, lineHeight:1.65, margin:0 }}>
                Born from Lebanon's recent crises, this platform transforms compassion into action by connecting lifesaving blood donors with patients in urgent need. </p>
            </div>

            <div style={{ ...fadeUp(.3), display:'flex', flexWrap:'wrap', gap:'clamp(10px,1.2vw,16px)', paddingTop:2 }}>
              <button className="bc-btn bc-btn-primary" onClick={() => go('/donor/register')}
                style={{ padding:'clamp(12px,1.4vw,17px) clamp(22px,3vw,36px)', borderRadius:22, fontSize:'clamp(13px,1.2vw,15px)' }}>
                Register as Donor →
              </button>
              <button className="bc-btn bc-btn-secondary" onClick={() => go('/login')}
                style={{ padding:'clamp(12px,1.4vw,17px) clamp(22px,3vw,36px)', borderRadius:22, fontSize:'clamp(13px,1.2vw,15px)' }}>
                Sign In
              </button>
            </div>
          </div>

          <div className="bc-hero-visual" style={{ position:'relative', height:'clamp(280px,28vw,420px)' }}>
            <div className="bc-glass-deep bc-card-hover" style={{ position:'absolute', inset:0, borderRadius:'clamp(24px,2.8vw,40px)', overflow:'hidden', border:'2px solid rgba(211,47,47,.12)' }}>
              <BloodDropVisual />
            </div>

            <div className="bc-stat-card-a bc-glass bc-card-hover" style={{ position:'absolute', top:'-4%', right:'-4%', zIndex:20, borderRadius:26, padding:'clamp(14px,1.8vw,22px)', minWidth:'min(200px,22vw)', border:'2px solid rgba(211,47,47,.2)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, background:'rgba(211,47,47,.1)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', animation:'bc-hb 1.5s ease-in-out infinite', flexShrink:0 }}>
                  <svg viewBox="0 0 24 24" style={{ width:22, height:22, fill:'#D32F2F' }}><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
                </div>
                <div>
                  <p style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.4)', letterSpacing:'.2em', textTransform:'uppercase', margin:0 }}>SYSTEM STATUS</p>
                  <p style={{ fontSize:22, fontWeight:900, color:'#D32F2F', margin:0 }}>Stable</p>
                </div>
              </div>
              <div style={{ marginTop:12 }}>
                <svg style={{ width:'100%', height:38 }} viewBox="0 0 200 40">
                  <path className="bc-heartpath" d="M0,20 L40,20 L50,5 L60,35 L70,20 L100,20 L110,10 L120,30 L130,20 L200,20" fill="none" stroke="#D32F2F" strokeLinecap="round" strokeWidth="3"/>
                </svg>
              </div>
              <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ width:8, height:8, background:'#22c55e', borderRadius:'50%', animation:'bc-pulse 2s infinite' }}/>
                <span style={{ fontSize:9, fontWeight:900, color:'rgba(211,47,47,.6)' }}>72 BPM · ACTIVE SYNC</span>
              </div>
            </div>

            <div className="bc-stat-card-b bc-glass" style={{ position:'absolute', bottom:'-4%', left:'-6%', width:'clamp(100px,12vw,150px)', height:'clamp(100px,12vw,150px)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', zIndex:20, border:'2px solid rgba(211,47,47,.2)' }}>
              <svg viewBox="0 0 24 24" style={{ width:'44%', height:'44%', stroke:'#D32F2F', fill:'none', strokeWidth:2, animation:'bc-spin8 8s linear infinite' }}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
          </div>
        </section>

        <section style={{ display:'flex', flexDirection:'column', gap:'clamp(16px,1.8vw,28px)' }}>
          <div className="bc-network-grid">
            <LebanonMap />

            <div className="bc-glass" style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:'clamp(20px,2.5vw,28px)', padding:'clamp(28px,3.5vw,40px)', borderRadius:'clamp(16px,2.5vw,28px)', border:'2px solid rgba(211,47,47,.2)' }}>
              <div style={{ textAlign:'center' }}>
                <span style={{ fontSize:'clamp(11px,1.2vw,14px)', fontWeight:900, color:'#D32F2F', textTransform:'uppercase', letterSpacing:'.1em' }}>Live Analytics</span>
              </div>
              
              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:'clamp(40px,6vw,60px)', flex:1 }}>
                {[
                  { label:'Donor Registrations', value: analytics.donors, color:'#4CAF50', icon:'👤' },
                  { label:'Emergency Clicks', value: analytics.emergencies, color:'#FF9800', icon:'🚨' },
                ].map((stat, i) => {
                  const maxVal = Math.max(analytics.donors, analytics.emergencies, 20)
                  const heightPercent = maxVal > 0 ? (stat.value / maxVal) * 100 : 0
                  return (
                    <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'clamp(12px,1.8vw,20px)', flex:1, minWidth:0 }}>
                      <div style={{ textAlign:'center' }}>
                        <span style={{ fontSize:'clamp(28px,5vw,56px)', fontWeight:900, color:'#D32F2F', textShadow:`0 2px 8px rgba(211,47,47,.2)`, display:'block' }}>
                          {stat.value}
                        </span>
                      </div>

                      <div style={{ width:'clamp(50px,7vw,80px)', flex:1, background:'rgba(211,47,47,.2)', borderRadius:'clamp(8px,1.2vw,12px)', overflow:'hidden', border:'2px solid rgba(211,47,47,.2)', position:'relative', minHeight:'clamp(140px,40vh,260px)' }}>
                        <motion.div
                          animate={{ height:`${heightPercent}%` }}
                          transition={{ duration:0.8, ease:'easeOut' }}
                          style={{ 
                            width:'100%',
                            background:`linear-gradient(180deg,#D32F2F,rgba(211,47,47,.8))`, 
                            borderRadius:'clamp(6px,1.2vw,12px)', 
                            boxShadow:`0 4px 16px rgba(211,47,47,.3)`,
                            position:'absolute',
                            bottom:0,
                          }}
                        />
                      </div>

                      <div style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:6, width:'100%' }}>
                        <span style={{ fontSize:'clamp(18px,2.8vw,28px)' }}>{stat.icon}</span>
                        <span style={{ fontSize:'clamp(9px,.95vw,11px)', fontWeight:700, color:'rgba(211,47,47,.65)', textTransform:'uppercase', letterSpacing:'.05em', lineHeight:1.2 }}>
                          {stat.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginTop:'clamp(12px,1.5vw,20px)', paddingTop:'clamp(12px,1.5vw,20px)', borderTop:'2px solid rgba(211,47,47,.15)' }}>
                <a href="https://www.google.com/maps/place/33.89652171663661,35.483144430563314/@33.89652171663661,35.483144430563314,18z" target="_blank" rel="noopener noreferrer"
                  className="bc-btn bc-btn-primary"
                  style={{ width:'100%', padding:'clamp(12px,1.5vw,16px)', borderRadius:16, fontSize:'clamp(10px,1.1vw,12px)', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', gap:8, textDecoration:'none' }}>
                  <span>📍</span>
                  <span>Visit Our Center - Hamra</span>
                  <span>→</span>
                </a>
                <p style={{ fontSize:'clamp(8px,.9vw,10px)', color:'rgba(211,47,47,.5)', margin:'8px 0 0', textAlign:'center', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' }}>🏥 Real Center · Hamra District</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bc-glass-deep" style={{ borderRadius:'clamp(28px,4vw,56px)', padding:'clamp(18px,2.5vw,40px)', position:'relative', overflow:'hidden', border:'2px solid rgba(211,47,47,.2)' }}>
          <div style={{ position:'absolute', right:'-18%', top:'-18%', width:'55%', height:'55%', background:'rgba(64,88,120,.18)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', left:'-18%', bottom:'-18%', width:'55%', height:'55%', background:'rgba(255,235,238,.5)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none' }}/>

          <div style={{ textAlign:'center', maxWidth:580, margin:'0 auto', marginBottom:'clamp(28px,4vw,52px)', position:'relative', zIndex:1 }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(20px,2.8vw,36px)', fontWeight:900, color:'#D32F2F', marginBottom:12, marginTop:0 }}>The Compatibility Matrix</h2>
            <p style={{ fontSize:'clamp(12px,1.2vw,15px)', color:'rgba(211,47,47,.65)', fontWeight:600, margin:0 }}>Click any blood type to unlock donor and recipient pathways with visual precision.</p>
          </div>

          <div style={{ display:'flex', justifyContent:'center', gap:'clamp(7px,.9vw,12px)', marginBottom:'clamp(24px,3.5vw,44px)', flexWrap:'wrap', position:'relative', zIndex:1 }}>
            {ALL_TYPES.map(t => (
              <button key={t} onClick={() => selectType(t)}
                className={`bc-btn bc-glass bc-chip${t === bloodType ? ' active' : ''}`}
                style={{ padding:'clamp(8px,1vw,12px) clamp(14px,1.8vw,22px)', borderRadius:'clamp(10px,1.4vw,16px)', fontSize:'clamp(13px,1.4vw,17px)', color: t === bloodType ? 'white' : 'rgba(211,47,47,.45)' }}>
                {t}
              </button>
            ))}
          </div>

          <div className="bc-compat-grid" style={{ position:'relative', zIndex:1 }}>
            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'clamp(40px,6vw,80px)', paddingBottom:'clamp(30px,5vw,60px)' }}>
              <div className="bc-glass" style={{ width:'min(340px,34vw)', height:'min(340px,34vw)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'clamp(6px,1.2vw,14px) solid rgba(211,47,47,.15)', position:'relative', boxShadow:'0 20px 56px rgba(211,47,47,.1)' }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'clamp(3px,.6vw,8px) solid', borderColor:'#D32F2F transparent transparent transparent', opacity:.3, animation:'bc-spin8 8s linear infinite' }}/>
                <div style={{ position:'absolute', inset:'4%', borderRadius:'50%', border:'2px dashed rgba(211,47,47,.15)', animation:'bc-spin30r 20s linear infinite' }}/>

                <div key={animKey} className="bc-pop" style={{ textAlign:'center', padding:'0 16px' }}>
                  <span style={{ fontSize:'clamp(48px,7.5vw,88px)', fontWeight:900, color:'#D32F2F', display:'block', lineHeight:1, textShadow:'0 4px 24px rgba(211,47,47,.2)', fontFamily:"'Fraunces',serif" }}>{bloodType}</span>
                  <div style={{ marginTop:8, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                    <span style={{ padding:'5px 16px', borderRadius:9999, background:'rgba(14,165,233,.15)', fontSize:8, fontWeight:900, color:'#405878', letterSpacing:'.18em', border:'1px solid rgba(64,88,120,.3)' }}>MATCH ACTIVE</span>
                    <span style={{ fontSize:8, fontWeight:900, color:'rgba(211,47,47,.5)', textTransform:'uppercase', letterSpacing:'.22em' }}>GENETIC REACH: {data.reach}</span>
                  </div>
                </div>
              </div>

              {floatBadges.map(({ type: nt, style }) => (
                <div key={nt} onClick={() => selectType(nt)} className="bc-glass bc-card-hover"
                  style={{ position:'absolute', ...style, width:'min(76px,7.8vw)', height:'min(76px,7.8vw)', minWidth:60, minHeight:60, borderRadius:'clamp(12px,1.8vw,20px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', border: nt === bloodType ? '2px solid rgba(211,47,47,.5)' : '2px solid rgba(211,47,47,.15)', background: nt === bloodType ? 'rgba(255,235,238,.5)' : undefined, transition:'all .22s', zIndex:20 }}>
                  <span style={{ fontSize:'clamp(12px,1.4vw,16px)', fontWeight:900, color:'#D32F2F' }}>{nt}</span>
                  <svg viewBox="0 0 24 24" style={{ width:12, height:12, fill:'#405878', marginTop:2 }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'clamp(18px,2.2vw,30px)' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="bc-glass" style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(64,88,120,.2)', flexShrink:0 }}>
                    <svg viewBox="0 0 24 24" style={{ width:18, height:18, fill:'none', stroke:'#405878', strokeWidth:2.5 }}><path d="M8 17l4 4 4-4m-4-5v9M3 5h18M3 5l2-2m-2 2l2 2m13-2l-2-2m2 2l-2 2"/></svg>
                  </div>
                  <h4 style={{ fontSize:9, fontWeight:900, color:'#D32F2F', letterSpacing:'.32em', textTransform:'uppercase', margin:0 }}>You can receive from</h4>
                </div>
                <div className="bc-type-grid">
                  {data.canReceive.map((t, i) => (
                    <div key={t + i} onClick={() => selectType(t)} className="bc-cell-receive">
                      {t === bloodType && <span className="bc-badge" style={{ background:'#405878' }}>✓</span>}
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="bc-glass" style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(211,47,47,.2)', flexShrink:0 }}>
                    <svg viewBox="0 0 24 24" style={{ width:18, height:18, fill:'none', stroke:'#D32F2F', strokeWidth:2.5 }}><path d="M16 7l-4-4-4 4m4-4v9M3 19h18M3 19l2 2m-2-2l2-2m13 2l-2 2m2-2l-2-2"/></svg>
                  </div>
                  <h4 style={{ fontSize:9, fontWeight:900, color:'#D32F2F', letterSpacing:'.32em', textTransform:'uppercase', margin:0 }}>You can donate to</h4>
                </div>
                <div className="bc-type-grid">
                  {data.canDonateTo.map((t, i) => (
                    <div key={t + i} onClick={() => selectType(t)} className="bc-cell-donate">
                      {t === bloodType && <span className="bc-badge" style={{ background:'#D32F2F' }}>!</span>}
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bc-glass" style={{ display:'flex', alignItems:'center', gap:14, padding:'clamp(10px,1.5vw,18px)', borderRadius:18, border:'2px solid rgba(211,47,47,.2)', background:'rgba(255,235,238,.3)' }}>
                <svg viewBox="0 0 24 24" style={{ width:32, height:32, fill:'rgba(211,47,47,.45)', flexShrink:0 }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <p style={{ fontSize:'clamp(10px,1vw,12px)', fontWeight:600, lineHeight:1.6, margin:0, color:'#D32F2F' }}>
                  <span style={{ fontWeight:900 }}>Did you know?</span> O- is the universal hero — it can be given to any blood type during critical emergencies.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bc-glass" style={{ marginTop:'clamp(44px,6vw,100px)', borderTop:'2px solid rgba(211,47,47,.2)', background:'rgba(255,255,255,.4)' }}>
        <div style={{ maxWidth:1360, margin:'0 auto', padding:'clamp(32px,4.5vw,64px) clamp(16px,3.5vw,44px)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'clamp(24px,3.5vw,52px)', marginBottom:'clamp(28px,3.5vw,56px)' }}>
            <div>
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'#D32F2F', fontSize:'clamp(18px,2.2vw,26px)', fontWeight:800, marginBottom:16, letterSpacing:'-.04em' }}>BloodConnect</div>
              <p style={{ color:'rgba(211,47,47,.65)', fontWeight:600, lineHeight:1.65, fontStyle:'italic', fontSize:'clamp(11px,1.1vw,13px)', margin:0 }}>
                "Pioneering the future of hematological logistics through empathy and code."
              </p>
            </div>
          </div>
      
          <div style={{ paddingTop:22, borderTop:'2px solid rgba(211,47,47,.2)' }}>
            <p style={{ color:'rgba(211,47,47,.4)', fontSize:'clamp(8px,.85vw,10px)', fontWeight:900, textTransform:'uppercase', letterSpacing:'.16em', margin:0 }}>
              © 2026 BloodConnect · Dana Ghannam & Lynn Anani · Lebanon.
            </p>
          </div>
        </div>
      </footer>

      <div className="bc-fab-wrap">
        <div className="bc-fab-ring" style={{ opacity:.45 }}/>
        <div className="bc-fab-ring2" style={{ opacity:.25 }}/>

        <button className="bc-fab" onClick={() => go('/emergency')}
          onMouseEnter={() => setSosHover(true)}
          onMouseLeave={() => setSosHover(false)}>
          !
        </button>
      </div>
    </div>
  )
}