import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─── Blood type compatibility data ─────────────────────── */
const BLOOD_DATA = {
  'A+':  { canReceive: ['A+','A-','O+','O-'], canDonateTo: ['A+','AB+'], reach: '34%' },
  'A-':  { canReceive: ['A-','O-'],           canDonateTo: ['A+','A-','AB+','AB-'], reach: '6%' },
  'B+':  { canReceive: ['B+','B-','O+','O-'], canDonateTo: ['B+','AB+'], reach: '9%' },
  'B-':  { canReceive: ['B-','O-'],           canDonateTo: ['B+','B-','AB+','AB-'], reach: '2%' },
  'AB+': { canReceive: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], canDonateTo: ['AB+'], reach: '3%' },
  'AB-': { canReceive: ['A-','B-','AB-','O-'], canDonateTo: ['AB+','AB-'], reach: '1%' },
  'O+':  { canReceive: ['O+','O-'],           canDonateTo: ['A+','B+','O+','AB+'], reach: '38%' },
  'O-':  { canReceive: ['O-'],                canDonateTo: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], reach: '7%' },
}
const ALL_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

/* ─── Injected CSS ───────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Lexend:wght@400;600&family=Fraunces:wght@700;900&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; overflow-x: hidden; }

  @keyframes liquid-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes pulse-glow {
    0%,100% { box-shadow: 0 0 16px rgba(184,29,39,.2), inset 0 0 8px rgba(184,29,39,.1); }
    50%     { box-shadow: 0 0 32px rgba(184,29,39,.55), inset 0 0 16px rgba(184,29,39,.25); }
  }
  @keyframes float-parallax {
    0%,100% { transform: translateY(0) translateX(0) rotate(0deg); }
    33%     { transform: translateY(-14px) translateX(8px) rotate(1.5deg); }
    66%     { transform: translateY(8px) translateX(-11px) rotate(-1.5deg); }
  }
  @keyframes heartbeat {
    0%  { transform: scale(1); }
    14% { transform: scale(1.1); }
    28% { transform: scale(1); }
    42% { transform: scale(1.1); }
    70% { transform: scale(1); }
  }
  @keyframes stream-flow {
    0%   { stroke-dashoffset: 1000; opacity: 0; }
    50%  { opacity: 0.8; }
    100% { stroke-dashoffset: 0; opacity: 0; }
  }
  @keyframes dash   { to { stroke-dashoffset: 0; } }
  @keyframes spin8  { to { transform: rotate(360deg); } }
  @keyframes spin30 { to { transform: rotate(360deg); } }
  @keyframes ping   { 75%,100% { transform: scale(2.2); opacity: 0; } }
  @keyframes pulse  { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
  @keyframes pop-in {
    0%   { transform: scale(.85); opacity: 0; }
    60%  { transform: scale(1.05); }
    100% { transform: scale(1);  opacity: 1; }
  }

  .bc-root {
    background: linear-gradient(-45deg,#e0f2fe,#f0fdf4,#fdf2f8,#fefce8);
    background-size: 400% 400%;
    animation: liquid-shift 12s ease infinite;
    min-height: 100vh;
    font-family: 'Lexend', sans-serif;
    overflow-x: hidden;
    width: 100%;
  }
  .bc-glass {
    background: rgba(255,255,255,.42);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,.65);
    box-shadow: 0 8px 32px rgba(31,38,135,.08), inset 0 0 16px rgba(255,255,255,.5);
  }
  .bc-glass-deep {
    background: rgba(255,255,255,.26);
    backdrop-filter: blur(36px) contrast(1.08);
    border: 1px solid rgba(255,255,255,.7);
    box-shadow: 0 20px 48px -8px rgba(0,0,0,.07), inset 0 0 32px rgba(255,255,255,.55);
  }
  .bc-chromatic { box-shadow: -2px -2px 6px rgba(100,180,255,.2), 2px 2px 6px rgba(255,100,100,.18); }
  .bc-float     { animation: float-parallax 10s ease-in-out infinite; }
  .bc-hb        { animation: heartbeat 1.5s ease-in-out infinite; }
  .bc-glow      { animation: pulse-glow 2s infinite; }
  .bc-spin8     { animation: spin8  8s  linear infinite; }
  .bc-spin30    { animation: spin30 30s linear infinite; }
  .bc-fraunces  { font-family: 'Fraunces', serif; }
  .bc-heartpath { stroke-dasharray:1000; stroke-dashoffset:1000; animation:dash 3s linear infinite; }
  .bc-stream    { stroke-dasharray:50; animation:stream-flow 10s linear infinite; }
  .bc-pop       { animation: pop-in .32s cubic-bezier(.34,1.56,.64,1) forwards; }

  .bc-btn { cursor:pointer; transition:transform .16s, box-shadow .16s; border:none; outline:none; }
  .bc-btn:hover  { transform: translateY(-2px) scale(1.04); }
  .bc-btn:active { transform: scale(.96); }

  .bc-type-chip {
    cursor: pointer;
    transition: all .2s cubic-bezier(.34,1.56,.64,1);
    border: 1.5px solid rgba(255,255,255,.55);
    outline: none;
  }
  .bc-type-chip:hover { transform: scale(1.08); box-shadow: 0 8px 24px rgba(35,101,129,.15); }
  .bc-type-chip.active-receive { border-color: rgba(29,108,56,.6) !important; background: rgba(29,108,56,.08) !important; color: #1d6c38 !important; transform: scale(1.1); }
  .bc-type-chip.active-donate  { border-color: rgba(184,29,39,.6) !important; background: rgba(184,29,39,.08) !important; color: #b81d27 !important; transform: scale(1.1); }
  .bc-type-chip.selected-type  { border-color: rgba(35,101,129,.7) !important; background: rgba(35,101,129,.1) !important; color: #236581 !important; transform: scale(1.14); box-shadow: 0 10px 28px rgba(35,101,129,.2); }

  .bc-nav-link { background:none; border:none; cursor:pointer; color:#236581; font-weight:700; font-size:.76rem; letter-spacing:.12em; text-transform:uppercase; transition:opacity .2s; font-family:'Lexend',sans-serif; padding:0; }
  .bc-nav-link:hover { opacity:.6; }

  .mso { font-family:'Material Symbols Outlined'; font-weight:normal; font-style:normal; line-height:1; letter-spacing:normal; text-transform:none; display:inline-block; white-space:nowrap; direction:ltr; -webkit-font-smoothing:antialiased; }

  /* ── Responsive ── */
  .bc-hero-grid    { display:grid; grid-template-columns:1fr 1fr; gap:clamp(20px,3.5vw,56px); align-items:center; min-height:75vh; }
  .bc-compat-grid  { display:grid; grid-template-columns:1fr 1.1fr; gap:clamp(24px,4vw,64px); align-items:start; }
  .bc-type-grid    { display:grid; grid-template-columns:repeat(4,1fr); gap:clamp(6px,.8vw,10px); }

  /* ── Map container ── */
  .bc-map-wrap {
    border-radius: clamp(24px,3.5vw,44px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.7);
    box-shadow: 0 20px 48px -8px rgba(0,0,0,.07), inset 0 0 32px rgba(255,255,255,.55);
    background: rgba(255,255,255,.26);
    backdrop-filter: blur(36px) contrast(1.08);
    display: flex;
    flex-direction: column;
  }
  .bc-map-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding: 14px 18px 10px;
    background: rgba(255,255,255,.25);
    border-bottom: 1px solid rgba(255,255,255,.5);
  }
  .bc-map-chips { display: flex; gap: 10px; flex-wrap: wrap; }
  .bc-map-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,.55);
    border: 1px solid rgba(255,255,255,.8);
    border-radius: 10px;
    padding: 6px 14px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: #236581;
    font-family: 'Lexend', sans-serif;
  }
  .bc-map-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .bc-map-coord {
    font-family: monospace;
    font-size: 12px;
    color: rgba(120,200,255,.9);
    background: rgba(2,21,34,.5);
    padding: 4px 10px;
    border-radius: 8px;
  }
  .bc-map-svg-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 900 / 820;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 28px;
  overflow: hidden;
}
  .bc-map-svg-wrap svg {
  width: 92%;
  height: 92%;

  max-width: 100%;
  max-height: 100%;

  display: block;
  margin: auto;
}
  .bc-map-bottombar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 18px 14px;
    background: rgba(255,255,255,.25);
    border-top: 1px solid rgba(255,255,255,.5);
  }
  .bc-map-legend { display: flex; gap: 18px; flex-wrap: wrap; align-items: center; }
  .bc-map-legend-item { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 600; color: #236581; font-family: 'Lexend', sans-serif; }
  .bc-map-vitality { display: flex; align-items: center; gap: 12px; }
  .bc-map-vbar { width: 120px; height: 7px; background: rgba(255,255,255,.4); border-radius: 999px; overflow: hidden; }
  .bc-map-vfill { height: 100%; width: 92%; background: linear-gradient(to right, #1d6c38, #236581); border-radius: 999px; }
  .bc-map-vlabel { font-size: 11px; font-weight: 700; color: #236581; font-family: 'Lexend', sans-serif; }
  .bc-map-vnum { font-size: 16px; font-weight: 900; color: #1d6c38; font-family: 'Lexend', sans-serif; }

  /* ── Network grid ── */
  .bc-network-grid { display:grid; grid-template-columns:2fr 1fr; gap:clamp(12px,1.8vw,20px); }

  @media (max-width:960px) {
    .bc-hero-grid    { grid-template-columns:1fr; min-height:unset; }
    .bc-network-grid { grid-template-columns:1fr; }
    .bc-compat-grid  { grid-template-columns:1fr; }
    .bc-hero-visual  { display:none !important; }
    .bc-desktop-nav  { display:none !important; }
    .bc-mobile-btn   { display:flex !important; }
  }
  @media (min-width:961px) {
    .bc-mobile-btn   { display:none !important; }
    .bc-mobile-menu  { display:none !important; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('bc-styles')) {
  const s = document.createElement('style')
  s.id = 'bc-styles'
  s.textContent = STYLES
  document.head.appendChild(s)
}

const C = { p: '#236581', s: '#1d6c38', r: '#b81d27' }

/* ── Lebanon Blood Network Map ───────────────────────────── */
function LebanonMap() {
  return (
    <div className="bc-map-wrap">
      {/* Top bar: status chips + coordinates */}
      <div className="bc-map-topbar">
        <div className="bc-map-chips">
          <div className="bc-map-chip">
            <span className="bc-map-dot" style={{ background:'#22c55e', animation:'pulse 2s infinite' }}/>
            Beirut: Live Matching
          </div>
          <div className="bc-map-chip">
            <span className="bc-map-dot" style={{ background:'#b81d27', animation:'pulse 2s infinite', animationDelay:'.4s' }}/>
            Tripoli: Urgent Need
          </div>
        </div>
        <span className="bc-map-coord">33°N 35°E</span>
      </div>

      {/* SVG map fills full width */}
      <div className="bc-map-svg-wrap">
        <svg
          viewBox="0 0 900 820"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="lbg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#021522"/>
              <stop offset="100%" stopColor="#042f4b"/>
            </linearGradient>
            <style>{`
              .mgrid{stroke:rgba(255,255,255,.05);stroke-width:1}
              .msea{fill:rgba(50,120,170,.15)}
              .gov{stroke:rgba(170,230,255,.55);stroke-width:2.2;stroke-linejoin:round;}
              .akkar{fill:rgba(140,95,185,.45)} .north{fill:rgba(45,120,75,.45)}
              .bh{fill:rgba(145,95,30,.48)} .kj{fill:rgba(45,95,145,.5)}
              .ml{fill:rgba(40,110,70,.45)} .beqaa{fill:rgba(115,80,180,.48)}
              .nab{fill:rgba(70,120,70,.45)} .south{fill:rgba(145,95,40,.48)}
              .beirut-gov{fill:rgba(220,40,60,.72)}
              .mcity{
  font-family:Lexend,sans-serif;
  font-size:15px;
  font-weight:800;
  fill:white;
  letter-spacing:1px;
}

.msub{
  font-family:Lexend,sans-serif;
  font-size:11px;
  font-weight:700;
  letter-spacing:.8px;
}

.mlabel{
  font-family:Lexend,sans-serif;
  font-size:12px;
  font-weight:700;
  fill:rgba(255,255,255,.72);
  letter-spacing:1px;
}
              .mfooter{font-family:Lexend,sans-serif;font-size:13px;fill:rgba(120,200,255,.45);letter-spacing:6px;}
              .dashBlue{stroke:#45bfff;stroke-width:2;stroke-dasharray:8 8;}
              .dashRed{stroke:#ff6677;stroke-width:2;stroke-dasharray:8 8;}
              .dashGreen{stroke:#41d27c;stroke-width:2;stroke-dasharray:8 8;}
            `}</style>
          </defs>

          <rect width="900" height="820" fill="url(#lbg)"/>
          <path className="msea" d="M0 0 L260 0 C240 140 240 250 245 380 C250 530 235 680 220 820 L0 820 Z"/>

          {/* Grid */}
          <g>
            {[80,160,240,320,400,480,560,640,720].map(y => <line key={`h${y}`} x1="0" y1={y} x2="900" y2={y} className="mgrid"/>)}
            {[80,160,240,320,400,480,560,640,720,800].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="820" className="mgrid"/>)}
          </g>

          <g transform="translate(120,5) scale(1.15)">
            {/* Governorates */}
            <path className="gov akkar"     d="M385 45 L430 38 L470 48 L500 42 L520 54 L548 50 L560 62 L556 82 L540 88 L525 102 L500 106 L472 110 L448 116 L418 112 L388 105 L370 90 L374 68 Z"/>
            <path className="gov north"     d="M355 120 L388 105 L418 112 L448 116 L472 110 L495 120 L505 150 L498 182 L485 205 L462 224 L438 235 L410 248 L380 242 L352 238 L330 228 L318 210 L320 180 L335 145 Z"/>
            <path className="gov bh"        d="M495 120 L528 108 L558 118 L578 138 L594 172 L610 208 L620 245 L612 275 L628 300 L620 340 L602 362 L585 380 L560 372 L542 392 L518 388 L492 370 L470 352 L452 328 L438 300 L425 268 L410 248 L438 235 L462 224 L485 205 L498 182 L505 150 Z"/>
            <path className="gov kj"        d="M300 210 L330 228 L352 238 L380 242 L410 248 L425 268 L420 300 L400 325 L372 338 L340 332 L318 320 L298 295 L286 268 L286 235 Z"/>
            <path className="gov beirut-gov" d="M268 328 L282 330 L288 345 L280 358 L265 356 L260 340 Z"/>
            <path className="gov ml"        d="M286 235 L298 295 L318 320 L340 332 L372 338 L400 325 L420 300 L438 318 L445 350 L438 380 L420 418 L392 450 L362 460 L332 455 L308 442 L286 418 L266 388 L252 352 L260 340 L265 356 L280 358 L288 345 L282 330 L268 328 L258 290 L268 250 Z"/>
            <path className="gov beqaa"     d="M438 318 L452 328 L470 352 L492 370 L520 390 L540 418 L530 448 L505 470 L492 500 L470 528 L448 520 L425 505 L405 485 L392 450 L420 418 L438 380 L445 350 Z"/>
            <path className="gov nab"       d="M332 455 L362 460 L392 450 L405 485 L425 505 L418 532 L395 555 L370 570 L338 565 L315 550 L300 522 L298 490 L310 468 Z"/>
            <path className="gov south"     d="M252 352 L266 388 L286 418 L310 468 L298 490 L300 522 L315 550 L338 565 L330 600 L312 640 L288 675 L250 680 L220 665 L205 632 L205 592 L210 548 L218 500 L225 455 L232 412 L240 378 Z"/>

            {/* Outer border */}
            <path
              d="M385 45 L430 38 L470 48 L500 42 L520 54 L548 50 L560 62 L556 82 L540 88 L525 102 L528 108 L558 118 L578 138 L594 172 L610 208 L620 245 L612 275 L628 300 L620 340 L602 362 L585 380 L560 372 L542 392 L540 418 L530 448 L505 470 L492 500 L470 528 L418 532 L395 555 L370 570 L330 600 L312 640 L288 675 L250 680 L220 665 L205 632 L205 592 L210 548 L218 500 L225 455 L232 412 L240 378 L252 352 L258 290 L268 250 L300 210 L320 180 L335 145 L355 120 L370 90 L374 68 Z"
              fill="none" stroke="rgba(120,220,255,.75)" strokeWidth="3"
            />

            {/* Connection lines */}
            <line x1="275" y1="343" x2="355" y2="165" className="dashBlue"/>
            <line x1="275" y1="343" x2="520" y2="270" className="dashRed"/>
            <line x1="275" y1="343" x2="265" y2="500" className="dashGreen"/>

            {/* TRIPOLI */}
            <circle cx="355" cy="165" r="34" fill="rgba(40,200,90,.15)">
              <animate attributeName="r" values="34;50;34" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".5;0;.5" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="355" cy="165" r="11" fill="#2ac96b" stroke="white" strokeWidth="4"/>
            <rect x="188" y="137" width="155" height="58" rx="12" fill="rgba(0,0,0,.72)"/>
            <text x="204" y="162" className="mcity">TRIPOLI</text>
            <text x="204" y="183" className="msub" fill="#ffba57">URGENT NEED</text>

            {/* BEIRUT */}
            <circle cx="275" cy="343" r="42" fill="rgba(255,70,90,.16)">
              <animate attributeName="r" values="42;62;42" dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".5;0;.5" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="275" cy="343" r="14" fill="#ff334f" stroke="white" strokeWidth="4"/>
            <rect x="82" y="318" width="182" height="58" rx="12" fill="rgba(0,0,0,.72)"/>
            <text x="98" y="343" className="mcity">BEIRUT</text>
            <text x="98" y="364" className="msub" fill="#49d6ff">LIVE MATCHING</text>

            {/* BAALBEK — tooltip to the LEFT of dot */}
            <circle cx="520" cy="270" r="30" fill="rgba(255,80,80,.16)">
              <animate attributeName="r" values="30;46;30" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".45;0;.45" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="520" cy="270" r="10" fill="#ff5a66" stroke="white" strokeWidth="4"/>
           <rect x="330" y="220" width="150" height="56" rx="12" />
           <text x="378" y="272" className="mcity">BAALBEK</text>
            <text x="378" y="292" className="msub" fill="#4ad7ff">MATCHING</text>

            {/* SIDON */}
            <circle cx="265" cy="500" r="28" fill="rgba(70,170,255,.16)">
              <animate attributeName="r" values="28;44;28" dur="3.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".45;0;.45" dur="3.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="265" cy="500" r="10" fill="#43b8ff" stroke="white" strokeWidth="4"/>
            <rect x="290" y="477" width="118" height="54" rx="12" fill="rgba(0,0,0,.72)"/>
            <text x="305" y="500" className="mcity">SIDON</text>
            <text x="305" y="520" className="msub" fill="#53d9ff">ACTIVE</text>

            {/* Region labels */}
            <text x="455" y="82"  textAnchor="middle" className="mlabel">AKKAR</text>
            <text x="410" y="192" textAnchor="middle" className="mlabel">NORTH</text>
            <text x="555" y="360" textAnchor="middle" className="mlabel">BAALBEK-HERMEL</text>
            <text x="350" y="285" textAnchor="middle" className="mlabel">KESERWAN-JBEIL</text>
            <text x="340" y="430" textAnchor="middle" className="mlabel">MOUNT LEBANON</text>
            <text x="478" y="490" textAnchor="middle" className="mlabel">BEQAA</text>
            <text x="360" y="555" textAnchor="middle" className="mlabel">NABATIEH</text>
            <text x="238" y="610" textAnchor="middle" className="mlabel">SOUTH</text>

            <text x="30" y="780" className="mfooter">LEBANON · BLOOD NETWORK · LIVE</text>
          </g>
        </svg>
      </div>

      {/* Bottom bar: legend + vitality — no overlap */}
      <div className="bc-map-bottombar">
        <div className="bc-map-legend">
          {[
            { color:'#ff334f', label:'Live matching' },
            { color:'#2ac96b', label:'Urgent need' },
            { color:'#43b8ff', label:'Active' },
            { color:'#ff6b7f', label:'Matching' },
          ].map(({ color, label }) => (
            <div key={label} className="bc-map-legend-item">
              <span className="bc-map-dot" style={{ background: color, width:10, height:10 }}/>
              {label}
            </div>
          ))}
        </div>
        <div className="bc-map-vitality">
          <span className="bc-map-vlabel">Network vitality</span>
          <div className="bc-map-vbar"><div className="bc-map-vfill"/></div>
          <span className="bc-map-vnum">92%</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [bloodType, setBloodType] = useState('A+')
  const [animKey, setAnimKey]     = useState(0)

  const go = (path) => { setMenuOpen(false); navigate(path) }

  const selectType = (t) => {
    if (t === bloodType) return
    setBloodType(t)
    setAnimKey(k => k + 1)
  }

  const data = BLOOD_DATA[bloodType]

  return (
    <div className="bc-root">

      {/* ── Orbs ── */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[
          { top:'8%',    left:'8%',   w:'min(420px,36vw)', color:'rgba(186,230,253,.5)', d:'-1s' },
          { bottom:'18%',right:'8%',  w:'min(480px,40vw)', color:'rgba(254,205,211,.4)', d:'-3s' },
          { top:'45%',   right:'18%', w:'min(320px,28vw)', color:'rgba(167,243,208,.4)', d:'-5s' },
          { bottom:'4%', left:'12%',  w:'min(220px,20vw)', color:'rgba(254,249,195,.5)', d:'-2s' },
        ].map((o,i) => (
          <div key={i} className="bc-float" style={{ position:'absolute', borderRadius:'50%', width:o.w, height:o.w, background:o.color, filter:'blur(110px)', animationDelay:o.d, top:o.top, bottom:o.bottom, left:o.left, right:o.right }}/>
        ))}
      </div>

      {/* ── SVG streams ── */}
      <svg style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:.15 }}>
        <path className="bc-stream" d="M-100,200 Q400,100 900,400 T1800,200" fill="none" stroke={C.p} strokeWidth="1"/>
        <path className="bc-stream" d="M-100,600 Q500,800 1100,500 T2000,700" fill="none" stroke={C.r} strokeWidth="1" style={{animationDelay:'-4s'}}/>
      </svg>

      {/* ══ NAV ══════════════════════════════════════════════ */}
      <header style={{ position:'sticky', top:0, zIndex:50, background:'rgba(255,255,255,.28)', backdropFilter:'blur(36px)', borderBottom:'1px solid rgba(255,255,255,.6)', boxShadow:'0 2px 20px rgba(0,0,0,.04)' }}>
        <div style={{ maxWidth:1360, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'clamp(10px,1.4vw,16px) clamp(16px,3.5vw,44px)' }}>

          <div style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer' }} onClick={() => go('/')}>
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'clamp(16px,1.8vw,22px)', fontWeight:800, color:C.p, letterSpacing:'-.04em' }}>BloodConnect</span>
          </div>

          <div className="bc-desktop-nav" style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1 }}>
            <button className="bc-btn bc-glow" onClick={() => go('/emergency')}
              style={{ padding:'10px 32px', borderRadius:11, fontWeight:900, color:'white', background:C.r, fontFamily:"'Lexend',sans-serif", fontSize:14, border:'none', boxShadow:`0 6px 20px rgba(184,29,39,.35)`, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:8, height:8, background:'rgba(255,255,255,.7)', borderRadius:'50%', display:'inline-block', animation:'pulse 2s infinite' }}/>
              Emergency
              <span style={{ width:8, height:8, background:'rgba(255,255,255,.7)', borderRadius:'50%', display:'inline-block', animation:'pulse 2s infinite', animationDelay:'.3s' }}/>
            </button>
          </div>

          <button className="bc-mobile-btn bc-btn" onClick={() => setMenuOpen(o=>!o)}
            style={{ background:'none', border:'none', fontSize:24, color:C.p, padding:4, display:'none' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <div className="bc-mobile-menu bc-glass" style={{ display:'flex', flexDirection:'column', gap:0, borderTop:'1px solid rgba(255,255,255,.5)', padding:'6px 18px 14px' }}>
            {[['Blood Status','/inventory'],['How It Works','/how-it-works'],['Emergency','/emergency']].map(([l,p])=>(
              <button key={l} onClick={() => go(p)} style={{ background:'none', border:'none', borderBottom:'1px solid rgba(35,101,129,.07)', padding:'12px 0', textAlign:'left', fontFamily:"'Lexend',sans-serif", fontWeight:700, fontSize:14, color:p==='/emergency'?C.r:C.p, cursor:'pointer' }}>{l}</button>
            ))}
            <button onClick={() => go('/login')} style={{ margin:'8px 0 3px', padding:11, borderRadius:11, background:C.p, color:'white', fontWeight:900, fontFamily:"'Lexend',sans-serif", fontSize:13, border:'none', cursor:'pointer' }}>Sign In</button>
            <button onClick={() => go('/donor/register')} style={{ padding:11, borderRadius:11, background:'none', color:C.r, fontWeight:700, fontFamily:"'Lexend',sans-serif", fontSize:12, border:`1px solid ${C.r}`, cursor:'pointer' }}>Register as Donor →</button>
          </div>
        )}
      </header>

      {/* ══ MAIN ═════════════════════════════════════════════ */}
      <main style={{ position:'relative', zIndex:10, maxWidth:1360, margin:'0 auto', padding:'clamp(20px,3.5vw,44px) clamp(16px,3.5vw,44px)', display:'flex', flexDirection:'column', gap:'clamp(52px,7vw,100px)' }}>

        {/* ── HERO ── */}
        <section className="bc-hero-grid">
          <div style={{ display:'flex', flexDirection:'column', gap:'clamp(14px,2vw,26px)' }}>

            <div className="bc-glass" style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'7px 18px', borderRadius:9999, width:'fit-content' }}>
              <span style={{ position:'relative', display:'inline-flex', width:12, height:12 }}>
                <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:C.r, opacity:.75, animation:'ping 1.2s cubic-bezier(0,0,.2,1) infinite' }}/>
                <span style={{ position:'relative', display:'inline-flex', width:12, height:12, borderRadius:'50%', background:C.r }}/>
              </span>
              <span style={{ color:C.p, fontWeight:900, fontSize:'clamp(8px,.85vw,10px)', letterSpacing:'.2em', textTransform:'uppercase' }}>AI-POWERED ROUTING ACTIVE</span>
            </div>

            <h1 className="bc-fraunces" style={{ fontSize:'clamp(36px,5.5vw,72px)', lineHeight:.93, fontWeight:900, color:C.p, margin:0 }}>
              Your <span style={{ color:C.r }}>Blood</span> Can<br/>
              <span style={{ fontStyle:'italic', color:C.s }}>Save Three Lives</span>
            </h1>

            <p style={{ fontSize:'clamp(13px,1.3vw,17px)', color:'rgba(35,101,129,.8)', fontWeight:600, maxWidth:480, lineHeight:1.65, margin:0 }}>
              Life-Saving Precision meets Human Connection. Lebanon's premier intelligent network bridging heroes to urgent needs.
            </p>

            <div style={{ display:'flex', flexWrap:'wrap', gap:'clamp(10px,1.2vw,16px)', paddingTop:2 }}>
              <button className="bc-btn" onClick={() => go('/donor/register')}
                style={{ padding:'clamp(12px,1.4vw,17px) clamp(22px,3vw,36px)', borderRadius:22, background:C.p, color:'white', fontWeight:900, fontSize:'clamp(13px,1.2vw,15px)', border:'none', boxShadow:'0 12px 30px rgba(35,101,129,.28)', fontFamily:"'Lexend',sans-serif" }}>
                Register as Donor
              </button>
              <button className="bc-btn bc-glass" onClick={() => go('/login')}
                style={{ padding:'clamp(12px,1.4vw,17px) clamp(22px,3vw,36px)', borderRadius:22, color:C.p, fontWeight:900, fontSize:'clamp(13px,1.2vw,15px)', border:'1px solid white', fontFamily:"'Lexend',sans-serif" }}>
                Sign In
              </button>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:16, paddingTop:2 }}>
              <div style={{ display:'flex' }}>
                {['A+','O-','B+'].map((t,i)=>(
                  <div key={t} className="bc-glass" style={{ width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid white', fontWeight:900, fontSize:11, color:C.p, marginLeft:i===0?0:-11, zIndex:3-i, boxShadow:'0 3px 10px rgba(0,0,0,.1)' }}>{t}</div>
                ))}
              </div>
              <span style={{ fontSize:9, fontWeight:900, color:'rgba(35,101,129,.5)', textTransform:'uppercase', letterSpacing:'.18em' }}>Network Match Active</span>
            </div>
          </div>

          {/* Right visual */}
          <div className="bc-hero-visual" style={{ position:'relative', height:'clamp(360px,46vw,560px)' }}>
            <div className="bc-glass-deep bc-chromatic" style={{ position:'absolute', inset:0, borderRadius:'clamp(32px,4.5vw,60px)', overflow:'hidden' }}>
              <img alt="Medical Visualization" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.9 }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWMYxQyxGQrtJlyvVak0G8r0JmRyXM_1uZw1yyQZas0TmV6YHxKAmW9rNIiZWw98ZSRkQ-GKLzjfm3Uh4imjDQewhPAXwMt3aRxssQQESFlGSk48H5Hc_NBUvRiC3D_uZFGzfmtW0BEQaaP8TBwvx330kCjEZ7DSFvbMXXHhuNlDGMhemF-YrbfcjgOsHnf2RBU3-R_nQYwOgjkc_YkJZTduDpN9nKUbKeUx-xkhfRnKE47aOBzmgIdC_pZ_5VVi-IpZw3VdHRh9U"/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top right,rgba(56,189,248,.15),transparent,rgba(251,113,133,.15))' }}/>
            </div>
            <div className="bc-glass bc-float" style={{ position:'absolute', top:'-8%', right:'-6%', width:'min(210px,23vw)', borderRadius:26, padding:4, zIndex:20, animationDelay:'-1.5s', overflow:'hidden' }}>
              <img alt="Live Data" style={{ width:'100%', borderRadius:22, opacity:.9, mixBlendMode:'multiply', filter:'brightness(1.1)' }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZY_zuhD5wQhuXrTvYAuM_dsbFRABpenJK0xtyA4mC5EXbmAI_zUJqbzD76z5Jj30ocYwESmdJABZ-8oCkTZgw__nJWJnC9UXZ1xju8i_ywXeXe_3KoMX8z51cTVEDdqVfcDN5tjFVrHnkyHb2bxzdg2vFJ4pfuPMY2PWUED_c_r1076rumqmBnckFceCx8V1hzeHD-ilOTFQ5NCrFfm-TqXlMBM5TmMLQm1EF9RDw_KLwb3OKWiRKAnjaq_KvqsRYBXiZyiU89Xg"/>
              <div style={{ position:'absolute', top:10, right:14, display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:6, height:6, background:'#22c55e', borderRadius:'50%', display:'inline-block', animation:'pulse 2s infinite' }}/>
                <span style={{ fontSize:8, fontWeight:900, color:'rgba(35,101,129,.6)' }}>LIVE</span>
              </div>
            </div>
            <div className="bc-glass bc-float" style={{ position:'absolute', bottom:'-7%', left:'-8%', width:'min(150px,15vw)', height:'min(150px,15vw)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', zIndex:20, animationDelay:'-3s' }}>
              <img alt="3D Heart" style={{ width:'80%', height:'80%', objectFit:'contain', filter:'drop-shadow(0 8px 14px rgba(0,0,0,.14))' }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtpq2ExpTjlwR-OJSgKCMGq5fFr85gFbUQ4cTxaynuYxm9CUfDXBYKXFgNi2fUkmynY7UZRwV-Kl6YXbJhoSSo9wtQggnkK-uCxFIIy0YXcDX7TTPsuqjz8hXt2R2gYA1Kgq7sNR82Med5tvYizwkIBs34mI7hZcvR6H961JYv6zI2rS4NKzLLAqakhn4shrlR5UugKD4hGvBd2mPB6I18_LMcdp7iIQ3TjqiCYTftVnewYmn2nOelgyklFA8Quz34T79vQ-k1QIY"/>
            </div>
            <div className="bc-glass" style={{ position:'absolute', top:'24%', left:'5%', padding:'clamp(12px,1.6vw,22px)', borderRadius:30, width:'min(220px,24vw)', zIndex:20, border:'1px solid rgba(255,255,255,.9)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div className="bc-hb" style={{ width:40, height:40, background:'rgba(239,68,68,.1)', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span className="mso" style={{ color:C.r, fontSize:22, fontVariationSettings:"'FILL' 1" }}>favorite</span>
                </div>
                <div>
                  <p style={{ fontSize:8, fontWeight:900, color:'rgba(35,101,129,.4)', letterSpacing:'.2em', textTransform:'uppercase', margin:0 }}>SYSTEM STATUS</p>
                  <p style={{ fontSize:20, fontWeight:900, color:C.p, margin:0 }}>Stable</p>
                </div>
              </div>
              <svg style={{ width:'100%', height:38 }} viewBox="0 0 200 40">
                <path className="bc-heartpath" d="M0,20 L40,20 L50,5 L60,35 L70,20 L100,20 L110,10 L120,30 L130,20 L200,20" fill="none" stroke={C.p} strokeLinecap="round" strokeWidth="3"/>
              </svg>
              <div style={{ marginTop:8, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:8, fontWeight:900, color:'rgba(35,101,129,.6)' }}>ACTIVE SYNC: 100%</span>
                <span style={{ fontSize:8, fontWeight:900, color:C.s }}>72 BPM</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── NETWORK ── */}
        <section style={{ display:'flex', flexDirection:'column', gap:'clamp(22px,3vw,44px)' }}>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-end', gap:18 }}>
            <div>
              <h2 className="bc-fraunces" style={{ fontSize:'clamp(24px,3.8vw,46px)', fontWeight:900, color:C.p, lineHeight:1.1, margin:0 }}>Lebanon's Smart Network</h2>
              <p style={{ fontSize:'clamp(12px,1.2vw,15px)', color:'rgba(35,101,129,.7)', fontWeight:600, marginTop:8, marginBottom:0 }}>Real-time matching active across 4,200+ centers nationwide.</p>
            </div>
            <div className="bc-glass" style={{ display:'flex', gap:'clamp(18px,2.5vw,38px)', padding:'clamp(12px,1.5vw,22px) clamp(20px,3vw,38px)', borderRadius:28, border:'1px solid white', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(224,242,254,.3),transparent)', pointerEvents:'none' }}/>
              {[{val:'24k+',label:'Active Heroes',color:C.p},{val:'142',label:'Urgent Calls',color:C.r}].map(({val,label,color},i)=>(
                <div key={label} style={{ textAlign:'center', position:'relative', zIndex:1 }}>
                  {i===1 && <div style={{ position:'absolute', left:-10, top:'50%', transform:'translateY(-50%)', width:1, height:36, background:'rgba(35,101,129,.1)' }}/>}
                  <p style={{ fontSize:'clamp(24px,3vw,38px)', fontWeight:900, color, margin:0 }}>{val}</p>
                  <p style={{ fontSize:8, fontWeight:900, color:'rgba(35,101,129,.4)', textTransform:'uppercase', letterSpacing:'.18em', marginTop:4, marginBottom:0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Map + sidebar ── */}
          <div className="bc-network-grid">

            {/* Map — fills the left column entirely, no inner overlaps */}
            <LebanonMap />

            {/* Sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:'clamp(12px,1.6vw,18px)' }}>
              <div className="bc-glass-deep" style={{ flex:1, borderRadius:'clamp(20px,3vw,38px)', padding:'clamp(18px,2.4vw,32px)', border:'1px solid white', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <div style={{ position:'absolute', right:-40, top:-40, width:100, height:100, background:'rgba(253,242,248,.5)', borderRadius:'50%', filter:'blur(32px)', pointerEvents:'none' }}/>
                <h3 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:'clamp(15px,1.8vw,21px)', fontWeight:900, color:C.p, marginBottom:12, marginTop:0 }}>Medical Ecosystem</h3>
                <p style={{ fontSize:'clamp(11px,1.1vw,13px)', color:'rgba(35,101,129,.7)', fontWeight:600, lineHeight:1.6, marginBottom:18, marginTop:0 }}>Unified tracking for donors, hospitals, and emergency units.</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:11 }}>
                  {[{icon:'local_hospital',c:C.p},{icon:'verified',c:C.s},{icon:'emergency_share',c:C.r}].map(({icon,c})=>(
                    <div key={icon} className="bc-glass bc-btn" style={{ width:44, height:44, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid white', cursor:'pointer' }}>
                      <span className="mso" style={{ color:c, fontSize:20, fontVariationSettings:"'FILL' 1" }}>{icon}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:C.p, color:'white', borderRadius:'clamp(20px,3vw,38px)', padding:'clamp(18px,2.4vw,32px)', boxShadow:`0 14px 40px rgba(35,101,129,.28)`, display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', right:-22, bottom:-22, width:100, height:100, background:'rgba(255,255,255,.1)', borderRadius:'50%', filter:'blur(18px)', pointerEvents:'none' }}/>
                <div>
                  <p style={{ fontSize:'clamp(28px,3.8vw,44px)', fontWeight:900, margin:0 }}>8.4<span style={{ fontSize:'clamp(12px,1.4vw,17px)', fontWeight:400, opacity:.6, marginLeft:4 }}>min</span></p>
                  <p style={{ fontWeight:900, fontSize:8, letterSpacing:'.28em', textTransform:'uppercase', opacity:.6, marginTop:8, marginBottom:0 }}>Avg Response Time</p>
                </div>
                <p style={{ fontSize:'clamp(10px,1vw,12px)', fontWeight:600, marginTop:18, lineHeight:1.6, opacity:.9, marginBottom:0 }}>Our decentralized intelligence optimizes matching speed daily.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMPATIBILITY MATRIX ── */}
        <section className="bc-glass-deep" style={{ borderRadius:'clamp(28px,4vw,56px)', padding:'clamp(24px,4vw,56px)', position:'relative', overflow:'hidden', border:'1px solid white' }}>
          <div style={{ position:'absolute', right:'-18%', top:'-18%', width:'55%', height:'55%', background:'rgba(224,242,254,.4)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', left:'-18%', bottom:'-18%', width:'55%', height:'55%', background:'rgba(255,241,242,.4)', borderRadius:'50%', filter:'blur(100px)', pointerEvents:'none' }}/>

          <div style={{ textAlign:'center', maxWidth:580, margin:'0 auto', marginBottom:'clamp(28px,4vw,56px)', position:'relative', zIndex:1 }}>
            <h2 className="bc-fraunces" style={{ fontSize:'clamp(24px,3.8vw,46px)', fontWeight:900, color:C.p, marginBottom:12, marginTop:0 }}>The Compatibility Matrix</h2>
            <p style={{ fontSize:'clamp(12px,1.2vw,15px)', color:'rgba(35,101,129,.7)', fontWeight:600, margin:0 }}>Click any blood type to unlock donor and recipient pathways with visual precision.</p>
          </div>

          <div style={{ display:'flex', justifyContent:'center', gap:'clamp(7px,.9vw,12px)', marginBottom:'clamp(24px,3.5vw,44px)', flexWrap:'wrap', position:'relative', zIndex:1 }}>
            {ALL_TYPES.map(t => (
              <button key={t} onClick={() => selectType(t)}
                className={`bc-btn bc-glass${t === bloodType ? ' selected-type' : ''}`}
                style={{ padding:'clamp(8px,1vw,12px) clamp(14px,1.8vw,22px)', borderRadius:'clamp(10px,1.4vw,16px)', fontWeight:900, fontSize:'clamp(13px,1.4vw,17px)', color: t === bloodType ? C.p : 'rgba(35,101,129,.45)', border: t === bloodType ? `2px solid rgba(35,101,129,.6)` : '1.5px solid rgba(255,255,255,.55)', fontFamily:"'Lexend',sans-serif", background: t === bloodType ? 'rgba(35,101,129,.1)' : undefined, transform: t === bloodType ? 'scale(1.1)' : undefined, boxShadow: t === bloodType ? `0 8px 22px rgba(35,101,129,.18)` : undefined, transition:'all .2s cubic-bezier(.34,1.56,.64,1)' }}>
                {t}
              </button>
            ))}
          </div>

          <div className="bc-compat-grid" style={{ position:'relative', zIndex:1 }}>

            {/* Circle visualiser */}
            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'clamp(40px,6vw,80px)', paddingBottom:'clamp(30px,5vw,60px)' }}>
              <div className="bc-glass" style={{ width:'min(340px,34vw)', height:'min(340px,34vw)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'clamp(6px,1.2vw,14px) solid rgba(255,255,255,.4)', position:'relative', boxShadow:'0 16px 44px rgba(0,0,0,.07)' }}>
                <div className="bc-spin8"  style={{ position:'absolute', inset:0, borderRadius:'50%', border:'clamp(3px,.6vw,8px) solid', borderColor:`${C.r} transparent transparent transparent`, opacity:.22 }}/>
                <div className="bc-spin30" style={{ position:'absolute', inset:'4%', borderRadius:'50%', border:'1.5px dashed rgba(35,101,129,.15)' }}/>
                <div key={animKey} className="bc-pop" style={{ textAlign:'center', padding:'0 16px' }}>
                  <span style={{ fontSize:'clamp(48px,7.5vw,88px)', fontWeight:900, color:C.p, display:'block', lineHeight:1 }}>{bloodType}</span>
                  <div style={{ marginTop:8, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                    <span style={{ padding:'4px 14px', borderRadius:9999, background:'rgba(29,108,56,.1)', fontSize:8, fontWeight:900, color:C.s, letterSpacing:'.18em', border:'1px solid rgba(29,108,56,.2)' }}>MATCH ACTIVE</span>
                    <span style={{ fontSize:8, fontWeight:900, color:'rgba(35,101,129,.5)', textTransform:'uppercase', letterSpacing:'.22em' }}>GENETIC REACH: {data.reach}</span>
                  </div>
                </div>
              </div>

              {[
                { type:'O-',  icon:'sync_alt',  iconC:C.s,  pos:{ top:0, left:'50%', transform:'translate(-50%,-10%)' } },
                { type:'AB+', icon:'lock',       iconC:'rgba(35,101,129,.4)', pos:{ top:'18%', right:0, transform:'translateX(30%)' } },
                { type:'B-',  icon:'emergency',  iconC:C.r,  pos:{ bottom:0, left:'22%', transform:'translateY(10%)' } },
              ].map(({type:nt,icon,iconC,pos})=>{
                const isSelected = nt === bloodType
                const isRec = data.canReceive.includes(nt)
                const isDon = data.canDonateTo.includes(nt)
                const border = isSelected ? `2px solid ${C.p}` : isRec ? `2px solid rgba(29,108,56,.5)` : isDon ? `2px solid rgba(184,29,39,.4)` : '1.5px solid white'
                const bg = isSelected ? 'rgba(35,101,129,.12)' : isRec ? 'rgba(29,108,56,.06)' : isDon ? 'rgba(184,29,39,.06)' : undefined
                return (
                  <div key={nt} onClick={() => selectType(nt)} className="bc-glass bc-float bc-btn" style={{ position:'absolute', ...pos, width:'min(76px,7.8vw)', height:'min(76px,7.8vw)', minWidth:58, minHeight:58, borderRadius:'clamp(12px,1.8vw,20px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border, background:bg, cursor:'pointer', transition:'all .22s' }}>
                    <span style={{ fontSize:'clamp(12px,1.4vw,16px)', fontWeight:900, color:C.p }}>{nt}</span>
                    <span className="mso" style={{ color:iconC, fontSize:11 }}>{icon}</span>
                  </div>
                )
              })}
            </div>

            {/* Compatibility details */}
            <div style={{ display:'flex', flexDirection:'column', gap:'clamp(18px,2.2vw,30px)' }}>

              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="bc-glass" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid white', flexShrink:0 }}>
                    <span className="mso" style={{ color:C.s, fontSize:18 }}>download</span>
                  </div>
                  <h4 style={{ fontSize:9, fontWeight:900, color:C.p, letterSpacing:'.32em', textTransform:'uppercase', margin:0 }}>You can receive from</h4>
                </div>
                <div className="bc-type-grid">
                  {data.canReceive.map((t,i) => (
                    <div key={t+i} onClick={() => selectType(t)} className="bc-glass bc-type-chip active-receive"
                      style={{ aspectRatio:'1', borderRadius:'clamp(10px,1.3vw,14px)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'clamp(12px,1.4vw,17px)', position:'relative', cursor:'pointer' }}>
                      {t === bloodType && <span style={{ position:'absolute', top:-5, right:-5, width:16, height:16, background:C.s, color:'white', fontSize:7, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>✓</span>}
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="bc-glass" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid white', flexShrink:0 }}>
                    <span className="mso" style={{ color:C.r, fontSize:18 }}>upload</span>
                  </div>
                  <h4 style={{ fontSize:9, fontWeight:900, color:C.r, letterSpacing:'.32em', textTransform:'uppercase', margin:0 }}>You can donate to</h4>
                </div>
                <div className="bc-type-grid">
                  {data.canDonateTo.map((t,i) => (
                    <div key={t+i} onClick={() => selectType(t)} className="bc-glass bc-type-chip active-donate"
                      style={{ aspectRatio:'1', borderRadius:'clamp(10px,1.3vw,14px)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'clamp(12px,1.4vw,17px)', position:'relative', cursor:'pointer' }}>
                      {t === bloodType && <span style={{ position:'absolute', top:-5, right:-5, width:16, height:16, background:C.r, color:'white', fontSize:7, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>!</span>}
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ paddingTop:'clamp(12px,1.5vw,22px)', borderTop:'1px solid rgba(255,255,255,.3)' }}>
                <div className="bc-glass" style={{ display:'flex', alignItems:'center', gap:14, padding:'clamp(10px,1.5vw,18px)', borderRadius:16, border:'1px solid white', background:'rgba(255,255,255,.1)' }}>
                  <span className="mso" style={{ fontSize:28, color:'rgba(35,101,129,.5)', flexShrink:0 }}>help_center</span>
                  <p style={{ fontSize:'clamp(10px,1vw,12px)', fontWeight:600, lineHeight:1.6, margin:0, color:C.p }}>
                    <span style={{ fontWeight:900 }}>Did you know?</span> O- is the universal hero — it can be given to any blood type during critical emergencies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section>
          <div className="bc-glass-deep" style={{ borderRadius:'clamp(28px,4vw,56px)', padding:'clamp(36px,5.5vw,80px) clamp(20px,4.5vw,52px)', textAlign:'center', border:'1px solid white', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', left:-40, top:0, width:150, height:150, background:'rgba(254,252,232,.6)', borderRadius:'50%', filter:'blur(40px)', opacity:.5, pointerEvents:'none' }}/>
            <h2 className="bc-fraunces" style={{ fontSize:'clamp(26px,5.5vw,62px)', fontWeight:900, color:C.p, position:'relative', zIndex:1, lineHeight:1.1, letterSpacing:'-.04em', margin:0 }}>Ready to save lives?</h2>
            <p style={{ fontSize:'clamp(12px,1.4vw,16px)', color:'rgba(35,101,129,.7)', fontWeight:600, margin:'clamp(12px,1.8vw,24px) auto 0', maxWidth:520, position:'relative', zIndex:1, lineHeight:1.65 }}>
              Join Lebanon's most innovative network of heroes. Your contribution is vital, and with our intelligent logistics, your impact is immediate.
            </p>
          </div>
        </section>
      </main>

      {/* ══ FOOTER ═══════════════════════════════════════════ */}
      <footer className="bc-glass" style={{ marginTop:'clamp(44px,6vw,100px)', borderTop:'1px solid rgba(255,255,255,.6)', background:'rgba(255,255,255,.2)' }}>
        <div style={{ maxWidth:1360, margin:'0 auto', padding:'clamp(32px,4.5vw,64px) clamp(16px,3.5vw,44px)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'clamp(24px,3.5vw,52px)', marginBottom:'clamp(28px,3.5vw,56px)' }}>
            <div>
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:C.p, fontSize:'clamp(18px,2.2vw,26px)', fontWeight:800, marginBottom:16, letterSpacing:'-.04em' }}>BloodConnect</div>
              <p style={{ color:'rgba(35,101,129,.7)', fontWeight:600, lineHeight:1.65, fontStyle:'italic', fontSize:'clamp(11px,1.1vw,13px)', margin:0 }}>
                "Pioneering the future of hematological logistics through empathy and code."
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:900, color:'rgba(35,101,129,.3)', textTransform:'uppercase', letterSpacing:'.24em', fontSize:8, marginBottom:16, marginTop:0 }}>Navigation</h4>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:11 }}>
                {[['How It Works','/how-it-works'],['Impact Stories','/impact'],['Emergency Portal','/emergency'],['Blood Status','/inventory']].map(([l,p])=>(
                  <li key={l}><button onClick={() => go(p)} style={{ color:C.p, fontWeight:700, background:'none', border:'none', cursor:'pointer', padding:0, fontSize:'clamp(11px,1vw,13px)', fontFamily:"'Lexend',sans-serif" }}>{l}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:900, color:'rgba(35,101,129,.3)', textTransform:'uppercase', letterSpacing:'.24em', fontSize:8, marginBottom:16, marginTop:0 }}>Ecosystem</h4>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:11 }}>
                {['Medical Standards','Logistics API','Partner Hospitals','Advisory Board'].map(l=>(
                  <li key={l}><a href="#" style={{ color:C.p, fontWeight:700, textDecoration:'none', fontSize:'clamp(11px,1vw,13px)' }}>{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:900, color:'rgba(35,101,129,.3)', textTransform:'uppercase', letterSpacing:'.24em', fontSize:8, marginBottom:16, marginTop:0 }}>Updates</h4>
              <p style={{ color:'rgba(35,101,129,.7)', fontWeight:600, lineHeight:1.6, marginTop:0, marginBottom:12, fontSize:'clamp(10px,1vw,12px)' }}>Stay connected to live alerts for blood shortages in Lebanon.</p>
              <div style={{ display:'flex', gap:8 }}>
                <input type="email" placeholder="Email Address" style={{ background:'rgba(255,255,255,.4)', border:'1px solid rgba(255,255,255,.6)', borderRadius:11, padding:'9px 14px', width:'100%', fontSize:11, fontWeight:700, color:C.p, outline:'none', fontFamily:"'Lexend',sans-serif" }}/>
                <button className="bc-btn" style={{ background:C.p, color:'white', padding:'9px 12px', borderRadius:11, border:'none', cursor:'pointer', flexShrink:0 }}>
                  <span className="mso" style={{ fontSize:17 }}>send</span>
                </button>
              </div>
            </div>
          </div>
          <div style={{ paddingTop:22, borderTop:'1px solid rgba(255,255,255,.3)', display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:14 }}>
            <p style={{ color:'rgba(35,101,129,.4)', fontSize:'clamp(8px,.85vw,10px)', fontWeight:900, textTransform:'uppercase', letterSpacing:'.16em', margin:0 }}>© 2024 BloodConnect · Dana Ghannam &amp; Lynn Anani · Lebanon.</p>
            <div style={{ display:'flex', gap:11 }}>
              {['public','share'].map(icon=>(
                <a key={icon} href="#" className="bc-glass" style={{ width:38, height:38, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', color:C.p, border:'1px solid white', textDecoration:'none' }}>
                  <span className="mso" style={{ fontSize:17 }}>{icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ══ SOS FAB ══════════════════════════════════════════ */}
      <button onClick={() => go('/emergency')} className="bc-glow"
        style={{ position:'fixed', bottom:'clamp(18px,2.2vw,36px)', right:'clamp(18px,2.2vw,36px)', width:'clamp(52px,5vw,72px)', height:'clamp(52px,5vw,72px)', background:C.r, color:'white', borderRadius:'50%', boxShadow:'0 12px 36px rgba(184,29,39,.42)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:60, border:'4px solid rgba(255,255,255,.5)', outline:'none', transition:'transform .2s' }}
        onMouseEnter={e => { e.currentTarget.style.transform='scale(1.12)'; const lbl=e.currentTarget.querySelector('.sos-lbl'); if(lbl){lbl.style.opacity='1';lbl.style.transform='translateX(0)';} }}
        onMouseLeave={e => { e.currentTarget.style.transform='scale(1)';   const lbl=e.currentTarget.querySelector('.sos-lbl'); if(lbl){lbl.style.opacity='0';lbl.style.transform='translateX(24px)';} }}>
        <span className="mso" style={{ fontSize:'clamp(22px,3vw,36px)', animation:'pulse 2s infinite', fontVariationSettings:"'FILL' 1" }}>emergency_record</span>
        <div className="sos-lbl" style={{ position:'absolute', right:'110%', background:'rgba(255,255,255,.96)', backdropFilter:'blur(16px)', color:C.r, padding:'9px 18px', borderRadius:14, fontSize:9, fontWeight:900, letterSpacing:'.2em', whiteSpace:'nowrap', opacity:0, transition:'all .28s', transform:'translateX(24px)', boxShadow:'0 10px 28px rgba(0,0,0,.1)', border:`1px solid rgba(184,29,39,.1)`, fontFamily:"'Lexend',sans-serif" }}>
          SOS EMERGENCY REQUEST
        </div>
      </button>

    </div>
  )
}