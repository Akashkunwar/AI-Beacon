import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { TimelineItem, TimelineKind } from '@/data/timeline';
import { layoutTimeline } from '@/utils/timeline';
import { formatDatePrecise } from '@/utils/timeline';

interface Props {
    kind: TimelineKind;
    items: TimelineItem[];
    selectedId: number | null;
    onSelect: (item: TimelineItem) => void;
}

// Geometry (px)
const NODE_W = 144;            // card width
const NODE_GAP = 14;
const NODE_H = 60;
const LANES_PER_SIDE = 3;
const LEVEL_STEP = 78;         // distance between lanes
const FIRST_LEVEL = 34;        // gap between spine and nearest card
const AXIS_TOP = 30;           // year label row
const PAD_X = 80;
const CANVAS_H = AXIS_TOP + 2 * (FIRST_LEVEL + (LANES_PER_SIDE - 1) * LEVEL_STEP + NODE_H) + 24;
const SPINE_Y = AXIS_TOP + (CANVAS_H - AXIS_TOP) / 2;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Landmarks get a small marker so first-time visitors can orient themselves.
const LANDMARKS = new Set(['transformer', 'gpt-3', 'chatgpt-gpt-3-5', 'gpt-4', 'llama', 'deepseek-r1', 'openai-o1-preview',
    'attention-is-all-you-need', 'imagenet-classification-with-deep-convolutional-neural-networks', 'chatgpt', 'github-copilot']);

export function TimelineCanvas({ kind, items, selectedId, onSelect }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [activeYear, setActiveYear] = useState<number | null>(null);
    const [atStart, setAtStart] = useState(false);
    const [atEnd, setAtEnd] = useState(true);

    const layout = useMemo(
        () => layoutTimeline(items.map((i) => ({ id: i.id, date: i.date })), {
            basePx: 22 * zoom,
            nodeWidth: (NODE_W + NODE_GAP),
            lanesPerSide: LANES_PER_SIDE,
        }),
        [items, zoom],
    );
    const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
    const width = layout.width + PAD_X * 2;

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const centre = el.scrollLeft + el.clientWidth / 2 - PAD_X;
        setActiveYear(layout.yearAt(centre));
        setAtStart(el.scrollLeft <= 2);
        setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
    }, [layout]);

    // Start at the most recent entries whenever the dataset or filter changes
    // (but not when only the zoom level changes the layout).
    const itemsKey = `${kind}:${items.length}:${items[0]?.id ?? ''}:${items[items.length - 1]?.id ?? ''}`;
    const updateRef = useRef(updateScrollState);
    useLayoutEffect(() => { updateRef.current = updateScrollState; }, [updateScrollState]);
    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollLeft = el.scrollWidth;
        updateRef.current();
    }, [itemsKey]);

    // Keep the selected card in view (e.g. when opened from the table).
    useEffect(() => {
        if (selectedId == null) return;
        const el = scrollRef.current;
        const node = layout.nodes.find((n) => n.id === selectedId);
        if (!el || !node) return;
        const x = node.x + PAD_X;
        if (x < el.scrollLeft + 80 || x > el.scrollLeft + el.clientWidth - 80) {
            el.scrollTo({ left: x - el.clientWidth / 2, behavior: 'smooth' });
        }
    }, [selectedId, layout]);

    // Vertical wheel scrolls the timeline sideways — but only while there is
    // room to move, so the page can still scroll past it.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            const canLeft = el.scrollLeft > 0;
            const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
            if ((e.deltaY < 0 && canLeft) || (e.deltaY > 0 && canRight)) {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            }
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    // Click-and-drag panning with a mouse.
    const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
    const onPointerDown = (e: React.PointerEvent) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        drag.current = { x: e.clientX, left: scrollRef.current?.scrollLeft ?? 0, moved: false };
    };
    const onPointerMove = (e: React.PointerEvent) => {
        const d = drag.current;
        const el = scrollRef.current;
        if (!d || !el) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 4) d.moved = true;
        if (d.moved) el.scrollLeft = d.left - dx;
    };
    const endDrag = () => { setTimeout(() => { drag.current = null; }, 0); };

    const jumpToYear = (year: number) => {
        const el = scrollRef.current;
        if (!el) return;
        const idx = (year - layout.startYear) * 12;
        el.scrollTo({ left: layout.monthStarts[idx] + PAD_X - 40, behavior: 'smooth' });
    };
    const page = (dir: 1 | -1) => {
        const el = scrollRef.current;
        if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    };

    const years = Array.from({ length: layout.endYear - layout.startYear + 1 }, (_, i) => layout.startYear + i);

    if (items.length === 0) {
        return (
            <div className="container-wide" style={{ paddingBlock: 'var(--s5)' }}>
                <div className="tl-empty">No entries match these filters.</div>
                <style>{CANVAS_CSS}</style>
            </div>
        );
    }

    return (
        <section aria-label="Timeline" className="tl-canvas-section">
            <div className="container-wide tl-controls">
                <div className="tl-years-nav" role="group" aria-label="Jump to year">
                    {years.map((y) => (
                        <button key={y} type="button" className="tl-year-btn" aria-pressed={activeYear === y} onClick={() => jumpToYear(y)}>
                            {y}
                        </button>
                    ))}
                </div>
                <div className="tl-zoom">
                    <button type="button" className="icon-btn" onClick={() => page(-1)} disabled={atStart} aria-label="Scroll earlier">‹</button>
                    <button type="button" className="icon-btn" onClick={() => page(1)} disabled={atEnd} aria-label="Scroll later">›</button>
                    <label className="tl-zoom-label">
                        <span className="field-label" style={{ margin: 0 }}>Zoom</span>
                        <input type="range" min={0.5} max={4} step={0.25} value={zoom} onChange={(e) => setZoom(+e.target.value)} aria-label="Zoom timeline" />
                    </label>
                </div>
            </div>

            <div className="tl-scroll-wrap">
                <div
                    ref={scrollRef}
                    className="tl-scroll"
                    tabIndex={0}
                    role="region"
                    aria-label={`Timeline of ${items.length} entries. Use left and right arrow keys to scroll.`}
                    onScroll={updateScrollState}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') { scrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' }); e.preventDefault(); }
                        if (e.key === 'ArrowLeft') { scrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' }); e.preventDefault(); }
                    }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerLeave={endDrag}
                >
                    <div className="tl-canvas" style={{ width, height: CANVAS_H }}>
                        <Axis layout={layout} />
                        {layout.nodes.map((n) => {
                            const it = byId.get(n.id);
                            if (!it) return null;
                            return (
                                <Node
                                    key={`${kind}-${n.id}`}
                                    item={it}
                                    x={n.x + PAD_X}
                                    dateX={n.dateX + PAD_X}
                                    above={n.above}
                                    level={n.level}
                                    active={selectedId === n.id}
                                    landmark={LANDMARKS.has(it.slug)}
                                    onSelect={(item) => { if (!drag.current?.moved) onSelect(item); }}
                                />
                            );
                        })}
                    </div>
                </div>
                <div className={`tl-fade tl-fade-left ${atStart ? 'is-hidden' : ''}`} aria-hidden="true" />
                <div className={`tl-fade tl-fade-right ${atEnd ? 'is-hidden' : ''}`} aria-hidden="true" />
            </div>
            <p className="container-wide tl-hint">
                Drag, scroll or use the year buttons to move through time. Busy months widen automatically so cards never overlap;
                cards sit above or below the line only for space — the thin connector marks the actual date.
                <span className="tl-hint-key"><span className="tl-landmark-dot" aria-hidden="true" /> landmark release</span>
            </p>
            <style>{CANVAS_CSS}</style>
        </section>
    );
}

