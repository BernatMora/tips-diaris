import React from 'react'
import { DIFFICULTIES } from '../utils/categories'

export default function DifficultySelector({ selected, onSelect }) {
  return (
    <div className="difficulty-selector">
      <h2 className="section-title">Nivell</h2>
      <div className="difficulty-tabs">
        {DIFFICULTIES.map((diff) => (
          <button
            key={diff.id}
            className={`difficulty-tab ${selected === diff.id ? 'difficulty-tab--active' : ''}`}
            onClick={() => onSelect(diff.id)}
            aria-pressed={selected === diff.id}
          >
            {diff.label}
          </button>
        ))}
      </div>
    </div>
  )
}
