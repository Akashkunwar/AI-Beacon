import { Component, ErrorInfo, ReactNode } from 'react';

// ─── ErrorBoundary Props & State ──────────────────────────────────────────────

interface ErrorBoundaryProps {
    children: ReactNode;
    /** Optional custom fallback — if not provided, uses the default DEPTH error UI */
    fallback?: ReactNode;
    /** Optional callback when an error is caught */
    onError?: (error: Error, info: ErrorInfo) => void;
    /** Label for the reset button */
    resetLabel?: string;
    /** Callback when user clicks reset */
    onReset?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

// ─── ErrorBoundary ────────────────────────────────────────────────────────────

/**
 * Class-based error boundary (React requirement — hooks can't catch render errors).
 * Wraps each pipeline step component to prevent the whole app from crashing.
 *
 * On error: shows a friendly message + error type + optional reset button.
 * Never shows a blank screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        // Log for debugging — in production this would go to a monitoring service
        console.error('[DEPTH ErrorBoundary]', error, info);
        this.props.onError?.(error, info);
    }

    handleReset = (): void => {
        this.props.onReset?.();
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback takes priority
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const { error } = this.state;
            const errorMessage = error?.message ?? 'Unknown error';
            const resetLabel = this.props.resetLabel ?? 'Reset to previous step';

            return (
                <div
                    className="error-boundary glass-card"
                    role="alert"
                    aria-label={`Error: ${errorMessage}`}
                >
                    {/* Error icon */}
                    <div
                        aria-hidden="true"
                        style={{ fontSize: 'var(--text-2xl)', color: 'var(--ink)' }}
                    >
                        ⚠
                    </div>

                    <p className="error-boundary-title">Oops! This computation hit an issue.</p>

                    <code className="error-boundary-message">{errorMessage}</code>

                    <p
                        style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--secondary)',
                            maxWidth: '360px',
                        }}
                    >
                        A math or rendering error occurred in this step. You can reset and
                        try with different parameters.
                    </p>

                    {this.props.onReset && (
                        <button
                            className="btn btn-primary"
                            onClick={this.handleReset}
                            aria-label={resetLabel}
                        >
                            ↺ {resetLabel}
                        </button>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
