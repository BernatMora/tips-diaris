import { useCallback } from 'react'

const KEY = 'tips-diaris-last-tip'

export function useOfflineStorage() {
  const saveTip = useCallback((tip, categoryId, difficulty) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ tip, categoryId, difficulty, date: new Date().toISOString() }))
    } catch {}
  }, [])

  const loadTip = useCallback(() => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  return { saveTip, loadTip }
}
