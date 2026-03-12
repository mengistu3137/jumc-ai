import React, { useState } from 'react'
import Conversation from './components/Conversation'
import MicButton from './components/MicButton'

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Welcome to JUMC AI Assistant. Tap the microphone and speak.' }
  ])
  const [listening, setListening] = useState(false)
  const [processing, setProcessing] = useState(false)

  function toggleMic() {
    // For STEP 2 we only toggle UI states. Actual capture added in STEP 3.
    if (processing) return
    setListening((s) => {
      const next = !s
      if (!next) {
        // simulate an interim user message when stopping
        setMessages((m) => [...m, { role: 'user', text: '...spoken command (simulated)'}])
        setProcessing(true)
        setTimeout(() => {
          setMessages((m) => [...m, { role: 'assistant', text: 'Processing complete (simulated).'}])
          setProcessing(false)
        }, 1000)
      }
      return next
    })
  }

  return (
    <div className="app-shell bg-white flex flex-col h-full shadow-md">
      <header className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-jumc">JUMC AI Assistant</h1>
          <div className="text-sm text-gray-500">Listening: {listening ? 'Yes' : 'No'}</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Conversation messages={messages} />
        <div className="p-2">
          <div className="text-center text-xs text-gray-500">Status: {processing ? 'Processing' : listening ? 'Listening' : 'Idle'}</div>
        </div>
        <div className="border-t border-gray-100">
          <MicButton listening={listening} onToggle={toggleMic} processing={processing} />
        </div>
      </main>
    </div>
  )
}
