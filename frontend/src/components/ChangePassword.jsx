import { useState } from 'react'

function ChangePassword({ onSubmit }) {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match')
      return
    }

    try {
      await onSubmit(form.old_password, form.new_password)
      setMessage('Password changed successfully!')
      setForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input type="password" placeholder="Current password" value={form.old_password}
        onChange={e => setForm({...form, old_password: e.target.value})}
        className="border rounded-lg p-3 focus:outline-none text-sm" required />
      <input type="password" placeholder="New password" value={form.new_password}
        onChange={e => setForm({...form, new_password: e.target.value})}
        className="border rounded-lg p-3 focus:outline-none text-sm" required />
      <input type="password" placeholder="Confirm new password" value={form.confirm_password}
        onChange={e => setForm({...form, confirm_password: e.target.value})}
        className="border rounded-lg p-3 focus:outline-none text-sm" required />
      <button type="submit"
        className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 text-sm">
        Change Password
      </button>
    </form>
  )
}

export default ChangePassword