import { useState } from 'react'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { generateRoomId, generateUserId } from '../lib/utils'

export function useRoom() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function createRoom({ durationSeconds }) {
    setLoading(true)
    setError(null)
    try {
      const roomId    = generateRoomId()
      const userId    = generateUserId()
      const expiresAt = Date.now() + durationSeconds * 1000

      await setDoc(doc(db, 'rooms', roomId), {
        createdAt:   serverTimestamp(),
        expiresAt,
        createdBy:   userId,
      })

      return { roomId, userId, expiresAt }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  async function joinRoom({ roomId }) {
    setLoading(true)
    setError(null)
    try {
      const upper   = roomId.trim().toUpperCase()
      const roomRef = doc(db, 'rooms', upper)
      const snap    = await getDoc(roomRef)

      if (!snap.exists()) {
        setError('Room not found. Check the ID and try again.')
        return null
      }

      const { expiresAt } = snap.data()
      if (Date.now() > expiresAt) {
        setError('This room session has expired.')
        return null
      }

      const userId = generateUserId()
      return { roomId: upper, userId, expiresAt }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createRoom, joinRoom, loading, error }
}