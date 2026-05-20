import React from 'react'
import { CATEGORIES } from '../utils/categories'

export default function Recommendations({ recommendations, getCategoryById, onSelectCategory, onSkip }) {
  const hasAny = recommendations.explore.length > 0 || recommendations.revisit.length > 0 || recommendations.favorites.length > 0

  if (!hasAny) return null

  return (
    <div className="recommendations">
      <h2 className="recommendations__title">🌟 Recomanacions per a tu</h2>
      <p className="recommendations__subtitle">
        Basades en les categories que més visites
      </p>

      {recommendations.favorites.length > 0 && (
        <div className="recommendations__group">
          <h3 className="recommendations__group-title">🔥 Les teves preferides</h3>
          <div className="recommendations__list">
            {recommendations.favorites.map((catId) => {
              const cat = CATEGORIES.find((c) => c.id === catId)
              if (!cat) return null
              return (
                <button key={catId} className="recommendation-chip" onClick={() => onSelectCategory(catId)}>
                  <span className="recommendation-chip__icon">{cat.icon}</span>
                  <span className="recommendation-chip__name">{cat.nom}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {recommendations.explore.length > 0 && (
        <div className="recommendations__group">
          <h3 className="recommendations__group-title">🌱 Per explorar</h3>
          <div className="recommendations__list">
            {recommendations.explore.map((catId) => {
              const cat = CATEGORIES.find((c) => c.id === catId)
              if (!cat) return null
              return (
                <button key={catId} className="recommendation-chip recommendation-chip--new" onClick={() => onSelectCategory(catId)}>
                  <span className="recommendation-chip__icon">{cat.icon}</span>
                  <span className="recommendation-chip__name">{cat.nom}</span>
                  <span className="recommendation-chip__badge">Nou</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {recommendations.revisit.length > 0 && (
        <div className="recommendations__group">
          <h3 className="recommendations__group-title">🔄 Per redescobrir</h3>
          <div className="recommendations__list">
            {recommendations.revisit.map((catId) => {
              const cat = CATEGORIES.find((c) => c.id === catId)
              if (!cat) return null
              return (
                <div key={catId} className="recommendation-chip recommendation-chip--dim">
                  <button className="recommendation-chip__body" onClick={() => onSelectCategory(catId)}>
                    <span className="recommendation-chip__icon">{cat.icon}</span>
                    <span className="recommendation-chip__name">{cat.nom}</span>
                  </button>
                  <button
                    className="recommendation-chip__dismiss"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSkip(catId)
                    }}
                    aria-label="No recomanar"
                    title="No m'interessa"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}