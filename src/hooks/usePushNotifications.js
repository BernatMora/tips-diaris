import { useState, useCallback } from 'react'
import { getVapidPublicKey, saveSubscription, urlBase64ToUint8Array } from '../utils/api'

const CATEGORIES_KEY = 'notif-categories'

function loadSavedCategories() {
  try { return JSON.parse(localStorage.getItem(CATEGORIES_KEY)) }
  catch { return null }
}

export function usePushNotifications() {
  const [status, setStatus] = useState('idle') // idle | loading | granted | denied | error
  const [error, setError] = useState(null)

  const subscribe = useCallback(async (categories = null) => {
    setStatus('loading')
    setError(null)

    try {
      if (!('Notification' in window)) throw new Error('El teu navegador no suporta notificacions')
      if (!('serviceWorker' in navigator)) throw new Error('El teu navegador no suporta service workers')

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return false
      }

      const reg = await navigator.serviceWorker.ready
      const publicKey = await getVapidPublicKey()
      const applicationServerKey = urlBase64ToUint8Array(publicKey)

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      if (categories?.length) {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
      } else {
        localStorage.removeItem(CATEGORIES_KEY)
      }

      await saveSubscription(subscription.toJSON(), categories)
      setStatus('granted')
      return true
    } catch (err) {
      setError(err.message)
      setStatus('error')
      return false
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
      localStorage.removeItem(CATEGORIES_KEY)
      setStatus('idle')
    } catch {}
  }, [])

  const updateCategories = useCallback(async (categories) => {
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return false
      if (categories?.length) {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
      } else {
        localStorage.removeItem(CATEGORIES_KEY)
      }
      await saveSubscription(sub.toJSON(), categories)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [])

  const checkStatus = useCallback(async () => {
    if (!('Notification' in window)) return setStatus('idle')
    if (Notification.permission === 'denied') return setStatus('denied')
    if (Notification.permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        setStatus(sub ? 'granted' : 'idle')
      } catch {
        setStatus('idle')
      }
    }
  }, [])

  return { status, error, subscribe, unsubscribe, updateCategories, checkStatus, loadSavedCategories }
}
