import { useState, useMemo, useEffect } from 'react'
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

function BloodDrop({ type, status, isCenter, onClick, isMobile }) {
  const isInactive = status === 'none' && !isCenter;
  
  const theme = {
    selected: { stop1: '#ef4444', stop2: '#991b1b', shadow: 'rgba(239,68,68,0.5)', scale: 1.1 },
    donor: { stop1: '#fca5a5', stop2: '#ef4444', shadow: 'rgba(239,68,68,0.3)', scale: 1 }, 
    recipient: { stop1: '#991b1b', stop2: '#450a0a', shadow: 'rgba(69,10,10,0.3)', scale: 1 },
    none: { stop1: 'rgba(255,255,255,0.4)', stop2: 'rgba(200,200,200,0.4)', shadow: 'transparent', scale: 0.9 },
  };

  const currentTheme = isCenter ? theme.selected : (theme[status] || theme.none);
  
  // Responsive sizing optimized for iPhone - ensure 44x44px minimum touch targets
  const isSmallPhone = typeof window !== 'undefined' && window.innerWidth < 400;
  const centerSize = isSmallPhone ? 95 : isMobile ? 100 : 110;
  const outerSize = isSmallPhone ? 68 : isMobile ? 72 : 75;
  const size = isCenter ? centerSize : outerSize;
  const viewBoxSize = isCenter ? 130 : 90;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: isCenter ? 1.1 : 1.05 }}
      animate={{ scale: currentTheme.scale, opacity: isInactive ? 0.4 : 1 }}
      style={{
        position: 'relative', 
        width: size, 
        height: isCenter ? size * 1.18 : size * 1.2,
        border: 'none', 
        background: 'none', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        cursor: 'pointer', 
        zIndex: isCenter ? 10 : 1,
        padding: 0,
        minWidth: 0,
      }}
    >
      <svg viewBox="0 0 100 130" style={{ 
        width: '100%', 
        height: '100%', 
        filter: status !== 'none' ? `drop-shadow(0 10px 15px ${currentTheme.shadow})` : 'none' 
      }}>
        <defs>
          <linearGradient id={`grad-${type}-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentTheme.stop1} />
            <stop offset="100%" stopColor={currentTheme.stop2} />
          </linearGradient>
        </defs>
        <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill={`url(#grad-${type}-${status})`} />
        <text 
          x="50" 
          y="90" 
          textAnchor="middle" 
          fontSize={isCenter ? (isMobile ? "22" : "28") : (isMobile ? "18" : "24")} 
          fontWeight="900" 
          fill={status === 'none' ? "#666" : "#faf7f7"} 
          style={{ fontFamily: "sans-serif" }}
        >
          {type}
        </text>
        {isCenter && (
           <text x="50" y="115" textAnchor="middle" fontSize={isMobile ? "10" : "12"} fontWeight="700" fill="rgba(255,255,255,0.8)" style={{ fontFamily: "sans-serif", textTransform: 'uppercase' }}>
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
              position: 'absolute', 
              top: '100%', 
              width: isMobile ? (window.innerWidth < 400 ? '90px' : '110px') : '120px', 
              marginTop: isMobile ? '6px' : '8px',
              color: status === 'donor' ? '#ef4444' : '#7f1d1d', 
              fontSize: isMobile ? (window.innerWidth < 400 ? '6px' : '8px') : '9px', 
              fontWeight: '900',
              textAlign: 'center', 
              lineHeight: 1.3, 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(8px)', 
              padding: isMobile ? (window.innerWidth < 400 ? '3px' : '4px') : '6px', 
              borderRadius: '6px',
              border: `1.5px solid ${status === 'donor' ? '#fca5a5' : '#dc2626'}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              whiteSpace: 'pre-wrap',
              zIndex: 20,
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
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768)
  const [isSmallPhone, setIsSmallPhone] = useState(typeof window !== 'undefined' && window.innerWidth < 400)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsSmallPhone(window.innerWidth < 400)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Responsive size calculation optimized for iPhone
  const maxSize = isSmallPhone ? Math.min(window.innerWidth - 40, 300) : isMobile ? Math.min(window.innerWidth - 60, 380) : 600
  const size = maxSize
  const center = size / 2
  const radius = isSmallPhone ? size * 0.30 : isMobile ? size * 0.34 : size * 0.35

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
      width: '100%', 
      padding: isMobile ? 'clamp(30px, 5vw, 40px) 16px' : 'clamp(40px, 5vw, 60px) 20px', 
      backgroundColor: '#fffcfc',
      borderRadius: 'clamp(24px, 5vw, 40px)', 
      position: 'relative', 
      overflow: 'hidden',
      border: '1px solid rgba(220, 38, 38, 0.1)'
    }}>
      <BackgroundOrbs />

      <div style={{ 
        position:'relative', 
        zIndex:2, 
        textAlign:'center', 
        marginBottom: isMobile ? '24px' : '40px' 
      }}>
        <h2 style={{ 
          fontFamily:"'Fraunces',serif", 
          fontSize: isMobile ? 'clamp(22px, 5vw, 28px)' : 'clamp(28px, 4vw, 42px)', 
          color:'#450a0a', 
          margin: 0,
          letterSpacing: -0.5
        }}>The Compatibility Matrix</h2>
        <p style={{ 
          fontSize: isMobile ? '13px' : '16px', 
          color: '#7f1d1d', 
          opacity: 0.7, 
          fontWeight: 600,
          marginTop: isMobile ? '8px' : '12px'
        }}>Explore life-saving connections</p>
      </div>

      {/* Main Glass Plate */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: size + (isSmallPhone ? 20 : isMobile ? 40 : 100), 
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.3)', 
        backdropFilter: 'blur(12px)',
        borderRadius: isSmallPhone ? '24px' : isMobile ? '32px' : '60px', 
        border: '1px solid rgba(255, 255, 255, 0.6)',
        padding: isSmallPhone ? '16px' : isMobile ? '20px' : '40px', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.05)', 
        zIndex: 2,
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'relative', 
          width: size, 
          height: size, 
          margin: '0 auto',
          touchAction: 'manipulation'
        }}>
          <svg 
            viewBox={`0 0 ${size} ${size}`} 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              pointerEvents: 'none',
              width: '100%',
              height: '100%'
            }}
          >
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
                    strokeWidth="2" 
                    strokeDasharray="8 4"
                    markerEnd={isDonor ? "url(#arrowhead-to-center)" : "url(#arrowhead-from-center)"}
                  />
                  <motion.circle
                    r="3" 
                    fill={isDonor ? "#ef4444" : "#7f1d1d"}
                    animate={{ cx: [x1, x2], cy: [y1, y2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </g>
              )
            })}
          </svg>

          <div style={{ position: 'absolute', left: center, top: center, transform: 'translate(-50%, -50%)', zIndex: 5 }}>
            <BloodDrop type={selected} isCenter status="selected" isMobile={isMobile} />
          </div>

          {ALL_TYPES.map((type) => (
            <div 
              key={type} 
              style={{ 
                position: 'absolute', 
                left: positions[type].x, 
                top: positions[type].y, 
                transform: 'translate(-50%, -50%)',
                zIndex: 4
              }}
            >
              <BloodDrop 
                type={type} 
                status={getStatus(type)} 
                onClick={() => setSelected(type)} 
                isMobile={isMobile}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Legend Container with Glassmorphism */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: isSmallPhone ? '10px' : isMobile ? '12px' : '20px', 
        marginTop: isSmallPhone ? '20px' : isMobile ? '24px' : '40px', 
        flexWrap: 'wrap', 
        position: 'relative', 
        zIndex: 3,
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        paddingTop: isSmallPhone ? '8px' : '0px'
      }}>
        <LegendItem color="#ef4444" title="Donors" desc="Give TO You" icon="↓" isMobile={isMobile} isSmallPhone={isSmallPhone} />
        <LegendItem color="#7f1d1d" title="Recipients" desc="Take FROM You" icon="↑" isMobile={isMobile} isSmallPhone={isSmallPhone} />
      </div>
    </section>
  )
}

function LegendItem({ color, title, desc, icon, isMobile, isSmallPhone }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: isSmallPhone ? '8px' : isMobile ? '10px' : '12px', 
      padding: isSmallPhone ? '12px 14px' : isMobile ? '10px 16px' : '12px 20px', 
      backgroundColor: 'rgba(255, 255, 255, 0.6)', 
      backdropFilter: 'blur(10px)',
      borderRadius: '20px', 
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
      width: isMobile ? '100%' : 'auto',
      justifyContent: isMobile ? 'center' : 'flex-start',
      minHeight: isMobile ? '48px' : 'auto'
    }}>
      <div style={{ 
        width: isSmallPhone ? '28px' : isMobile ? '24px' : '28px', 
        height: isSmallPhone ? '28px' : isMobile ? '24px' : '28px', 
        borderRadius: '50%', 
        backgroundColor: color, 
        color: '#faf7f7', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontWeight: 'bold',
        fontSize: isSmallPhone ? '13px' : isMobile ? '12px' : '14px',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ 
          fontWeight: '800', 
          fontSize: isSmallPhone ? '13px' : isMobile ? '12px' : '13px', 
          color: '#1a1a1a' 
        }}>{title}</div>
        <div style={{ 
          fontSize: isSmallPhone ? '11px' : isMobile ? '10px' : '11px', 
          color: '#666', 
          fontWeight: 600 
        }}>{desc}</div>
      </div>
    </div>
  )
}