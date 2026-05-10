import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-5 py-4 shadow-sm bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-2xl">🩸</span>
          <span className="text-xl font-bold text-red-600">BloodConnect</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-3 items-center">
          <button onClick={() => navigate('/how-it-works')}
            className="text-gray-600 hover:text-red-600 text-sm font-medium">How It Works</button>
          <button onClick={() => navigate('/impact')}
            className="text-gray-600 hover:text-red-600 text-sm font-medium">Impact</button>
          <button onClick={() => navigate('/emergency')}
            className="text-red-600 border border-red-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-50">
            🚨 Emergency
          </button>
          <button onClick={() => navigate('/login')}
            className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700">
            Sign In
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-gray-700 text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b shadow-sm px-5 py-4 flex flex-col gap-3 z-40">
          <button onClick={() => { navigate('/how-it-works'); setMenuOpen(false) }}
            className="text-gray-700 text-sm font-medium text-left py-2 border-b border-gray-100">
            How It Works
          </button>
          <button onClick={() => { navigate('/impact'); setMenuOpen(false) }}
            className="text-gray-700 text-sm font-medium text-left py-2 border-b border-gray-100">
            Impact
          </button>
          <button onClick={() => { navigate('/emergency'); setMenuOpen(false) }}
            className="text-red-600 text-sm font-semibold text-left py-2 border-b border-gray-100">
            🚨 Emergency
          </button>
          <button onClick={() => { navigate('/login'); setMenuOpen(false) }}
            className="bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold w-full">
            Sign In
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-50 to-white py-16 px-6 text-center">
        <p className="text-red-600 font-semibold text-xs mb-3 uppercase tracking-widest">
          Smart Donor Matching System
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
          Every Drop Counts.<br />
          <span className="text-red-600">Save a Life Today.</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-lg max-w-xl mx-auto mb-10">
          BloodConnect connects blood donors with hospitals in real-time, ensuring the right blood reaches the right patient at the right time.
        </p>
        <div className="flex flex-col items-center gap-4">
          <button onClick={() => navigate('/emergency')}
            className="w-full max-w-xs bg-white border-2 border-red-600 text-red-600 px-8 py-3 rounded-xl text-base font-semibold hover:bg-red-50">
            🚨 Emergency Help
          </button>
          <button onClick={() => navigate('/login')}
            className="w-full max-w-xs bg-red-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-red-700 shadow-lg">
            Sign In
          </button>
          <button onClick={() => navigate('/donor/register')}
            className="text-red-600 text-sm font-medium hover:underline">
            New here? Register as a donor →
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl md:text-5xl font-extrabold">1 in 3</p>
            <p className="mt-2 text-red-100 text-sm">People will need blood in their lifetime</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-extrabold">4.5M</p>
            <p className="mt-2 text-red-100 text-sm">People need blood transfusions each year</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-extrabold">1 Pint</p>
            <p className="mt-2 text-red-100 text-sm">Can save up to 3 lives</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">How BloodConnect Works</h2>
          <p className="text-gray-500 mb-10 text-sm">A simple 3-step process to save lives</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 rounded-2xl p-6">
              <p className="text-4xl mb-4">📝</p>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Register</h3>
              <p className="text-gray-500 text-sm">Sign up as a donor and complete your health screening with our AI system.</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-6">
              <p className="text-4xl mb-4">🗺️</p>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Get Matched</h3>
              <p className="text-gray-500 text-sm">Our system matches you with nearby hospitals that need your blood type.</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-6">
              <p className="text-4xl mb-4">🩸</p>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Donate</h3>
              <p className="text-gray-500 text-sm">Visit the hospital and donate. Your contribution saves up to 3 lives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-12 px-6 bg-red-50 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to save lives?</h2>
        <p className="text-gray-500 text-sm mb-6">Join BloodConnect and become someone's hero today.</p>
        <button onClick={() => navigate('/donor/register')}
          className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 text-sm">
          Register as Donor
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 px-6 text-center text-gray-500 text-sm">
        © 2026 BloodConnect. Smart Donor Matching System. All rights reserved.
      </footer>

    </div>
  )
}

export default Home