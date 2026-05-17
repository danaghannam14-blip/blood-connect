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
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes gradient-shift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
  @keyframes float-gentle { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-12px) scale(1.02); } }
  @keyframes glow-soft { 0%,100% { opacity: 0.4; box-shadow: 0 0 20px rgba(209, 42, 35, 0.3); } 50% { opacity: 0.8; box-shadow: 0 0 40px rgba(209, 42, 35, 0.6); } }
  @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }
  @keyframes shimmer { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(100%) skewX(-15deg); } }
  @keyframes particle-drift { 0%,100% { transform: translateY(0) translateX(0); opacity: 0.15; } 50% { transform: translateY(-25px) translateX(12px); opacity: 0.4; } }
  @keyframes text-glow { 0%,100% { text-shadow: 0 0 10px rgba(209, 42, 35, 0.3); } 50% { text-shadow: 0 0 20px rgba(209, 42, 35, 0.6); } }
  @keyframes float-rotate { 0% { transform: translateY(-8px) rotate(0deg); } 50% { transform: translateY(4px) rotate(2deg); } 100% { transform: translateY(-8px) rotate(0deg); } }
  @keyframes liquid-blob { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(25px,-20px) scale(1.12); } 66% { transform: translate(-15px,25px) scale(0.94); } }
  @keyframes orb-float { 0%,100% { transform: translate(0,0) scale(1); } 25% { transform: translate(30px,-40px) scale(1.1); } 50% { transform: translate(-20px,30px) scale(0.95); } 75% { transform: translate(40px,20px) scale(1.08); } }
  @keyframes aurora { 0% { transform: translateY(-100%) rotate(0deg); } 100% { transform: translateY(100%) rotate(180deg); } }
  @keyframes mesh-flow { 0%,100% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } }
  @keyframes floating-shapes { 0%,100% { transform: translateY(0) rotate(0deg) scale(1); } 50% { transform: translateY(-40px) rotate(45deg) scale(1.15); } }
  @keyframes wave-pulse { 0%,100% { transform: scaleY(1); opacity: 0.3; } 50% { transform: scaleY(1.3); opacity: 0.8; } }

  .cb-root {
    min-height: 100vh;
    width: 100%;
    background: linear-gradient(-45deg, #FAFBFC, #F5F7FA, #FEF9F9, #F8FAFB, #FFFBFB);
    background-size: 400% 400%;
    animation: gradient-shift 16s ease infinite;
    font-family: 'Plus Jakarta Sans', sans-serif;
    display: flex;
    overflow: hidden;
    position: relative;
  }
  
  .cb-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background: 
      radial-gradient(circle at 15% 75%, rgba(209, 42, 35, 0.12) 0%, transparent 45%),
      radial-gradient(circle at 85% 15%, rgba(99, 117, 139, 0.1) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 20% 50%, rgba(254, 217, 217, 0.15) 0%, transparent 40%),
      radial-gradient(ellipse at 80% 80%, rgba(99, 117, 139, 0.08) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
    animation: orb-float 25s ease-in-out infinite;
  }
  
  .cb-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background: 
      linear-gradient(45deg, transparent 25%, rgba(209, 42, 35, 0.04) 50%, transparent 75%),
      linear-gradient(-45deg, transparent 25%, rgba(99, 117, 139, 0.03) 50%, transparent 75%),
      linear-gradient(90deg, transparent 0%, rgba(220, 38, 38, 0.02) 25%, transparent 50%, rgba(220, 38, 38, 0.02) 75%, transparent 100%);
    pointer-events: none;
    z-index: 0;
    animation: aurora 30s ease-in-out infinite;
  }

  .cb-gradient-bg {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }
  
  .cb-gradient-bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      linear-gradient(90deg, rgba(209,42,35,0.03) 1px, transparent 1px),
      linear-gradient(rgba(209,42,35,0.03) 1px, transparent 1px);
    background-size: 80px 80px;
    animation: mesh-flow 60s ease infinite;
  }
  
  .cb-gradient-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 25% 25%, rgba(209,42,35,0.04) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(99,117,139,0.03) 0%, transparent 50%);
    animation: floating-shapes 20s ease-in-out infinite;
  }

  .cb-particle { position: fixed; border-radius: 50%; pointer-events: none; animation: particle-drift var(--dur, 5s) ease-in-out infinite; }

  .cb-glass {
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.85);
    box-shadow: 0 8px 32px rgba(209, 42, 35, 0.06), inset 0 0 20px rgba(255, 255, 255, 0.7);
  }

  .cb-glass-deep {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(30px) contrast(1.05);
    -webkit-backdrop-filter: blur(30px) contrast(1.05);
    border: 1px solid rgba(255, 255, 255, 0.88);
    box-shadow: 0 20px 60px rgba(209, 42, 35, 0.08), inset 0 0 30px rgba(255, 255, 255, 0.75);
  }

  .cb-panel {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
  }

  .cb-left-panel {
    width: 360px;
    flex-shrink: 0;
    border-right: 1px solid rgba(209, 42, 35, 0.08);
    padding: clamp(32px, 3vw, 44px);
    background: rgba(255, 255, 255, 0.4);
  }

  .cb-right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: rgba(255, 255, 255, 0.35);
  }

  .cb-btn {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    border-radius: 16px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 13px;
  }

  .cb-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transform: translateX(-100%) skewX(-15deg);
  }

  .cb-btn:hover::before { animation: shimmer 0.7s ease forwards; }
  .cb-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 12px 36px rgba(209, 42, 35, 0.25); }
  .cb-btn:active { transform: scale(0.95); }

  .cb-btn-yes {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.08));
    border: 2px solid rgba(34, 197, 94, 0.4);
    color: #16a34a;
    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.15);
  }

  .cb-btn-yes:hover {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.15));
    border-color: rgba(34, 197, 94, 0.7);
    box-shadow: 0 16px 48px rgba(34, 197, 94, 0.3);
  }

  .cb-btn-no {
    background: linear-gradient(135deg, rgba(209, 42, 35, 0.2), rgba(209, 42, 35, 0.08));
    border: 2px solid rgba(209, 42, 35, 0.4);
    color: #dc2626;
    box-shadow: 0 8px 24px rgba(209, 42, 35, 0.1);
  }

  .cb-btn-no:hover {
    background: linear-gradient(135deg, rgba(209, 42, 35, 0.3), rgba(209, 42, 35, 0.15));
    border-color: rgba(209, 42, 35, 0.7);
    box-shadow: 0 16px 48px rgba(209, 42, 35, 0.25);
  }

  .cb-btn-cta {
    background: linear-gradient(135deg, #D12A23, #E63946);
    border: none;
    color: white;
    box-shadow: 0 16px 48px rgba(209, 42, 35, 0.35);
    font-weight: 800;
  }

  .cb-btn-cta:hover {
    box-shadow: 0 24px 64px rgba(209, 42, 35, 0.5);
    transform: translateY(-4px) scale(1.06);
  }

  .cb-btn-secondary {
    background: rgba(255, 255, 255, 0.6);
    border: 2px solid rgba(209, 42, 35, 0.18);
    color: #D12A23;
    box-shadow: 0 4px 16px rgba(209, 42, 35, 0.08);
  }

  .cb-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.8);
    border-color: rgba(209, 42, 35, 0.35);
    box-shadow: 0 8px 28px rgba(209, 42, 35, 0.15);
  }

  .cb-scroll { overflow-y: auto; scroll-behavior: smooth; }
  .cb-scroll::-webkit-scrollbar { width: 8px; }
  .cb-scroll::-webkit-scrollbar-track { background: transparent; }
  .cb-scroll::-webkit-scrollbar-thumb { background: rgba(209, 42, 35, 0.2); border-radius: 4px; }
  .cb-scroll::-webkit-scrollbar-thumb:hover { background: rgba(209, 42, 35, 0.35); }

  .cb-bubble-bot {
    background: rgba(255, 255, 255, 0.7);
    border: 1.5px solid rgba(209, 42, 35, 0.12);
    border-radius: 20px 20px 20px 6px;
    padding: clamp(14px, 1.5vw, 18px) clamp(16px, 2vw, 22px);
    box-shadow: 0 8px 32px rgba(209, 42, 35, 0.07);
    backdrop-filter: blur(10px);
  }

  .cb-bubble-user {
    background: linear-gradient(135deg, rgba(209, 42, 35, 0.15), rgba(209, 42, 35, 0.08));
    border: 1.5px solid rgba(209, 42, 35, 0.3);
    border-radius: 20px 20px 6px 20px;
    padding: clamp(14px, 1.5vw, 18px) clamp(16px, 2vw, 22px);
    box-shadow: 0 8px 32px rgba(209, 42, 35, 0.09);
  }

  .cb-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: rgba(255, 255, 255, 0.6);
    border: 1.5px solid rgba(209, 42, 35, 0.2);
    border-radius: 14px;
    font-size: 11px;
    font-weight: 800;
    color: #D12A23;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    box-shadow: 0 4px 16px rgba(209, 42, 35, 0.08);
  }

  .cb-dot-pulse {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    animation: glow-soft 2s ease-in-out infinite;
    background: #D12A23;
  }

  .cb-progress-bar {
    height: 4px;
    background: rgba(209, 42, 35, 0.1);
    border-radius: 9999px;
    overflow: hidden;
    margin-top: 10px;
  }

  .cb-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #D12A23, #E63946);
    border-radius: 9999px;
    box-shadow: 0 0 16px rgba(209, 42, 35, 0.5);
  }

  @media (max-width: 1024px) {
    .cb-left-panel { display: none; }
    .cb-right-panel { width: 100%; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('cb-styles-v4')) {
  const s = document.createElement('style')
  s.id = 'cb-styles-v4'
  s.textContent = STYLES
  document.head.appendChild(s)
}

/* ─── Particle Field ─────────────────────────────────────── */
function ParticleField() {
  const pts = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    w: Math.random() * 5 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: (Math.random() * 6 + 5).toFixed(1),
    delay: -(Math.random() * 7).toFixed(1),
    color: i % 3 === 0 ? 'rgba(209,42,35,0.15)' : i % 3 === 1 ? 'rgba(99,117,139,0.12)' : 'rgba(254,249,249,0.35)',
  }))

  return (
    <div className="cb-gradient-bg">
      {/* Dynamic gradient mesh layers */}
      <motion.div
        animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'fixed',
          top: '-20%',
          left: '-20%',
          width: '140%',
          height: '140%',
          background: `
            conic-gradient(from 0deg, 
              rgba(209, 42, 35, 0.08), 
              rgba(99, 117, 139, 0.05),
              rgba(220, 38, 38, 0.06),
              rgba(209, 42, 35, 0.08)
            )
          `,
          borderRadius: '50%',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Liquid blob animations */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 0.95, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: '5%',
          left: '10%',
          width: 'min(520px, 45vw)',
          height: 'min(520px, 45vw)',
          background: 'radial-gradient(circle at 30% 70%, rgba(209,42,35,0.12), transparent 70%)',
          borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <motion.div
        animate={{ 
          scale: [1, 1.15, 0.9, 1],
          rotate: [360, 180, 0]
        }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'fixed',
          bottom: '8%',
          right: '8%',
          width: 'min(480px, 42vw)',
          height: 'min(480px, 42vw)',
          background: 'radial-gradient(circle at 60% 40%, rgba(99,117,139,0.1), transparent 65%)',
          borderRadius: '45% 55% 60% 40% / 55% 45% 55% 45%',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          x: [-50, 50, -50],
          y: [30, -30, 30]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'fixed',
          top: '40%',
          left: '50%',
          marginLeft: '-200px',
          marginTop: '-200px',
          width: 'min(400px, 35vw)',
          height: 'min(400px, 35vw)',
          background: 'radial-gradient(circle, rgba(254,217,217,0.1), transparent 70%)',
          borderRadius: '45% 55% 45% 55% / 55% 45% 55% 45%',
          filter: 'blur(85px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Particles */}
      {pts.map(p => (
        <div
          key={p.id}
          className="cb-particle"
          style={{
            '--dur': `${p.dur}s`,
            width: p.w,
            height: p.w,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            zIndex: 1,
          }}
        />
      ))}

      {/* Floating geometric shapes */}
      <motion.svg
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        viewBox="0 0 100 100"
        style={{
          position: 'fixed',
          top: '15%',
          right: '12%',
          width: 'min(180px, 18vw)',
          height: 'min(180px, 18vw)',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.08,
        }}
      >
        <g strokeWidth="0.5" stroke="rgba(209, 42, 35, 0.5)" fill="none">
          <circle cx="50" cy="50" r="45" />
          <circle cx="50" cy="50" r="35" />
          <circle cx="50" cy="50" r="25" />
          <path d="M 50 5 L 80 80 L 20 80 Z" strokeWidth="0.5" />
        </g>
      </motion.svg>

      <motion.svg
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        viewBox="0 0 100 100"
        style={{
          position: 'fixed',
          bottom: '15%',
          left: '10%',
          width: 'min(200px, 20vw)',
          height: 'min(200px, 20vw)',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.07,
        }}
      >
        <g strokeWidth="0.5" stroke="rgba(99, 117, 139, 0.4)" fill="none">
          <polygon points="50,10 90,90 10,90" />
          <polygon points="50,30 70,70 30,70" />
          <polygon points="50,50 60,60 40,60" />
        </g>
      </motion.svg>
    </div>
  )
}

