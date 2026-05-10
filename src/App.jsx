import { useRoom } from './hooks/useRoom'
import { useSession } from './lib/session'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './screens/Landing'
import Tracker from './screens/Tracker'
function App() {
  const { createRoom, joinRoom, loading, error } = useRoom()
  const { session, startSession } = useSession()

  async function handleCreate() {
    const result = await createRoom({ durationSeconds: 3600 })
    if (result) {
      startSession({ ...result, name: 'Test User', colorIndex: 0 })
      console.log('Session started:', result)
    }
  }

  async function handleJoin() {
    const id = prompt('Enter room ID:')
    if (!id) return
    const result = await joinRoom({ roomId: id })
    if (result) {
      startSession({ ...result, name: 'Guest User', colorIndex: 1 })
      console.log('Joined session:', result)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center space-y-4 w-full max-w-sm">

        {session ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-2">
            <div className="text-emerald-600 font-medium text-sm">Session active</div>
            <div className="text-2xl font-mono font-bold tracking-widest text-gray-800">
              {session.roomId}
            </div>
            <div className="text-gray-400 text-xs">User ID: {session.userId}</div>
            <div className="text-gray-400 text-xs">
              Expires: {new Date(session.expiresAt).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No active session</p>
        )}
        <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Landing />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="*"        element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating...' : 'Create room'}
        </button>

        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
        >
          Join room
        </button>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>
        )}
      </div>
    </div>
    
  )
}

export default App