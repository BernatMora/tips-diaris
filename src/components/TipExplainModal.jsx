import React, { useState, useCallback, useMemo } from 'react'
import { explainTip } from '../utils/api'

const SECTION_DEFS = [
  { title: '💡 Per què funciona', marker: '**Per què funciona:**' },
  { title: '📋 Com aplicar-ho pas a pas', marker: '**Com aplicar-ho pas a pas:**' },
  { title: '⚠️ Errors comuns', marker: '**Errors comuns:**' },
  { title: '📚 Per aprendre\'n més', marker: '**Per aprendre\'n més:**' },
]

export default function TipExplainModal({ tip, category, difficulty, onClose }) {
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await explainTip(tip, category, difficulty)
      setExplanation(result)
    } catch (err) {
      setError(err.message || 'Error generant l\'explicació')
    } finally {
      setLoading(false)
    }
  }, [tip, category, difficulty])

  const sections = useMemo(() => {
    if (!explanation) return []
    const markers = SECTION_DEFS.map((s) => s.marker)
    return SECTION_DEFS.map(({ title, marker }) => {
      const idx = explanation.indexOf(marker)
      if (idx === -1) return null
      const start = idx + marker.length
      let end = explanation.length
      for (const nm of markers) {
        if (nm === marker) continue
        const ni = explanation.indexOf(nm, start)
        if (ni !== -1 && ni < end) end = ni
      }
      return { title, content: explanation.slice(start, end).trim() }
    }).filter(Boolean)
  }, [explanation])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tip-explain-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tancar">×</button>

        <div className="tip-explain-modal__header">
          <span className="tip-explain-modal__icon">{category.icon}</span>
          <div>
            <h2 className="tip-explain-modal__title">Saber-ne més</h2>
            <p className="tip-explain-modal__subtitle">{category.nom}</p>
          </div>
        </div>

        <div className="tip-explain-modal__content">
          <div className="tip-explain-modal__original">
            <label className="tip-explain-modal__label">Tip original</label>
            <p>{tip}</p>
          </div>

          {!explanation && !loading && !error && (
            <div className="tip-explain-modal__cta">
              <p className="tip-explain-modal__cta-text">
                Vols aprofundir en aquest consell? Obtín una explicació detallada amb context, passos pràctics i recomanacions.
              </p>
              <button className="btn btn--generate" onClick={handleGenerate}>
                ✨ Explica-m'ho
              </button>
            </div>
          )}

          {loading && (
            <div className="tip-explain-modal__loading">
              <div className="tip-loading">
                <span className="tip-loading__dot" />
                <span className="tip-loading__dot" />
                <span className="tip-loading__dot" />
              </div>
              <p>Generant l'explicació detallada...</p>
            </div>
          )}

          {error && <p className="app-error">{error}</p>}

          {sections.length > 0 && (
            <div className="tip-explain-modal__sections">
              {sections.map(({ title, content }) => (
                <div key={title} className="tip-explain-modal__section">
                  <h3 className="tip-explain-modal__section-title">{title}</h3>
                  <p>{content}</p>
                </div>
              ))}
              {sections.length === 0 && <p className="tip-explain-modal__raw">{explanation}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}