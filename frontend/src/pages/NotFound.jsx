import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-8 text-center">
      <p className="text-8xl mb-6">🩸</p>
      <h1 className="text-6xl font-extrabold text-red-600 mb-2">404</h1>
      <p className="text-xl font-semibold text-gray-700 mb-2">Page not found</p>
      <p className="text-gray-400 text-sm mb-8 max-w-sm">
        Looks like this page doesn't exist. Don't worry — your blood is still needed elsewhere.
      </p>
      <div className="flex gap-3">
        <button onClick={() => navigate('/')}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700">
          Go Home
        </button>
        <button onClick={() => navigate(-1)}
          className="bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 border border-gray-200">
          Go Back
        </button>
      </div>
    </div>
  )
}

export default NotFound