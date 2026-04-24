import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-sm bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🩸</span>
          <span className="text-xl font-bold text-red-600">BloodConnect</span>
        </div>
        <div className="flex gap-4 items-center">
          <a href="/how-it-works" className="text-gray-600 hover:text-red-600 text-sm font-medium">How It Works</a>
<a href="/impact" className="text-gray-600 hover:text-red-600 text-sm font-medium">Impact</a>
          <button onClick={() => navigate('/emergency')}
            className="text-red-600 border border-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50">
            🚨 Emergency
          </button>
          <button onClick={() => navigate('/login')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-50 to-white py-24 px-8 text-center">
        <p className="text-red-600 font-semibold text-sm mb-3 uppercase tracking-widest">Smart Donor Matching System</p>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Every Drop Counts.<br />
          <span className="text-red-600">Save a Life Today.</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10">
          BloodConnect connects blood donors with hospitals in real-time, ensuring the right blood reaches the right patient at the right time.
        </p>
        <button onClick={() => navigate('/emergency')}
          className="bg-white border-2 border-red-600 text-red-600 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-red-50">
          🚨 Emergency Help
        </button>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-8 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-5xl font-extrabold">1 in 3</p>
            <p className="mt-2 text-red-100">People will need blood in their lifetime</p>
          </div>
          <div>
            <p className="text-5xl font-extrabold">4.5M</p>
            <p className="mt-2 text-red-100">People need blood transfusions each year</p>
          </div>
          <div>
            <p className="text-5xl font-extrabold">1 Pint</p>
            <p className="mt-2 text-red-100">Can save up to 3 lives</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">How BloodConnect Works</h2>
          <p className="text-gray-500 mb-12">A simple 3-step process to save lives</p>
          <div className="grid grid-cols-3 gap-8">
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

      {/* Footer */}
      <footer className="bg-gray-900 py-6 px-8 text-center text-gray-500 text-sm">
        © 2024 BloodConnect. Smart Donor Matching System. All rights reserved.
      </footer>

    </div>
  )
}

export default Home