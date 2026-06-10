import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import DonorRegister from './pages/DonorRegister'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import HospitalDashboard from './pages/HospitalDashboard'
import Admin from './pages/Admin'
import Emergency from './pages/Emergency'
import HospitalPartners from './pages/HospitalPartners'
import HowItWorks from './pages/HowItWorks'
import Impact from './pages/Impact'
import Chatbot from './pages/Chatbot'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/" element={<Home />} />
        <Route path="/hospital-partners" element={<HospitalPartners />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/donor/register" element={<DonorRegister />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/donor/dashboard" element={<Dashboard />} />
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Feature Routes */}
        <Route path="/emergency" element={<Emergency />} />
        
        
      </Routes>
    </Router>
  )
}

export default App