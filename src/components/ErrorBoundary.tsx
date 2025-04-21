import React, { Component, ErrorInfo, ReactNode } from 'react';

    interface Props {
      children: ReactNode;
      fallback?: ReactNode; // Optional fallback UI
    }

    interface State {
      hasError: boolean;
      error?: Error;
    }

    class ErrorBoundary extends Component<Props, State> {
      public state: State = {
        hasError: false,
      };

      public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
      }

      public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
      }

      public render() {
        if (this.state.hasError) {
          // You can render any custom fallback UI
          return this.props.fallback || (
            <div className="text-error p-4 border border-error rounded">
              <p>Something went wrong with this component.</p>
              {/* Optionally display error details during development */}
              {import.meta.env.DEV && this.state.error && (
                <pre className="text-xs mt-2">{this.state.error.toString()}</pre>
              )}
            </div>
          );
        }

        return this.props.children;
      }
    }

    export default ErrorBoundary;
