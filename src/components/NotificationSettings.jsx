import React, { useEffect } from 'react'
import { usePushNotifications } from '../hooks/usePushNotifications'

export default function NotificationSettings() {
  const { status, error, subscribe, unsubscribe, checkStatus } = usePushNotifications()

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window

  if (!isSupported) {
    return (
      <div className="notification-settings">
        <p className="notification-settings__unsupported">
          El teu navegador no suporta notificacions push.
        </p>
      </div>
    )
  }

  return (
    <div className="notification-settings">
      <h2 className="section-title">Notificacions</h2>
      <p className="notification-settings__desc">
        Rep el teu tip diari cada matí a les 8:00h automàticament.
      </p>

      {status === 'granted' ? (
        <div className="notification-settings__active">
          <span className="notification-settings__badge">✓ Notificacions activades</span>
          <button className="btn btn--outline" onClick={unsubscribe}>
            Desactivar
          </button>
        </div>
      ) : (
        <button
          className="btn btn--primary"
          onClick={subscribe}
          disabled={status === 'loading' || status === 'denied'}
        >
          {status === 'loading' ? 'Activant...' : 'Activar notificacions diàries'}
        </button>
      )}

      {status === 'denied' && (
        <p className="notification-settings__error">
          Has denegat els permisos. Activa-les des de la configuració del navegador.
        </p>
      )}

      {status === 'error' && error && (
        <p className="notification-settings__error">{error}</p>
      )}
    </div>
  )
}
