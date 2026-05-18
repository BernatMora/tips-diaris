import React, { useState } from 'react'
import { CATEGORIES } from '../utils/categories'

const DIFF_LABEL = { basic: 'Bàsic', intermediate: 'Intermedi', advanced: 'Avançat' }

export default function SavedTips({ saved, onRemove }) {
  const [open, setOpen] = useState(false)

  if (!saved.length && !open) return null

  const count = saved.length

  return (
    <div className="saved-tips">
      <button className="saved-tips__toggle" onClick={() => setOpen((o) => !o)}>
        <span>📚 Tips desats</span>
        {count > 0 && <span className="saved-tips__count">{count}</span>}
        <span className="saved-tips__arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="saved-tips__list">
          {saved.length === 0 && (
            <p className="saved-tips__empty">Encara no has desat cap tip.</p>
          )}
          {saved.map((entry) => {
            const cat = CATEGORIES.find((c) => c.id === entry.category)
            const date = new Date(entry.date).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
            return (
              <div key={entry.id} className="saved-tip-card">
                <div className="saved-tip-card__header">
                  <span>{cat?.icon} {cat?.nom}</span>
                  <span className="saved-tip-card__meta">{DIFF_LABEL[entry.difficulty]} · {date}</span>
                </div>
                <p className="saved-tip-card__text">{entry.tip}</p>
                <button className="saved-tip-card__remove" onClick={() => onRemove(entry.id)} aria-label="Eliminar">
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
