import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log to console (dev) and could be sent to remote logging here
    console.error('ErrorBoundary caught an error:', error);
    console.error(info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Something went wrong.</h2>
          <p>
            The application encountered an unexpected error. Check the developer console for details.
          </p>
          {this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
              {this.state.error.toString()}
              <br />
              {this.state.info?.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
