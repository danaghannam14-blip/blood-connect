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
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' })
  const [adminMessage, setAdminMessage] = useState('')
  const [changePass, setChangePass] = useState({ email: '', old_password: '', new_password: '' })
  const [changePassMessage, setChangePassMessage] = useState('')
  const [editHospital, setEditHospital] = useState(null)
  const [newHospital, setNewHospital] = useState({ name: '', email: '', password: '', address: '', latitude: '', longitude: '' })
  const [hospitalMessage, setHospitalMessage] = useState('')
  const [hospitalSearch, setHospitalSearch] = useState('')

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
    setLoading(true)
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
    } finally {
      setLoading(false)
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

  const saveHospital = async (id) => {
    try {
      await axios.put(`${API}/api/admin/hospitals/${id}`, editHospital)
      setEditHospital(null)
      const res = await axios.get(`${API}/api/admin/hospitals`)
      setHospitals(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminData')
    navigate('/login')
  }

  if (!authed) return null

  const eligibleDonors = donors.filter(d => d.is_eligible).length
  const pendingRequests = requests.filter(r => r.status === 'pending').length
  const bloodTypeStats = requests.reduce((acc, r) => {
    if (r.status === 'pending') acc[r.blood_type] = (acc[r.blood_type] || 0) + 1
    return acc
  }, {})
  const mostNeeded = Object.entries(bloodTypeStats).sort((a, b) => b[1] - a[1])[0]

  const tabs = ['overview', 'donors', 'hospitals', 'requests', 'admins', 'settings']

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
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

        {/* Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize ${tab === t ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Loading spinner */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div className="flex flex-col gap-6">

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl shadow p-5 text-center">
                    <p className="text-3xl font-extrabold text-red-600">{donors.length}</p>
                    <p className="text-gray-500 text-sm mt-1">Total Donors</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-5 text-center">
                    <p className="text-3xl font-extrabold text-green-600">{eligibleDonors}</p>
                    <p className="text-gray-500 text-sm mt-1">Eligible Donors</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-5 text-center">
                    <p className="text-3xl font-extrabold text-blue-600">{hospitals.length}</p>
                    <p className="text-gray-500 text-sm mt-1">Hospitals</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow p-5 text-center">
                    <p className="text-3xl font-extrabold text-orange-500">{pendingRequests}</p>
                    <p className="text-gray-500 text-sm mt-1">Active Requests</p>
                  </div>
                </div>

                {/* Second row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Most needed blood type */}
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">🩸 Most Needed Blood Type</h3>
                    {mostNeeded ? (
                      <div className="flex items-center gap-4">
                        <div className="bg-red-50 rounded-xl p-4 text-center w-24">
                          <p className="text-3xl font-extrabold text-red-600">{mostNeeded[0]}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">{mostNeeded[1]} active request{mostNeeded[1] > 1 ? 's' : ''}</p>
                          <p className="text-gray-400 text-xs mt-1">Across all hospitals</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No active requests right now.</p>
                    )}
                  </div>

                  {/* Blood type breakdown */}
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Donors by Blood Type</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => {
                        const count = donors.filter(d => d.blood_type === bt).length
                        return (
                          <div key={bt} className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-sm font-bold text-red-600">{bt}</p>
                            <p className="text-lg font-extrabold text-gray-800">{count}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </div>

                {/* Recent requests */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">🕐 Recent Blood Requests</h3>
                  {requests.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-4xl mb-2">📭</p>
                      <p className="text-gray-400 text-sm">No blood requests yet.</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-gray-500">
                          <th className="pb-2 pr-4">Hospital</th>
                          <th className="pb-2 pr-4">Blood Type</th>
                          <th className="pb-2 pr-4">Units</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.slice(0, 5).map(r => (
                          <tr key={r.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{r.hospital_name}</td>
                            <td className="py-2 pr-4 text-red-600 font-bold">{r.blood_type}</td>
                            <td className="py-2 pr-4">{r.quantity_needed}</td>
                            <td className="py-2">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}

            {/* DONORS TAB */}
            {tab === 'donors' && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">👥 Donors ({donors.length})</h2>
                {donors.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-5xl mb-3">👤</p>
                    <p className="text-gray-400">No donors registered yet.</p>
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {/* HOSPITALS TAB */}
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
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">🏥 Hospitals ({hospitals.filter(h => h.name.toLowerCase().includes(hospitalSearch.toLowerCase())).length})</h2>
                    <input
                      placeholder="🔍 Search hospitals..."
                      value={hospitalSearch}
                      onChange={e => setHospitalSearch(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none w-64"
                    />
                  </div>
                  {hospitals.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-5xl mb-3">🏥</p>
                      <p className="text-gray-400">No hospitals added yet.</p>
                    </div>
                  ) : (
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
                          {hospitals.filter(h => h.name.toLowerCase().includes(hospitalSearch.toLowerCase())).map(h => (
                            <tr key={h.id} className="border-b last:border-0">
                              <td className="py-2 pr-4">
                                {editHospital?.id === h.id ? (
                                  <input value={editHospital.name}
                                    onChange={e => setEditHospital({...editHospital, name: e.target.value})}
                                    className="border rounded p-1 text-sm w-full" />
                                ) : h.name}
                              </td>
                              <td className="py-2 pr-4">
                                {editHospital?.id === h.id ? (
                                  <input value={editHospital.email}
                                    onChange={e => setEditHospital({...editHospital, email: e.target.value})}
                                    className="border rounded p-1 text-sm w-full" />
                                ) : h.email}
                              </td>
                              <td className="py-2 pr-4">
                                {editHospital?.id === h.id ? (
                                  <input value={editHospital.address}
                                    onChange={e => setEditHospital({...editHospital, address: e.target.value})}
                                    className="border rounded p-1 text-sm w-full" />
                                ) : h.address}
                              </td>
                              <td className="py-2 flex gap-2">
                                {editHospital?.id === h.id ? (
                                  <>
                                    <button onClick={() => saveHospital(h.id)}
                                      className="text-green-600 hover:text-green-800 text-xs font-semibold">
                                      Save
                                    </button>
                                    <button onClick={() => setEditHospital(null)}
                                      className="text-gray-500 hover:text-gray-700 text-xs font-semibold">
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => setEditHospital({...h})}
                                      className="text-blue-500 hover:text-blue-700 text-xs font-semibold">
                                      Edit
                                    </button>
                                    <button onClick={() => deleteHospital(h.id)}
                                      className="text-red-500 hover:text-red-700 text-xs font-semibold">
                                      Delete
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* REQUESTS TAB */}
            {tab === 'requests' && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">🩸 Blood Requests ({requests.length})</h2>
                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-5xl mb-3">📭</p>
                    <p className="text-gray-400">No blood requests yet.</p>
                  </div>
                ) : (
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
                            <td className="py-2 pr-4">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                {r.status}
                              </span>
                            </td>
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
                )}
              </div>
            )}

            {/* ADMINS TAB */}
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

            {/* SETTINGS TAB */}
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
          </>
        )}

      </div>
    </div>
  )
}

export default Admin