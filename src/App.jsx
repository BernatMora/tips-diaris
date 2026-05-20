import React, { useState, useEffect, useCallback, useRef } from 'react'
import CategorySelector from './components/CategorySelector'
import DifficultySelector from './components/DifficultySelector'
import TipCard from './components/TipCard'
import NotificationSettings from './components/NotificationSettings'
import InstallPrompt from './components/InstallPrompt'
import SavedTips from './components/SavedTips'
import ScrollToTop from './components/ScrollToTop'
import Toast from './components/Toast'
import { CATEGORIES } from './utils/categories'
import { generateTip } from './utils/api'
import { useOfflineStorage } from './hooks/useOfflineStorage'
import { useSavedTips } from './hooks/useSavedTips'
import { useTopicHistory } from './hooks/useTopicHistory'
import { useTipRatings } from './hooks/useTipRatings'

export default function App() {
  const [categoryId, setCategoryId] = useState('guitarra')
  const [difficulty, setDifficulty] = useState('basic')
  const [tip, setTip] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [offline, setOffline] = useState(!navigator.onLine)
  const { saveTip: cacheLastTip, loadTip } = useOfflineStorage()
  const { saved, saveTip, removeTip, isSaved, syncing, clearAllTips } = useSavedTips()
  const { pickTopic } = useTopicHistory()
  const { rateTip, getRating } = useTipRatings()

  // Track if the current tip matches the selected category/difficulty
  const [tipContext, setTipContext] = useState(null)
  const tipIsStale = tip && tipContext && (tipContext.categoryId !== categoryId || tipContext.difficulty !== difficulty)
  const loadingMessages = [
    'Buscant el millor consell...',
    'Personalitzant per a tu...',
    'Consultant experts...',
    'Preparant el repte del dia...',
    'Gairebé llest...',
  ]
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)
  const loadingTimerRef = useRef(null)

  // Rotate loading messages
  useEffect(() => {
    if (loading) {
      loadingTimerRef.current = setInterval(() => {
        setLoadingMsgIndex((i) => (i + 1) % loadingMessages.length)
      }, 2500)
    } else {
      clearInterval(loadingTimerRef.current)
      setLoadingMsgIndex(0)
    }
    return () => clearInterval(loadingTimerRef.current)
  }, [loading])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlTip = params.get('tip')
    if (urlTip) {
      setTip(decodeURIComponent(urlTip))
      window.history.replaceState({}, '', '/')
      return
    }
    const cached = loadTip()
    if (cached) {
      setTip(cached.tip)
      const catId = cached.categoryId || 'guitarra'
      const diff = cached.difficulty || 'basic'
      if (cached.categoryId) setCategoryId(catId)
      if (cached.difficulty) setDifficulty(diff)
      setTipContext({ categoryId: catId, difficulty: diff })
    }
  }, [loadTip])

  useEffect(() => {
    const onOffline = () => setOffline(true)
    const onOnline = () => setOffline(false)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() })
  }, [])

  const category = CATEGORIES.find((c) => c.id === categoryId)
  const difficultyLabel = { basic: 'Bàsic', intermediate: 'Intermedi', advanced: 'Avançat' }[difficulty]

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const topic = pickTopic(categoryId, difficulty)
      const result = await generateTip(categoryId, difficulty, topic)
      setTip(result)
      cacheLastTip(result, categoryId, difficulty)
      setTipContext({ categoryId, difficulty })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      // If offline, try loading cached tip
      if (!navigator.onLine) {
        const cached = loadTip()
        if (cached) {
          setTip(cached.tip)
          setTipContext({ categoryId, difficulty })
          setError(null)
          showToast('📡 Mode offline — mostrant l\'últim tip disponible', 'info')
        } else {
          setError('Sense connexió i sense tip en caché. Connecta\'t a internet i torna-ho a provar.')
        }
      } else {
        setError(err.message || 'Error generant el tip. Comprova la connexió.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (tip) {
      saveTip(tip, categoryId, difficulty)
      showToast('Tip desat!')
    }
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  return (
    <div className="app">
      {offline && <div className="offline-badge">Mode offline</div>}

      <ScrollToTop />

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      <InstallPrompt />

      <header className="app-header">
        <h1 className="app-title">
          <span className="app-title__icon">✨</span>
          Tips Diaris
        </h1>
        <p className="app-subtitle">El teu consell personalitzat d'avui</p>
      </header>

      <main className="app-main">
        <CategorySelector selected={categoryId} onSelect={setCategoryId} />
        <DifficultySelector selected={difficulty} onSelect={setDifficulty} />

        <button className="btn btn--generate" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generant...' : '✨ Genera el meu tip'}
        </button>

        {error && <p className="app-error">{error}</p>}

        {tipIsStale && (
          <p className="stale-indicator">
            {category.icon} Categoria o nivell canviat — prem <strong>Genera el meu tip</strong> per obtenir un de nou
          </p>
        )}

        <TipCard
          tip={tip}
          loading={loading}
          loadingMessage={loadingMessages[loadingMsgIndex]}
          category={category}
          difficulty={difficultyLabel}
          isSaved={tip ? isSaved(tip) : false}
          onSave={handleSave}
          rating={tip ? getRating(tip) : null}
          onRate={(tipText, value) => {
            rateTip(tipText, value)
            showToast(value === 'up' ? 'Valorat com a útil!' : 'Gràcies pel feedback!', 'info')
          }}
        />

        {tip && !loading && (
          <button className="btn btn--outline" onClick={handleRegenerate} style={{ width: '100%' }}>
            {'\u21BB'} Un altre tip
          </button>
        )}

        <SavedTips saved={saved} onRemove={removeTip} syncing={syncing} clearAll={clearAllTips} showToast={showToast} />

        <NotificationSettings />
      </main>

      <footer className="app-footer">
        <p>Generat amb IA · Tips Diaris</p>
      </footer>
    </div>
  )
}