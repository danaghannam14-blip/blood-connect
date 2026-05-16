import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import DonorRegister from './pages/DonorRegister'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import HospitalDashboard from './pages/HospitalDashboard'
import Admin from './pages/Admin'
import Emergency from './pages/Emergency'
import Inventory from './pages/Inventory'
import NotFound from './pages/NotFound'
import HospitalPartners from './pages/HospitalPartners'
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/hospital-partners" element={<HospitalPartners />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/donor/register" element={<DonorRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/donor/dashboard" element={<Dashboard />} />
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Feature Routes */}
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/inventory" element={<Inventory />} />
        
        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App