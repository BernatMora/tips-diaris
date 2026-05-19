import { useState, useCallback } from 'react'

const STORAGE_KEY = 'tip-ratings'

function loadRatings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

export function useTipRatings() {
  const [ratings, setRatings] = useState(loadRatings)

  const rateTip = useCallback((tipText, rating) => {
    const key = tipText.slice(0, 100)
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
    return ratings[tipText.slice(0, 100)] ?? null
  }, [ratings])

  return { rateTip, getRating }
}
