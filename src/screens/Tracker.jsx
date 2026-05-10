import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../lib/session'
import { useMembers } from '../hooks/useMembers'
import { timeLeft, MEMBER_COLORS } from '../lib/utils'

export default function Tracker() {
  const navigate = useNavigate()
  const { session, endSession } = useSession()
  const [countdown, setCountdown] = useState('')
  const [copied, setCopied]       = useState(false)
  const [showMembers, setShowMembers] = useState(true)
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef({})

  const { members, locationError } = useMembers({
    roomId:     session?.roomId,
    userId:     session?.userId,
    name:       session?.name,
    colorIndex: session?.colorIndex,
  })

  // Redirect if no session
  useEffect(() => {
    if (!session) navigate('/')
  }, [session])

  // Countdown timer
  useEffect(() => {
    if (!session) return
    const tick = () => {
      const t = timeLeft(session.expiresAt)
      if (!t) { handleLeave(); return }
      setCountdown(t)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [session])

  // Init Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return

    import('leaflet').then(L => {
      import('leaflet/dist/leaflet.css')

      leafletMap.current = L.map(mapRef.current, {
        center:          [20.5937, 78.9629], // India center
        zoom:            5,
        zoomControl:     false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(leafletMap.current)

      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current)
    })

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [])

  // Update markers when members change
  useEffect(() => {
    if (!leafletMap.current) return

    import('leaflet').then(L => {
      const validMembers = members.filter(m => m.lat && m.lng)

      // Remove old markers
      Object.keys(markersRef.current).forEach(id => {
        if (!validMembers.find(m => m.id === id)) {
          markersRef.current[id].remove()
          delete markersRef.current[id]
        }
      })

      validMembers.forEach(member => {
        const color = MEMBER_COLORS[member.colorIndex ?? 0]
        const initial = member.name.charAt(0).toUpperCase()

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              width:38px; height:38px; border-radius:50%;
              background:${color.pin}; border:3px solid white;
              display:flex; align-items:center; justify-content:center;
              color:white; font-weight:600; font-size:14px;
              box-shadow:0 2px 8px rgba(0,0,0,0.25);
              ${member.isMe ? 'box-shadow:0 0 0 4px ' + color.pin + '40, 0 2px 8px rgba(0,0,0,0.25)' : ''}
            ">${initial}</div>
          `,
          iconSize:   [38, 38],
          iconAnchor: [19, 19],
        })

        if (markersRef.current[member.id]) {
          markersRef.current[member.id]
            .setLatLng([member.lat, member.lng])
            .setIcon(icon)
        } else {
          markersRef.current[member.id] = L.marker([member.lat, member.lng], { icon })
            .bindPopup(`<b>${member.name}</b>${member.isMe ? ' (you)' : ''}`)
            .addTo(leafletMap.current)
        }
      })

      // Fit bounds to all members
      if (validMembers.length > 0) {
        const bounds = L.latLngBounds(validMembers.map(m => [m.lat, m.lng]))
        leafletMap.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 })
      }
    })
  }, [members])

  function handleLeave() {
    endSession()
    navigate('/')
  }

  function handleCopy() {
    const link = `${window.location.origin}/join/${session?.roomId}`
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!session) return null

  const sessionExpired = Date.now() > session.expiresAt

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-900">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold tracking-widest text-gray-800 text-sm">
            {session.roomId}
          </span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!sessionExpired && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
              <span className="text-xs text-gray-500 font-mono">{countdown}</span>
            </div>
          )}
          <button
            onClick={handleLeave}
            className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            Leave
          </button>
        </div>
      </div>

      {/* GPS error banner */}
      {locationError && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-xs text-amber-700 text-center">
          {locationError}
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Share button */}
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 z-[999] bg-white shadow-md rounded-xl px-3 py-2 text-xs font-medium text-gray-700 flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          {copied ? 'Copied!' : 'Share link'}
        </button>
      </div>

      {/* Members bottom sheet */}
      <div className="bg-white border-t border-gray-100">
        <button
          onClick={() => setShowMembers(p => !p)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Members in room
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${showMembers ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>

        {showMembers && (
          <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto">
            {members.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">Waiting for members...</p>
            ) : (
              members.map(m => {
                const color  = MEMBER_COLORS[m.colorIndex ?? 0]
                const ageMs  = Date.now() - m.updatedAt
                const ageStr = ageMs < 60000
                  ? 'just now'
                  : `${Math.floor(ageMs / 60000)}m ago`
                const hasLocation = m.lat && m.lng

                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-sm font-semibold flex-shrink-0`}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-800 truncate">{m.name}</span>
                        {m.isMe && (
                          <span className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-md">you</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {hasLocation ? `Updated ${ageStr}` : 'Getting location...'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      hasLocation && ageMs < 30000
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {hasLocation && ageMs < 30000 ? 'live' : 'idle'}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}