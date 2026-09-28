// src/hooks/useTheme.ts
// Light/dark theme state. The initial theme is applied by an inline script in
// index.html (saved choice → OS preference) so there is no flash on load.
// This hook keeps React in sync, persists explicit choices, and follows OS
// changes until the user picks a theme themselves.

import { useCallback, useEffect, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'ai-beacon-theme';
const listeners = new Set<() => void>();

function readTheme(): Theme {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function hasSavedChoice(): boolean {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        return v === 'light' || v === 'dark';
    } catch {
        return false;
    }
}

export function useTheme() {
    const theme = useSyncExternalStore(subscribe, readTheme, () => 'light' as Theme);

    // Follow OS changes while the user has not made an explicit choice.
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (e: MediaQueryListEvent) => {
            if (!hasSavedChoice()) applyTheme(e.matches ? 'dark' : 'light');
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const setTheme = useCallback((next: Theme) => {
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* storage unavailable (private mode) — still switch for this session */
        }
        applyTheme(next);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(readTheme() === 'dark' ? 'light' : 'dark');
    }, [setTheme]);

    return { theme, setTheme, toggleTheme };
}
