import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import FamilyCookbook from './FamilyCookbook'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Error Boundary for the whole app
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4 text-emerald-400">Oops! Something went wrong.</h1>
          <p className="text-slate-400 mb-8 max-w-md">Our secret family recipe book hit a snag. Please try refreshing the page.</p>
          <pre className="bg-white/5 p-4 rounded-xl text-left text-xs overflow-auto max-w-full mb-8 text-rose-400">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-emerald-500 text-white rounded-full font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            Refresh Recipes
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Register service worker for PWA safely
try {
  registerSW({ immediate: true })
} catch (e) {
  console.warn('PWA registration failed', e)
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (cacheTime renamed to gcTime in v5)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <FamilyCookbook />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
