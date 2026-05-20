import React, { useState } from 'react'
import { parseTip } from '../utils/parseTip'

const canShare = typeof navigator !== 'undefined' && !!navigator.share

export default function TipCard({ tip, loading, loadingMessage, category, difficulty, isSaved, onSave, rating, onRate }) {
  const [shared, setShared] = useState(false)

  if (loading) {
    return (
      <div className="tip-card tip-card--loading">
        <div className="tip-loading">
          <span className="tip-loading__dot" />
          <span className="tip-loading__dot" />
          <span className="tip-loading__dot" />
        </div>
        <p className="tip-loading__text">{loadingMessage || 'Generant el teu tip...'}</p>
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

  const parsed = parseTip(tip)

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

      {parsed.plain ? (
        <p className="tip-card__tip">{parsed.plain}</p>
      ) : (
        <div className="tip-card__sections">
          <p className="tip-card__tip">{parsed.consell}</p>
          <div className="tip-card__exemple">
            <span className="tip-card__section-label">Exemple pràctic</span>
            <p>{parsed.exemple}</p>
          </div>
          <div className="tip-card__repte">
            <span className="tip-card__section-label">🎯 Repte del dia</span>
            <p>{parsed.repte}</p>
          </div>
        </div>
      )}

      <div className="tip-card__actions">
        {canShare && (
          <button
            className={`tip-card__share ${shared ? 'tip-card__share--done' : ''}`}
            onClick={async () => {
              try {
                await navigator.share({
                  title: `${category?.icon} Tip de ${category?.nom}`,
                  text: tip,
                })
                setShared(true)
                setTimeout(() => setShared(false), 2000)
              } catch {}
            }}
            aria-label="Compartir tip"
            title="Compartir"
          >
            {shared ? '✓' : '↑'}
          </button>
        )}
        <button
          className={`tip-card__rate ${rating === 'up' ? 'tip-card__rate--up' : ''}`}
          onClick={() => onRate(tip, 'up')}
          aria-label="M'agrada"
          title="M'agrada"
        >
          👍
        </button>
        <button
          className={`tip-card__rate ${rating === 'down' ? 'tip-card__rate--down' : ''}`}
          onClick={() => onRate(tip, 'down')}
          aria-label="No m'agrada"
          title="No m'agrada"
        >
          👎
        </button>
        {rating && (
          <span className="tip-card__rate-label">
            {rating === 'up' ? 'Útil!' : 'No era el que buscava'}
          </span>
        )}
      </div>
    </div>
  )
}
