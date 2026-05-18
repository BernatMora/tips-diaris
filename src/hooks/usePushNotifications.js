import { useState, useCallback } from 'react'
import { getVapidPublicKey, saveSubscription, urlBase64ToUint8Array } from '../utils/api'

export function usePushNotifications() {
  const [status, setStatus] = useState('idle') // idle | loading | granted | denied | error
  const [error, setError] = useState(null)

  const subscribe = useCallback(async () => {
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

      await saveSubscription(subscription.toJSON())
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
      setStatus('idle')
    } catch {}
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

  return { status, error, subscribe, unsubscribe, checkStatus }
}
