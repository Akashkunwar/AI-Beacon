// Track an element's content width, for responsive SVG charts.

import { useEffect, useRef, useState } from 'react';

export function useWidth<T extends HTMLElement>(fallback = 720) {
    const ref = useRef<T>(null);
    const [width, setWidth] = useState(fallback);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return { ref, width };
}

