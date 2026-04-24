import { useNavigate } from 'react-router-dom'

function Impact() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-sm bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-2xl">🩸</span>
          <span className="text-xl font-bold text-red-600">BloodConnect</span>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate('/how-it-works')}
            className="text-gray-600 hover:text-red-600 text-sm font-medium">How It Works</button>
          <button onClick={() => navigate('/impact')}
            className="text-red-600 font-medium text-sm">Impact</button>
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
      <section className="bg-gradient-to-br from-red-50 to-white py-20 px-8 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Our Impact</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Every donation matters. Here's why blood donation is one of the most powerful things you can do.
        </p>
      </section>

      {/* Stats */}
      <section className="py-16 px-8 bg-red-600 text-white">
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

      {/* Facts */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Why Blood Donation Matters</h2>
          <div className="grid grid-cols-2 gap-8">

            <div className="bg-red-50 rounded-2xl p-6">
              <p className="text-3xl mb-3">🏥</p>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hospitals Always Need Blood</h3>
              <p className="text-gray-500 text-sm">Blood cannot be manufactured — it can only come from donors. Hospitals need a constant supply for surgeries, emergencies, and treatments.</p>
            </div>

            <div className="bg-red-50 rounded-2xl p-6">
              <p className="text-3xl mb-3">⏱️</p>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Blood Has a Short Shelf Life</h3>
              <p className="text-gray-500 text-sm">Red blood cells last only 42 days. Platelets last just 5 days. Regular donations are essential to maintain a stable blood supply.</p>
            </div>

            <div className="bg-red-50 rounded-2xl p-6">
              <p className="text-3xl mb-3">🌍</p>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Global Shortage</h3>
              <p className="text-gray-500 text-sm">Many countries face chronic blood shortages. In Lebanon, the demand for blood is especially high due to accidents and medical conditions.</p>
            </div>

            <div className="bg-red-50 rounded-2xl p-6">
              <p className="text-3xl mb-3">💪</p>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Safe and Easy to Donate</h3>
              <p className="text-gray-500 text-sm">Donating blood is safe, takes about 10 minutes, and your body replenishes the blood within weeks. You can donate every 3 months.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-8 bg-gray-900 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Be the Reason Someone Survives</h2>
        <p className="text-gray-400 mb-8">Register today and become a lifesaver in your community.</p>
        <button onClick={() => navigate('/donor/register')}
          className="bg-red-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-red-700">
          Register as Donor
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-6 px-8 text-center text-gray-500 text-sm">
        © 2024 BloodConnect. Smart Donor Matching System. All rights reserved.
      </footer>

    </div>
  )
}

export default Impact