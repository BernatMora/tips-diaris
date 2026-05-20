import React, { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onDone) onDone()
    }, 2000)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!visible) return null

  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : ''

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">{emoji}</span>
      <span className="toast__message">{message}</span>
    </div>
  )
}