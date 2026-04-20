import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-red-600 mb-4">🩸 Blood Bank System</h1>
      <p className="text-gray-600 text-lg mb-10">Connecting donors, hospitals, and patients in real-time</p>

      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={() => navigate('/donor/register')}
          className="bg-red-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-red-700">
          Register as Donor
        </button>
        <button
          onClick={() => navigate('/donor/login')}
          className="bg-white border-2 border-red-600 text-red-600 py-3 rounded-lg text-lg font-semibold hover:bg-red-50">
          Donor Login
        </button>
        <button
          onClick={() => navigate('/hospital/login')}
          className="bg-gray-800 text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-900">
          Hospital Login
        </button>
      </div>
    </div>
  )
}

export default Home