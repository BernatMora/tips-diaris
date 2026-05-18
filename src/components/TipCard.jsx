import React from 'react'

export default function TipCard({ tip, loading, category, difficulty, isSaved, onSave }) {
  if (loading) {
    return (
      <div className="tip-card tip-card--loading">
        <div className="tip-loading">
          <span className="tip-loading__dot" />
          <span className="tip-loading__dot" />
          <span className="tip-loading__dot" />
        </div>
        <p className="tip-loading__text">Generant el teu tip...</p>
      </div>
    )
  }

  if (!tip) {
    return (
      <div className="tip-card tip-card--empty">
        <p className="tip-card__empty-text">
          Selecciona una categoria i nivell, i prem <strong>Genera el meu tip</strong>
        </p>
      </div>
    )
  }

  return (
    <div className="tip-card">
      <div className="tip-card__header">
        <span className="tip-card__icon">{category?.icon}</span>
        <div>
          <h3 className="tip-card__category">{category?.nom}</h3>
          <span className="tip-card__difficulty">{difficulty}</span>
        </div>
        <button
          className={`tip-card__save ${isSaved ? 'tip-card__save--saved' : ''}`}
          onClick={onSave}
          aria-label={isSaved ? 'Ja desat' : 'Desar tip'}
          title={isSaved ? 'Ja desat' : 'Desar tip'}
        >
          {isSaved ? '★' : '☆'}
        </button>
      </div>
      <p className="tip-card__tip">{tip}</p>
    </div>
  )
}
