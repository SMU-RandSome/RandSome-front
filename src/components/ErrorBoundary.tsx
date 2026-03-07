import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start">
          <div className="w-full max-w-[430px] min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-4xl">😵</p>
            <h1 className="text-lg font-bold text-slate-900">문제가 발생했습니다</h1>
            <p className="text-sm text-slate-500">잠시 후 다시 시도해주세요.</p>
            <button
              onClick={() => window.location.replace('/')}
              className="mt-2 px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              처음으로 돌아가기
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
