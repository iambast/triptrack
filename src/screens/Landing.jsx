import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoom } from '../hooks/useRoom'
import { useSession } from '../lib/session'
import { generateRoomId, MEMBER_COLORS } from '../lib/utils'

const DURATIONS = [
  { label: '30m', seconds: 1800 },
  { label: '1h',  seconds: 3600 },
  { label: '2h',  seconds: 7200 },
  { label: '4h',  seconds: 14400 },
]

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  .tt-root {
    min-height: 100svh;
    background: #FFF8F0;
    font-family: 'DM Sans', sans-serif;
    color: #1A1008;
    overflow-x: hidden;
    position: relative;
  }

  .tt-doodle-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .tt-panel {
    animation: panelIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes panelIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes pinBounce {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  .pin-icon { animation: pinBounce 2.8s ease-in-out infinite; display: block; }

  @keyframes float {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  @keyframes radarPulse {
    0% { transform: scale(0.5); opacity: 0.8; }
    100% { transform: scale(2.2); opacity: 0; }
  }

  .tt-card {
    background: #fff;
    border: 1.5px solid #F0DFC8;
    border-radius: 20px;
    padding: 20px;
  }

  /* Choice cards */
  .tt-choice {
    width: 100%;
    background: #fff;
    border: 1.5px solid #F0DFC8;
    border-radius: 18px;
    padding: 18px 20px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    position: relative;
    overflow: hidden;
  }
  .tt-choice:active { transform: scale(0.97); }
  .tt-choice.create-choice:hover {
    border-color: #FDBA74;
    background: #FFF7ED;
  }
  .tt-choice.join-choice:hover {
    border-color: #C4B5FD;
    background: #F5F3FF;
  }

  /* Inputs */
  .tt-input {
    width: 100%;
    background: #FFFBF5;
    border: 1.5px solid #F0DFC8;
    border-radius: 14px;
    padding: 15px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: #1A1008;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    -webkit-appearance: none;
  }
  .tt-input::placeholder { color: #C4A882; }
  .tt-input:focus {
    border-color: #E8A44A;
    background: #fff;
  }
  .tt-input-mono {
    font-family: 'Space Mono', monospace;
    font-size: 16px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  /* Duration pills */
  .tt-pill {
    flex: 1;
    padding: 10px 6px;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    border: 1.5px solid #F0DFC8;
    background: #FFFBF5;
    color: #A08060;
    text-align: center;
  }
  .tt-pill:hover { background: #FFF0DC; border-color: #FDBA74; color: #C2570A; }
  .tt-pill:active { transform: scale(0.95); }
  .tt-pill-active {
    background: #F97316;
    border-color: #F97316;
    color: #fff;
  }
  .tt-pill-active:hover {
    background: #EA6C0A;
    border-color: #EA6C0A;
    color: #fff;
  }

  /* CTAs */
  .tt-cta {
    width: 100%;
    padding: 16px;
    border-radius: 16px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    letter-spacing: 0.01em;
  }
  .tt-cta:active:not(:disabled) { transform: scale(0.97); }
  .tt-cta:disabled { opacity: 0.4; cursor: default; }

  .tt-cta-create { background: #F97316; color: #fff; }
  .tt-cta-create:hover:not(:disabled) { background: #FDBA74; color: #7C2D12; }

  .tt-cta-join { background: #7C3AED; color: #fff; }
  .tt-cta-join:hover:not(:disabled) { background: #C4B5FD; color: #3B0764; }

  /* Back */
  .tt-back {
    display: inline-flex; align-items: center; gap: 5px;
    background: none; border: none;
    color: #A08060;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    padding: 4px 0;
    transition: color 0.2s;
  }
  .tt-back:hover { color: #1A1008; }

  /* Room ID */
  .tt-room-id-box {
    background: #FFF7ED;
    border: 1.5px dashed #F0DFC8;
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  /* Error */
  .tt-error {
    background: #FEF2F2;
    border: 1.5px solid #FECACA;
    border-radius: 12px;
    padding: 11px 16px;
    font-size: 13px;
    color: #DC2626;
  }

  /* Label */
  .tt-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #A08060;
    margin-bottom: 8px;
    display: block;
  }

  .tt-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
  }

  .tt-feature-pill {
    flex: 1;
    border-radius: 12px;
    padding: 12px;
    text-align: center;
    transition: all 0.2s;
    cursor: default;
  }
  .tt-feature-pill:hover { transform: translateY(-2px); }
`

export default function Landing() {
  const navigate = useNavigate()
  const { createRoom, joinRoom, loading, error } = useRoom()
  const { startSession } = useSession()

  const [mode, setMode]         = useState(null)
  const [name, setName]         = useState('')
  const [joinId, setJoinId]     = useState('')
  const [duration, setDuration] = useState(3600)
  const [previewId]             = useState(generateRoomId)

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
    <>
      <style>{STYLES}</style>
      <div className="tt-root">

        {/* Doodle background */}
        <div className="tt-doodle-layer">
          <svg width="100%" height="100%" viewBox="0 0 390 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <g opacity="0.12" fill="#F97316">
              <ellipse cx="60" cy="80" rx="36" ry="18"/>
              <ellipse cx="88" cy="70" rx="28" ry="16"/>
              <ellipse cx="40" cy="78" rx="22" ry="14"/>
            </g>
            <g opacity="0.10" fill="#7C3AED">
              <ellipse cx="330" cy="140" rx="30" ry="15"/>
              <ellipse cx="354" cy="132" rx="22" ry="13"/>
              <ellipse cx="312" cy="138" rx="18" ry="11"/>
            </g>
            <g fill="#F97316" opacity="0.25">
              <circle cx="340" cy="60" r="2.5"/>
              <circle cx="350" cy="75" r="1.5"/>
              <circle cx="325" cy="52" r="1.8"/>
            </g>
            <g fill="#7C3AED" opacity="0.20">
              <circle cx="50" cy="200" r="2"/>
              <circle cx="62" cy="215" r="1.4"/>
              <circle cx="38" cy="210" r="1.8"/>
            </g>
            {/* Paper plane */}
            <g transform="translate(300, 50) rotate(-20)" opacity="0.18" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M0 10 L28 0 L22 10 L28 20 Z"/>
              <path d="M8 10 L2 20"/>
              <path d="M18 6 L14 14"/>
              <path d="M-5 12 L-18 12" strokeDasharray="2 3"/>
              <path d="M-5 14 L-14 14" strokeDasharray="2 3"/>
            </g>
            {/* Compass */}
            <g transform="translate(20, 50)" opacity="0.13" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="22" cy="22" r="18"/>
              <line x1="22" y1="6" x2="22" y2="12"/>
              <line x1="22" y1="32" x2="22" y2="38"/>
              <line x1="6" y1="22" x2="12" y2="22"/>
              <line x1="32" y1="22" x2="38" y2="22"/>
              <polygon points="22,10 19,20 22,18 25,20" fill="#7C3AED" opacity="0.5"/>
            </g>
            {/* Route pin doodle */}
            <g transform="translate(15, 580)" opacity="0.12" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round">
              <path d="M16 42 Q0 28 0 18 A16 16 0 0 1 32 18 Q32 28 16 42Z"/>
              <circle cx="16" cy="17" r="5" stroke="#F97316"/>
              <path d="M32 30 Q60 20 70 40" strokeDasharray="3 4"/>
              <path d="M70 40 Q80 60 100 45" strokeDasharray="3 4"/>
              <circle cx="100" cy="45" r="4" fill="#F97316" opacity="0.5" stroke="none"/>
            </g>
            {/* Suitcase */}
            <g transform="translate(300, 620)" opacity="0.12" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="12" width="50" height="38" rx="5"/>
              <rect x="15" y="4" width="20" height="10" rx="3"/>
              <line x1="0" y1="31" x2="50" y2="31"/>
              <line x1="25" y1="12" x2="25" y2="50"/>
              <circle cx="8" cy="52" r="3"/>
              <circle cx="42" cy="52" r="3"/>
              <rect x="6" y="15" width="10" height="7" rx="2" opacity="0.6"/>
            </g>
            {/* Sun */}
            <g transform="translate(310, 700)" opacity="0.10" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="22" cy="22" r="10"/>
              <line x1="22" y1="4" x2="22" y2="0"/>
              <line x1="22" y1="40" x2="22" y2="44"/>
              <line x1="4" y1="22" x2="0" y2="22"/>
              <line x1="40" y1="22" x2="44" y2="22"/>
              <line x1="8" y1="8" x2="5" y2="5"/>
              <line x1="36" y1="8" x2="39" y2="5"/>
              <line x1="8" y1="36" x2="5" y2="39"/>
              <line x1="36" y1="36" x2="39" y2="39"/>
            </g>
            <path d="M0 870 Q97 845 195 860 Q292 875 390 850 L390 900 L0 900Z" fill="#FFF0DC" opacity="0.5"/>
          </svg>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 400, margin: '0 auto', padding: '0 20px 60px' }}>

          {/* Hero */}
          <div style={{ paddingTop: 56, paddingBottom: 44, textAlign: 'center' }}>

            {/* Logo mark */}
            <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: 8, height: 8, background: '#F97316', borderRadius: '50%', top: 0, right: 4, opacity: 0.6, animation: 'float 2.4s ease-in-out infinite' }}/>
              <div style={{ position: 'absolute', width: 5, height: 5, background: '#7C3AED', borderRadius: '50%', bottom: 4, left: 0, opacity: 0.5, animation: 'float 3s ease-in-out 0.8s infinite' }}/>
              <div style={{ width: 60, height: 60, background: '#F97316', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(249,115,22,0.28)' }}>
                <svg className="pin-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                  <circle cx="12" cy="10" r="2.5" fill="white" stroke="none"/>
                </svg>
              </div>
            </div>

            {/* Title + live pulse indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 36,
                fontWeight: 900,
                color: '#1A1008',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>
                TripTrack
              </h1>

              {/* Live location pulse badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 6 }}>
                <div style={{ position: 'relative', width: 20, height: 20 }}>
                  {/* Radar rings */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: '1.5px solid #F97316',
                    animation: 'radarPulse 2s ease-out infinite',
                  }}/>
                  <div style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: '1.5px solid #F97316',
                    animation: 'radarPulse 2s ease-out 0.7s infinite',
                  }}/>
                  {/* Center dot */}
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 7, height: 7,
                    background: '#F97316',
                    borderRadius: '50%',
                  }}/>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#F97316', letterSpacing: '0.1em', textTransform: 'uppercase' }}>live</span>
              </div>
            </div>

            <p style={{ fontSize: 14, color: '#A08060', fontWeight: 400, letterSpacing: '0.01em' }}>
              Real-time location for your whole group
            </p>

            {/* Single chip */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
              <span className="tt-chip" style={{ background: '#F5F3FF', color: '#6D28D9', border: '1px solid #EDE9FE' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Live tracking • No sign-up needed
              </span>
            </div>
          </div>

          {/* Home panel */}
          {!mode && (
            <div className="tt-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Mini map — no name labels on pins */}
              <div className="tt-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 4 }}>
                <svg width="100%" viewBox="0 0 360 100" xmlns="http://www.w3.org/2000/svg">
                  <rect width="360" height="100" fill="#FFF7ED"/>
                  <g stroke="#F0DFC8" strokeWidth="0.8" opacity="0.6">
                    <line x1="0" y1="25" x2="360" y2="25"/>
                    <line x1="0" y1="50" x2="360" y2="50"/>
                    <line x1="0" y1="75" x2="360" y2="75"/>
                    <line x1="60" y1="0" x2="60" y2="100"/>
                    <line x1="120" y1="0" x2="120" y2="100"/>
                    <line x1="180" y1="0" x2="180" y2="100"/>
                    <line x1="240" y1="0" x2="240" y2="100"/>
                    <line x1="300" y1="0" x2="300" y2="100"/>
                  </g>
                  {/* Dashed route */}
                  <path d="M50 75 Q80 55 120 60 Q160 65 200 40 Q240 20 290 35" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4" opacity="0.7"/>
                  {/* Pin 1 — orange, no name */}
                  <circle cx="120" cy="60" r="13" fill="#F97316" opacity="0.12"/>
                  <circle cx="120" cy="60" r="6" fill="#F97316"/>
                  <circle cx="120" cy="60" r="2.5" fill="#fff"/>
                  {/* Pin 2 — violet */}
                  <circle cx="200" cy="40" r="13" fill="#7C3AED" opacity="0.12"/>
                  <circle cx="200" cy="40" r="6" fill="#7C3AED"/>
                  <circle cx="200" cy="40" r="2.5" fill="#fff"/>
                  {/* Pin 3 — green */}
                  <circle cx="285" cy="35" r="13" fill="#16A34A" opacity="0.12"/>
                  <circle cx="285" cy="35" r="6" fill="#16A34A"/>
                  <circle cx="285" cy="35" r="2.5" fill="#fff"/>
                  {/* Start dot */}
                  <circle cx="50" cy="75" r="4" fill="#A08060" opacity="0.5"/>
                  {/* Destination flag */}
                  <rect x="286" y="26" width="9" height="6" rx="1.5" fill="#F97316" opacity="0.8"/>
                  <line x1="290" y1="26" x2="290" y2="40" stroke="#F97316" strokeWidth="1.5" opacity="0.8"/>
                </svg>
              </div>

              <button className="tt-choice create-choice" onClick={() => setMode('create')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #FDE9CC' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1008', marginBottom: 2 }}>Create a room</div>
                    <div style={{ fontSize: 12, color: '#A08060' }}>Start a new session for your group</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>

              <button className="tt-choice join-choice" onClick={() => setMode('join')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #EDE9FE' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1008', marginBottom: 2 }}>Join a room</div>
                    <div style={{ fontSize: 12, color: '#A08060' }}>Enter with a room ID from your group</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>

            </div>
          )}

          {/* Create panel */}
          {mode === 'create' && (
            <div className="tt-panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <button className="tt-back" onClick={() => setMode(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back
              </button>

              <div className="tt-room-id-box">
                <div style={{ position: 'absolute', top: 8, right: 12, opacity: 0.2, fontSize: 16 }}>★</div>
                <div style={{ position: 'absolute', bottom: 8, left: 12, opacity: 0.18, fontSize: 11 }}>♦</div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C2570A', marginBottom: 10 }}>
                  Your room ID
                </p>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, letterSpacing: '0.2em', color: '#F97316' }}>
                  {previewId}
                </p>
                <p style={{ fontSize: 11, color: '#C4A882', marginTop: 8 }}>Share this code with your travel crew ✈</p>
              </div>

              <div>
                <label className="tt-label">Your name</label>
                <input
                  className="tt-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Aryan"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="tt-label">Session duration</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {DURATIONS.map(d => (
                    <button
                      key={d.seconds}
                      className={`tt-pill ${duration === d.seconds ? 'tt-pill-active' : ''}`}
                      onClick={() => setDuration(d.seconds)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div className="tt-feature-pill" style={{ background: '#F5F3FF' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>📍</div>
                  <div style={{ fontSize: 11, color: '#6D28D9', fontWeight: 500 }}>Live pins</div>
                </div>
                <div className="tt-feature-pill" style={{ background: '#FFF7ED' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>🔔</div>
                  <div style={{ fontSize: 11, color: '#C2570A', fontWeight: 500 }}>Alerts</div>
                </div>
                <div className="tt-feature-pill" style={{ background: '#F0FDF4' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>🗺️</div>
                  <div style={{ fontSize: 11, color: '#15803D', fontWeight: 500 }}>Group map</div>
                </div>
              </div>

              {error && <div className="tt-error">{error}</div>}

              <button
                className="tt-cta tt-cta-create"
                onClick={handleCreate}
                disabled={loading || !name.trim()}
              >
                {loading ? 'Starting session…' : 'Start sharing →'}
              </button>
            </div>
          )}

          {/* Join panel */}
          {mode === 'join' && (
            <div className="tt-panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <button className="tt-back" onClick={() => setMode(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back
              </button>

              <div className="tt-card" style={{ textAlign: 'center', padding: '24px 20px' }}>
                {/* Avatar group — no names */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  {[
                    { bg: '#FFF7ED', border: '#FDE9CC', emoji: '🧑', dashed: false },
                    { bg: '#F5F3FF', border: '#EDE9FE', emoji: '👩', dashed: false },
                    { bg: '#F0FDF4', border: '#BBF7D0', emoji: '🧔', dashed: false },
                    { bg: '#FFFBF5', border: '#F0DFC8', emoji: '+',  dashed: true  },
                  ].map((av, i) => (
                    <div key={i} style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: av.bg,
                      border: `2px ${av.dashed ? 'dashed' : 'solid'} ${av.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                      color: '#A08060',
                      fontWeight: 500,
                      marginLeft: i > 0 ? -10 : 0,
                      zIndex: 4 - i,
                      position: 'relative',
                    }}>
                      {av.emoji}
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#1A1008', marginBottom: 4 }}>
                  Your crew is waiting!
                </p>
                <p style={{ fontSize: 12, color: '#A08060' }}>Enter the room ID to join them on the map</p>
              </div>

              <div>
                <label className="tt-label">Your name</label>
                <input
                  className="tt-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Priya"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="tt-label">Room ID</label>
                <input
                  className="tt-input tt-input-mono"
                  type="text"
                  value={joinId}
                  onChange={e => setJoinId(e.target.value.toUpperCase())}
                  placeholder="TRP-R2RD"
                  maxLength={8}
                />
              </div>

              {error && <div className="tt-error">{error}</div>}

              <button
                className="tt-cta tt-cta-join"
                onClick={handleJoin}
                disabled={loading || !name.trim() || !joinId.trim()}
              >
                {loading ? 'Joining…' : 'Join the adventure →'}
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}