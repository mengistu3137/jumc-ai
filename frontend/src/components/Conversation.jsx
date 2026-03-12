import React from 'react'

export default function Conversation({ messages }) {
  return (
    <div className="p-4 overflow-auto flex-1">
      <ul className="space-y-3">
        {messages.map((m, i) => (
          <li key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user' ? 'bg-jumc text-white' : 'bg-gray-100 text-gray-900'}`}>
              <div className="text-sm">{m.text}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
