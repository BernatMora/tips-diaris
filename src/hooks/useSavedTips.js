import { useState, useCallback, useEffect } from 'react'

const KEY = 'tips-diaris-saved'
const MAX = 50

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function save(tips) {
  try { localStorage.setItem(KEY, JSON.stringify(tips)) } catch {}
}

export function useSavedTips() {
  const [saved, setSaved] = useState(load)

  useEffect(() => { save(saved) }, [saved])

  const saveTip = useCallback((tip, category, difficulty) => {
    setSaved((prev) => {
      const entry = { id: Date.now(), tip, category, difficulty, date: new Date().toISOString() }
      const filtered = prev.filter((t) => t.tip !== tip) // no duplicats
      return [entry, ...filtered].slice(0, MAX)
    })
  }, [])

  const removeTip = useCallback((id) => {
    setSaved((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const isSaved = useCallback((tip) => saved.some((t) => t.tip === tip), [saved])

  return { saved, saveTip, removeTip, isSaved }
}
