import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
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
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="glass-card p-10 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle size={32} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Une erreur est survenue
              </h3>
              <p className="text-sm text-zinc-500 mb-1">
                حدث خطأ غير متوقع
              </p>
              <p className="text-xs text-zinc-600 font-mono mt-4 bg-surface rounded-xl p-3 text-start break-all">
                {this.state.error?.message}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              <RefreshCw size={16} />
              Réessayer / إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
