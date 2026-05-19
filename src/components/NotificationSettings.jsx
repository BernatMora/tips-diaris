import React, { useEffect, useState } from 'react'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { CATEGORIES } from '../utils/categories'

export default function NotificationSettings() {
  const { status, error, subscribe, unsubscribe, updateCategories, checkStatus, loadSavedCategories } =
    usePushNotifications()

  const [selectedCats, setSelectedCats] = useState(() => {
    const saved = loadSavedCategories()
    return saved ?? CATEGORIES.map((c) => c.id)
  })
  const [saveStatus, setSaveStatus] = useState(null) // null | 'saving' | 'saved'

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  const isSupported =
    'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window

  if (!isSupported) {
    return (
      <div className="notification-settings">
        <p className="notification-settings__unsupported">
          El teu navegador no suporta notificacions push.
        </p>
      </div>
    )
  }

  const toggleCat = (id) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
    setSaveStatus(null)
  }

  const handleSubscribe = () => {
    const cats = selectedCats.length === CATEGORIES.length ? null : selectedCats
    subscribe(cats)
  }

  const handleUpdateCategories = async () => {
    setSaveStatus('saving')
    const cats = selectedCats.length === CATEGORIES.length ? null : selectedCats
    const ok = await updateCategories(cats)
    setSaveStatus(ok ? 'saved' : null)
    if (ok) setTimeout(() => setSaveStatus(null), 2000)
  }

  return (
    <div className="notification-settings">
      <h2 className="section-title">Notificacions</h2>
      <p className="notification-settings__desc">
        Rep el teu tip diari cada matí automàticament.
      </p>

      <div className="notif-categories">
        <p className="notif-categories__title">Categories que vols rebre</p>
        <div className="notif-categories__grid">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              className={`notif-category-check ${selectedCats.includes(cat.id) ? 'notif-category-check--active' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedCats.includes(cat.id)}
                onChange={() => toggleCat(cat.id)}
                style={{ display: 'none' }}
              />
              <span className="notif-category-check__icon">{cat.icon}</span>
              {cat.nom}
            </label>
          ))}
        </div>
      </div>

      {status === 'granted' ? (
        <div className="notification-settings__active">
          <span className="notification-settings__badge">✓ Notificacions activades</span>
          <button
            className="btn btn--outline btn--sm"
            onClick={handleUpdateCategories}
            disabled={saveStatus === 'saving' || selectedCats.length === 0}
          >
            {saveStatus === 'saving' ? 'Desant...' : saveStatus === 'saved' ? '✓ Desat' : 'Desar categories'}
          </button>
          <button className="btn btn--outline btn--sm" onClick={unsubscribe}>
            Desactivar
          </button>
        </div>
      ) : (
        <button
          className="btn btn--primary"
          onClick={handleSubscribe}
          disabled={status === 'loading' || status === 'denied' || selectedCats.length === 0}
        >
          {status === 'loading' ? 'Activant...' : 'Activar notificacions diàries'}
        </button>
      )}

      {selectedCats.length === 0 && (
        <p className="notification-settings__error">Selecciona almenys una categoria.</p>
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
