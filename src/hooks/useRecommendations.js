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

export function useRecommendations() {
  const [visits, setVisits] = useState(() => loadVisits())
  const [skipped, setSkipped] = useState(() => loadSkipped())

  const safeSkipped = Array.isArray(skipped) ? skipped : []

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
      const safe = Array.isArray(prev) ? prev : []
      const next = [...safe, categoryId]
      localStorage.setItem('tip-skipped-categories', JSON.stringify(next))
      return next
    })
  }, [])

  const resetSkip = useCallback((categoryId) => {
    setSkipped((prev) => {
      const safe = Array.isArray(prev) ? prev : []
      const next = safe.filter((id) => id !== categoryId)
      localStorage.setItem('tip-skipped-categories', JSON.stringify(next))
      return next
    })
  }, [])

  const recommendations = useMemo(() => {
    const safeVisits = visits || {}
    const safeSkip = Array.isArray(skipped) ? skipped : []

    const visitedIds = Object.keys(safeVisits).sort((a, b) => safeVisits[b] - safeVisits[a])
    const allCategoryIds = CATEGORIES.map((c) => c.id)
    const unexplored = allCategoryIds.filter((id) => !safeVisits[id])
    const exploredButLess = allCategoryIds.filter((id) => safeVisits[id] && safeVisits[id] < 3 && !safeSkip.includes(id))
    const explored = visitedIds.filter((id) => safeVisits[id] >= 3)

    return {
      explore: unexplored.slice(0, 2),
      revisit: exploredButLess.slice(0, 2),
      favorites: explored.slice(0, 2),
      skipped: safeSkip,
    }
  }, [visits, skipped])

  const getCategoryById = useCallback((id) => CATEGORIES.find((c) => c.id === id), [])

  return { recommendations, trackVisit, skipRecommendation, resetSkip, getCategoryById }
}