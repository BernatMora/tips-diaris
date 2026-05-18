import React from 'react'
import { CATEGORIES } from '../utils/categories'

export default function CategorySelector({ selected, onSelect }) {
  return (
    <div className="category-selector">
      <h2 className="section-title">Categoria</h2>
      <div className="category-grid">
        {CATEGORIES.map((cat) => (
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
      </div>
    </div>
  )
}
