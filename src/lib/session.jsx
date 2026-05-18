// lib/session.js
import { createContext, useContext, useState, useEffect } from 'react'

const SESSION_KEY = 'triptrack_session'

const SessionContext = createContext(null)

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Discard if already expired
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => readSession())

  // Keep sessionStorage in sync whenever session changes
  useEffect(() => {
    if (session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [session])

  function startSession(data) {
    setSession(data)
  }

  function endSession() {
    setSession(null)
  }

  return (
    <SessionContext.Provider value={{ session, startSession, endSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}