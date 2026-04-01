'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-64 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-error-container/30 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-error text-xl">warning</span>
          </div>
          <p className="text-sm font-semibold text-on-surface mb-1">Render Error</p>
          <p className="text-xs text-on-surface-outline mb-4 max-w-md">
            Something went wrong while rendering this component.
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
