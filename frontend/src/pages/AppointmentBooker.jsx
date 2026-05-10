import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://blood-bank-eqyr.onrender.com'

const TIME_SLOTS = [
  { label: '9:00 AM', value: '09:00:00' },
  { label: '9:30 AM', value: '09:30:00' },
  { label: '10:00 AM', value: '10:00:00' },
  { label: '10:30 AM', value: '10:30:00' },
  { label: '11:00 AM', value: '11:00:00' },
  { label: '11:30 AM', value: '11:30:00' },
  { label: '12:00 PM', value: '12:00:00' },
  { label: '12:30 PM', value: '12:30:00' },
  { label: '1:00 PM', value: '13:00:00' },
  { label: '1:30 PM', value: '13:30:00' },
  { label: '2:00 PM', value: '14:00:00' },
  { label: '2:30 PM', value: '14:30:00' },
  { label: '3:00 PM', value: '15:00:00' },
  { label: '3:30 PM', value: '15:30:00' },
  { label: '4:00 PM', value: '16:00:00' },
]

function AppointmentBooker({ donor }) {
  const [hospitals, setHospitals] = useState([])
  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState({ hospital_id: '', date: '', time: '' })
  const [bookedSlots, setBookedSlots] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [hospitalSearch, setHospitalSearch] = useState('')

  useEffect(() => {
    axios.get(`${API}/api/hospitals/all`).then(res => setHospitals(res.data)).catch(console.log)
    loadAppointments()
  }, [])

  const loadAppointments = () => {
    axios.get(`${API}/api/appointments/donor/${donor.id}`)
      .then(res => setAppointments(res.data))
      .catch(console.log)
  }

  useEffect(() => {
    if (!form.hospital_id || !form.date) return
    axios.get(`${API}/api/appointments/slots/${form.hospital_id}/${form.date}`)
      .then(res => setBookedSlots(res.data))
      .catch(console.log)
  }, [form.hospital_id, form.date])

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
      setForm({ hospital_id: '', date: '', time: '' })
      setHospitalSearch('')
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

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const slot = TIME_SLOTS.find(s => s.value === timeStr || s.value.startsWith(timeStr))
    return slot ? slot.label : timeStr
  }

  const today = new Date().toISOString().split('T')[0]
  const scheduled = appointments.filter(a => a.status === 'scheduled')
  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(hospitalSearch.toLowerCase())
  )

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

          {/* Hospital search */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Search Hospital</label>
            <input
              type="text"
              placeholder="Type hospital name..."
              value={hospitalSearch}
              onChange={e => {
                setHospitalSearch(e.target.value)
                setForm({...form, hospital_id: '', time: ''})
              }}
              className="w-full border rounded-xl p-3 text-sm focus:outline-none mb-2"
            />
            {hospitalSearch && filteredHospitals.length > 0 && !form.hospital_id && (
              <div className="border rounded-xl overflow-hidden bg-white max-h-40 overflow-y-auto">
                {filteredHospitals.slice(0, 8).map(h => (
                  <button key={h.id} type="button"
                    onClick={() => {
                      setForm({...form, hospital_id: h.id.toString(), time: ''})
                      setHospitalSearch(h.name)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 border-b last:border-0">
                    {h.name}
                  </button>
                ))}
              </div>
            )}
            {form.hospital_id && (
              <p className="text-xs text-green-600 font-medium">✓ Hospital selected</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Date</label>
            <input type="date" min={today}
              value={form.date}
              onChange={e => setForm({...form, date: e.target.value, time: ''})}
              className="w-full border rounded-xl p-3 text-sm focus:outline-none" required />
          </div>

          {/* Time slots */}
          {form.hospital_id && form.date && (
            <div>
              <label className="text-xs text-gray-500 font-medium mb-2 block">
                Available Time Slots
                <span className="text-gray-400 ml-1">(grayed = booked)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => {
                  const isBooked = bookedSlots.some(b =>
                    b === slot.value || b.startsWith(slot.value.slice(0, 5))
                  )
                  const isSelected = form.time === slot.value
                  return (
                    <button key={slot.value} type="button"
                      disabled={isBooked}
                      onClick={() => !isBooked && setForm({...form, time: slot.value})}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all
                        ${isBooked
                          ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-red-300'}`}>
                      {slot.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-1">
            <button type="button"
              onClick={() => { setShowForm(false); setError(''); setHospitalSearch(''); setForm({ hospital_id: '', date: '', time: '' }) }}
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