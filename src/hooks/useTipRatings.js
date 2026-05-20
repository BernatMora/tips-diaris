import { useState, useCallback } from 'react'

const STORAGE_KEY = 'tip-ratings'

function loadRatings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

// Simple hash to avoid issues with very long keys in localStorage
function hashKey(text) {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return 'r_' + Math.abs(hash).toString(36) + '_' + text.slice(0, 20).replace(/[^a-z0-9]/gi, '')
}

export function useTipRatings() {
  const [ratings, setRatings] = useState(loadRatings)

  const rateTip = useCallback((tipText, rating) => {
    const key = hashKey(tipText)
    setRatings((prev) => {
      const next = { ...prev }
      if (prev[key] === rating) {
        delete next[key]
      } else {
        next[key] = rating
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const getRating = useCallback((tipText) => {
    if (!tipText) return null
    return ratings[hashKey(tipText)] ?? null
  }, [ratings])

  return { rateTip, getRating }
}