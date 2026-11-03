import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      if (typeof indexedDB !== 'undefined') {
        indexedDB.deleteDatabase('JacksonHongPortfolioDB');
      }
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f4f0] text-[#202421] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-[#c8ccc3] p-8 shadow-md">
            <h2 className="font-serif text-2xl font-bold mb-3 text-[#202923]">
              Jackson Hong 포트폴리오
            </h2>
            <p className="text-sm text-[#555c55] mb-6 leading-relaxed">
              페이지를 불러오는 중 일시적인 오류가 발생했습니다. 아래 버튼을 눌러 초기 데이터로 복원하거나 페이지를 새로고침해 주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-[#202923] text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                페이지 새로고침
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 bg-[#f8f7f3] border border-[#c8ccc3] text-[#202421] text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
              >
                초기 데이터로 복원
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
