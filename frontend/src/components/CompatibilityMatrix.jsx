import { useState } from 'react'
import { motion } from 'framer-motion'

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

function BloodDrop({ type, isCenter, isSelected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{
        scale: 1.12,
        rotate: isCenter ? 0 : [0, -2, 2, 0],
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        y: [0, -5, 0],
      }}
      transition={{
        duration: isCenter ? 2.2 : 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        position: 'relative',
        width: isCenter ? 135 : 78,
        height: isCenter ? 160 : 92,
        border: 'none',
        cursor: 'pointer',
        background: 'none',
        padding: 0,
      }}
    >
      <svg
        viewBox="0 0 100 130"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient
            id={`grad-${type}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={isSelected ? '#ff5f5f' : '#d63434'}
            />
            <stop
              offset="50%"
              stopColor={isSelected ? '#ef2f2f' : '#b42323'}
            />
            <stop
              offset="100%"
              stopColor={isSelected ? '#9f1515' : '#7a1010'}
            />
          </linearGradient>

          <filter id={`shadow-${type}`}>
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="10"
              floodColor="#c92a2a"
              floodOpacity="0.35"
            />
          </filter>

          {/* RECEIVE ARROW */}
          <marker
            id="receiveArrow"
            markerWidth="14"
            markerHeight="14"
            refX="10"
            refY="5"
            orient="auto"
          >
            <path
              d="M0,0 L10,5 L0,10"
              fill="none"
              stroke="#ff7b7b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>

          {/* DONATE ARROW */}
          <marker
            id="donateArrow"
            markerWidth="14"
            markerHeight="14"
            refX="10"
            refY="5"
            orient="auto"
          >
            <path
              d="M0,0 L10,5 L0,10"
              fill="none"
              stroke="#c92a2a"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        {/* Pulse Rings */}
        {isSelected && (
          <>
            {[0, 0.6].map((delay) => (
              <motion.circle
                key={delay}
                cx="50"
                cy="70"
                r="42"
                fill="none"
                stroke="#ff4d4d"
                strokeWidth="1.5"
                opacity="0.4"
                animate={{
                  r: [42, 70],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}

        {/* Main Blood Drop */}
        <motion.path
          d="M50 0 C50 0 95 58 95 86 C95 112 74 130 50 130 C26 130 5 112 5 86 C5 58 50 0 50 0 Z"
          fill={`url(#grad-${type})`}
          filter={`url(#shadow-${type})`}
          animate={
            isSelected
              ? {
                  scale: [1, 1.03, 1],
                }
              : {}
          }
          transition={{
            duration: 1.8,
            repeat: Infinity,
          }}
        />

        {/* Shine */}
        <motion.ellipse
          cx="32"
          cy="58"
          rx="12"
          ry="18"
          fill="white"
          opacity={0.22}
          animate={{
            opacity: [0.16, 0.28, 0.16],
            x: [0, 2, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
          }}
        />

        {/* Inner Glow */}
        {isSelected && (
          <motion.circle
            cx="50"
            cy="82"
            r="26"
            fill="rgba(255,255,255,0.08)"
            animate={{
              opacity: [0.1, 0.22, 0.1],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
            }}
          />
        )}

        {/* Text */}
        <motion.text
          x="50"
          y="79"
          textAnchor="middle"
          fontSize={isCenter ? '34' : '18'}
          fontWeight="900"
          fill="white"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          letterSpacing="-1px"
          animate={
            isSelected
              ? {
                  opacity: [1, 0.85, 1],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          {type}
        </motion.text>
      </svg>
    </motion.button>
  )
}

export default function CompatibilityMatrix() {
  const [selected, setSelected] = useState('O-')
  const data = BLOOD_DATA[selected]

  const size = 600
  const center = size / 2
  const radius = 250

  const positions = {}

  ALL_TYPES.forEach((type, i) => {
    const angle = ((360 / ALL_TYPES.length) * i - 90) * (Math.PI / 180)

    positions[type] = {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  })

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 32,
        padding: '50px 30px',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,245,245,0.85))',
        border: '1px solid rgba(255,255,255,0.5)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Ambient Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(201,42,42,0.18), transparent 70%)',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 20,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <motion.h2
          animate={{
            textShadow: [
              '0 0 0px rgba(201,42,42,0)',
              '0 0 20px rgba(201,42,42,0.15)',
              '0 0 0px rgba(201,42,42,0)',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: '#c92a2a',
            marginBottom: 8,
            fontFamily: "'Fraunces', serif",
          }}
        >
          Blood Compatibility Network
        </motion.h2>

        <p
          style={{
            color: 'rgba(0,0,0,0.55)',
            fontSize: 13,
            fontWeight: 500,
            margin: 0,
          }}
        >
          Interactive smart donor compatibility visualization
        </p>
      </div>

      {/* Main Network */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 700,
          aspectRatio: '1 / 1',
          margin: '0 auto',
        }}
      >
        {/* SVG CONNECTIONS */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          <defs>
            <linearGradient id="lineGradient">
              <stop offset="0%" stopColor="#ff9d9d" />
              <stop offset="100%" stopColor="#ff4d4d" />
            </linearGradient>
          </defs>

          {/* Orbit Rings */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(201,42,42,0.08)"
            strokeWidth="1"
            strokeDasharray="5 10"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              transformOrigin: 'center',
            }}
          />

          {/* RECEIVE LINES */}
          {data.canReceive.map((type, idx) => {
            const p = positions[type]

            return (
              <g key={type}>
                <motion.line
                  x1={p.x}
                  y1={p.y}
                  x2={center}
                  y2={center}
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeDasharray="8 10"
                  strokeLinecap="round"
                  markerEnd="url(#receiveArrow)"
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: [0.25, 1, 0.25],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: idx * 0.15,
                  }}
                />

                {[0, 0.4, 0.8].map((delay) => (
                  <motion.circle
                    key={delay}
                    r="4.5"
                    fill="#ff7b7b"
                    animate={{
                      cx: [p.x, center],
                      cy: [p.y, center],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay,
                      ease: 'linear',
                    }}
                  />
                ))}
              </g>
            )
          })}

          {/* DONATE LINES */}
          {data.canDonateTo.map((type, idx) => {
            const p = positions[type]

            return (
              <g key={type}>
                <motion.line
                  x1={center}
                  y1={center}
                  x2={p.x}
                  y2={p.y}
                  stroke="#c92a2a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  markerEnd="url(#donateArrow)"
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: [0.25, 1, 0.25],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: idx * 0.15,
                  }}
                />

                {[0, 0.4, 0.8].map((delay) => (
                  <motion.circle
                    key={delay}
                    r="4.5"
                    fill="#c92a2a"
                    animate={{
                      cx: [center, p.x],
                      cy: [center, p.y],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay,
                      ease: 'linear',
                    }}
                  />
                ))}
              </g>
            )
          })}
        </svg>

        {/* CENTER DROP */}
        <motion.div
          animate={{
            scale: [0.5, 1.03, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
          }}
          style={{
            position: 'absolute',
            left: '40%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
          }}
        >
          <BloodDrop
            type={selected}
            isCenter
            isSelected
          />
        </motion.div>

        {/* OUTER DROPS */}
        {ALL_TYPES.map((type, i) => {
          const pos = positions[type]

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: i * 0.06,
                type: 'spring',
                stiffness: 180,
                damping: 15,
              }}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                zIndex: type === selected ? 12 : 5,
              }}
            >
              <BloodDrop
                type={type}
                isSelected={type === selected}
                onClick={() => setSelected(type)}
              />
            </motion.div>
          )
        })}
      </div>

      {/* LEGEND */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 30,
          marginTop: 25,
          flexWrap: 'wrap',
        }}
      >
        {[
          ['Receives Blood ←', '#ff7b7b'],
          ['Donates Blood →', '#c92a2a'],
        ].map(([label, color]) => (
          <motion.div
            key={label}
            whileHover={{ scale: 1.06 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(201,42,42,0.08)',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
              }}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: color,
              }}
            />

            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#444',
              }}
            >
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}