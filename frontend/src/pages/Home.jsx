import { useState, useEffect, useMemo, useRef, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import lebanonMap from '../assets/bcc.png'
import CompatibilityMatrix from "../components/CompatibilityMatrix"

const BLOOD_DATA = {
  'A+':  { canReceive: ['A+','A-','O+','O-'], canDonateTo: ['A+','AB+'], reach: '34%' },
  'A-':  { canReceive: ['A-','O-'], canDonateTo: ['A+','A-','AB+','AB-'], reach: '6%' },
  'B+':  { canReceive: ['B+','B-','O+','O-'], canDonateTo: ['B+','AB+'], reach: '9%' },
  'B-':  { canReceive: ['B-','O-'], canDonateTo: ['B+','B-','AB+','AB-'], reach: '2%' },
  'AB+': { canReceive: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], canDonateTo: ['AB+'], reach: '3%' },
  'AB-': { canReceive: ['A-','B-','AB-','O-'], canDonateTo: ['AB+','AB-'], reach: '1%' },
  'O+':  { canReceive: ['O+','O-'], canDonateTo: ['A+','B+','O+','AB+'], reach: '38%' },
  'O-':  { canReceive: ['O-'], canDonateTo: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], reach: '7%' },
}

const MODERN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }

  @keyframes float { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-15px) scale(1.02); } }
  @keyframes pulse-ring { 0% { transform:scale(.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes gradient-shift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes shimmer { 0%,100% { opacity:.5; } 50% { opacity:1; } }
  @keyframes float-orb { 0%,100% { transform:translateY(0) scale(1); opacity:.2; } 50% { transform:translateY(-20px) scale(1.05); opacity:.35; } }
  @keyframes glow-pulse { 0%,100% { box-shadow: 0 8px 20px rgba(220,38,38,.2); } 50% { box-shadow: 0 12px 30px rgba(220,38,38,.3); } }
  @keyframes glow-pulse-lg { 0%,100% { box-shadow: 0 8px 24px rgba(220,38,38,.2); } 50% { box-shadow: 0 16px 40px rgba(220,38,38,.35); } }

  .bc-root {
    min-height:100vh;
    background:linear-gradient(135deg,#f8f8f8 0%,#efefef 25%,#e8e8e8 50%,#f2f2f2 75%,#f8f8f8 100%);
    background-size:400% 400%;
    animation:gradient-shift 15s ease infinite;
    font-family:'Plus Jakarta Sans',sans-serif;
    overflow-x:hidden;
    position:relative;
    color:#380101;
    zoom: 0.85;
  }

  .bc-glass {
    background:rgba(255,255,255,.6);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(180,180,180,.2);
    box-shadow:0 8px 32px rgba(0,0,0,.08);
  }
  
  .bc-glass-deep {
    background:rgba(255,255,255,.5);
    backdrop-filter:blur(30px) saturate(200%);
    -webkit-backdrop-filter:blur(30px) saturate(200%);
    border:1px solid rgba(180,180,180,.25);
    box-shadow:0 16px 48px rgba(0,0,0,.1),inset 0 1px 1px rgba(255,255,255,.3);
  }

  .bc-nav {
    position:sticky;top:0;z-index:50;
    background:rgba(248,248,248,.85);
    backdrop-filter:blur(20px) saturate(200%);
    -webkit-backdrop-filter:blur(20px) saturate(200%);
    border-bottom:1px solid rgba(180,180,180,.15);
    box-shadow:0 4px 30px rgba(0,0,0,.08);
  }
  
  .bc-nav-inner {
    max-width:1360px;margin:0 auto;
    display:flex;justify-content:space-between;align-items:center;
    padding:14px clamp(16px,3.5vw,44px);
    gap:clamp(16px,2.5vw,32px);
  }

  .bc-btn {
    position:relative;overflow:hidden;cursor:pointer;
    border:none;outline:none;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
    font-family:'Plus Jakarta Sans',sans-serif;
    font-weight:700;
  }

  .bc-btn::before {
    content:'';position:absolute;top:0;left:-100%;
    width:100%;height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
    transition:left .5s;
  }

  .bc-btn:hover::before { left:100%; }

  .bc-btn-primary {
    background:linear-gradient(135deg,#dc2626 0%,#991b1b 50%,#7f1d1d 100%);
    color:#faf7f7;
    box-shadow:0 10px 30px rgba(220,38,38,.35);
    border:1px solid rgba(255,255,255,.15);
  }

  .bc-btn-primary:hover {
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 20px 60px rgba(220,38,38,.5);
  }

  .bc-btn-secondary {
    background:rgba(255,255,255,.7);
    backdrop-filter:blur(10px);
    border:1.5px solid rgba(180,180,180,.3) !important;
    color:#380101;
  }

  .bc-btn-secondary:hover {
    background:rgba(255,255,255,.85);
    border-color:rgba(180,180,180,.5) !important;
    transform:translateY(-2px);
  }

  .bc-float-orb {
    position:absolute;
    border-radius:50%;
    filter:blur(80px);
    pointer-events:none;
    animation:float-orb 6s ease-in-out infinite;
  }

  .bc-fab-wrap {
    position:fixed;bottom:clamp(20px,2vw,32px);right:clamp(20px,2vw,32px);z-index:60;
  }

  .bc-fab-ring {
    position:absolute;inset:-8px;border-radius:50%;background:#dc2626;
    animation:pulse-ring 2s cubic-bezier(0,0,.2,1) infinite;
  }

  .bc-fab {
    position:relative;
    width:clamp(56px,4vw,64px);height:clamp(56px,4vw,64px);
    border-radius:50%;
    background:linear-gradient(135deg,#dc2626,#991b1b);
    color:#faf7f7;border:none;
    box-shadow:0 16px 48px rgba(220,38,38,.4);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;outline:none;
    animation:float 3s ease-in-out infinite;
    transition:all .3s;
    font-size:clamp(24px,2.8vw,28px);
    font-weight:900;
  }

  .bc-fab:hover {
    transform:scale(1.2);
    box-shadow:0 24px 64px rgba(220,38,38,.6);
  }

  .bc-card-hover {
    transition:all .4s cubic-bezier(.22,1,.36,1);
  }

  .bc-card-hover:hover {
    transform:translateY(-8px) scale(1.02);
    box-shadow:0 32px 80px rgba(220,38,38,.2) !important;
  }

  .glow-pulse {
    animation: glow-pulse 2.5s ease-in-out infinite;
  }

  .glow-pulse-lg {
    animation: glow-pulse-lg 2.5s ease-in-out infinite;
  }

  footer {
    border-top:1px solid rgba(140,140,140,.1);
  }

  @media (max-width:960px) {
    .bc-root { zoom: 0.9; }
    .bc-hero-grid { grid-template-columns:1fr; }
    .bc-network-grid { grid-template-columns:1fr; }
    .bc-hero-visual { display:none !important; }
  }
`

if (typeof document !== 'undefined' && !document.getElementById('bc-modern-v1')) {
  const s = document.createElement('style')
  s.id = 'bc-modern-v1'
  s.textContent = MODERN_STYLES
  document.head.appendChild(s)
}

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
          className="bc-float-orb"
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

// ✅ ModernBloodDrop DEFINED HERE (BEFORE Home component)
function ModernBloodDrop() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    // Load Three.js from CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.async = true

    script.onload = () => {
      initScene()
    }

    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const initScene = () => {
    if (!canvasRef.current || !window.THREE) return

    const THREE = window.THREE
    const canvas = canvasRef.current
    const container = containerRef.current

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x260105)

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 3

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0xff4444, 1.5, 100)
    pointLight1.position.set(5, 5, 5)
    pointLight1.castShadow = true
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x4a9eff, 0.8, 100)
    pointLight2.position.set(-5, 3, 5)
    scene.add(pointLight2)

    // Create main blood sphere
    const sphereGeometry = new THREE.SphereGeometry(0.8, 64, 64)
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      metalness: 0.2,
      roughness: 0.5,
      emissive: 0x660000,
      emissiveIntensity: 0.3,
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.castShadow = true
    sphere.receiveShadow = true
    scene.add(sphere)

    // Create floating particles
    const particles = []
    const particleGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const particleMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5555,
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0xff2222,
      emissiveIntensity: 0.5,
    })

    for (let i = 0; i < 30; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone())
      particle.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      )
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        life: Math.random(),
      }
      scene.add(particle)
      particles.push(particle)
    }

    // Create vein lines
    const lineGroup = new THREE.Group()
    for (let i = 0; i < 6; i++) {
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos((i * Math.PI * 2) / 6) * 0.5,
          Math.sin((i * Math.PI * 2) / 6) * 0.5,
          0.3
        ),
        new THREE.Vector3(
          Math.cos((i * Math.PI * 2) / 6) * 1.2,
          Math.sin((i * Math.PI * 2) / 6) * 1.2,
          0.8
        ),
      ]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: 0xff6b6b,
        linewidth: 2,
        transparent: true,
        opacity: 0.6,
      })
      const line = new THREE.Line(geometry, material)
      lineGroup.add(line)
    }
    scene.add(lineGroup)

    // Animation loop
    let animationId = null
    const clock = new THREE.Clock()
    let time = 0

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      time += clock.getDelta()

      // Rotate sphere
      sphere.rotation.x += 0.001
      sphere.rotation.y += 0.0015

      // Pulse sphere
      const scale = 1 + Math.sin(time * 2) * 0.08
      sphere.scale.set(scale, scale, scale)

      // Animate particles
      particles.forEach((particle) => {
        particle.position.add(particle.userData.velocity)
        particle.userData.life += 0.01

        if (particle.userData.life > 1) {
          particle.userData.life = 0
          particle.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
          )
        }

        const visibility = Math.cos(particle.userData.life * Math.PI)
        particle.material.opacity = Math.max(0, visibility * 0.6)
      })

      // Rotate vein lines
      lineGroup.rotation.z += 0.003
      lineGroup.children.forEach((line, i) => {
        const pulse = Math.sin(time * 1.5 + i) * 0.3 + 0.6
        line.material.opacity = pulse * 0.6
      })

      // Camera movement
      camera.position.x = Math.sin(time * 0.3) * 0.5
      camera.position.y = Math.cos(time * 0.25) * 0.3
      camera.lookAt(0, 0, 0)

      // Dynamic lighting
      pointLight1.intensity = 1.5 + Math.sin(time * 1.3) * 0.4

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationId) cancelAnimationFrame(animationId)
      renderer.dispose()
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(15,15,25,0.95) 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {/* HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p
              style={{
                fontSize: '9px',
                letterSpacing: '2px',
                color: '#dc2626',
                fontWeight: 900,
                margin: 0,
                textTransform: 'uppercase',
              }}
            >
              Core Flow Active
            </p>
            <p
              style={{
                fontSize: '16px',
                fontWeight: 300,
                color: '#fff',
                margin: '4px 0 0',
              }}
            >
              Biometric Sync
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                fontSize: '8px',
                color: 'rgba(255,255,255,0.4)',
                margin: 0,
              }}
            >
              REF_ID
            </p>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#dc2626',
                margin: '2px 0 0',
              }}
            >
              #BC-9921
            </p>
          </div>
        </div>

        {/* Bottom status */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            fontSize: '10px',
            color: '#4ade80',
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          ● SYSTEM ONLINE
        </motion.div>
      </div>

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  )
}

// ✅ Home component defined AFTER ModernBloodDrop
export default function Home() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [analytics, setAnalytics] = useState({ donors: 0, emergencies: 0 })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const baseURL = 'https://blood-bank-eqyr.onrender.com/api'
        const res = await fetch(`${baseURL}/analytics/dashboard`)
        if (res.ok) {
          const data = await res.json()
          setAnalytics({ donors: data.donors || 0, emergencies: data.emergencies || 0 })
        }
      } catch (err) {
        console.log('Analytics fetch failed')
      }
    }
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.23, 1, 0.32, 1] },
    },
  }

  return (
    <div className="bc-root">
      <AnimatedBackgroundOrbs />

      <header className="bc-nav" style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)', transition: 'transform .6s cubic-bezier(.22,1,.36,1)' }}>
        <div className="bc-nav-inner">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
            onClick={() => go('/')}
            whileHover={{ x: 3 }}
          >
            <motion.div
              style={{
                width: 50,
                height: 50,
                background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 32px rgba(220,38,38,.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
              whileHover={{ scale: 1.12, boxShadow: '0 16px 40px rgba(220,38,38,.4)' }}
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            >
              <svg viewBox="0 0 100 130" style={{ width: 28, height: 38 }}>
                <defs>
                  <linearGradient id="navBlood" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="50%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                </defs>
                <path d="M50 0 C50 0 95 60 95 85 C95 110 75 130 50 130 C25 130 5 110 5 85 C5 60 50 0 50 0 Z" fill="url(#navBlood)" opacity="0.95" />
                <ellipse cx="32" cy="65" rx="16" ry="22" fill="#faf7f7" opacity="0.2" />
              </svg>
            </motion.div>
            <div>
              <motion.div style={{ fontSize: 22, fontWeight: 900, color: '#dc2626' }} animate={{ letterSpacing: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                BloodConnect
              </motion.div>
            </div>
          </motion.div>

          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={() => go('/emergency')}
              className="bc-btn bc-btn-primary"
              whileHover={{ scale: 1.08, boxShadow: '0 20px 60px rgba(220,38,38,.6)' }}
              whileTap={{ scale: 0.92 }}
              style={{
                padding: '13px 26px',
                borderRadius: 24,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                ●
              </motion.span>
              Emergency
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onClick={() => go('/how-it-works')}
              className="bc-btn bc-btn-secondary"
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.92 }}
              style={{
                padding: '13px 24px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
               How It Works
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              onClick={() => go('/impact')}
              className="bc-btn bc-btn-secondary"
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.92 }}
              style={{
                padding: '13px 24px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Donor Guide
            </motion.button>
          </div>
        </div>
      </header>

      <main style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: 1360,
        margin: '0 auto',
        padding: '40px clamp(20px,3vw,50px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '60px',
      }}>

        {/* Hero Section */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 36, alignItems: 'center', minHeight: 'auto' }} className="bc-hero-grid">
          <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>

            <motion.div variants={item}>
              <motion.div
                className="bc-glass"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 22px',
                  borderRadius: 9999,
                  width: 'fit-content',
                }}
                whileHover={{ scale: 1.06, boxShadow: '0 12px 40px rgba(220,38,38,.2)' }}
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span style={{
                  position: 'relative',
                  display: 'inline-flex',
                  width: 10,
                  height: 10,
                }}>
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: '#dc2626',
                    opacity: 0.6,
                    animation: 'pulse-ring 1.5s cubic-bezier(0,0,.2,1) infinite',
                  }} />
                  <span style={{
                    position: 'relative',
                    display: 'inline-flex',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#dc2626',
                    boxShadow: '0 0 16px #dc2626',
                  }} />
                </span>
                <span style={{ color: '#dc2626', fontWeight: 900, fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase' }}>
                  Live System
                </span>
              </motion.div>
            </motion.div>

            <motion.div variants={item}>
              <h1 style={{
                fontFamily: "'Fraunces',serif",
                fontSize: 'clamp(40px,5vw,60px)',
                lineHeight: 1.1,
                fontWeight: 900,
                color: '#6e2016',
                margin: 0,
              }}>
                Connected by  Blood,
                <motion.span
                  style={{
                    display: 'block',
                    background: 'linear-gradient(135deg,#dc2626,#fca5a5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                >
                 United by Hope
                </motion.span>
              </h1>
            </motion.div>

            <motion.div variants={item}>
              <p style={{
                fontSize: 'clamp(15px,1.4vw,18px)',
                color: 'rgba(42,42,42,.65)',
                fontWeight: 500,
                maxWidth: 520,
                lineHeight: 1.8,
                margin: 0,
              }}>
                Born from Lebanon's recent crises, this platform transforms compassion into action by connecting lifesaving blood donors with patients in urgent need.
              </p>
            </motion.div>

            <motion.div variants={item} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 8 }}>
              <motion.button
                className="bc-btn bc-btn-primary"
                onClick={() => go('/donor/register')}
                whileHover={{ scale: 1.06, boxShadow: '0 20px 60px rgba(220,38,38,.6)' }}
                whileTap={{ scale: 0.93 }}
                style={{
                  padding: '15px 32px',
                  borderRadius: 24,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Register as Donor
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  →
                </motion.span>
              </motion.button>

              <motion.button
                className="bc-btn bc-btn-secondary"
                onClick={() => go('/login')}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                style={{
                  padding: '15px 32px',
                  borderRadius: 24,
                  fontSize: 14,
                }}
              >
                Sign In
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            className="bc-hero-visual"
            style={{
              position: 'relative',
              height: 'clamp(360px,32vw,500px)',
            }}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            viewport={{ once: true }}
          >
            <motion.div
              className="bc-glass-deep bc-card-hover"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 32,
                overflow: 'hidden',
                border: '1px solid rgba(91,115,151,.12)',
              }}
              whileHover={{ boxShadow: '0 40px 100px rgba(220,38,38,.25)', y: -8 }}
            >
              <ModernBloodDrop />
            </motion.div>

            <motion.div
              className="bc-glass-deep bc-card-hover glow-pulse"
              style={{
                position: 'absolute',
                top: '-8%',
                right: '-8%',
                zIndex: 20,
                borderRadius: 24,
                padding: 24,
                minWidth: 'min(260px,30vw)',
              }}
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -16, scale: 1.05 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <motion.div
                    style={{
                      width: 50,
                      height: 50,
                      background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <motion.div
                      style={{
                        width: 10,
                        height: 10,
                        background: '#fff',
                        borderRadius: '50%',
                        position: 'relative',
                        zIndex: 3,
                      }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                    
                    <motion.div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,.7)',
                      }}
                      animate={{ 
                        scale: [1, 1.6],
                        opacity: [1, 0]
                      }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity,
                        ease: 'easeOut'
                      }}
                    />
                    
                    <motion.div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '1.5px solid rgba(255,255,255,.4)',
                      }}
                      animate={{ 
                        scale: [1, 2],
                        opacity: [0.8, 0]
                      }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: 0.2
                      }}
                    />
                  </motion.div>
                  
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 900, color: 'rgba(42,42,42,.5)', letterSpacing: '.15em', textTransform: 'uppercase', margin: 0, marginBottom: 4 }}>SYSTEM STATUS</p>
                    <motion.p 
                      style={{ fontSize: 26, fontWeight: 900, color: '#dc2626', margin: 0 }}
                      animate={{ color: ['#dc2626', '#ff5555', '#dc2626'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      Stable
                    </motion.p>
                  </div>
                </div>

                <div style={{ height: 40, display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <svg
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    viewBox="0 0 300 40"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="heartbeatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#dc2626" stopOpacity="1" />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    <motion.polyline
                      points="0,20 10,20 15,10 20,30 25,15 35,20 45,20 50,20 55,18 58,22 62,20 70,20 80,20 90,20 100,20 110,20 115,18 118,22 122,20 130,20 140,20 150,20 160,20 165,18 168,22 172,20 180,20 190,20 200,20 210,20 215,18 218,22 222,20 230,20 240,20 250,20 260,20 270,20 280,20 290,20 300,20"
                      fill="none"
                      stroke="url(#heartbeatGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{ 
                        strokeDashoffset: [0, 300],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      style={{
                        strokeDasharray: 300,
                      }}
                    />
                  </svg>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 8px rgba(74,222,128,.6)'
                    }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(42,42,42,.7)', margin: 0 }}>
                    72 BPM · ACTIVE SYNC
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bc-glass-deep glow-pulse-lg"
              style={{
                position: 'absolute',
                bottom: '-8%',
                left: '-10%',
                width: 'clamp(120px,14vw,180px)',
                height: 'clamp(120px,14vw,180px)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.15 }}
            >
              <div style={{ textAlign: 'center' }}>
                <motion.div
                  style={{ fontSize: 32, fontWeight: 900, color: '#ff6b6b' }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  24/7
                </motion.div>
                <div style={{ fontSize: 9, color: 'rgba(42,42,42,.55)', fontWeight: 700, marginTop: 4 }}>RESPONSE</div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Analytics Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <motion.div
            className="bc-network-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 32,
              alignItems: 'stretch',
              height: '400px',
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="bc-glass-deep bc-card-hover"
              style={{
                borderRadius: 28,
                overflow: 'hidden',
                border: '1px solid rgba(91,115,151,.12)',
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              whileHover={{ boxShadow: '0 32px 80px rgba(220,38,38,.2)' }}
            >
              <img src={lebanonMap} alt="Lebanon Blood Network Map" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.95) contrast(1.08)' }} />
            </motion.div>

            <motion.div
              className="bc-glass-deep bc-card-hover"
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 28,
                padding: 'clamp(28px,3.5vw,44px)',
                borderRadius: 28,
                border: '1px solid rgba(91,115,151,.12)',
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              whileHover={{ boxShadow: '0 32px 80px rgba(220,38,38,.2)' }}
            >
              <div style={{ textAlign: 'center' }}>
                <motion.span
                  style={{ fontSize: 12, fontWeight: 900, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '.15em' }}
                  animate={{ letterSpacing: ['.15em', '.2em', '.15em'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Real-Time Analytics
                </motion.span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'clamp(36px,7vw,64px)', flex: 1 }}>
                {[
                  { label: 'Donors', value: analytics.donors, color: 'rgba(220,38,38,.2)', textColor: '#dc2626' },
                  { label: 'Emergencies', value: analytics.emergencies, color: 'rgba(220,38,38,.2)', textColor: '#dc2626' },
                ].map((stat, i) => {
                  const maxVal = Math.max(analytics.donors, analytics.emergencies, 20)
                  const heightPercent = maxVal > 0 ? (stat.value / maxVal) * 100 : 0

                  return (
                    <motion.div
                      key={i}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, flex: 1 }}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: i * 0.2 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -6, scale: 1.05 }}
                    >
                      <motion.span
                        style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: stat.textColor, textShadow: `0 4px 20px ${stat.color}` }}
                        key={stat.value}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                      >
                        {stat.value}
                      </motion.span>

                      <div style={{
                        width: 'clamp(60px,8vw,90px)',
                        flex: 1,
                        background: stat.color,
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: `1px solid ${stat.color}`,
                        position: 'relative',
                        minHeight: 'clamp(100px,30vh,180px)',
                      }}>
                        <motion.div
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(180deg,#dc2626,#991b1b)',
                            borderRadius: 12,
                            boxShadow: `0 6px 20px ${stat.color}`,
                            position: 'absolute',
                            bottom: 0,
                          }}
                        />
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, animation: 'float 3s ease-in-out infinite' }}></div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(71,85,105,.6)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 6 }}>
                          {stat.label}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div style={{ marginTop: 12, paddingTop: 20, borderTop: '1px solid rgba(91,115,151,.1)' }}>
                <motion.a
                  href="https://www.google.com/maps/place/BloodConnect/@33.896303,35.4830185,17z/data=!3m1!4b1!4m6!3m5!1s0x151f1700556b765f:0x7b13b4102e84e328!8m2!3d33.896303!4d35.4830185!16s%2Fg%2F11njy2j9_g?hl=en-GB&entry=ttu&g_ep=EgoyMDI2MDUxNy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bc-btn bc-btn-primary"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(220,38,38,.5)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '100%',
                    padding: 16,
                    borderRadius: 16,
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    textDecoration: 'none',
                  }}
                >
                  <span>Visit Our Center in Hamra</span>
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    →
                  </motion.span>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Compatibility Matrix - with proper spacing */}
        <section style={{ marginTop: '150px' }}>
          <CompatibilityMatrix />
        </section>

       {/* Video Section */}
<section style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: 28 }}>
  <motion.div
    className="bc-glass-deep bc-card-hover"
    style={{
      borderRadius: 28,
      overflow: 'hidden',
      border: '1px solid rgba(91,115,151,.12)',
      position: 'relative',
      width: '100%',
      aspectRatio: '16 / 9',
    }}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    viewport={{ once: true }}
    whileHover={{ boxShadow: '0 32px 80px rgba(220,38,38,.2)' }}
  >
    <iframe
  width="100%"
  height="100%"
  src="https://www.youtube.com/embed/MGsZUvVrOtg?vq=hd1440&modestbranding=1&rel=0"
  title="BloodConnect"
  frameBorder="0"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowFullScreen
  style={{ 
    borderRadius: '12px', 
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
  }}
/>
  </motion.div>
</section>

      </main>

      {/* Footer */}
      <motion.footer
        className="bc-glass"
        style={{
          marginTop: 'clamp(60px,8vw,120px)',
          borderTop: '1px solid rgba(180,180,180,.15)',
          background: 'rgba(255,255,255,.3)',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(44px,5vw,72px) clamp(16px,3.5vw,44px)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
            gap: 'clamp(32px,4vw,60px)',
            marginBottom: 'clamp(36px,4vw,60px)',
          }}>
            <motion.div whileHover={{ x: 5 }}>
              <div style={{
                fontFamily: "'Fraunces',serif",
                color: '#dc2626',
                fontSize: 'clamp(20px,2.5vw,28px)',
                fontWeight: 900,
                marginBottom: 16,
              }}>
                BloodConnect
              </div>
              <p style={{
                color: 'rgba(71,85,105,.7)',
                fontWeight: 500,
                lineHeight: 1.7,
                fontStyle: 'italic',
                fontSize: 'clamp(12px,1.2vw,14px)',
                margin: 0,
              }}>
                Pioneering the future of hematological logistics through empathy and code.
              </p>
            </motion.div>
          </div>

          <div style={{ paddingTop: 24, borderTop: '1px solid rgba(91,115,151,.1)' }}>
            <p style={{
              color: 'rgba(71,85,105,.55)',
              fontSize: 'clamp(9px,.9vw,11px)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '.18em',
              margin: 0,
            }}>
              © 2026 BloodConnect · Dana Ghannam & Lynn Anani · Lebanon
            </p>
          </div>
        </div>
      </motion.footer>

      {/* FAB */}
      <motion.div className="bc-fab-wrap" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 1 }}>
        <div className="bc-fab-ring" style={{ opacity: 0.5 }} />
        <motion.button
          className="bc-fab"
          onClick={() => go('/emergency')}
          whileHover={{ scale: 1.2, boxShadow: '0 24px 80px rgba(220,38,38,.7)' }}
          whileTap={{ scale: 0.9 }}
        >
          
        </motion.button>
      </motion.div>
    </div>
  )
}