import React, { useState } from 'react'
import { CATEGORIES } from '../utils/categories'

const INITIAL_SHOW = 6

export default function CategorySelector({ selected, onSelect }) {
  const [showAll, setShowAll] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const visible = showAll ? CATEGORIES : CATEGORIES.slice(0, INITIAL_SHOW)

  return (
    <div className="category-selector">
      <button
        className="category-toggle"
        onClick={() => setExpanded((s) => !s)}
        aria-expanded={expanded}
      >
        <span className="category-toggle__label">
          <span className="category-toggle__icon">{expanded ? '\u25BC' : '\u25B6'}</span>
          Categoria
        </span>
        <span className="category-toggle__selected">
          {CATEGORIES.find((c) => c.id === selected)?.icon}{' '}
          {CATEGORIES.find((c) => c.id === selected)?.nom}
        </span>
      </button>
      {expanded && (
        <div className="category-grid">
          {visible.map((cat) => (
            <button
              key={cat.id}
              className={`category-card ${selected === cat.id ? 'category-card--active' : ''}`}
              onClick={() => onSelect(cat.id)}
              aria-pressed={selected === cat.id}
            >
              <span className="category-card__icon">{cat.icon}</span>
              <span className="category-card__name">{cat.nom}</span>
            </button>
          ))}
          {CATEGORIES.length > INITIAL_SHOW && (
            <button className="category-more-btn" onClick={() => setShowAll((s) => !s)}>
              {showAll ? '\u25B2 Mostra menys' : `\u25BC +${CATEGORIES.length - INITIAL_SHOW} mes`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
