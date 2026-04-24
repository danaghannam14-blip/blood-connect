import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DonorRegister from './pages/DonorRegister'
import DonorLogin from './pages/DonorLogin'
import Dashboard from './pages/Dashboard'
import Chatbot from './pages/Chatbot'
import DonorMap from './pages/DonorMap'
import Emergency from './pages/Emergency'
import HospitalLogin from './pages/HospitalLogin'
import HospitalDashboard from './pages/HospitalDashboard'
import Admin from './pages/Admin'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donor/register" element={<DonorRegister />} />
        <Route path="/donor/login" element={<DonorLogin />} />
        <Route path="/donor/dashboard" element={<Dashboard />} />
        <Route path="/donor/chatbot" element={<Chatbot />} />
        <Route path="/donor/map" element={<DonorMap />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/hospital/login" element={<HospitalLogin />} />     
      <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
      <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App