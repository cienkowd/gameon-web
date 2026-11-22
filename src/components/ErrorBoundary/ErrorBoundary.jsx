import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Here you could send error to logging service
        // logErrorToService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h2 style={{ color: '#e54a23', marginBottom: '16px' }}>
                        Ups! Coś poszło nie tak
                    </h2>
                    <p style={{ color: '#666', marginBottom: '24px', maxWidth: '500px' }}>
                        Wystąpił nieoczekiwany błąd. Proszę odświeżyć stronę lub spróbować ponownie później.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            backgroundColor: '#e54a23',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#d63910'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#e54a23'}
                    >
                        Odśwież stronę
                    </button>
                    
                    {process.env.NODE_ENV === 'development' && (
                        <details style={{ marginTop: '20px', textAlign: 'left' }}>
                            <summary style={{ cursor: 'pointer', color: '#666' }}>
                                Szczegóły błędu (tryb deweloperski)
                            </summary>
                            <pre style={{ 
                                backgroundColor: '#f5f5f5', 
                                padding: '10px', 
                                borderRadius: '4px',
                                fontSize: '12px',
                                overflow: 'auto',
                                maxWidth: '80vw'
                            }}>
                                {this.state.error && this.state.error.toString()}
                                <br />
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 