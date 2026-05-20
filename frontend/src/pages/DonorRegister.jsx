// UPDATE: Replace the handleScanId function with this one to support blood type extraction

const handleScanId = async () => {
  if (!idFile) { 
    setIdMessage('Please select your ID photo first.') 
    setIdStatus('failed')
    return 
  }
  setIdStatus('scanning')
  setIdMessage('')
  try {
    const formData = new FormData()
    formData.append('id_photo', idFile)
    
    const res = await axios.post(`${API}/api/idcheck/scan`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000
    })
    
    if (res.data.eligible) {
      setIdStatus('verified')
      setIdMessage(`✓ Age verified! You are ${res.data.age} years old.`)
      setForm(prev => ({ 
        ...prev, 
        date_of_birth: res.data.date_of_birth,
        // Auto-fill blood type if detected from ID back
        blood_type: res.data.blood_type || prev.blood_type
      }))
      
      // Show blood type info if found on ID
      if (res.data.blood_type) {
        setIdMessage(`✓ Age verified! You are ${res.data.age} years old.\n🩸 Blood type detected: ${res.data.blood_type}`)
      }
    } else {
      setIdStatus('failed')
      setIdMessage(res.data.message || 'You must be 18 years or older to donate.')
    }
  } catch (err) {
    setIdStatus('failed')
    const errorMsg = err.response?.data?.message || err.message || 'Could not scan ID. Please try a clearer photo.'
    setIdMessage(errorMsg)
    console.error('ID scan error:', err)
  }
}