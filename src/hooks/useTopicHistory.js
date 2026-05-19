import { useCallback } from 'react'
import { CATEGORIES } from '../utils/categories'

const STORAGE_KEY = 'topic-history'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

export function useTopicHistory() {
  const pickTopic = useCallback((categoryId, difficulty) => {
    const category = CATEGORIES.find((c) => c.id === categoryId)
    if (!category?.topics?.[difficulty]) return null

    const allTopics = category.topics[difficulty]
    const key = `${categoryId}-${difficulty}`
    const history = loadHistory()
    const seen = history[key] || []

    const unseen = allTopics.filter((t) => !seen.includes(t))
    const pool = unseen.length > 0 ? unseen : allTopics
    const topic = pool[Math.floor(Math.random() * pool.length)]

    history[key] = unseen.length > 0 ? [...seen, topic] : [topic]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))

    return topic
  }, [])

  return { pickTopic }
}
