import { useEffect, useState, useRef } from 'react'
import { ref, onValue, set, remove } from 'firebase/database'
import { rtdb } from '../lib/firebase'

export function useMembers({ roomId, userId, name, colorIndex }) {
  const [members, setMembers]       = useState([])
  const [locationError, setLocationError] = useState(null)
  const watchIdRef  = useRef(null)
  const memberRef   = useRef(null)

  // Register presence in Realtime DB
  useEffect(() => {
    if (!roomId || !userId) return

    memberRef.current = ref(rtdb, `rooms/${roomId}/members/${userId}`)

    set(memberRef.current, {
      name,
      colorIndex,
      lat:       null,
      lng:       null,
      updatedAt: Date.now(),
      online:    true,
    })

    return () => {
      if (memberRef.current) remove(memberRef.current)
    }
  }, [roomId, userId])

  // Start GPS
  useEffect(() => {
    if (!roomId || !userId) return

    if (!navigator.geolocation) {
      setLocationError('GPS not supported on this device.')
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        setLocationError(null)

        if (memberRef.current) {
          set(memberRef.current, {
            name,
            colorIndex,
            lat:       parseFloat(latitude.toFixed(5)),
            lng:       parseFloat(longitude.toFixed(5)),
            accuracy:  Math.round(accuracy),
            updatedAt: Date.now(),
            online:    true,
          })
        }
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? 'Location permission denied. Please allow access.'
            : 'Unable to get location. Make sure GPS is on.'
        )
      },
      {
        enableHighAccuracy: true,
        maximumAge:         5000,
        timeout:            15000,
      }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [roomId, userId])

  // Listen to all members in real time
  useEffect(() => {
    if (!roomId) return

    const roomMembersRef = ref(rtdb, `rooms/${roomId}/members`)

    const unsub = onValue(roomMembersRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) { setMembers([]); return }

      const list = Object.entries(data).map(([id, m]) => ({
        id,
        ...m,
        isMe: id === userId,
      }))

      setMembers(list)
    })

    return () => unsub()
  }, [roomId, userId])

  return { members, locationError }
}