import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#181818] border border-[#E53935]/50 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#E53935]/20 border border-[#E53935]/50 flex items-center justify-center text-[#E53935]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {this.props.fallbackTitle || 'Rendering Diagnostics Encountered'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                A non-critical component error was captured safely by the application boundary. 
                Your session and navigation remain active.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-2.5 bg-black/50 rounded-lg text-left text-[11px] font-mono text-[#E53935] overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C29D26] text-black text-xs font-bold shadow-md hover:brightness-110 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Component View</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
