import React, { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="install-prompt">
      <div className="install-prompt__content">
        <span className="install-prompt__icon">📱</span>
        <p className="install-prompt__text">Instal·la l'app per accedir-hi ràpidament</p>
        <div className="install-prompt__actions">
          <button className="btn btn--primary btn--sm" onClick={handleInstall}>
            Instal·lar
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => setShow(false)}>
            Ara no
          </button>
        </div>
      </div>
    </div>
  )
}
