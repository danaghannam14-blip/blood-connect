import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NAV_LINKS = ['How It Works', 'Emergency', 'Blood Status']

function Home() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh', color: 'var(--text-primary)' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px',
        background: scrolled ? 'rgba(10,15,30,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #C41E3A, #9B1530)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(196,30,58,0.4)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C12 2 4 10 4 15a8 8 0 0016 0C20 10 12 2 12 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Instrument Serif', fontSize: '18px', lineHeight: 1 }}>BloodConnect</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Smart Donor Matching</div>
          </div>
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden md:flex">
          <button onClick={() => navigate('/how-it-works')} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', fontFamily: 'DM Sans', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            How It Works
          </button>
          <button onClick={() => navigate('/inventory')} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', fontFamily: 'DM Sans', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            Blood Status
          </button>
          <button onClick={() => navigate('/emergency')} style={{
            color: '#C41E3A', background: 'rgba(196,30,58,0.1)', border: '1px solid rgba(196,30,58,0.3)',
            padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'DM Sans',
            transition: 'all 0.2s', fontWeight: 500
          }}
            onMouseEnter={e => { e.target.style.background = 'rgba(196,30,58,0.2)' }}
            onMouseLeave={e => { e.target.style.background = 'rgba(196,30,58,0.1)' }}>
            Emergency
          </button>
          <button onClick={() => navigate('/login')} className="btn-crimson" style={{
            padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'DM Sans', fontWeight: 500
          }}>
            Sign In
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} className="md:hidden block">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></>}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '72px', left: 0, right: 0, zIndex: 99,
          background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          {[['How It Works', '/how-it-works'], ['Blood Status', '/inventory'], ['Emergency', '/emergency']].map(([label, path]) => (
            <button key={label} onClick={() => { navigate(path); setMenuOpen(false) }} style={{
              background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '12px 0',
              textAlign: 'left', cursor: 'pointer', fontSize: '15px', fontFamily: 'DM Sans',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>{label}</button>
          ))}
          <button onClick={() => { navigate('/login'); setMenuOpen(false) }} className="btn-crimson" style={{
            padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '15px',
            fontFamily: 'DM Sans', fontWeight: 600, marginTop: '8px'
          }}>Sign In</button>
        </div>
      )}

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background elements */}
        <div style={{
          position: 'absolute', top: '20%', right: '10%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(196,30,58,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}/>
        <div style={{
          position: 'absolute', bottom: '20%', left: '5%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(232,197,71,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}/>

        <div style={{ maxWidth: '800px', textAlign: 'center', position: 'relative' }}>
          <div className="animate-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(196,30,58,0.1)', border: '1px solid rgba(196,30,58,0.25)',
            borderRadius: '100px', padding: '6px 16px', marginBottom: '32px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C41E3A' }} className="pulse-dot"/>
            <span style={{ fontSize: '13px', color: '#E8C547', fontWeight: 500, letterSpacing: '0.05em' }}>SMART DONOR MATCHING SYSTEM</span>
          </div>

          <h1 className="animate-fade-up delay-100" style={{
            fontFamily: 'Instrument Serif', fontSize: 'clamp(48px, 8vw, 96px)',
            lineHeight: 1.05, marginBottom: '24px', fontWeight: 400
          }}>
            Every Drop<br/>
            <span className="gradient-text">Saves a Life</span>
          </h1>

          <p className="animate-fade-up delay-200" style={{
            fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7,
            maxWidth: '520px', margin: '0 auto 48px', fontWeight: 300
          }}>
            BloodConnect bridges the gap between donors and hospitals in Lebanon — intelligently, instantly, and at no cost.
          </p>

          <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/donor/register')} className="btn-crimson" style={{
              padding: '14px 32px', borderRadius: '12px', fontSize: '16px',
              fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer'
            }}>
              Register as Donor
            </button>
            <button onClick={() => navigate('/emergency')} style={{
              padding: '14px 32px', borderRadius: '12px', fontSize: '16px',
              fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'white', transition: 'all 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              Emergency Help
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', textAlign: 'center' }}>
          {[
            { value: '1 in 3', label: 'People will need blood in their lifetime' },
            { value: '4.5M', label: 'Need transfusions each year' },
            { value: '3 Lives', label: 'Saved by a single donation' },
          ].map((stat, i) => (
            <div key={i} className={`animate-fade-up delay-${(i+1)*100}`}>
              <div style={{ fontFamily: 'Instrument Serif', fontSize: '52px', color: '#C41E3A', lineHeight: 1, marginBottom: '12px' }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.15em', color: 'var(--gold)', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase' }}>The Process</div>
            <h2 style={{ fontFamily: 'Instrument Serif', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400 }}>How BloodConnect Works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { num: '01', title: 'Register & Screen', desc: 'Sign up and complete an AI-powered health screening to confirm your eligibility to donate.' },
              { num: '02', title: 'Get Matched', desc: 'Our system matches you with nearby hospitals that urgently need your blood type.' },
              { num: '03', title: 'Book & Donate', desc: 'Book your appointment slot and donate. The hospital confirms your donation instantly.' },
            ].map((step, i) => (
              <div key={i} className="glass card-hover" style={{ borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: '20px', right: '20px',
                  fontFamily: 'Instrument Serif', fontSize: '64px', color: 'rgba(255,255,255,0.03)', lineHeight: 1
                }}>{step.num}</div>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(196,30,58,0.15)', border: '1px solid rgba(196,30,58,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
                }}>
                  <span style={{ color: '#C41E3A', fontFamily: 'Instrument Serif', fontSize: '16px', fontWeight: 600 }}>{step.num}</span>
                </div>
                <h3 style={{ fontFamily: 'Instrument Serif', fontSize: '22px', marginBottom: '12px', fontWeight: 400 }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div className="glass" style={{
            borderRadius: '24px', padding: '64px 48px',
            background: 'linear-gradient(135deg, rgba(196,30,58,0.1), rgba(232,197,71,0.05))',
            border: '1px solid rgba(196,30,58,0.2)'
          }}>
            <h2 style={{ fontFamily: 'Instrument Serif', fontSize: '40px', marginBottom: '16px', fontWeight: 400 }}>Ready to save lives?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '32px', lineHeight: 1.6 }}>
              Join BloodConnect and become part of Lebanon's most connected donor network.
            </p>
            <button onClick={() => navigate('/donor/register')} className="btn-crimson" style={{
              padding: '14px 40px', borderRadius: '12px', fontSize: '16px',
              fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer'
            }}>
              Register as Donor
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px', maxWidth: '1200px', margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #C41E3A, #9B1530)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C12 2 4 10 4 15a8 8 0 0016 0C20 10 12 2 12 2z"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Instrument Serif', fontSize: '16px' }}>BloodConnect</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          © 2026 BloodConnect · Lynn Anani & Dana Ghannam
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Smart Donor Matching System · Lebanon
        </div>
      </footer>

    </div>
  )
}

export default Home