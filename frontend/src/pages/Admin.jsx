import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

function Admin() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [donors, setDonors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [requests, setRequests] = useState([])
  const [admins, setAdmins] = useState([])
  const [tab, setTab] = useState('donors')
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' })
  const [adminMessage, setAdminMessage] = useState('')
  const [changePass, setChangePass] = useState({ email: '', old_password: '', new_password: '' })
  const [changePassMessage, setChangePassMessage] = useState('')
  const [newHospital, setNewHospital] = useState({ name: '', email: '', password: '', address: '', latitude: '', longitude: '' })
  const [hospitalMessage, setHospitalMessage] = useState('')

  useEffect(() => {
    const adminData = localStorage.getItem('adminData')
    if (adminData) {
      setAuthed(true)
      loadData()
    } else {
      navigate('/login')
    }
  }, [])

  const loadData = async () => {
    try {
      const [d, h, r, a] = await Promise.all([
        axios.get(`${API}/api/admin/donors`),
        axios.get(`${API}/api/admin/hospitals`),
        axios.get(`${API}/api/admin/requests`),
        axios.get(`${API}/api/admin/admins`)
      ])
      setDonors(d.data)
      setHospitals(h.data)
      setRequests(r.data)
      setAdmins(a.data)
    } catch (err) {
      console.log(err)
    }
  }

  const deleteDonor = async (id) => {
    if (!window.confirm('Delete this donor?')) return
    await axios.delete(`${API}/api/admin/donors/${id}`)
    setDonors(donors.filter(d => d.id !== id))
  }

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return
    await axios.delete(`${API}/api/admin/requests/${id}`)
    setRequests(requests.filter(r => r.id !== id))
  }

  const deleteAdmin = async (id) => {
    if (!window.confirm('Delete this admin?')) return
    await axios.delete(`${API}/api/admin/admins/${id}`)
    setAdmins(admins.filter(a => a.id !== id))
  }

  const addAdmin = async (e) => {
    e.preventDefault()
    setAdminMessage('')
    try {
      await axios.post(`${API}/api/admin/add-admin`, newAdmin)
      setAdminMessage('Admin added successfully!')
      setNewAdmin({ email: '', password: '' })
      const res = await axios.get(`${API}/api/admin/admins`)
      setAdmins(res.data)
    } catch (err) {
      setAdminMessage(err.response?.data?.message || 'Failed to add admin')
    }
  }

  const addHospital = async (e) => {
    e.preventDefault()
    setHospitalMessage('')
    try {
      await axios.post(`${API}/api/admin/add-hospital`, newHospital)
      setHospitalMessage('Hospital added successfully!')
      setNewHospital({ name: '', email: '', password: '', address: '', latitude: '', longitude: '' })
      const res = await axios.get(`${API}/api/admin/hospitals`)
      setHospitals(res.data)
    } catch (err) {
      setHospitalMessage(err.response?.data?.message || 'Failed to add hospital')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setChangePassMessage('')
    try {
      const res = await axios.put(`${API}/api/admin/change-password`, changePass)
      setChangePassMessage(res.data.message)
      setChangePass({ email: '', old_password: '', new_password: '' })
    } catch (err) {
      setChangePassMessage(err.response?.data?.message || 'Failed to change password')
    }
  }
const deleteHospital = async (id) => {
  if (!window.confirm('Delete this hospital?')) return
  await axios.delete(`${API}/api/admin/hospitals/${id}`)
  setHospitals(hospitals.filter(h => h.id !== id))
}
  const handleLogout = () => {
    localStorage.removeItem('adminData')
    navigate('/login')
  }

  if (!authed) return null

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <h1 className="text-3xl font-bold text-gray-800">BloodConnect Admin</h1>
          </div>
          <button onClick={handleLogout}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">
            Logout
          </button>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          {['donors', 'hospitals', 'requests', 'admins', 'settings'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize ${tab === t ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'donors' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">👥 Donors ({donors.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Blood Type</th>
                    <th className="pb-2 pr-4">Eligible</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map(d => (
                    <tr key={d.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{d.full_name}</td>
                      <td className="py-2 pr-4">{d.email}</td>
                      <td className="py-2 pr-4 text-red-600 font-bold">{d.blood_type}</td>
                      <td className="py-2 pr-4">{d.is_eligible ? '✅' : '❌'}</td>
                      <td className="py-2">
                        <button onClick={() => deleteDonor(d.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'hospitals' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-2">➕ Add New Hospital</h2>
              <p className="text-gray-500 text-sm mb-4">Add a hospital so it can log in and post blood requests.</p>
              {hospitalMessage && (
                <p className={`mb-4 text-sm ${hospitalMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {hospitalMessage}
                </p>
              )}
              <form onSubmit={addHospital} className="grid grid-cols-2 gap-4">
                <input placeholder="Hospital Name" value={newHospital.name}
                  onChange={e => setNewHospital({...newHospital, name: e.target.value})}
                  className="border rounded-lg p-3 focus:outline-none text-sm" required />
                <input placeholder="email@hospital.com" value={newHospital.email}
                
                  onChange={e => setNewHospital({...newHospital, email: e.target.value})}
                  className="border rounded-lg p-3 focus:outline-none text-sm" required />
                <input type="password" placeholder="Password" value={newHospital.password}
                  onChange={e => setNewHospital({...newHospital, password: e.target.value})}
                  className="border rounded-lg p-3 focus:outline-none text-sm" required />
                <input placeholder="Address" value={newHospital.address}
                  onChange={e => setNewHospital({...newHospital, address: e.target.value})}
                  className="border rounded-lg p-3 focus:outline-none text-sm" />
                <input placeholder="Latitude (e.g. 33.8938)" value={newHospital.latitude}
                  onChange={e => setNewHospital({...newHospital, latitude: e.target.value})}
                  className="border rounded-lg p-3 focus:outline-none text-sm" />
                <input placeholder="Longitude (e.g. 35.5018)" value={newHospital.longitude}
                  onChange={e => setNewHospital({...newHospital, longitude: e.target.value})}
                  className="border rounded-lg p-3 focus:outline-none text-sm" />
                <button type="submit"
                  className="col-span-2 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 text-sm">
                  Add Hospital
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">🏥 Hospitals ({hospitals.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                 <thead>
  <tr className="border-b text-left text-gray-500">
    <th className="pb-2 pr-4">Name</th>
    <th className="pb-2 pr-4">Email</th>
    <th className="pb-2 pr-4">Address</th>
    <th className="pb-2">Action</th>
  </tr>
</thead>
<tbody>
  {hospitals.map(h => (
    <tr key={h.id} className="border-b last:border-0">
      <td className="py-2 pr-4">{h.name}</td>
      <td className="py-2 pr-4">{h.email}</td>
      <td className="py-2 pr-4">{h.address}</td>
      <td className="py-2">
        <button onClick={() => deleteHospital(h.id)}
          className="text-red-500 hover:text-red-700 text-xs font-semibold">
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🩸 Blood Requests ({requests.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Hospital</th>
                    <th className="pb-2 pr-4">Blood Type</th>
                    <th className="pb-2 pr-4">Units</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{r.hospital_name}</td>
                      <td className="py-2 pr-4 text-red-600 font-bold">{r.blood_type}</td>
                      <td className="py-2 pr-4">{r.quantity_needed}</td>
                      <td className="py-2 pr-4">{r.status}</td>
                      <td className="py-2">
                        <button onClick={() => deleteRequest(r.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'admins' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-2">➕ Add New Admin</h2>
              <p className="text-gray-500 text-sm mb-4">Admin email must end with @bloodconnect.com</p>
              {adminMessage && (
                <p className={`mb-4 text-sm ${adminMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {adminMessage}
                </p>
              )}
              <form onSubmit={addAdmin} className="flex gap-4">
                <input placeholder="email@bloodconnect.com" value={newAdmin.email}
                  onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="border rounded-lg p-3 flex-1 focus:outline-none text-sm" required />
                <input type="password" placeholder="Password" value={newAdmin.password}
                  onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="border rounded-lg p-3 flex-1 focus:outline-none text-sm" required />
                <button type="submit"
                  className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 text-sm">
                  Add Admin
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">🔐 Admins ({admins.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 pr-4">Username</th>
                      <th className="pb-2 pr-4">Email</th>
                      <th className="pb-2 pr-4">Created At</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(a => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{a.username}</td>
                        <td className="py-2 pr-4 text-gray-500">{a.email}</td>
                        <td className="py-2 pr-4 text-gray-500">{new Date(a.created_at).toLocaleDateString()}</td>
                        <td className="py-2">
                          <button onClick={() => deleteAdmin(a.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔑 Change Password</h2>
            {changePassMessage && (
              <p className={`mb-4 text-sm ${changePassMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {changePassMessage}
              </p>
            )}
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md">
              <input placeholder="Your email (@bloodconnect.com)" value={changePass.email}
                onChange={e => setChangePass({...changePass, email: e.target.value})}
                className="border rounded-lg p-3 focus:outline-none text-sm" required />
              <input type="password" placeholder="Old password" value={changePass.old_password}
                onChange={e => setChangePass({...changePass, old_password: e.target.value})}
                className="border rounded-lg p-3 focus:outline-none text-sm" required />
              <input type="password" placeholder="New password" value={changePass.new_password}
                onChange={e => setChangePass({...changePass, new_password: e.target.value})}
                className="border rounded-lg p-3 focus:outline-none text-sm" required />
              <button type="submit"
                className="bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 text-sm">
                Change Password
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

export default Admin