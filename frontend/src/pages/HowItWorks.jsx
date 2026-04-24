import { useNavigate } from 'react-router-dom'

function HowItWorks() {
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
            className="text-red-600 font-medium text-sm">How It Works</button>
          <button onClick={() => navigate('/impact')}
            className="text-gray-600 hover:text-red-600 text-sm font-medium">Impact</button>
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
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">How BloodConnect Works</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          A simple, smart, and life-saving process connecting donors with hospitals in real-time.
        </p>
      </section>

      {/* Steps */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">

          <div className="flex gap-6 items-start">
            <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shrink-0">1</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Register as a Donor</h3>
              <p className="text-gray-500">Create your account by providing your personal information, blood type, and contact details. Registration takes less than 2 minutes.</p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shrink-0">2</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Complete AI Health Screening</h3>
              <p className="text-gray-500">Answer a few health questions through our AI-powered chatbot. The system instantly determines your eligibility to donate blood safely.</p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shrink-0">3</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Get Matched with Nearby Hospitals</h3>
              <p className="text-gray-500">Our smart matching system finds hospitals near you that urgently need your blood type. View them on an interactive map.</p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shrink-0">4</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Donate and Save Lives</h3>
              <p className="text-gray-500">Visit the matched hospital and donate. One pint of blood can save up to 3 lives. Track your donation history through your dashboard.</p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shrink-0">🚨</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Emergency Blood Search</h3>
              <p className="text-gray-500">No login needed. Anyone in an emergency can instantly find the nearest hospital with available blood using our emergency map.</p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-8 bg-red-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Save a Life?</h2>
        <p className="text-red-100 mb-8">Join thousands of donors making a difference every day.</p>
        <button onClick={() => navigate('/donor/register')}
          className="bg-white text-red-600 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-red-50">
          Register as Donor
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 px-8 text-center text-gray-500 text-sm">
        © 2024 BloodConnect. Smart Donor Matching System. All rights reserved.
      </footer>

    </div>
  )
}

export default HowItWorks