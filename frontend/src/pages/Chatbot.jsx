import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const questions = [
  { key: 'feeling_healthy', text: 'Are you feeling healthy today?' },
  { key: 'chronic_illness', text: 'Do you have any chronic illnesses?' },
  { key: 'recent_surgery', text: 'Have you had any surgeries in the last 6 months?' },
  { key: 'medications', text: 'Are you currently taking any medications?' },
  { key: 'recent_travel', text: 'Have you traveled outside the country in the last month?' }
]

function Chatbot() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! I will ask you a few health questions to check your eligibility to donate blood.' },
    { from: 'bot', text: questions[0].text }
  ])
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dots, setDots] = useState('.')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!loading) return
    let count = 1
    const interval = setInterval(() => {
      count = count >= 3 ? 1 : count + 1
      setDots('.'.repeat(count))
    }, 600)
    return () => clearInterval(interval)
  }, [loading])

  const handleAnswer = async (answer) => {
    const currentQuestion = questions[step]
    const newAnswers = { ...answers, [currentQuestion.key]: answer }
    setAnswers(newAnswers)

    setMessages(prev => [...prev, { from: 'user', text: answer }])

    if (step + 1 < questions.length) {
      setStep(step + 1)
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: questions[step + 1].text }])
      }, 500)
    } else {
      setLoading(true)

      const donorData = JSON.parse(localStorage.getItem('donorData'))
      try {
        const res = await axios.post('https://blood-bank-eqyr.onrender.com/api/chatbot/screen', {
          donor_id: donorData.id,
          answers: newAnswers
        })

        // Keep analyzing visible for at least 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000))

        setLoading(false)

        const eligible = res.data.eligible
        const reason = res.data.reason
        const resultText = eligible
          ? `✅ You are eligible to donate blood!`
          : `❌ You are not eligible to donate at this time: ${reason}`

        setMessages(prev => [...prev, { from: 'bot', text: resultText }])
      } catch (err) {
        setLoading(false)
        setMessages(prev => [...prev, { from: 'bot', text: 'Something went wrong. Please try again.' }])
      }
      setDone(true)
    }
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md flex flex-col" style={{height: '85vh'}}>
        <div className="bg-red-600 text-white p-4 rounded-t-2xl">
          <h2 className="text-xl font-bold">🩺 Health Screening</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl px-4 py-2 max-w-xs text-sm ${msg.from === 'user' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-500 rounded-2xl px-4 py-3 text-sm italic">
                🤔 Analyzing your answers{dots}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t">
          {!done && !loading && (
            <div className="flex gap-2 justify-center">
              <button onClick={() => handleAnswer('yes')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600">
                Yes
              </button>
              <button onClick={() => handleAnswer('no')}
                className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600">
                No
              </button>
            </div>
          )}
          {done && (
            <button onClick={() => navigate('/donor/dashboard')}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700">
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chatbot