const Axis = memo(function Axis({ layout }: { layout: ReturnType<typeof layoutTimeline> }) {
    const ticks: React.ReactNode[] = [];
    const months = layout.monthStarts.length - 1;
    for (let i = 0; i <= months; i++) {
        const x = layout.monthStarts[i] + PAD_X;
        const m = i % 12;
        const year = layout.startYear + Math.floor(i / 12);
        const w = i < months ? layout.monthStarts[i + 1] - layout.monthStarts[i] : 0;
        if (m === 0 && i < months) {
            ticks.push(
                <div key={`y${i}`} className="tl-year-mark" style={{ left: x }}>
                    <span className="tl-year-label">{year}</span>
                </div>,
            );
        } else if (i < months) {
            ticks.push(
                <div key={`m${i}`} className="tl-month-mark" style={{ left: x }}>
                    {w >= 44 && <span className="tl-month-label">{MONTHS[m]}</span>}
                </div>,
            );
        }
    }
    return (
        <>
            <div className="tl-spine" style={{ top: SPINE_Y }} />
            {ticks}
        </>
    );
});

interface NodeProps {
    item: TimelineItem;
    x: number;
    dateX: number;
    above: boolean;
    level: number;
    active: boolean;
    landmark: boolean;
    onSelect: (item: TimelineItem) => void;
}

const Node = memo(function Node({ item, x, dateX, above, level, active, landmark, onSelect }: NodeProps) {
    const offset = FIRST_LEVEL + (level - 1) * LEVEL_STEP;
    const top = above ? SPINE_Y - offset - NODE_H : SPINE_Y + offset;
    const stemTop = above ? SPINE_Y - offset : SPINE_Y;
    return (
        <>
            <div
                className="tl-stem"
                aria-hidden="true"
                style={{ left: dateX, top: stemTop, height: offset }}
            />
            <div className={`tl-dot ${landmark ? 'is-landmark' : ''}`} aria-hidden="true" style={{ left: dateX, top: SPINE_Y }} />
            <button
                type="button"
                className={`tl-node ${active ? 'is-active' : ''}`}
                style={{ left: x - NODE_W / 2, top, width: NODE_W, height: NODE_H }}
                onClick={() => onSelect(item)}
                aria-label={`${item.name}, ${item.org}, ${formatDatePrecise(item.date, item.datePrecision)}`}
                title={`${item.name} — ${formatDatePrecise(item.date, item.datePrecision)}`}
            >
                <span className="tl-node-org">{item.org}</span>
                <span className="tl-node-name">{landmark && <span className="tl-landmark-dot" aria-hidden="true" />}{item.name}</span>
                <span className="tl-node-meta">{item.meta}</span>
            </button>
        </>
    );
});

