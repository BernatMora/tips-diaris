import React, { useState, useEffect } from 'react'
import CategorySelector from './components/CategorySelector'
import DifficultySelector from './components/DifficultySelector'
import TipCard from './components/TipCard'
import NotificationSettings from './components/NotificationSettings'
import InstallPrompt from './components/InstallPrompt'
import SavedTips from './components/SavedTips'
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
  const { saveTip: cacheLastTip, loadTip } = useOfflineStorage()
  const { saved, saveTip, removeTip, isSaved } = useSavedTips()
  const { pickTopic } = useTopicHistory()
  const { rateTip, getRating } = useTipRatings()

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
      if (cached.categoryId) setCategoryId(cached.categoryId)
      if (cached.difficulty) setDifficulty(cached.difficulty)
    }
  }, [loadTip])

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
    } catch (err) {
      setError(err.message || 'Error generant el tip. Comprova la connexió.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (tip) saveTip(tip, categoryId, difficulty)
  }

  return (
    <div className="app">
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

        <TipCard
          tip={tip}
          loading={loading}
          category={category}
          difficulty={difficultyLabel}
          isSaved={tip ? isSaved(tip) : false}
          onSave={handleSave}
          rating={tip ? getRating(tip) : null}
          onRate={rateTip}
        />

        <SavedTips saved={saved} onRemove={removeTip} />

        <NotificationSettings />
      </main>

      <footer className="app-footer">
        <p>Generat amb IA · Tips Diaris</p>
      </footer>
    </div>
  )
}
