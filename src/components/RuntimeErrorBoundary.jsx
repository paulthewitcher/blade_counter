import React from 'react';

export default class RuntimeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1>Blade Counter</h1>
        <p>Si è verificato un errore durante l'avvio dell'app.</p>
        <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 12, background: '#f1f5f9', borderRadius: 12 }}>
          {this.state.error.message}
        </pre>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 14px', borderRadius: 10, border: 0, background: '#111', color: '#fff' }}>
          Ricarica
        </button>
      </main>
    );
  }
}
