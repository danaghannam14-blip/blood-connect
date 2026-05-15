import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import DonorRegister from './pages/DonorRegister'
import Dashboard from './pages/Dashboard'
import Chatbot from './pages/Chatbot'
import Emergency from './pages/Emergency'
import HospitalDashboard from './pages/HospitalDashboard'
import Admin from './pages/Admin'
import HowItWorks from './pages/HowItWorks'
import Impact from './pages/Impact'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import Inventory from './pages/Inventory'

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/donor/register" element={<DonorRegister />} />
        <Route path="/donor/dashboard" element={<Dashboard />} />
        <Route path="/donor/chatbot" element={<Chatbot />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App