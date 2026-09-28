import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Every page is lazy-loaded so visitors only download the module they open.
const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })));
const SimulatorPage = lazy(() => import('@/pages/SimulatorPage').then((m) => ({ default: m.SimulatorPage })));
const Training = lazy(() => import('@/pages/Training').then((m) => ({ default: m.Training })));
const Timeline = lazy(() => import('@/pages/Timeline').then((m) => ({ default: m.Timeline })));
const About = lazy(() => import('@/pages/About').then((m) => ({ default: m.About })));
const AutomationClockPage = lazy(() => import('@/pages/AutomationClockPage').then((m) => ({ default: m.AutomationClockPage })));
const BenchmarksPage = lazy(() => import('@/pages/BenchmarksPage').then((m) => ({ default: m.BenchmarksPage })));
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })));

function LoadingFallback() {
    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                minHeight: '100vh',
                background: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    border: '2px solid var(--stroke)',
                    borderTopColor: 'var(--ink)',
                    animation: 'spin 0.8s linear infinite',
                }}
            />
            <span className="sr-only">Loading…</span>
        </div>
    );
}

export function App() {
    return (
        <HelmetProvider>
            <BrowserRouter>
                <ScrollToTop />
                <ErrorBoundary
                    fallback={
                        <div className="error-boundary" style={{ minHeight: '100vh' }} role="alert">
                            <p className="error-boundary-title">Something went wrong</p>
                            <p style={{ color: 'var(--secondary)', maxWidth: '44ch' }}>
                                The page hit an unexpected error. Refreshing usually fixes it. If it keeps happening,
                                please report it on GitHub.
                            </p>
                            <a href="/" className="btn btn-primary">Back to home</a>
                        </div>
                    }
                >
                    <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/timeline" element={<Timeline />} />
                            <Route path="/transformer-simulator" element={<SimulatorPage />} />
                            <Route path="/transformer-training-simulator" element={<Training />} />
                            <Route path="/benchmarks" element={<BenchmarksPage />} />
                            <Route path="/automation-clock" element={<AutomationClockPage />} />
                            <Route path="/about" element={<About />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </ErrorBoundary>
            </BrowserRouter>
        </HelmetProvider>
    );
}
