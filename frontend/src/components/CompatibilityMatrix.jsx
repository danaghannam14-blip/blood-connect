import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BLOOD_DATA = {
  'A+':  { canReceive: ['A+','A-','O+','O-'], canDonateTo: ['A+','AB+'] },
  'A-':  { canReceive: ['A-','O-'], canDonateTo: ['A+','A-','AB+','AB-'] },
  'B+':  { canReceive: ['B+','B-','O+','O-'], canDonateTo: ['B+','AB+'] },
  'B-':  { canReceive: ['B-','O-'], canDonateTo: ['B+','B-','AB+','AB-'] },
  'AB+': { canReceive: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], canDonateTo: ['AB+'] },
  'AB-': { canReceive: ['A-','B-','AB-','O-'], canDonateTo: ['AB+','AB-'] },
  'O+':  { canReceive: ['O+','O-'], canDonateTo: ['A+','B+','O+','AB+'] },
  'O-':  { canReceive: ['O-'], canDonateTo: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
}

const ALL_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function BloodDrop({ type, status, isCenter, onClick }) {
  const isInactive = status === 'none' && !isCenter;
  
  const theme = {
    selected: { stop1: '#dc2626', stop2: '#7f1d1d', shadow: 'rgba(220,38,38,0.5)', scale: 1.15 },
    donor: { stop1: '#f87171', stop2: '#dc2626', shadow: 'rgba(220,38,38,0.2)', scale: 1 }, 
    recipient: { stop1: '#991b1b', stop2: '#450a0a', shadow: 'rgba(69,10,10,0.3)', scale: 1 },
    none: { stop1: '#e5e7eb', stop2: '#9ca3af', shadow: 'transparent', scale: 0.85 },
  };

  const currentTheme = isCenter ? theme.selected : (theme[status] || theme.none);

  return (
    <motion.button
      onClick={onClick}
      animate={{
        scale: isCenter ? [1, 1.05, 1] : currentTheme.scale,
        opacity: isInactive ? 0.25 : 1,
      }}
      transition={{ scale: isCenter ? { duration: 3, repeat: Infinity } : { duration: 0.2 } }}
      style={{
        position: 'relative',
        width: isCenter ? 120 : 80,
        height: isCenter ? 150 : 100,
        border: 'none',
        background: 'none',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: isCenter ? 10 : 1
      }}
    >
      <svg viewBox="0 0 100 130" style={{ 
        width: '100%', 
        height: '100%', 
        filter: status !== 'none' ? `drop-shadow(0 15px 30px ${currentTheme.shadow})` : 'none' 
      }}>
        <defs>
          <linearGradient id={`grad-${type}-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentTheme.stop1} />
            <stop offset="100%" stopColor={currentTheme.stop2} />
          </linearGradient>
        </defs>
        <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill={`url(#grad-${type}-${status})`} />
        <ellipse cx="32" cy="65" rx="16" ry="22" fill="white" fillOpacity="0.15" />
        <text x="50" y="95" textAnchor="middle" fontSize={isCenter ? "30" : "24"} fontWeight="900" fill="white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {type}
        </text>
      </svg>
      
      <AnimatePresence>
        {!isCenter && status !== 'none' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: '5px',
              color: status === 'donor' ? '#dc2626' : '#7f1d1d',
              fontSize: '10px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textAlign: 'center',
              lineHeight: 1.1
            }}
          >
            {status === 'donor' ? 'Can Give\nTo You' : 'Can Take\nFrom You'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default function CompatibilityMatrix() {
  const [selected, setSelected] = useState('O-')
  
  const size = 600
  const center = size / 2
  const radius = 220

  const positions = useMemo(() => {
    const pos = {}
    ALL_TYPES.forEach((type, i) => {
      const angle = ((360 / ALL_TYPES.length) * i - 90) * (Math.PI / 180)
      pos[type] = { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) }
    })
    return pos
  }, [center, radius])

  const getStatus = (type) => {
    if (type === selected) return 'selected'
    if (BLOOD_DATA[selected].canReceive.includes(type)) return 'donor' 
    if (BLOOD_DATA[selected].canDonateTo.includes(type)) return 'recipient' 
    return 'none'
  }

  const summary = useMemo(() => {
    const canRec = BLOOD_DATA[selected].canReceive.length
    const canDon = BLOOD_DATA[selected].canDonateTo.length
    return `Type ${selected} can receive from ${canRec} blood types and donate to ${canDon}.`
  }, [selected])

  return (
    <section style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(32px, 4vw, 42px)', color: '#6e2016', margin: 0 }}>
          Compatibility Matrix
        </h2>
        <motion.p 
          key={selected}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ color: 'rgba(42,42,42,.7)', fontWeight: 600, fontSize: '16px', background: 'rgba(220,38,38,0.05)', padding: '8px 20px', borderRadius: '30px', border: '1px solid rgba(220,38,38,0.1)' }}
        >
          {summary}
        </motion.p>
      </div>

      <div className="bc-glass-deep" style={{ position: 'relative', width: '100%', maxWidth: size + 100, margin: '0 auto', borderRadius: '48px', padding: '50px' }}>
        <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
          <svg viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <defs>
              <marker id="arrow-donor" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
              </marker>
              <marker id="arrow-recipient" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#7f1d1d" />
              </marker>
            </defs>

            {ALL_TYPES.map(type => {
              const status = getStatus(type)
              if (status === 'none' || status === 'selected') return null
              const pos = positions[type]
              const isDonor = status === 'donor'
              
              // Flow direction logic
              const start = isDonor ? pos : { x: center, y: center }
              const end = isDonor ? { x: center, y: center } : pos

              return (
                <g key={`link-${type}`}>
                  <motion.line
                    x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                    stroke={isDonor ? "#fca5a5" : "#dc2626"}
                    strokeWidth="3"
                    strokeDasharray="8 4"
                    markerEnd={isDonor ? "url(#arrow-donor)" : "url(#arrow-recipient)"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                  />
                  {[0, 0.5].map((i) => (
                    <motion.circle
                      key={i} r="4" fill={isDonor ? "#dc2626" : "#7f1d1d"}
                      animate={{ cx: [start.x, end.x], cy: [start.y, end.y], opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 2, ease: "linear" }}
                    />
                  ))}
                </g>
              )
            })}
          </svg>

          <div style={{ position: 'absolute', left: center, top: center, transform: 'translate(-50%, -50%)' }}>
            <BloodDrop type={selected} isCenter status="selected" />
          </div>

          {ALL_TYPES.map((type) => (
            <div key={type} style={{ position: 'absolute', left: positions[type].x, top: positions[type].y, transform: 'translate(-50%, -50%)' }}>
              <BloodDrop type={type} status={getStatus(type)} onClick={() => setSelected(type)} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '60px' }}>
          <LegendItem color="#fca5a5" label="Can Give Blood to you" arrow="→" />
          <LegendItem color="#dc2626" label="Selected Group" arrow="" />
          <LegendItem color="#7f1d1d" label="Can Receive Blood from you" arrow="→" />
        </div>
      </div>
    </section>
  )
}

function LegendItem({ color, label, arrow }) {
  return (
    <div className="bc-btn bc-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: '800', color: '#380101', padding: '12px 24px', borderRadius: '30px' }}>
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
      {label} {arrow && <span style={{fontSize: '14px', marginLeft: '4px'}}>{arrow}</span>}
    </div>
  )
}