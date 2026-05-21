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

const getRelationshipLabel = (status) => {
  if (status === 'donor') return "THEY CAN\nGIVE TO YOU";
  if (status === 'recipient') return "YOU CAN\nGIVE TO THEM";
  return "";
}

// Background Decoration Component
function BackgroundOrbs() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [Math.random() * 100, Math.random() * 600, Math.random() * 100],
            y: [Math.random() * 100, Math.random() * 600, Math.random() * 100],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 15 + i * 2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: 200 + i * 50,
            height: 200 + i * 50,
            borderRadius: '50%',
            background: i % 2 === 0 ? 'radial-gradient(circle, #ff0000 0%, transparent 70%)' : 'radial-gradient(circle, #7f1d1d 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      ))}
    </div>
  )
}

function BloodDrop({ type, status, isCenter, onClick }) {
  const isInactive = status === 'none' && !isCenter;
  
  const theme = {
    selected: { stop1: '#ef4444', stop2: '#991b1b', shadow: 'rgba(239,68,68,0.5)', scale: 1.1 },
    donor: { stop1: '#fca5a5', stop2: '#ef4444', shadow: 'rgba(239,68,68,0.3)', scale: 1 }, 
    recipient: { stop1: '#991b1b', stop2: '#450a0a', shadow: 'rgba(69,10,10,0.3)', scale: 1 },
    none: { stop1: 'rgba(255,255,255,0.4)', stop2: 'rgba(200,200,200,0.4)', shadow: 'transparent', scale: 0.9 },
  };

  const currentTheme = isCenter ? theme.selected : (theme[status] || theme.none);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: isCenter ? 1.1 : 1.05 }}
      animate={{ scale: currentTheme.scale, opacity: isInactive ? 0.4 : 1 }}
      style={{
        position: 'relative', width: isCenter ? 110 : 75, height: isCenter ? 130 : 90,
        border: 'none', background: 'none', display: 'flex', flexDirection: 'column',
        alignItems: 'center', cursor: 'pointer', zIndex: isCenter ? 10 : 1
      }}
    >
      <svg viewBox="0 0 100 130" style={{ 
        width: '100%', height: '100%', 
        filter: status !== 'none' ? `drop-shadow(0 10px 15px ${currentTheme.shadow})` : 'none' 
      }}>
        <defs>
          <linearGradient id={`grad-${type}-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentTheme.stop1} />
            <stop offset="100%" stopColor={currentTheme.stop2} />
          </linearGradient>
        </defs>
        <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill={`url(#grad-${type}-${status})`} />
        <text x="50" y="90" textAnchor="middle" fontSize={isCenter ? "28" : "24"} fontWeight="900" fill={status === 'none' ? "#666" : "#faf7f7"} style={{ fontFamily: "sans-serif" }}>
          {type}
        </text>
        {isCenter && (
           <text x="50" y="115" textAnchor="middle" fontSize="12" fontWeight="700" fill="rgba(255,255,255,0.8)" style={{ fontFamily: "sans-serif", textTransform: 'uppercase' }}>
           (YOU)
         </text>
        )}
      </svg>
      
      <AnimatePresence>
        {!isCenter && status !== 'none' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', top: '100%', width: '120px', marginTop: '8px',
              color: status === 'donor' ? '#ef4444' : '#7f1d1d', fontSize: '9px', fontWeight: '900',
              textAlign: 'center', lineHeight: 1.2, background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(4px)', padding: '6px', borderRadius: '8px',
              border: `1px solid ${status === 'donor' ? '#fca5a5' : '#dc2626'}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {getRelationshipLabel(status)}
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
  const radius = 210

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

  return (
    <section style={{ 
      width: '100%', padding: '60px 20px', backgroundColor: '#fffcfc',
      borderRadius: '40px', position: 'relative', overflow: 'hidden',
      border: '1px solid rgba(220, 38, 38, 0.1)'
    }}>
      <BackgroundOrbs />

      <div style={{ position:'relative', zIndex:2, textAlign:'center', marginBottom: '40px' }}>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(28px, 4vw, 42px)', color:'#450a0a', margin:0 }}>The Compatibility Matrix</h2>
        <p style={{ fontSize: '16px', color: '#7f1d1d', opacity: 0.7, fontWeight: 600 }}>Explore life-saving connections</p>
      </div>

      {/* Main Glass Plate */}
      <div style={{ 
        position: 'relative', width: '100%', maxWidth: size + 100, margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(12px)',
        borderRadius: '60px', border: '1px solid rgba(255, 255, 255, 0.6)',
        padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', zIndex: 2
      }}>
        <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
          <svg viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <defs>
              <marker id="arrowhead-to-center" markerWidth="10" markerHeight="7" refX="45" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
              <marker id="arrowhead-from-center" markerWidth="10" markerHeight="7" refX="45" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#7f1d1d" />
              </marker>
            </defs>

            {ALL_TYPES.map(type => {
              const status = getStatus(type)
              if (status === 'none' || status === 'selected') return null
              const pos = positions[type]
              const isDonor = status === 'donor'
              const x1 = isDonor ? pos.x : center
              const y1 = isDonor ? pos.y : center
              const x2 = isDonor ? center : pos.x
              const y2 = isDonor ? center : pos.y

              return (
                <g key={`link-${type}`}>
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isDonor ? "#ef4444" : "#7f1d1d"}
                    strokeWidth="2" strokeDasharray="8 4"
                    markerEnd={isDonor ? "url(#arrowhead-to-center)" : "url(#arrowhead-from-center)"}
                  />
                  <motion.circle
                    r="3" fill={isDonor ? "#ef4444" : "#7f1d1d"}
                    animate={{ cx: [x1, x2], cy: [y1, y2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
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
      </div>

      {/* Legend Container with Glassmorphism */}
      <div style={{ 
        display: 'flex', justifyContent: 'center', gap: '20px', 
        marginTop: '40px', flexWrap: 'wrap', position: 'relative', zIndex: 3 
      }}>
        <LegendItem color="#ef4444" title="Donors" desc="Give TO You" icon="↓" />
        <LegendItem color="#7f1d1d" title="Recipients" desc="Take FROM You" icon="↑" />
      </div>
    </section>
  )
}

function LegendItem({ color, title, desc, icon }) {
  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', 
      backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)',
      borderRadius: '20px', border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
    }}>
      <div style={{ 
        width: '28px', height: '28px', borderRadius: '50%', 
        backgroundColor: color, color: '#faf7f7', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: '800', fontSize: '13px', color: '#1a1a1a' }}>{title}</div>
        <div style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>{desc}</div>
      </div>
    </div>
  )
}