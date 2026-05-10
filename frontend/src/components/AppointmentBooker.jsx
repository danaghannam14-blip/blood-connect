import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

function AppointmentBooker({ donor, onAppointmentsChange }) {
  const [hospitals, setHospitals] = useState([])
  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState({ hospital_id: '', date: '', time: '', hour: 9, minute: 0, ampm: 'AM' })
  const [bookedSlots, setBookedSlots] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    axios.get(`${API}/api/requests/compatible/${donor.blood_type}`)
      .then(res => {
        const uniqueHospitals = []
        const seen = new Set()
        res.data.forEach(req => {
          if (!seen.has(req.hospital_id)) {
            seen.add(req.hospital_id)
            uniqueHospitals.push({
              id: req.hospital_id,
              name: req.hospital_name,
              address: req.hospital_address,
              blood_type: req.blood_type,
              quantity_needed: req.quantity_needed
            })
          }
        })
        setHospitals(uniqueHospitals)
      }).catch(console.log)
    loadAppointments()
  }, [])

  const loadAppointments = () => {
    axios.get(`${API}/api/appointments/donor/${donor.id}`)
      .then(res => {
        setAppointments(res.data)
        if (onAppointmentsChange) onAppointmentsChange(res.data)
      })
      .catch(console.log)
  }

  useEffect(() => {
    if (!form.hospital_id || !form.date) return
    axios.get(`${API}/api/appointments/slots/${form.hospital_id}/${form.date}`)
      .then(res => setBookedSlots(res.data))
      .catch(console.log)
  }, [form.hospital_id, form.date])

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [hourStr, minuteStr] = timeStr.split(':')
    let h = parseInt(hourStr)
    const m = minuteStr || '00'
    const ampm = h >= 12 ? 'PM' : 'AM'
    if (h > 12) h -= 12
    if (h === 0) h = 12
    return `${h}:${m} ${ampm}`
  }

  const handleBook = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setSubmitting(true)
    try {
      await axios.post(`${API}/api/appointments/book`, {
        donor_id: donor.id,
        hospital_id: form.hospital_id,
        appointment_date: form.date,
        appointment_time: form.time
      })
      setMessage('✅ Appointment booked! You will receive a reminder email after your appointment time.')
      setForm({ hospital_id: '', date: '', time: '', hour: 9, minute: 0, ampm: 'AM' })
      setShowForm(false)
      loadAppointments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await axios.put(`${API}/api/appointments/cancel/${id}`)
      loadAppointments()
    } catch (err) { console.log(err) }
  }

  const handleSetTime = () => {
    let h = parseInt(form.hour || 9)
    const m = parseInt(form.minute || 0)
    const ampm = form.ampm || 'AM'
    if (ampm === 'PM' && h !== 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    const timeValue = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
    const isBooked = bookedSlots.some(b => b.startsWith(timeValue.slice(0, 5)))
    if (isBooked) {
      setError('This time is already booked. Please choose another time.')
      return
    }
    setError('')
    setForm({ ...form, time: timeValue })
  }

  const today = new Date().toISOString().split('T')[0]
  const scheduled = appointments.filter(a => a.status === 'scheduled')

  return (
    <div>
      {message && <p className="text-green-600 text-sm mb-3 font-medium">{message}</p>}
      {error && <p className="text-red-600 text-sm mb-3 font-medium">{error}</p>}

      {/* Upcoming appointments */}
      {scheduled.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Upcoming Appointments</p>
          {scheduled.map(a => (
            <div key={a.id}
              className="flex justify-between items-center bg-blue-50 border border-blue-100 rounded-xl p-3 mb-2">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{a.hospital_name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(a.appointment_date).toLocaleDateString('en-GB')} at {formatTime(a.appointment_time)}
                </p>
              </div>
              <button onClick={() => handleCancel(a.id)}
                className="text-red-500 text-xs font-semibold hover:text-red-700">
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Book button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-red-200 text-red-600 py-3 rounded-xl text-sm font-semibold hover:bg-red-50">
          + Book New Appointment
        </button>
      )}

      {/* Booking form */}
      {showForm && (
        <form onSubmit={handleBook} className="flex flex-col gap-3 bg-gray-50 rounded-xl p-4 mt-2">

          {/* Hospital list */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-2 block">Select Hospital in Need</label>
            <div className="flex flex-col gap-2">
              {hospitals.length === 0 ? (
                <p className="text-gray-400 text-sm">No hospitals currently need your blood type.</p>
              ) : hospitals.map(h => (
                <button key={h.id} type="button"
                  onClick={() => setForm({ ...form, hospital_id: h.id.toString(), time: '' })}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all
                    ${form.hospital_id === h.id.toString()
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-white border-gray-200 hover:border-red-300 text-gray-800'}`}>
                  <p className="font-semibold text-sm">{h.name}</p>
                  <p className={`text-xs mt-0.5 ${form.hospital_id === h.id.toString() ? 'text-red-200' : 'text-red-500'}`}>
                    🩸 Needs {h.quantity_needed} units of {h.blood_type}
                  </p>
                  {h.address && (
                    <p className={`text-xs mt-0.5 ${form.hospital_id === h.id.toString() ? 'text-red-100' : 'text-gray-400'}`}>
                      📍 {h.address}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Date</label>
            <input type="date" min={today}
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value, time: '' })}
              className="w-full border rounded-xl p-3 text-sm focus:outline-none" required />
          </div>

          {/* Custom time picker */}
          {form.hospital_id && form.date && (
            <div>
              <label className="text-xs text-gray-500 font-medium mb-2 block">Choose Your Time</label>
              <div className="bg-white border rounded-xl p-4">
                <div className="flex items-center justify-center gap-3">

                  {/* Hour */}
                  <div className="flex flex-col items-center">
                    <button type="button"
                      onClick={() => {
                        const h = parseInt(form.hour || 9)
                        setForm({ ...form, hour: h >= 12 ? 1 : h + 1, time: '' })
                      }}
                      className="text-red-600 text-xl font-bold w-10 h-10 flex items-center justify-center hover:bg-red-50 rounded-lg">▲</button>
                    <div className="text-2xl font-extrabold text-gray-800 w-12 text-center">
                      {String(form.hour || 9).padStart(2, '0')}
                    </div>
                    <button type="button"
                      onClick={() => {
                        const h = parseInt(form.hour || 9)
                        setForm({ ...form, hour: h <= 1 ? 12 : h - 1, time: '' })
                      }}
                      className="text-red-600 text-xl font-bold w-10 h-10 flex items-center justify-center hover:bg-red-50 rounded-lg">▼</button>
                    <p className="text-xs text-gray-400 mt-1">Hour</p>
                  </div>

                  <div className="text-2xl font-extrabold text-gray-400">:</div>

                  {/* Minute */}
                  <div className="flex flex-col items-center">
                    <button type="button"
                      onClick={() => {
                        const m = parseInt(form.minute || 0)
                        setForm({ ...form, minute: m >= 55 ? 0 : m + 5, time: '' })
                      }}
                      className="text-red-600 text-xl font-bold w-10 h-10 flex items-center justify-center hover:bg-red-50 rounded-lg">▲</button>
                    <div className="text-2xl font-extrabold text-gray-800 w-12 text-center">
                      {String(form.minute || 0).padStart(2, '0')}
                    </div>
                    <button type="button"
                      onClick={() => {
                        const m = parseInt(form.minute || 0)
                        setForm({ ...form, minute: m <= 0 ? 55 : m - 5, time: '' })
                      }}
                      className="text-red-600 text-xl font-bold w-10 h-10 flex items-center justify-center hover:bg-red-50 rounded-lg">▼</button>
                    <p className="text-xs text-gray-400 mt-1">Minute</p>
                  </div>

                  <div className="text-2xl font-extrabold text-gray-400 mx-1"></div>

                  {/* AM/PM */}
                  <div className="flex flex-col items-center">
                    <button type="button"
                      onClick={() => setForm({ ...form, ampm: form.ampm === 'AM' ? 'PM' : 'AM', time: '' })}
                      className="text-red-600 text-xl font-bold w-10 h-10 flex items-center justify-center hover:bg-red-50 rounded-lg">▲</button>
                    <div className="text-2xl font-extrabold text-gray-800 w-12 text-center">
                      {form.ampm || 'AM'}
                    </div>
                    <button type="button"
                      onClick={() => setForm({ ...form, ampm: form.ampm === 'AM' ? 'PM' : 'AM', time: '' })}
                      className="text-red-600 text-xl font-bold w-10 h-10 flex items-center justify-center hover:bg-red-50 rounded-lg">▼</button>
                    <p className="text-xs text-gray-400 mt-1">AM/PM</p>
                  </div>

                </div>

                <button type="button" onClick={handleSetTime}
                  className="w-full mt-4 bg-red-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-700">
                  Set This Time
                </button>

                {form.time && (
                  <p className="text-green-600 text-xs font-semibold text-center mt-2">
                    ✓ Time set: {form.hour || 9}:{String(form.minute || 0).padStart(2, '0')} {form.ampm || 'AM'}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-1">
            <button type="button"
              onClick={() => {
                setShowForm(false)
                setError('')
                setForm({ hospital_id: '', date: '', time: '', hour: 9, minute: 0, ampm: 'AM' })
              }}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !form.time || !form.hospital_id}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>

        </form>
      )}
    </div>
  )
}

export default AppointmentBooker