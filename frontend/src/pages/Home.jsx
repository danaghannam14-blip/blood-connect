import { useState, useEffect, useMemo, useRef, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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
    padding:11px clamp(12px,2vw,28px);
    gap:clamp(12px,2vw,24px);
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
    position:fixed;bottom:clamp(16px,2vw,24px);right:clamp(16px,2vw,24px);z-index:60;
  }

  .bc-fab-ring {
    position:absolute;inset:-8px;border-radius:50%;background:#dc2626;
    animation:pulse-ring 2s cubic-bezier(0,0,.2,1) infinite;
  }

  .bc-fab {
    position:relative;
    width:clamp(48px,3.5vw,56px);height:clamp(48px,3.5vw,56px);
    border-radius:50%;
    background:linear-gradient(135deg,#dc2626,#991b1b);
    color:#faf7f7;border:none;
    box-shadow:0 16px 48px rgba(220,38,38,.4);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;outline:none;
    animation:float 3s ease-in-out infinite;
    transition:all .3s;
    font-size:clamp(20px,2.4vw,24px);
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

  .recharts-surface { border-radius: 0; }
  .recharts-cartesian-axis-tick text { font-size: 11px; fill: rgba(71,85,105,.7); }
  .recharts-wrapper { outline: none; }

   @media (max-width:1024px) {
    .bc-root { font-size: 0.9em; }
    .bc-hero-grid { grid-template-columns:1fr !important; }
    .bc-network-grid { grid-template-columns:1fr !important; }
    .bc-hero-visual { display:none !important; }
  }

  @media (max-width:768px) {
    .bc-root { font-size: 1em; }
    .bc-nav-inner { padding: 10px clamp(10px, 1.5vw, 16px); gap: 6px; flex-wrap: nowrap; }
    main { padding: 16px clamp(12px, 1.5vw, 20px) !important; gap: 24px !important; }
    h1 { font-size: clamp(24px, 5vw, 38px) !important; }
    p { font-size: clamp(13px, 1.2vw, 15px) !important; }
    .bc-btn { font-size: clamp(11px, 0.9vw, 12px) !important; padding: 9px clamp(12px, 1.5vw, 18px) !important; }
    section { overflow-x: hidden; }
  }

 @media (max-width:640px) {
  .bc-root { font-size: 1em; }
  main { padding: 14px 12px !important; gap: 20px !important; }
  h1 { font-size: clamp(22px, 5vw, 34px) !important; line-height: 1.1 !important; }
  p { font-size: clamp(12px, 1.15vw, 14px) !important; line-height: 1.5 !important; }
  .bc-btn { font-size: clamp(10px, 0.8vw, 11px) !important; padding: 8px clamp(12px, 2vw, 16px) !important; }
  .bc-network-grid { gap: 16px !important; height: auto !important; grid-template-columns: 1fr !important; }
  .bc-network-grid > div { min-height: auto !important; height: auto !important; aspect-ratio: auto !important; }
}

  @media (max-width:480px) {
    .bc-root { font-size: 1em; overflow-x: hidden; }
    main { padding: 12px 10px !important; gap: 18px !important; max-width: 100vw !important; }
    .bc-nav-inner { padding: 9px 10px; gap: 4px; justify-content: flex-start; }
    .bc-nav-inner > div:nth-child(2) { display: none !important; }
    
    h1 { font-size: clamp(20px, 5vw, 28px) !important; line-height: 1.15 !important; margin-bottom: 10px !important; }
    h2 { font-size: clamp(16px, 4vw, 22px) !important; }
    p { font-size: clamp(11.5px, 1.1vw, 12.5px) !important; line-height: 1.5 !important; }
    
    .bc-btn { 
      font-size: clamp(10px, 0.9vw, 11px) !important; 
      padding: 8px clamp(10px, 1.5vw, 14px) !important; 
      min-height: 40px;
      justify-content: center;
      white-space: nowrap;
    }
    @media (max-width:480px) {
  .bc-network-grid {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
    height: auto !important;
  }

  /* map */
  .bc-network-grid > div:first-child {
    height: 240px !important;
  }

  /* chart */
  .bc-network-grid > div:nth-child(2) {
    min-height: 420px !important;
    height: 420px !important;
    aspect-ratio: auto !important;
  }
}
    .bc-btn-primary, .bc-btn-secondary { 
      width: auto;
      flex: 1;
      min-width: auto;
    }
    
    section { margin-top: 16px !important; overflow-x: hidden; }
    
    .bc-nav-inner > div:last-child {
      width: 100% !important;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      display: flex !important;
      gap: 6px;
    }
    
    .bc-network-grid { 
      grid-template-columns: 1fr !important; 
      gap: 14px !important; 
      height: auto !important; 
    }
    
    .bc-network-grid > div { 
      min-height: auto !important;
      aspect-ratio: auto !important;
    }
    
    .bc-network-grid > div:first-child {
      height: 240px;
    }
    
    .bc-network-grid > div:last-child {
      min-height: 280px;
    }
    
    .glow-pulse { display: none !important; }
    .glow-pulse-lg { display: none !important; }
    
    .float-orb { animation: none !important; opacity: 0.03 !important; }
    .bc-float-orb { animation-play-state: paused !important; opacity: 0.05 !important; }
    
    iframe { border-radius: 12px !important; }
    
    footer { margin-top: 30px !important; }
    footer > div { padding: 24px clamp(10px, 2.5vw, 24px) !important; }
    
    * { max-width: 100vw; }
    body { overflow-x: hidden; }
    
    a, button { min-height: 40px; min-width: 40px; }
  }

  @media (max-width:380px) {
    h1 { font-size: clamp(18px, 5vw, 24px) !important; }
    p { font-size: clamp(11px, 1vw, 12px) !important; }
    main { padding: 10px 10px !important; gap: 16px !important; }
    .bc-btn { padding: 7px clamp(8px, 1.2vw, 12px) !important; font-size: clamp(9px, 0.8vw, 10px) !important; }
    section { margin-top: 14px !important; }
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

function ModernBloodDrop() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0xff4444, 1.5, 100)
    pointLight1.position.set(5, 5, 5)
    pointLight1.castShadow = true
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x4a9eff, 0.8, 100)
    pointLight2.position.set(-5, 3, 5)
    scene.add(pointLight2)

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

    let animationId = null
    const clock = new THREE.Clock()
    let time = 0

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      time += clock.getDelta()

      sphere.rotation.x += 0.001
      sphere.rotation.y += 0.0015

      const scale = 1 + Math.sin(time * 2) * 0.08
      sphere.scale.set(scale, scale, scale)

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

      lineGroup.rotation.z += 0.003
      lineGroup.children.forEach((line, i) => {
        const pulse = Math.sin(time * 1.5 + i) * 0.3 + 0.6
        line.material.opacity = pulse * 0.6
      })

      camera.position.x = Math.sin(time * 0.3) * 0.5
      camera.position.y = Math.cos(time * 0.25) * 0.3
      camera.lookAt(0, 0, 0)

      pointLight1.intensity = 1.5 + Math.sin(time * 1.3) * 0.4

      renderer.render(scene, camera)
    }

    animate()

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
              Emergency Blood Support
            </p>
            <p
              style={{
                fontSize: '16px',
                fontWeight: 300,
                color: '#fff',
                margin: '4px 0 0',
              }}
            >
               Live Matching
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

