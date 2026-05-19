import { useState, useCallback, useEffect, useRef } from 'react'

const LOCAL_KEY = 'tips-diaris-saved'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') } catch { return [] }
}

function saveLocal(tips) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(tips)) } catch {}
}

export function useSavedTips() {
  const [saved, setSaved] = useState(loadLocal)
  const [syncing, setSyncing] = useState(false)
  const syncedRef = useRef(false)

  // Carrega del servidor en muntar (una sola vegada)
  useEffect(() => {
    if (syncedRef.current) return
    syncedRef.current = true
    fetch('/api/saved-tips')
      .then((r) => r.ok ? r.json() : null)
      .then((serverTips) => {
        if (Array.isArray(serverTips) && serverTips.length > 0) {
          setSaved(serverTips)
          saveLocal(serverTips)
        }
      })
      .catch(() => {})
  }, [])

  const saveTip = useCallback(async (tip, category, difficulty) => {
    setSyncing(true)
    try {
      const res = await fetch('/api/saved-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', tip, category, difficulty }),
      })
      if (res.ok) {
        const updated = await res.json()
        setSaved(updated)
        saveLocal(updated)
      } else {
        throw new Error('server-error')
      }
    } catch {
      // offline o error del servidor: desa localment
      setSaved((prev) => {
        const entry = { id: Date.now(), tip, category, difficulty, date: new Date().toISOString() }
        const filtered = prev.filter((t) => t.tip !== tip)
        const updated = [entry, ...filtered].slice(0, 50)
        saveLocal(updated)
        return updated
      })
    } finally {
      setSyncing(false)
    }
  }, [])

  const removeTip = useCallback(async (id) => {
    setSyncing(true)
    try {
      const res = await fetch('/api/saved-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', id }),
      })
      if (res.ok) {
        const updated = await res.json()
        setSaved(updated)
        saveLocal(updated)
      } else {
        throw new Error('server-error')
      }
    } catch {
      // offline o error del servidor: elimina localment
      setSaved((prev) => {
        const updated = prev.filter((t) => t.id !== id)
        saveLocal(updated)
        return updated
      })
    } finally {
      setSyncing(false)
    }
  }, [])

  const isSaved = useCallback((tip) => saved.some((t) => t.tip === tip), [saved])

  return { saved, saveTip, removeTip, isSaved, syncing }
}
