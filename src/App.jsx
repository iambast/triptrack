import { db } from './lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    getDocs(collection(db, 'test'))
      .then(() => console.log('Firebase connected'))
      .catch((err) => console.error('Firebase error:', err))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Check browser console for Firebase status</p>
    </div>
  )
}

export default App