/* ─── Animated Heartbeat Pulse ────────────────────────────── */
function AnimatedHeartPulse({ size = 72 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Outer rings */}
      <motion.div
        animate={{ scale: [0.8, 1.2], opacity: [0.4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: '-15%',
          borderRadius: '50%',
          border: '2px solid rgba(209, 42, 35, 0.4)',
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
          border: '2px solid rgba(209, 42, 35, 0.25)',
          pointerEvents: 'none',
        }}
      />

      {/* Rotating background */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, rgba(209,42,35,0.2), rgba(209,42,35,0.05), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Heart SVG */}
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
              <stop offset="0%" stopColor="#E63946" />
              <stop offset="50%" stopColor="#D12A23" />
              <stop offset="100%" stopColor="#A71620" />
            </linearGradient>
          </defs>
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill="url(#heartGrad)"
            filter="drop-shadow(0 8px 20px rgba(209,42,35,0.4))"
          />
        </svg>
      </motion.div>

      {/* Inner glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: '-20%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(209,42,35,0.3), transparent)',
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
        borderRadius: 22,
        padding: 'clamp(18px, 2vw, 24px)',
        marginBottom: 22,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: done ? (eligible ? '#22c55e' : '#D12A23') : '#D12A23',
              boxShadow: `0 0 14px ${done && eligible ? 'rgba(34,197,94,0.8)' : 'rgba(209,42,35,0.8)'}`,
            }}
          />
        </div>
        <span style={{ fontSize: '10px', fontWeight: 800, color: '#406088', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {done ? (eligible ? '✓ Cleared' : '✗ Restricted') : 'Screening Active'}
        </span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(64,96,136,0.6)' }}>Progress</span>
          <motion.span
            key={pct}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '13px', fontWeight: 900, color: '#D12A23' }}
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

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === step && !done ? 18 : 6,
              background: i < step || done ? '#22c55e' : i === step ? '#D12A23' : 'rgba(209,42,35,0.12)',
            }}
            transition={{ duration: 0.3 }}
            style={{ height: 4, borderRadius: 9999 }}
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
      <ParticleField />

      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        className="cb-panel cb-left-panel"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(26px, 3vw, 38px)',
            fontWeight: 900,
            color: '#D12A23',
            margin: '0 0 8px',
            lineHeight: 1.1,
          }}>
            Health<br />
            <em style={{ color: '#406088', fontStyle: 'italic', fontWeight: 700 }}>Screening</em>
          </h1>
          <p style={{
            fontSize: '10px',
            color: 'rgba(64,96,136,0.5)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: 0,
          }}>
            Donor Eligibility Assessment
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}
        >
          <AnimatedHeartPulse size={80} />
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
            borderRadius: 18,
            padding: 'clamp(14px, 1.5vw, 18px)',
          }}
        >
          <div style={{
            fontSize: '8px',
            fontWeight: 900,
            color: 'rgba(209,42,35,0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: 12,
          }}>
            Question Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questions.map((q, i) => {
              const isRecorded = i < step || done
              const isActive = i === step && !done
              return (
                <motion.div
                  key={i}
                  animate={{ opacity: isActive ? 1 : isRecorded ? 0.65 : 0.28 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 9 }}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.3 : 1,
                    }}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: isRecorded ? '#22c55e' : isActive ? '#D12A23' : 'rgba(209,42,35,0.15)',
                      flexShrink: 0,
                      boxShadow: isActive ? '0 0 8px rgba(209,42,35,0.5)' : 'none',
                    }}
                  />
                  <span style={{
                    fontSize: '9px',
                    color: isRecorded ? '#22c55e' : isActive ? '#D12A23' : 'rgba(64,96,136,0.4)',
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
      <div className="cb-panel cb-right-panel">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="cb-glass"
          style={{
            padding: 'clamp(18px, 2vw, 26px) clamp(24px, 3.5vw, 44px)',
            borderRadius: 0,
            borderBottom: '1px solid rgba(209, 42, 35, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(18px, 2.2vw, 26px)',
              fontWeight: 900,
              color: '#D12A23',
              margin: '0 0 4px',
              lineHeight: 1.1,
            }}>
              Assessment <em style={{ color: '#406088', fontStyle: 'italic', fontWeight: 700 }}>Chat</em>
            </h2>
            <p style={{
              fontSize: '10px',
              color: 'rgba(64,96,136,0.5)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: 0,
            }}>
              {!done && `Q${Math.min(step + 1, questions.length)} of ${questions.length}`}
              {done && '✓ Complete'}
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
            padding: 'clamp(24px, 3.5vw, 40px) clamp(24px, 3.5vw, 44px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            minHeight: 0,
          }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16, x: msg.from === 'user' ? 16 : -16 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'flex',
                  justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: 14,
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
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(209,42,35,0.15), rgba(209,42,35,0.08))',
                      border: '1.5px solid rgba(209,42,35,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                          fill="#D12A23"
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}

                <div
                  className={msg.from === 'bot' ? 'cb-bubble-bot' : 'cb-bubble-user'}
                  style={{
                    maxWidth: 'min(75%, 520px)',
                    fontSize: 'clamp(13px, 1.1vw, 15px)',
                    lineHeight: 1.6,
                    color: msg.from === 'bot' ? 'rgba(64,96,136,0.8)' : 'rgba(64,96,136,0.85)',
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
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(209,42,35,0.2), rgba(209,42,35,0.1))',
                      border: '1.5px solid rgba(209,42,35,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: '#D12A23' }}>
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
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 14,
                }}
              >
                <motion.div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(209,42,35,0.15), rgba(209,42,35,0.08))',
                    border: '1.5px solid rgba(209,42,35,0.25)',
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
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      borderRight: '2px solid #D12A23',
                      borderTop: '2px solid #D12A23',
                      borderLeft: '2px solid transparent',
                      borderBottom: '2px solid transparent',
                    }}
                  />
                </motion.div>
                <div className="cb-bubble-bot" style={{ padding: 'clamp(14px, 1.5vw, 18px) clamp(16px, 2vw, 22px)' }}>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: '#D12A23',
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
            padding: 'clamp(18px, 2.5vw, 26px) clamp(24px, 3.5vw, 44px)',
            borderRadius: 0,
            borderTop: '1px solid rgba(209, 42, 35, 0.08)',
            flexShrink: 0,
          }}
        >
          <AnimatePresence mode="wait">
            {/* Yes / No Buttons */}
            {!done && !loading && (
              <motion.div
                key="yn"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
              >
                <div style={{ marginBottom: 16 }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: 'rgba(64,96,136,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    Question {step + 1} of {questions.length}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <motion.button
                    className="cb-btn cb-btn-yes"
                    onClick={() => handleAnswer('yes')}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      flex: 1,
                      padding: 'clamp(14px, 1.8vw, 18px)',
                      fontSize: 'clamp(12px, 1.1vw, 14px)',
                    }}
                  >
                    ✓ Yes
                  </motion.button>

                  <motion.button
                    className="cb-btn cb-btn-no"
                    onClick={() => handleAnswer('no')}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      flex: 1,
                      padding: 'clamp(14px, 1.8vw, 18px)',
                      fontSize: 'clamp(12px, 1.1vw, 14px)',
                    }}
                  >
                    ✗ No
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Eligible Result */}
            {done && eligible && (
              <motion.div
                key="eligible"
                initial={{ opacity: 0, scale: 0.93, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 130 }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  marginBottom: 16,
                  padding: 'clamp(12px, 1.5vw, 16px)',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1.5px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: 14,
                }}>
                  <motion.div
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: '#22c55e',
                      boxShadow: '0 0 16px rgba(34,197,94,0.8)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#16a34a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}>
                    ✓ Cleared to Donate
                  </span>
                </div>

                <motion.button
                  className="cb-btn cb-btn-cta"
                  onClick={() => navigate('/donor/dashboard')}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '100%',
                    padding: 'clamp(15px, 2vw, 20px)',
                    fontSize: 'clamp(13px, 1.1vw, 15px)',
                    fontWeight: 800,
                  }}
                >
                  Proceed to Dashboard →
                </motion.button>
              </motion.div>
            )}

            {/* Not Eligible Result */}
            {done && !eligible && (
              <motion.div
                key="noteligible"
                initial={{ opacity: 0, scale: 0.93, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 130 }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  marginBottom: 16,
                  padding: 'clamp(12px, 1.5vw, 16px)',
                  background: 'rgba(209, 42, 35, 0.1)',
                  border: '1.5px solid rgba(209, 42, 35, 0.3)',
                  borderRadius: 14,
                }}>
                  <motion.div
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: '#D12A23',
                      boxShadow: '0 0 12px rgba(209,42,35,0.8)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#dc2626',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}>
                    ✗ Temporary Restriction
                  </span>
                </div>

                <motion.button
                  className="cb-btn cb-btn-secondary"
                  onClick={() => navigate('/')}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    width: '100%',
                    padding: 'clamp(15px, 2vw, 20px)',
                    fontSize: 'clamp(13px, 1.1vw, 15px)',
                    fontWeight: 800,
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