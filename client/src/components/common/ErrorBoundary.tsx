import { Component, type ReactNode } from 'react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="text-6xl">💥</div>
            <h2 className="text-2xl font-semibold">Bir şeyler ters gitti</h2>
            <p className="max-w-md text-text-muted">
              {this.state.error?.message ?? 'Beklenmeyen bir hata oluştu.'}
            </p>
            <Button onClick={() => window.location.reload()}>Sayfayı Yenile</Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
