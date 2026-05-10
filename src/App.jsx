import { useRoom } from './hooks/useRoom'
import { useSession } from './lib/session'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './screens/Landing'
import Tracker from './screens/Tracker'

const DEV_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  .dev-root {
    min-height: 100svh;
    background: #060810;
    font-family: 'Outfit', sans-serif;
    color: #f0f2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  .dev-orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(80px);
    opacity: 0.15;
  }
  .dev-orb-1 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #00c8ff 0%, transparent 70%);
    top: -130px; left: -100px;
    animation: devOf1 14s ease-in-out infinite;
  }
  .dev-orb-2 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, #6c48ff 0%, transparent 70%);
    bottom: -80px; right: -80px;
    animation: devOf2 18s ease-in-out infinite;
  }
  @keyframes devOf1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(28px,36px)} }
  @keyframes devOf2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-22px,-28px)} }

  .dev-grain {
    position: fixed; inset: 0; pointer-events: none; z-index: 1;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px 180px;
  }

  .dev-card {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Session pill */
  .dev-session-box {
    background: rgba(0,200,255,0.06);
    border: 1px solid rgba(0,200,255,0.18);
    border-radius: 20px;
    padding: 20px 22px;
    animation: devFadeIn 0.4s ease both;
  }
  .dev-session-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(0,200,255,0.12);
    border: 1px solid rgba(0,200,255,0.25);
    border-radius: 100px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #00c8ff;
    margin-bottom: 14px;
  }
  .dev-session-badge::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #00c8ff;
    box-shadow: 0 0 6px #00c8ff;
    animation: devBlink 1.4s ease-in-out infinite;
  }
  @keyframes devBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .dev-room-id {
    font-family: 'Space Mono', monospace;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: #00c8ff;
    text-shadow: 0 0 20px rgba(0,200,255,0.4);
    margin-bottom: 10px;
  }
  .dev-meta {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .dev-meta span { font-family: 'Space Mono', monospace; font-size: 11px; color: rgba(0,200,255,0.45); }

  /* No session */
  .dev-no-session {
    text-align: center;
    padding: 20px;
    background: rgba(255,255,255,0.03);
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 20px;
    font-size: 13px;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.02em;
  }

  /* Buttons */
  .dev-btn {
    width: 100%;
    padding: 16px;
    border-radius: 16px;
    border: none;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: opacity 0.2s, transform 0.15s;
  }
  .dev-btn:active:not(:disabled) { transform: scale(0.97); }
  .dev-btn:disabled { opacity: 0.35; cursor: default; }
  .dev-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
    pointer-events: none;
  }

  .dev-btn-create {
    background: linear-gradient(135deg, #00b8e8 0%, #0072ff 100%);
    color: #fff;
    box-shadow: 0 8px 32px rgba(0,114,255,0.35);
  }
  .dev-btn-join {
    background: linear-gradient(135deg, #6c48ff 0%, #c026d3 100%);
    color: #fff;
    box-shadow: 0 8px 32px rgba(108,72,255,0.35);
  }

  /* Error */
  .dev-error {
    background: rgba(220,50,50,0.1);
    border: 1px solid rgba(220,50,50,0.22);
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 13px;
    color: #ff7070;
    text-align: center;
  }

  @keyframes devFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

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
    <>
      <style>{DEV_STYLES}</style>

      {/* Router: full-screen, renders Landing / Tracker */}
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<Landing />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="*"        element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>

      {/* Dev debug panel — overlaid in bottom-right during development */}
      {import.meta.env.DEV && (
        <div style={{
          position: 'fixed', bottom: 24, right: 16,
          width: 300, zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>

         
        </div>
      )}
    </>
  )
}

export default App