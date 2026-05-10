import { createContext, useContext, useState } from 'react'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null)

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