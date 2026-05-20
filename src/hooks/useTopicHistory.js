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

    // If we've seen all topics, reset the history to start a new cycle
    if (seen.length >= allTopics.length) {
      history[key] = []
    }

    const currentSeen = history[key]
    const unseen = allTopics.filter((t) => !currentSeen.includes(t))
    const topic = unseen[Math.floor(Math.random() * unseen.length)]

    history[key] = [...currentSeen, topic]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))

    return topic
  }, [])

  return { pickTopic }
}