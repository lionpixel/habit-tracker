'use client'

import React from 'react'

interface Props { children: React.ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <pre style={{
          padding: 24,
          color: '#f1f5f9',
          background: '#0d1117',
          fontSize: 13,
          whiteSpace: 'pre-wrap',
          minHeight: '100vh',
          fontFamily: 'monospace',
        }}>
          <strong style={{ color: '#ef4444' }}>App Error — cole isso na conversa com Claude:</strong>
          {'\n\n'}
          {this.state.error.message}
          {'\n\n'}
          {this.state.error.stack}
        </pre>
      )
    }
    return this.props.children
  }
}
