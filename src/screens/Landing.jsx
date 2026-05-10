import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoom } from '../hooks/useRoom'
import { useSession } from '../lib/session'
import { generateRoomId, MEMBER_COLORS } from '../lib/utils'

const DURATIONS = [
  { label: '30 min', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
  { label: '2 hours', seconds: 7200 },
  { label: '4 hours', seconds: 14400 },
]

export default function Landing() {
  const navigate = useNavigate()
  const { createRoom, joinRoom, loading, error } = useRoom()
  const { startSession } = useSession()

  const [mode, setMode]             = useState(null) // 'create' | 'join'
  const [name, setName]             = useState('')
  const [joinId, setJoinId]         = useState('')
  const [duration, setDuration]     = useState(3600)
  const [previewId]                 = useState(generateRoomId)

  async function handleCreate() {
    if (!name.trim()) return
    const colorIndex = Math.floor(Math.random() * MEMBER_COLORS.length)
    const result = await createRoom({ durationSeconds: duration })
    if (result) {
      startSession({ ...result, name: name.trim(), colorIndex })
      navigate('/tracker')
    }
  }

  async function handleJoin() {
    if (!name.trim() || !joinId.trim()) return
    const colorIndex = Math.floor(Math.random() * MEMBER_COLORS.length)
    const result = await joinRoom({ roomId: joinId })
    if (result) {
      startSession({ ...result, name: name.trim(), colorIndex })
      navigate('/tracker')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="pt-14 pb-8 px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-2xl mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
            <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">TripTrack</h1>
        <p className="text-gray-400 text-sm mt-1">Share your location with your group</p>
      </div>

      {/* Main content */}
      <div className="flex-1 px-5 pb-10 max-w-md mx-auto w-full">

        {/* Mode selector */}
        {!mode && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left shadow-sm active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Create a room</div>
                  <div className="text-gray-400 text-xs mt-0.5">Start a new session for your group</div>
                </div>
                <svg className="w-4 h-4 text-gray-300 ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left shadow-sm active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Join a room</div>
                  <div className="text-gray-400 text-xs mt-0.5">Enter with a room ID from your group</div>
                </div>
                <svg className="w-4 h-4 text-gray-300 ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>
          </div>
        )}

        {/* Create form */}
        {mode === 'create' && (
          <div className="space-y-4">
            <button onClick={() => setMode(null)} className="flex items-center gap-1 text-gray-400 text-sm mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back
            </button>

            {/* Room ID preview */}
            <div className="bg-emerald-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-emerald-600 font-medium mb-1">Your room ID</p>
              <p className="text-3xl font-mono font-bold tracking-widest text-emerald-700">{previewId}</p>
              <p className="text-xs text-emerald-500 mt-1">Share this with your group</p>
            </div>

            {/* Name input */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Aryan"
                maxLength={20}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />
            </div>

            {/* Duration picker */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Session duration</label>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.seconds}
                    onClick={() => setDuration(d.seconds)}
                    className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                      duration === d.seconds
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-500'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-xs bg-red-50 rounded-xl px-4 py-2">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white py-4 rounded-2xl text-sm font-semibold transition-colors mt-2"
            >
              {loading ? 'Starting...' : 'Start sharing →'}
            </button>
          </div>
        )}

        {/* Join form */}
        {mode === 'join' && (
          <div className="space-y-4">
            <button onClick={() => setMode(null)} className="flex items-center gap-1 text-gray-400 text-sm mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back
            </button>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Priya"
                maxLength={20}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Room ID</label>
              <input
                type="text"
                value={joinId}
                onChange={e => setJoinId(e.target.value.toUpperCase())}
                placeholder="e.g. TRP-R2RD"
                maxLength={8}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent uppercase"
              />
            </div>

            {error && <p className="text-red-500 text-xs bg-red-50 rounded-xl px-4 py-2">{error}</p>}

            <button
              onClick={handleJoin}
              disabled={loading || !name.trim() || !joinId.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white py-4 rounded-2xl text-sm font-semibold transition-colors mt-2"
            >
              {loading ? 'Joining...' : 'Join room →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}