export default function Home() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [analytics, setAnalytics] = useState({ donors: 0, emergencies: 0 })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480)

  const [chartData, setChartData] = useState([
    { time: '00:00', donors: 0, emergencies: 0 },
    { time: '06:00', donors: 0, emergencies: 2 },
    { time: '12:00', donors: 0, emergencies: 8 },
    { time: '18:00', donors: 0, emergencies: 15 },
  ])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const baseURL = 'https://blood-bank-eqyr.onrender.com/api'
        const res = await fetch(`${baseURL}/analytics/dashboard`)
        if (res.ok) {
          const data = await res.json()
          const donors = data.donors || 0
          const emergencies = data.emergencies || 0
          setAnalytics({ donors, emergencies })
          
          setChartData(prev => [
            ...prev.slice(0, -1),
            { 
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), 
              donors, 
              emergencies 
            }
          ])
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
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => go('/')}
            whileHover={{ x: 3 }}
          >
            <motion.div
              style={{
                width: 42,
                height: 42,
                background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                borderRadius: 10,
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
              <svg viewBox="0 0 100 130" style={{ width: 24, height: 32 }}>
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
              <motion.div 
                style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', margin: 0 }} 
                animate={{ letterSpacing: [0, 1, 0] }} 
                transition={{ duration: 3, repeat: Infinity }}
              >
                BloodConnect
              </motion.div>
              <motion.div
                style={{ 
                  fontSize: 'clamp(7px, 0.8vw, 10px)', 
                  fontWeight: 500, 
                  color: 'rgba(71, 85, 105, 0.7)',
                  margin: '1px 0 0 0',
                  letterSpacing: '0.3px'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Smart Donor Matching System
              </motion.div>
            </div>
          </motion.div>

          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={() => go('/emergency')}
              className="bc-btn bc-btn-primary"
              whileHover={{ scale: 1.08, boxShadow: '0 20px 60px rgba(220,38,38,.6)' }}
              whileTap={{ scale: 0.92 }}
              style={{
                padding: '10px 18px',
                borderRadius: 20,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
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
                padding: '10px 18px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
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
                padding: '10px 18px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
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
        padding: '24px clamp(14px,2vw,32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '36px',
      }}>

        <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24, alignItems: 'center', minHeight: 'auto' }} className="bc-hero-grid">
          <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>

            <motion.div variants={item}>
              <motion.div
                className="bc-glass"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 16px',
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
                  width: 8,
                  height: 8,
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
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#dc2626',
                    boxShadow: '0 0 16px #dc2626',
                  }} />
                </span>
                <span style={{ color: '#dc2626', fontWeight: 900, fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase' }}>
                  Live System
                </span>
              </motion.div>
            </motion.div>

            <motion.div variants={item}>
              <h1 style={{
                fontFamily: "'Fraunces',serif",
                fontSize: 'clamp(32px,4.5vw,48px)',
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
                fontSize: 'clamp(13px,1.2vw,15px)',
                color: 'rgba(42,42,42,.65)',
                fontWeight: 500,
                maxWidth: 520,
                lineHeight: 1.7,
                margin: 0,
              }}>
                Born from Lebanon's recent crises, this platform transforms compassion into action by connecting lifesaving blood donors with patients in urgent need.
              </p>
            </motion.div>

            <motion.div variants={item} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 4 }}>
              <motion.button
                className="bc-btn bc-btn-primary"
                onClick={() => go('/donor/register')}
                whileHover={{ scale: 1.06, boxShadow: '0 20px 60px rgba(220,38,38,.6)' }}
                whileTap={{ scale: 0.93 }}
                style={{
                  padding: '12px 24px',
                  borderRadius: 20,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
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
                  padding: '12px 24px',
                  borderRadius: 20,
                  fontSize: 12,
                }}
              >
                Sign In
              </motion.button>
            </motion.div>
          </motion.div>
{/* Hero Visual - HIDDEN ON MOBILE */}
          {!isMobile && (
            <motion.div
              className="bc-hero-visual"
              style={{
                position: 'relative',
                height: 'clamp(300px,28vw,400px)',
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
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: '1px solid rgba(91,115,151,.12)',
                }}
                whileHover={{ boxShadow: '0 40px 100px rgba(220,38,38,.25)', y: -8 }}
              >
                <ModernBloodDrop />
              </motion.div>

              {/* Biometric sync card - HIDDEN ON MOBILE */}
              <motion.div
                className="bc-glass-deep bc-card-hover glow-pulse"
                style={{
                  position: 'absolute',
                  top: '-8%',
                  right: '-8%',
                  zIndex: 20,
                  borderRadius: 20,
                  padding: 18,
                  minWidth: 'min(220px,26vw)',
                }}
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -16, scale: 1.05 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <motion.div
                      style={{
                        width: 42,
                        height: 42,
                        background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                        borderRadius: 10,
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
                          width: 8,
                          height: 8,
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
                      <p style={{ fontSize: 5, fontWeight: 900, color: 'rgba(42,42,42,.5)', letterSpacing: '.15em', textTransform: 'uppercase', margin: 0, marginBottom: 2 }}>STATUS</p>
                      <motion.p 
                        style={{ fontSize: 20, fontWeight: 900, color: '#dc2626', margin: 0 }}
                        animate={{ color: ['#dc2626', '#ff5555', '#dc2626'] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        Ready
                      </motion.p>
                    </div>
                  </div>

                  <div style={{ height: 32, display: 'flex', alignItems: 'center', position: 'relative' }}>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <motion.div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#4ade80',
                        boxShadow: '0 0 8px rgba(74,222,128,.6)'
                      }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(42,42,42,.7)', margin: 0 }}>
                     · Requests Live
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
                  width: 'clamp(100px,12vw,150px)',
                  height: 'clamp(100px,12vw,150px)',
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
                    style={{ fontSize: 28, fontWeight: 900, color: '#ff6b6b' }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    24/7
                  </motion.div>
                  <div style={{ fontSize: 8, color: 'rgba(42,42,42,.55)', fontWeight: 700, marginTop: 3 }}>RESPONSE</div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </section>


        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <motion.div
            className="bc-network-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              alignItems: 'stretch',
              height: 'clamp(420px,34vw,520px)',
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="bc-glass-deep bc-card-hover"
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid rgba(91,115,151,.12)',
                aspectRatio: '1 / 1',
                height: '100%',
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              whileHover={{
                boxShadow: '0 32px 80px rgba(220,38,38,.2)',
              }}
            >
              <img
                src={lebanonMap}
                alt="Lebanon Blood Network Map"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'brightness(0.95) contrast(1.08)',
                }}
              />
            </motion.div>

            <motion.div
              className="bc-glass-deep bc-card-hover"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                padding: 'clamp(18px,2.5vw,28px)',
                borderRadius: 20,
                border: '1px solid rgba(91,115,151,.12)',
                aspectRatio: '1 / 1',
                height: '100%',
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              whileHover={{
                boxShadow: '0 32px 80px rgba(220,38,38,.2)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <motion.span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: '#dc2626',
                    textTransform: 'uppercase',
                    letterSpacing: '.15em',
                  }}
                  animate={{
                    letterSpacing: ['.15em', '.2em', '.15em'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  Real-Time Analytics
                </motion.span>
              </div>

              <div
                style={{
                  flex: 1,
                  width: '100%',
                  minHeight: 0,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 8,
                      right: 0,
                      left: -18,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="colorDonors"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#dc2626"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#dc2626"
                          stopOpacity={0.08}
                        />
                      </linearGradient>

                      <linearGradient
                        id="colorEmergencies"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#991b1b"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#991b1b"
                          stopOpacity={0.08}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(220,38,38,.1)"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="time"
                      stroke="rgba(71,85,105,.5)"
                      style={{ fontSize: 10 }}
                    />

                    <YAxis
                      hide={true}
                    />

                    <Tooltip
                      cursor={false}
                      content={<></>}
                    />

                    <Area
                      type="monotone"
                      dataKey="donors"
                      stroke="#dc2626"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDonors)"
                    />

                    <Area
                      type="monotone"
                      dataKey="emergencies"
                      stroke="#991b1b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEmergencies)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                {[
                  {
                    label: 'Active Donors',
                    value: analytics.donors,
                    color: '#dc2626',
                  },
                  {
                    label: 'Emergencies',
                    value: analytics.emergencies,
                    color: '#991b1b',
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="bc-glass"
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      textAlign: 'center',
                      border: '1px solid rgba(220,38,38,.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '2px',
                          background: stat.color,
                          boxShadow: `0 0 12px ${stat.color}`,
                        }}
                      />
                      <motion.div
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: '#dc2626',
                        }}
                      >
                        {stat.value}
                      </motion.div>
                    </div>

                    <div
                      style={{
                        fontSize: 8,
                        fontWeight: 700,
                        color: 'rgba(71,85,105,.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                      }}
                    >
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.a
  href="https://www.google.com/maps/dir//BloodConnect,+Hamra,+Beirut/@33.6833468,35.5110506,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x151f1700556b765f:0x7b13b4102e84e328!2m2!1d35.4830185!2d33.896303?entry=ttu&g_ep=EgoyMDI2MDUyNy4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="bc-btn bc-btn-primary"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                }}
              >
                Visit Our Center in Hamra →
              </motion.a>
            </motion.div>
          </motion.div>
        </section>

        <section style={{ marginTop: '180px' }}>
          <CompatibilityMatrix />
        </section>

        <section style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <motion.div
            className="bc-glass-deep bc-card-hover"
            style={{
              borderRadius: 20,
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

      <motion.footer
        className="bc-glass"
        style={{
          marginTop: 'clamp(40px,5vw,80px)',
          borderTop: '1px solid rgba(180,180,180,.15)',
          background: 'rgba(255,255,255,.3)',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: 'clamp(32px,4vw,48px) clamp(14px,2.5vw,32px)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
            gap: 'clamp(20px,3vw,40px)',
            marginBottom: 'clamp(24px,3vw,40px)',
          }}>
            <motion.div whileHover={{ x: 5 }}>
              <div style={{
                fontFamily: "'Fraunces',serif",
                color: '#dc2626',
                fontSize: 'clamp(16px,2vw,22px)',
                fontWeight: 900,
                marginBottom: 12,
              }}>
                BloodConnect
              </div>
              <p style={{
                color: 'rgba(71,85,105,.7)',
                fontWeight: 500,
                lineHeight: 1.6,
                fontStyle: 'italic',
                fontSize: 'clamp(11px,1vw,12px)',
                margin: 0,
              }}>
               Building a smarter blood donation network.
              </p>
            </motion.div>
          </div>

          <div style={{ paddingTop: 16, borderTop: '1px solid rgba(91,115,151,.1)' }}>
            <p style={{
              color: 'rgba(71,85,105,.55)',
              fontSize: 'clamp(8px,.8vw,10px)',
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