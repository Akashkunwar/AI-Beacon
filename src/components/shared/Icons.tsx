// Small inline SVG icon set (stroke icons, 24px grid). Icons inherit
// `currentColor`, so they follow the surrounding text colour in both themes.

interface IconProps {
    size?: number;
    className?: string;
    strokeWidth?: number;
}

function Svg({ size = 18, className, strokeWidth = 1.75, children }: IconProps & { children: React.ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className={className}
            style={{ display: 'inline-block', flexShrink: 0 }}
        >
            {children}
        </svg>
    );
}

export const SunIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </Svg>
);

export const MoonIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </Svg>
);

export const MenuIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
);

export const CloseIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
);

export const ArrowRightIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
);

export const ArrowUpRightIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M7 17 17 7M8 7h9v9" />
    </Svg>
);

export const SearchIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </Svg>
);

export const InfoIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
    </Svg>
);

export const GitHubIcon = ({ size = 18, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className} style={{ display: 'inline-block', flexShrink: 0 }}>
        <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
);

/** The AI Beacon mark: a lit core with two broadcast arcs. */
export const BeaconMark = ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" style={{ display: 'inline-block', flexShrink: 0 }}>
        <rect width="32" height="32" rx="8" fill="var(--bg-inverse)" />
        <circle cx="16" cy="16" r="3.6" fill="var(--text-inverse)" />
        <path d="M10.3 10.3a8 8 0 0 0 0 11.4M21.7 10.3a8 8 0 0 1 0 11.4" stroke="var(--text-inverse)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.85" />
        <path d="M6.8 6.8a13 13 0 0 0 0 18.4M25.2 6.8a13 13 0 0 1 0 18.4" stroke="var(--text-inverse)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.45" />
    </svg>
);
