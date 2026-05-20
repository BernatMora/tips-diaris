import { useState, useCallback, useMemo } from 'react'
import { CATEGORIES } from '../utils/categories'

const STORAGE_VISITS = 'tip-visits'

function loadVisits() {
  try { return JSON.parse(localStorage.getItem(STORAGE_VISITS) || '{}') }
  catch { return {} }
}

function loadSkipped() {
  try { return JSON.parse(localStorage.getItem('tip-skipped-categories') || '[]') }
  catch { return [] }
}

export function useRecommendations(ratings = {}) {
  const [visits, setVisits] = useState(loadVisits)
  const [skipped, setSkipped] = useState(loadSkipped)

  const trackVisit = useCallback((categoryId) => {
    setVisits((prev) => {
      const next = { ...prev }
      next[categoryId] = (next[categoryId] || 0) + 1
      localStorage.setItem(STORAGE_VISITS, JSON.stringify(next))
      return next
    })
  }, [])

  const skipRecommendation = useCallback((categoryId) => {
    setSkipped((prev) => {
      const next = [...prev, categoryId]
      localStorage.setItem('tip-skipped-categories', JSON.stringify(next))
      return next
    })
  }, [])

  const resetSkip = useCallback((categoryId) => {
    setSkipped((prev) => {
      const next = prev.filter((id) => id !== categoryId)
      localStorage.setItem('tip-skipped-categories', JSON.stringify(next))
      return next
    })
  }, [])

  const recommendations = useMemo(() => {
    const visitedIds = Object.keys(visits).sort((a, b) => visits[b] - visits[a])
    const allCategoryIds = CATEGORIES.map((c) => c.id)
    const unexplored = allCategoryIds.filter((id) => !visits[id])
    const exploredButLess = allCategoryIds.filter((id) => visits[id] && visits[id] < 3 && !skipped.includes(id))

    // Sort explored by visit count (most visited first)
    const explored = visitedIds.filter((id) => visits[id] >= 3)

    return {
      explore: unexplored.slice(0, 2),         // Categories never visited
      revisit: exploredButLess.slice(0, 2),     // Categories with < 3 visits
      favorites: explored.slice(0, 2),          // Categories with 3+ visits
      skipped: skipped,
    }
  }, [visits, ratings, skipped])

  const getCategoryById = useCallback((id) => CATEGORIES.find((c) => c.id === id), [])

  return { recommendations, trackVisit, skipRecommendation, resetSkip, getCategoryById }
}