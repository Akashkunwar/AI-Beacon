import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import '@/index.css';
import { ScrollToTop } from '@/components/common/ScrollToTop';

// Lazy-load pages as per SKILL.md performance guidelines
const Home = lazy(() =>
    import('@/pages/Home').then((m) => ({ default: m.Home }))
);
const SimulatorPage = lazy(() =>
    import('@/pages/SimulatorPage').then((m) => ({ default: m.SimulatorPage }))
);
const Training = lazy(() =>
    import('@/pages/Training').then((m) => ({ default: m.Training }))
);
const Timeline = lazy(() =>
    import('@/pages/Timeline').then((m) => ({ default: m.Timeline }))
);

// Minimal loading fallback — light background while pages load
function LoadingFallback() {
    return (
        <div
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
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: '2px solid var(--stroke)',
                    borderTopColor: 'var(--ink)',
                    animation: 'spin 0.8s linear infinite',
                }}
            />
        </div>
    );
}

export function App() {
    return (
        <HelmetProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/transformer-simulator" element={<SimulatorPage />} />
                        <Route path="/transformer-training-simulator" element={<Training />} />
                        <Route path="/timeline" element={<Timeline />} />
                        {/* Catch-all → redirect to home */}
                        <Route path="*" element={<Home />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </HelmetProvider>
    );
}
