import { useState, useRef, useEffect, useMemo } from 'react';
import { LLMModel, PlacedModel, getXPosition, getPixelPosition, assignLanes } from '@/utils/timeline';
import { TimelineNode } from './TimelineNode';
import { TabType } from '@/components/timeline/TimelineHeader';

interface TimelineCanvasProps {
    activeTab: TabType;
    models: LLMModel[];
    filteredModelIds: Set<number>;
    selectedModelId: number | null;
    onModelSelect: (id: number) => void;
}



export function TimelineCanvas({ activeTab, models: baseModels, filteredModelIds, selectedModelId, onModelSelect }: TimelineCanvasProps) {
    const START_YEAR = useMemo(() => {
        if (baseModels.length === 0) return 2017;
        const minYear = Math.min(...baseModels.map(m => parseInt(m.release_date.split('-')[0])));
        return Math.min(2017, minYear);
    }, [baseModels]);

    const END_YEAR = useMemo(() => {
        if (baseModels.length === 0) return 2026;
        const maxYear = Math.max(...baseModels.map(m => parseInt(m.release_date.split('-')[0])));
        return Math.max(2026, maxYear); // Cap at exactly maxYear without artificial padding
    }, [baseModels]);
    const TOTAL_MONTHS = (END_YEAR - START_YEAR + 1) * 12;

    const containerRef = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);
    const [activeYear, setActiveYear] = useState(START_YEAR);
    const [zoom, setZoom] = useState(1);
    const [lastScrolledTab, setLastScrolledTab] = useState<TabType | null>(null);

    const pixelsPerMonth = 56 * zoom;
    const CANVAS_WIDTH = getPixelPosition(TOTAL_MONTHS, pixelsPerMonth, START_YEAR);

    // Compute lanes dynamically based on current pixel mapping
    const models = useMemo(() => assignLanes(baseModels, pixelsPerMonth, START_YEAR), [baseModels, pixelsPerMonth, START_YEAR]);

    const handleScroll = () => {
        if (!scrolled) setScrolled(true);
        if (containerRef.current) {
            const scrollLeft = containerRef.current.scrollLeft;
            // Calculate which year is mostly in view based on scroll position
            // Center of viewport in canvas coordinates:
            const centerXs = scrollLeft + containerRef.current.clientWidth / 2;
            const approxMonth = Math.max(0, Math.floor(centerXs / pixelsPerMonth));
            const year = Math.min(END_YEAR, START_YEAR + Math.floor(approxMonth / 12));
            setActiveYear(year);
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });

            // Initial scroll to optimal position for the latest model
            if (lastScrolledTab !== activeTab) {
                // adding a small timeout gives layout time to compute actual scrollWidth
                setTimeout(() => {
                    if (containerRef.current) {
                        if (baseModels.length > 0) {
                            const latestDate = baseModels.reduce((latest, m) => m.release_date > latest ? m.release_date : latest, "2017-01-01");
                            const latestX = getXPosition(latestDate, pixelsPerMonth, START_YEAR);
                            // Position latest model near right edge, allowing some padding
                            containerRef.current.scrollLeft = Math.max(0, latestX - containerRef.current.clientWidth + 300);
                        } else {
                            containerRef.current.scrollLeft = containerRef.current.scrollWidth;
                        }
                        setLastScrolledTab(activeTab);
                    }
                }, 100);
            }

            // Intercept mouse wheel events to scroll horizontally instead of vertically
            const handleWheel = (e: WheelEvent) => {
                if (e.deltaY !== 0 && containerRef.current) {
                    e.preventDefault();
                    containerRef.current.scrollLeft += e.deltaY * 2.5;
                }
            };

            // Must use non-passive event listener to allow e.preventDefault()
            container.addEventListener('wheel', handleWheel, { passive: false });

            return () => {
                container.removeEventListener('scroll', handleScroll);
                container.removeEventListener('wheel', handleWheel);
            };
        }
    }, [scrolled, lastScrolledTab, activeTab, baseModels, pixelsPerMonth]);

    const jumpToYear = (year: number) => {
        if (containerRef.current) {
            const monthsFromStart = (year - START_YEAR) * 12;
            const xPos = getPixelPosition(monthsFromStart, pixelsPerMonth, START_YEAR);
            // Center the year marker slightly
            const offset = (containerRef.current.clientWidth / 2) - 100;
            containerRef.current.scrollTo({
                left: Math.max(0, xPos - offset),
                behavior: 'smooth'
            });
            setActiveYear(year);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!containerRef.current) return;
        const jump = 200;
        if (e.key === 'ArrowRight') {
            containerRef.current.scrollBy({ left: jump, behavior: 'smooth' });
            e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
            containerRef.current.scrollBy({ left: -jump, behavior: 'smooth' });
            e.preventDefault();
        }
    };

    // Selected model tracking to scroll it into view from table click
    useEffect(() => {
        if (selectedModelId !== null && containerRef.current) {
            const selected = models.find(m => m.id === selectedModelId);
            if (selected) {
                const nodeX = getXPosition(selected.release_date, pixelsPerMonth, START_YEAR);
                const rect = containerRef.current.getBoundingClientRect();
                const viewLeft = containerRef.current.scrollLeft;
                const viewRight = viewLeft + rect.width;

                // If it's outside the view, scroll to it
                if (nodeX < viewLeft + 100 || nodeX > viewRight - 100) {
                    containerRef.current.scrollTo({
                        left: Math.max(0, nodeX - rect.width / 2),
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [selectedModelId, models, pixelsPerMonth]);

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newZoom = parseFloat(e.target.value);
        if (containerRef.current) {
            const container = containerRef.current;
            const centerXs = container.scrollLeft + container.clientWidth / 2;
            const monthAtCenter = centerXs / pixelsPerMonth;

            const newPixelsPerMonth = 56 * newZoom;
            const newCenterXs = monthAtCenter * newPixelsPerMonth;

            setZoom(newZoom);

            requestAnimationFrame(() => {
                if (containerRef.current) {
                    containerRef.current.scrollLeft = Math.max(0, newCenterXs - containerRef.current.clientWidth / 2);
                }
            });
        } else {
            setZoom(newZoom);
        }
    };


    const canvasHeight = 'clamp(320px, 60vh, 660px)';

    return (
        <div style={{ position: 'relative', margin: 'var(--s6) 0' }} className="timeline-canvas-wrapper">
            {/* Jump to year controls */}
            <div className="depth-container timeline-canvas-controls">
                <div className="timeline-zoom-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Zoom</span>
                        <input
                            type="range"
                            min="0.5"
                            max="4"
                            step="0.1"
                            value={zoom}
                            onChange={handleZoomChange}
                            style={{ width: '120px', accentColor: 'var(--ink)' }}
                            aria-label="Timeline zoom level"
                        />
                    </div>
                </div>
                <div className="timeline-year-row">
                    {Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i).map(year => (
                        <button
                            key={year}
                            onClick={() => jumpToYear(year)}
                            type="button"
                            className="timeline-year-btn"
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-xs)',
                                color: activeYear === year ? 'var(--text-inverse)' : 'var(--muted)',
                                background: activeYear === year ? 'var(--ink)' : 'transparent',
                                border: 'none',
                                borderRadius: 'var(--r-sm)',
                                padding: 'var(--s2) var(--s3)',
                                minHeight: 44,
                                cursor: 'pointer',
                                transition: 'all var(--dur-fast) var(--ease-out)',
                                flexShrink: 0,
                            }}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scroll hint */}
            <div
                className="timeline-scroll-hint"
                style={{
                    position: 'absolute',
                    right: 0,
                    height: canvasHeight,
                    background: 'linear-gradient(to right, transparent, var(--bg-panel))',
                    zIndex: 2,
                    pointerEvents: 'none',
                    opacity: scrolled ? 0 : 1,
                    transition: 'opacity var(--dur-slow) var(--ease-out)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 'var(--s4)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted)',
                }}
            >
                scroll &rarr;
            </div>

            {/* Main Scroll Container */}
            <div
                ref={containerRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                aria-label="AI model timeline, use arrow keys to scroll"
                className="timeline-scroll-container"
                style={{
                    width: '100%',
                    height: canvasHeight,
                    background: 'var(--bg-panel)',
                    borderTop: '1px solid var(--stroke)',
                    borderBottom: '1px solid var(--stroke)',
                    overflowX: 'scroll',
                    overflowY: 'visible',
                    scrollBehavior: 'smooth',
                    position: 'relative',
                    outlineOffset: '2px',
                }}
            >
                {/* Inner Canvas */}
                <div style={{
                    position: 'relative',
                    minWidth: '100%',
                    width: `${CANVAS_WIDTH + 200}px`, // + padding
                    height: '100%',
                    padding: '0 var(--s8)',
                    boxSizing: 'border-box'
                }}>

                    {/* Spine / X-Axis */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'var(--timeline-spine)',
                        transform: 'translateY(-50%)'
                    }} />

                    {/* Years & Tick marks */}
                    {Array.from({ length: TOTAL_MONTHS + 1 }).map((_, i) => {
                        const month = i % 12;
                        const year = Math.floor(i / 12) + START_YEAR;
                        const xPos = getPixelPosition(i, pixelsPerMonth, START_YEAR);

                        if (month === 0 && year <= END_YEAR) {
                            // Year label
                            return (
                                <div key={`year-${year}`} style={{
                                    position: 'absolute',
                                    left: xPos,
                                    height: '100%',
                                    top: 0
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 'var(--s2)',
                                        left: 0,
                                        transform: 'translateX(-50%)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--text-xs)',
                                        color: 'var(--timeline-year-label)',
                                        textTransform: 'uppercase'
                                    }}>
                                        {year}
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 'var(--s6)',
                                        height: 'calc(100% - var(--s6))',
                                        borderLeft: '1px dashed var(--stroke)'
                                    }} />
                                    {/* Major Tick */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '-0.5px', // center the 1px tick
                                        height: '12px',
                                        width: '1px',
                                        background: 'var(--timeline-tick)',
                                        transform: 'translateY(-50%)'
                                    }} />
                                </div>
                            );
                        } else if ((month + 1) % 3 === 0 && month !== 11 && i < TOTAL_MONTHS && year < 2023) {
                            // Quarter Tick for pre-2023 (Mar = 2, Jun = 5, Sep = 8)
                            const monthNames = ["", "", "Mar", "", "", "Jun", "", "", "Sep", "", "", "Dec"];
                            return (
                                <div key={`tick-${i}`} style={{
                                    position: 'absolute',
                                    left: xPos,
                                    height: '100%',
                                    top: 0
                                }}>
                                    {zoom >= 0.8 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 'var(--s4)',
                                            left: 0,
                                            transform: 'translateX(-50%)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '10px',
                                            color: 'var(--muted)',
                                            opacity: 0.6
                                        }}>
                                            {monthNames[month]}
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '-0.5px',
                                        height: '8px',
                                        width: '1px',
                                        background: 'var(--timeline-tick-minor)',
                                        transform: 'translateY(-50%)'
                                    }} />
                                </div>
                            );
                        } else if (i < TOTAL_MONTHS && (zoom >= 1.5 || year >= 2023) && month !== 0) {
                            // Render remaining months if zoomed in enough OR if year is 2023 onwards
                            const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            return (
                                <div key={`tick-${i}`} style={{
                                    position: 'absolute',
                                    left: xPos,
                                    height: '100%',
                                    top: 0
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 'var(--s4)',
                                        left: 0,
                                        transform: 'translateX(-50%)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '10px',
                                        color: 'var(--muted)',
                                        opacity: year >= 2023 ? 0.6 : 0.4
                                    }}>
                                        {allMonths[month]}
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '-0.5px',
                                        height: year >= 2023 ? '8px' : '4px',
                                        width: '1px',
                                        background: year >= 2023 ? 'var(--timeline-tick-minor)' : 'var(--stroke)',
                                        transform: 'translateY(-50%)'
                                    }} />
                                </div>
                            );
                        } else if (i < TOTAL_MONTHS && month !== 0) {
                            // Just a minor tick for other months
                            return (
                                <div key={`tick-${i}`} style={{
                                    position: 'absolute',
                                    left: xPos,
                                    top: '50%',
                                    height: '4px',
                                    width: '1px',
                                    background: 'var(--stroke)',
                                    transform: 'translateY(-50%)'
                                }} />
                            );
                        }
                        return null;
                    })}

                    {/* Nodes Array Container */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        // Use a fixed padding shift logic. Instead of standard padding, 
                        // shift ALL nodes over by s8 (approx 96px).
                        transform: 'translateX(96px)'
                    }}>
                        {models.map((model: PlacedModel) => (
                            <div key={model.id} style={{
                                position: 'absolute',
                                left: `${getXPosition(model.release_date, pixelsPerMonth, START_YEAR)}px`,
                                top: 0,
                                height: '100%',
                                // we don't apply width here to avoid blocking clicks, TimelineNode uses translation
                            }}>
                                <TimelineNode
                                    activeTab={activeTab}
                                    model={model}
                                    isActive={selectedModelId === model.id}
                                    isFilteredOut={!filteredModelIds.has(model.id)}
                                    onClick={() => onModelSelect(model.id)}
                                />
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Dynamic Density Hint - Placed below the canvas per user request */}
            <div style={{
                display: (activeYear >= 2023 && activeYear <= END_YEAR) ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--s2)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                color: 'var(--secondary)',
                background: 'var(--bg-raised)',
                padding: 'var(--s2) var(--s4)',
                borderRadius: 'var(--r-pill)',
                border: '1px solid var(--stroke)',
                margin: 'var(--s4) auto 0 auto',
                width: 'fit-content'
            }}>
                <span style={{ fontSize: '1.2em' }}>💡</span>
                <span>The 2023+ era is automatically zoomed in 2.8x to accommodate high model density.</span>
            </div>

            <style>{`
                .timeline-canvas-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--s4);
                    gap: var(--s4);
                }
                .timeline-zoom-row { display: flex; align-items: center; }
                .timeline-year-row {
                    display: flex;
                    gap: var(--s1);
                    flex-wrap: wrap;
                }
                .timeline-scroll-hint { width: 80px; }
                @media (max-width: 719px) {
                    .timeline-canvas-controls {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .timeline-zoom-row { margin-bottom: var(--s2); }
                    .timeline-year-row {
                        flex-wrap: nowrap;
                        overflow-x: auto;
                        overflow-y: hidden;
                        -webkit-overflow-scrolling: touch;
                        padding-bottom: var(--s1);
                        margin: 0 calc(-1 * var(--s4));
                        padding-left: var(--s4);
                        padding-right: var(--s4);
                    }
                    .timeline-scroll-hint { width: 40px; }
                }
                .timeline-scroll-container:focus {
                    outline: 2px solid var(--stroke-dark);
                }
                .timeline-scroll-container::-webkit-scrollbar {
                    height: 4px;
                }
                .timeline-scroll-container::-webkit-scrollbar-track {
                    background: var(--stroke);
                    border-radius: var(--r-pill);
                }
                .timeline-scroll-container::-webkit-scrollbar-thumb {
                    background: var(--stroke-dark);
                    border-radius: var(--r-pill);
                }
                .timeline-scroll-container {
                    scrollbar-width: thin;
                    scrollbar-color: var(--stroke-dark) var(--stroke);
                }
            `}</style>
        </div>
    );
}
