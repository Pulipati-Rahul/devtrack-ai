'use client';

import * as React from 'react';
import { Icons } from './ui/icons';

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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
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
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-card border border-border/40 rounded-xl max-w-xl mx-auto my-12 shadow-sm">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
              <Icons.Warning size={24} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-display font-semibold">An unexpected error occurred</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {this.state.error?.message || "Something went wrong when loading this part of the screen."}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary rounded-lg shadow-sm hover:opacity-90 transition-opacity"
            >
              <Icons.Spinner size={14} className="animate-spin" />
              <span>Retry Render</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