const CANVAS_CSS = `
.tl-canvas-section { margin-top: var(--s5); }
.tl-controls { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--s3); margin-bottom: var(--s3); }
.tl-years-nav { display: flex; gap: 2px; overflow-x: auto; scrollbar-width: none; max-width: 100%; }
.tl-years-nav::-webkit-scrollbar { display: none; }
.tl-year-btn {
    font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--muted);
    padding: 6px 9px; border-radius: var(--r-sm); flex-shrink: 0;
    transition: all var(--dur-fast) var(--ease-out);
}
.tl-year-btn:hover { color: var(--ink); background: var(--bg-raised); }
.tl-year-btn[aria-pressed='true'] { color: var(--text-inverse); background: var(--bg-inverse); }
.tl-zoom { display: flex; align-items: center; gap: var(--s2); }
.tl-zoom .icon-btn { width: 34px; height: 34px; font-size: 18px; }
.tl-zoom .icon-btn:disabled { opacity: 0.35; cursor: default; }
.tl-zoom-label { display: flex; align-items: center; gap: var(--s2); margin-left: var(--s2); }
.tl-zoom-label input { width: 110px; }

.tl-scroll-wrap { position: relative; border-block: 1px solid var(--stroke); background: var(--bg-sunken); }
.tl-scroll { overflow-x: auto; overflow-y: hidden; cursor: grab; }
.tl-scroll:active { cursor: grabbing; }
.tl-scroll:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: -2px; }
.tl-canvas { position: relative; }
.tl-fade { position: absolute; top: 0; bottom: 0; width: 56px; pointer-events: none; transition: opacity var(--dur-base) var(--ease-out); }
.tl-fade-left { left: 0; background: linear-gradient(to right, var(--bg-sunken), transparent); }
.tl-fade-right { right: 0; background: linear-gradient(to left, var(--bg-sunken), transparent); }
.tl-fade.is-hidden { opacity: 0; }

.tl-spine { position: absolute; left: 0; right: 0; height: 1px; background: var(--timeline-spine); }
.tl-year-mark { position: absolute; top: 0; bottom: 0; border-left: 1px solid var(--stroke-dark); }
.tl-year-label {
    position: absolute; top: 6px; left: 6px;
    font-family: var(--font-mono); font-size: var(--text-xs); font-weight: var(--weight-medium); color: var(--ink);
}
.tl-month-mark { position: absolute; top: 24px; bottom: 0; border-left: 1px dashed var(--stroke); }
.tl-month-label { position: absolute; top: -18px; left: 4px; font-family: var(--font-mono); font-size: 10px; color: var(--muted); }

.tl-stem { position: absolute; width: 1px; background: var(--timeline-connector); transform: translateX(-0.5px); }
.tl-dot {
    position: absolute; width: 7px; height: 7px; border-radius: 50%;
    background: var(--bg-sunken); border: 1.5px solid var(--stroke-dark);
    transform: translate(-50%, -50%);
}
.tl-dot.is-landmark { background: var(--ink); border-color: var(--ink); }
.tl-node {
    position: absolute;
    display: flex; flex-direction: column; justify-content: center; gap: 1px;
    padding: 6px 10px;
    text-align: left;
    background: var(--timeline-node-bg);
    border: 1px solid var(--timeline-node-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-soft);
    transition: transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
    z-index: 1;
}
.tl-node:hover { border-color: var(--ink); box-shadow: var(--shadow-lift); transform: translateY(-1px); z-index: 3; }
.tl-node.is-active { background: var(--bg-inverse); border-color: var(--bg-inverse); z-index: 4; }
.tl-node.is-active .tl-node-org, .tl-node.is-active .tl-node-name, .tl-node.is-active .tl-node-meta { color: var(--text-inverse); }
.tl-node-org {
    font-family: var(--font-mono); font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tl-node-name {
    display: flex; align-items: center; gap: 5px;
    font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--ink);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tl-node-meta { font-family: var(--font-mono); font-size: 10px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tl-landmark-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.tl-hint { font-size: var(--text-2xs); color: var(--muted); margin-top: var(--s2); margin-bottom: var(--s5); display: flex; flex-wrap: wrap; gap: var(--s2) var(--s4); }
.tl-hint-key { display: inline-flex; align-items: center; gap: 6px; color: var(--secondary); }
.tl-empty { padding: var(--s6); text-align: center; color: var(--muted); border: 1px dashed var(--stroke-dark); border-radius: var(--r-lg); }
@media (max-width: 719px) {
    .tl-zoom-label { display: none; }
}
`;
