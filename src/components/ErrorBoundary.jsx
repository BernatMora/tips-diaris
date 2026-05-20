import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <span className="error-boundary__icon">⚠️</span>
          <h2 className="error-boundary__title">Alguna cosa ha anat malament</h2>
          <p className="error-boundary__text">Torna-ho a intentar o recarrega la pàgina.</p>
          <button
            className="btn btn--primary"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
          >
            Recarregar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}