import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../lib/session'
import { useMembers } from '../hooks/useMembers'
import { timeLeft, MEMBER_COLORS } from '../lib/utils'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

  .tr-root {
    height: 100svh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #FFF8F0;
    font-family: 'DM Sans', sans-serif;
    position: relative;
  }

  /* ── Map fills everything ── */
  .tr-map-wrap {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .tr-map-wrap .leaflet-container {
    width: 100%; height: 100%;
    background: #f5ede0;
  }

  /* ── Floating header ── */
  .tr-header {
    position: absolute;
    top: 16px; left: 12px; right: 12px;
    z-index: 800;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,248,240,0.88);
    border: 1.5px solid #F0DFC8;
    border-radius: 18px;
    padding: 10px 14px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 4px 20px rgba(249,115,22,0.08);
  }

  .tr-logo-mark {
    width: 28px; height: 28px;
    background: #F97316;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .tr-room-id {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #F97316;
  }

  .tr-member-badge {
    background: #FFF7ED;
    border: 1px solid #FDE9CC;
    border-radius: 100px;
    padding: 3px 9px;
    font-size: 11px;
    font-weight: 500;
    color: #C2570A;
  }

  .tr-spacer { flex: 1; }

  .tr-live-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #22C55E;
    box-shadow: 0 0 6px #22C55E;
    animation: trLivePulse 1.6s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes trLivePulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.4; transform: scale(0.8); }
  }

  .tr-countdown {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #A08060;
    letter-spacing: 0.04em;
  }

  /* ── Expiry warning banner ── */
  .tr-expiry-warn {
    position: absolute;
    top: 78px; left: 12px; right: 12px;
    z-index: 800;
    background: #FFFBEB;
    border: 1.5px solid #FDE68A;
    border-radius: 14px;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 500;
    color: #92400E;
    text-align: center;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    animation: trFadeIn 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .tr-leave-btn {
    background: #FEF2F2;
    border: 1.5px solid #FECACA;
    border-radius: 10px;
    padding: 5px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #DC2626;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .tr-leave-btn:hover { background: #FEE2E2; border-color: #FCA5A5; }
  .tr-leave-btn:active { transform: scale(0.96); }

  /* ── GPS error toast ── */
  .tr-gps-error {
    position: absolute;
    top: 78px; left: 12px; right: 12px;
    z-index: 800;
    background: #FFFBEB;
    border: 1.5px solid #FDE68A;
    border-radius: 14px;
    padding: 10px 14px;
    font-size: 12px;
    color: #92400E;
    text-align: center;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    animation: trFadeIn 0.3s ease;
  }

  /* ── Recenter FAB ── */
  .tr-recenter-fab {
    position: absolute;
    z-index: 800;
    right: 12px;
    background: rgba(255,248,240,0.92);
    border: 1.5px solid #F0DFC8;
    border-radius: 14px;
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 2px 12px rgba(249,115,22,0.10);
    transition: all 0.2s;
    color: #A08060;
  }
  .tr-recenter-fab:hover {
    background: #FFF7ED;
    border-color: #FDBA74;
    color: #F97316;
    transform: scale(1.06);
  }
  .tr-recenter-fab:active { transform: scale(0.94); }

  /* ── Bottom sheet ── */
  .tr-sheet {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    z-index: 800;
    background: rgba(255,248,240,0.95);
    border-top: 1.5px solid #F0DFC8;
    border-radius: 24px 24px 0 0;
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    transition: transform 0.32s cubic-bezier(0.22,1,0.36,1);
    box-shadow: 0 -4px 24px rgba(249,115,22,0.08);
    animation: trSheetIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes trSheetIn {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }

  .tr-handle-wrap {
    display: flex;
    justify-content: center;
    padding: 10px 0 2px;
    cursor: pointer;
  }
  .tr-handle {
    width: 36px; height: 4px;
    background: #F0DFC8;
    border-radius: 100px;
  }

  .tr-sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 18px 10px;
    cursor: pointer;
  }
  .tr-sheet-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #C4A882;
  }
  .tr-chevron {
    width: 18px; height: 18px;
    color: #C4A882;
    transition: transform 0.28s cubic-bezier(0.22,1,0.36,1);
  }
  .tr-chevron.open { transform: rotate(180deg); }

  .tr-members-list {
    padding: 0 14px 24px;
    max-height: 220px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .tr-members-list::-webkit-scrollbar { display: none; }

  .tr-empty {
    text-align: center;
    padding: 18px;
    font-size: 13px;
    color: #C4A882;
  }

  .tr-member-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: #fff;
    border: 1.5px solid #F0DFC8;
    border-radius: 14px;
    transition: background 0.2s;
  }
  .tr-member-row:hover { background: #FFFBF5; }

  .tr-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    flex-shrink: 0;
    border: 2px solid transparent;
    position: relative;
  }

  .tr-member-name {
    font-size: 14px;
    font-weight: 600;
    color: #1A1008;
    line-height: 1.2;
  }
  .tr-member-sub {
    font-size: 11px;
    color: #A08060;
    margin-top: 2px;
  }

  .tr-you-badge {
    background: #FFF7ED;
    border: 1px solid #FDE9CC;
    border-radius: 6px;
    padding: 1px 7px;
    font-size: 10px;
    font-weight: 600;
    color: #C2570A;
    margin-left: 5px;
  }

  .tr-status-live {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 100px;
    padding: 3px 9px;
    font-size: 10px;
    font-weight: 700;
    color: #16A34A;
    display: flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
  }
  .tr-status-live::before {
    content: '';
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #22C55E;
    animation: trLivePulse 1.6s ease-in-out infinite;
  }
  .tr-status-idle {
    background: #FFFBF5;
    border: 1.5px solid #F0DFC8;
    border-radius: 100px;
    padding: 3px 9px;
    font-size: 10px;
    font-weight: 600;
    color: #C4A882;
    flex-shrink: 0;
  }
  /* NEW: paused status for members silent > 2 min */
  .tr-status-paused {
    background: #FFFBEB;
    border: 1.5px solid #FDE68A;
    border-radius: 100px;
    padding: 3px 9px;
    font-size: 10px;
    font-weight: 600;
    color: #92400E;
    flex-shrink: 0;
  }

  /* Leaflet overrides */
  .leaflet-control-zoom {
    border: none !important;
    box-shadow: none !important;
    margin-right: 12px !important;
    transition: margin-bottom 0.32s cubic-bezier(0.22,1,0.36,1) !important;
  }
  .leaflet-control-zoom a {
    background: rgba(255,248,240,0.92) !important;
    border: 1.5px solid #F0DFC8 !important;
    color: #A08060 !important;
    width: 34px !important;
    height: 34px !important;
    line-height: 34px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
    backdrop-filter: blur(12px) !important;
    margin-bottom: 4px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: background 0.2s, color 0.2s !important;
  }
  .leaflet-control-zoom a:hover {
    background: #FFF7ED !important;
    color: #F97316 !important;
    border-color: #FDBA74 !important;
  }
  .leaflet-control-zoom-in { border-bottom: none !important; }
  .leaflet-popup-content-wrapper {
    background: rgba(255,248,240,0.97) !important;
    border: 1.5px solid #F0DFC8 !important;
    border-radius: 14px !important;
    color: #1A1008 !important;
    box-shadow: 0 8px 32px rgba(249,115,22,0.12) !important;
    backdrop-filter: blur(16px) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 13px !important;
    padding: 6px 2px !important;
  }
  .leaflet-popup-tip {
    background: rgba(255,248,240,0.97) !important;
  }

  @keyframes trFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

// ── Smooth marker interpolation ──────────────────────────────────────────────
// Moves a Leaflet marker smoothly from its current position to [targetLat, targetLng]
// over `steps` animation frames (~1 second at 50ms intervals).
function lerpMarker(marker, targetLat, targetLng, steps = 20) {
  const start = marker.getLatLng()
  // Skip if essentially no movement (avoids jitter on identical coords)
  if (
    Math.abs(start.lat - targetLat) < 0.000001 &&
    Math.abs(start.lng - targetLng) < 0.000001
  ) return

  let i = 0
  const interval = setInterval(() => {
    i++
    const t = i / steps
    marker.setLatLng([
      start.lat + (targetLat - start.lat) * t,
      start.lng  + (targetLng  - start.lng)  * t,
    ])
    if (i >= steps) clearInterval(interval)
  }, 50)
}

// ── Countdown helpers ────────────────────────────────────────────────────────
const FIVE_MINUTES_MS = 5 * 60 * 1000

export default function Tracker() {
  const navigate   = useNavigate()
  const { session, endSession } = useSession()
  const [countdown, setCountdown]       = useState('')
  const [nearExpiry, setNearExpiry]     = useState(false)   // NEW: <5 min warning
  const [showMembers, setShowMembers]   = useState(true)
  const mapRef      = useRef(null)
  const leafletMap  = useRef(null)
  const markersRef  = useRef({})
  const sheetRef    = useRef(null)
  const hasAutoFitted = useRef(false)   // NEW: only auto-fit bounds once

  const { members, locationError } = useMembers({
    roomId:     session?.roomId,
    userId:     session?.userId,
    name:       session?.name,
    colorIndex: session?.colorIndex,
  })

  // ── Redirect if no session ───────────────────────────────────────────────
  useEffect(() => {
    if (!session) navigate('/')
  }, [session])

  // ── Countdown timer + expiry warning ────────────────────────────────────
  useEffect(() => {
    if (!session) return
    const tick = () => {
      const remaining = session.expiresAt - Date.now()
      const t = timeLeft(session.expiresAt)
      if (!t) { handleLeave(); return }
      setCountdown(t)
      setNearExpiry(remaining < FIVE_MINUTES_MS)   // NEW
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [session])

  // ── Dynamic zoom control offset ──────────────────────────────────────────
  useEffect(() => {
    const updateZoomOffset = () => {
      if (!sheetRef.current) return
      const h = sheetRef.current.offsetHeight
      const zoomEl = document.querySelector('.leaflet-control-zoom')
      if (zoomEl) zoomEl.style.marginBottom = `${h + 16}px`
    }
    updateZoomOffset()
    const t = setTimeout(updateZoomOffset, 350)
    return () => clearTimeout(t)
  }, [showMembers, members])

  // ── Init Leaflet ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return

    import('leaflet').then(L => {
      import('leaflet/dist/leaflet.css')

      leafletMap.current = L.map(mapRef.current, {
        center:             [20.5937, 78.9629],
        zoom:               5,
        zoomControl:        false,
        attributionControl: false,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(leafletMap.current)

      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current)

      setTimeout(() => {
        if (sheetRef.current) {
          const h = sheetRef.current.offsetHeight
          const zoomEl = document.querySelector('.leaflet-control-zoom')
          if (zoomEl) zoomEl.style.marginBottom = `${h + 16}px`
        }
      }, 100)
    })

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [])

  // ── Recenter: fit bounds to all visible members ──────────────────────────
  // NEW: extracted so both auto-fit and the FAB can call it.
  const recenterMap = useCallback(() => {
    if (!leafletMap.current) return
    import('leaflet').then(L => {
      const validMembers = members.filter(m => m.lat && m.lng)
      if (validMembers.length === 0) return
      const bounds = L.latLngBounds(validMembers.map(m => [m.lat, m.lng]))
      leafletMap.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 })
    })
  }, [members])

  // ── Update markers ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!leafletMap.current) return

    import('leaflet').then(L => {
      const validMembers = members.filter(m => m.lat && m.lng)

      // Remove markers for members who left
      Object.keys(markersRef.current).forEach(id => {
        if (!validMembers.find(m => m.id === id)) {
          markersRef.current[id].remove()
          delete markersRef.current[id]
        }
      })

      validMembers.forEach(member => {
        const color   = MEMBER_COLORS[member.colorIndex ?? 0]
        const initial = member.name.charAt(0).toUpperCase()
        const isMe    = member.isMe

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              width:42px; height:42px; border-radius:50%;
              background:${color.pin};
              border:3px solid rgba(255,255,255,0.95);
              display:flex; align-items:center; justify-content:center;
              color:white; font-family:'DM Sans',sans-serif; font-weight:700; font-size:15px;
              box-shadow:${isMe
                ? `0 0 0 4px ${color.pin}55, 0 4px 16px rgba(0,0,0,0.18)`
                : '0 4px 14px rgba(0,0,0,0.15)'
              };
              transition:box-shadow 0.3s;
              cursor:${isMe ? 'default' : 'pointer'};
            ">${initial}</div>
            ${isMe ? `<div style="
              position:absolute; bottom:-2px; left:50%; transform:translateX(-50%);
              width:8px; height:8px; border-radius:50%;
              background:#22C55E; border:2px solid #FFF8F0;
              box-shadow:0 0 6px #22C55E;
            "></div>` : ''}
          `,
          iconSize:   [42, 42],
          iconAnchor: [21, 21],
        })

        if (markersRef.current[member.id]) {
          // FIX: use smooth lerp instead of instant setLatLng
          lerpMarker(markersRef.current[member.id], member.lat, member.lng)
          markersRef.current[member.id].setIcon(icon)
        } else {
          const marker = L.marker([member.lat, member.lng], { icon })
            .addTo(leafletMap.current)

          if (!member.isMe) {
            marker.on('click', () => {
              const dest    = `${member.lat},${member.lng}`
              const mapsUrl =
                `https://www.google.com/maps/dir/?api=1` +
                `&destination=${dest}` +
                `&travelmode=driving`

              const popupHtml = `
                <div style="font-family:'DM Sans',sans-serif; min-width:150px; padding:2px 4px;">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                    <div style="
                      width:30px; height:30px; border-radius:50%;
                      background:${color.pin}22; border:2px solid ${color.pin}60;
                      display:flex; align-items:center; justify-content:center;
                      color:${color.pin}; font-weight:700; font-size:13px; flex-shrink:0;
                    ">${initial}</div>
                    <div>
                      <div style="font-weight:700; color:#1A1008; font-size:13px; line-height:1.2;">
                        ${member.name}
                      </div>
                      <div style="color:#A08060; font-size:10px; margin-top:1px;">
                        ${member.lat.toFixed(5)}, ${member.lng.toFixed(5)}
                      </div>
                    </div>
                  </div>
                  <a
                    href="${mapsUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                      display:flex; align-items:center; justify-content:center; gap:6px;
                      background:#F97316; color:white; border-radius:10px;
                      padding:8px 12px; text-decoration:none;
                      font-size:12px; font-weight:600; letter-spacing:0.02em;
                      box-shadow:0 2px 8px rgba(249,115,22,0.30);
                      transition:background 0.2s;
                    "
                    onmouseover="this.style.background='#EA6C10'"
                    onmouseout="this.style.background='#F97316'"
                  >
                    <svg width="13" height="13" fill="none" stroke="white" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                    Get Directions
                  </a>
                </div>
              `

              marker
                .bindPopup(popupHtml, {
                  offset:      [0, -24],
                  maxWidth:    220,
                  closeButton: false,
                })
                .openPopup()
            })
          } else {
            marker.bindPopup(
              `<b style="font-family:'DM Sans',sans-serif;color:#1A1008">${member.name}</b>
               <span style="color:#F97316;font-size:11px"> (you)</span>`,
              { offset: [0, -24], closeButton: false }
            )
          }

          markersRef.current[member.id] = marker
        }
      })

      // FIX: only auto-fit bounds the very first time we have locations
      if (validMembers.length > 0 && !hasAutoFitted.current) {
        const bounds = L.latLngBounds(validMembers.map(m => [m.lat, m.lng]))
        leafletMap.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 })
        hasAutoFitted.current = true
      }
    })
  }, [members])

  // ── Position the recenter FAB above the zoom controls ───────────────────
  // We compute this from sheetRef so it sits above the sheet.
  const [fabBottom, setFabBottom] = useState(160)
  useEffect(() => {
    if (!sheetRef.current) return
    const h = sheetRef.current.offsetHeight
    setFabBottom(h + 58) // 58px above sheet = above zoom controls
  }, [showMembers, members])

  function handleLeave() {
    endSession()
    navigate('/')
  }

  if (!session) return null

  const sessionExpired = Date.now() > session.expiresAt

  return (
    <>
      <style>{STYLES}</style>
      <div className="tr-root">

        {/* Full-screen map */}
        <div className="tr-map-wrap">
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* ── Floating header ── */}
        <div className="tr-header">
          <div className="tr-logo-mark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
              <circle cx="12" cy="10" r="2.5" fill="white" stroke="none"/>
            </svg>
          </div>

          <span className="tr-room-id">{session.roomId}</span>
          <span className="tr-member-badge">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </span>
          <div className="tr-spacer" />
          {!sessionExpired && (
            <>
              <div className="tr-live-dot" />
              <span className="tr-countdown" style={nearExpiry ? { color: '#F97316', fontWeight: 700 } : {}}>
                {countdown}
              </span>
            </>
          )}
          <button className="tr-leave-btn" onClick={handleLeave}>Leave</button>
        </div>

        {/* ── GPS error toast ── */}
        {locationError && (
          <div className="tr-gps-error">
            <svg style={{ display:'inline', width:12, height:12, marginRight:5, verticalAlign:-1 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {locationError}
          </div>
        )}

        {/* ── Expiry warning (< 5 min) ── */}
        {nearExpiry && !sessionExpired && !locationError && (
          <div className="tr-expiry-warn">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Session ends in {countdown} — save anything you need!
          </div>
        )}

        {/* ── Recenter FAB ── */}
        <button
          className="tr-recenter-fab"
          style={{ bottom: fabBottom }}
          onClick={recenterMap}
          title="Re-center map"
        >
          {/* crosshair / recenter icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <line x1="12" y1="2"  x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="2"  y1="12" x2="6"  y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
          </svg>
        </button>

        {/* ── Members bottom sheet ── */}
        <div className="tr-sheet" ref={sheetRef}>
          <div className="tr-handle-wrap" onClick={() => setShowMembers(p => !p)}>
            <div className="tr-handle" />
          </div>

          <div className="tr-sheet-header" onClick={() => setShowMembers(p => !p)}>
            <span className="tr-sheet-title">Members in room</span>
            <svg
              className={`tr-chevron ${showMembers ? 'open' : ''}`}
              fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
            >
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </div>

          {showMembers && (
            <div className="tr-members-list">
              {members.length === 0 ? (
                <div className="tr-empty">Waiting for members to join…</div>
              ) : (
                members.map(m => {
                  const color  = MEMBER_COLORS[m.colorIndex ?? 0]
                  const ageMs  = Date.now() - m.updatedAt
                  const ageStr = ageMs < 60000
                    ? 'just now'
                    : `${Math.floor(ageMs / 60000)}m ago`
                  const hasLoc  = m.lat && m.lng
                  const isLive  = hasLoc && ageMs < 30000
                  const isPaused = hasLoc && ageMs >= 2 * 60000  // NEW: silent > 2 min

                  return (
                    <div key={m.id} className="tr-member-row">
                      <div
                        className="tr-avatar"
                        style={{
                          background:  color.pin + '22',
                          borderColor: color.pin + '60',
                          color:       color.pin,
                          boxShadow:   m.isMe ? `0 0 0 3px ${color.pin}30` : 'none',
                        }}
                      >
                        {m.name.charAt(0).toUpperCase()}
                        {m.isMe && (
                          <div style={{
                            position:'absolute', bottom:0, right:0,
                            width:9, height:9, borderRadius:'50%',
                            background:'#22C55E', border:'2px solid #FFF8F0',
                          }} />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display:'flex', alignItems:'center' }}>
                          <span className="tr-member-name">{m.name}</span>
                          {m.isMe && <span className="tr-you-badge">you</span>}
                        </div>
                        <div className="tr-member-sub">
                          {hasLoc
                            ? isPaused
                              ? 'Location paused'           // NEW
                              : `Updated ${ageStr}`
                            : 'Getting location…'
                          }
                        </div>
                      </div>

                      {/* NEW: three-state status pill */}
                      {isLive
                        ? <span className="tr-status-live">live</span>
                        : isPaused
                          ? <span className="tr-status-paused">paused</span>
                          : <span className="tr-status-idle">idle</span>
                      }
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

      </div>
    </>
  )
}