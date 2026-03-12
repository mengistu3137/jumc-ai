import React from 'react'

export default function MicButton({ listening, onToggle, processing }) {
  return (
    <div className="flex items-center justify-center p-6">
      <button
        aria-label="Toggle microphone"
        onClick={onToggle}
        className={`w-28 h-28 rounded-full shadow-lg flex items-center justify-center transition-transform transform ${listening ? 'scale-105' : ''} ${processing ? 'opacity-60' : 'opacity-100'}`}
      >
        <div className={`${listening ? 'bg-red-500' : 'bg-jumc'} w-24 h-24 rounded-full flex items-center justify-center`}> 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a2 2 0 00-2 2v6a2 2 0 104 0V4a2 2 0 00-2-2z" />
            <path d="M4 10a6 6 0 0012 0h-2a4 4 0 11-8 0H4z" />
          </svg>
        </div>
      </button>
    </div>
  )
}
