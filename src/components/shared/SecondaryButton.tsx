import { Link } from 'react-router-dom';

const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--s2)',
    padding: '0.6rem 1.25rem',
    background: 'transparent',
    border: '1px solid var(--stroke-dark)',
    borderRadius: 'var(--r-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--weight-medium)' as const,
    color: 'var(--secondary)',
    textDecoration: 'none',
    transition: 'all var(--dur-fast) var(--ease-out)',
};

export interface SecondaryButtonProps {
    children: React.ReactNode;
    to?: string;
    href?: string;
    id?: string;
    'aria-label'?: string;
    onClick?: (e: React.MouseEvent) => void;
}

/**
 * Secondary CTA: outline style. Use for "See what's coming", "Open Walkthrough", etc.
 */
export function SecondaryButton({ children, to, href, id, 'aria-label': ariaLabel, onClick }: SecondaryButtonProps) {
    const hover = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        const el = e.currentTarget;
        el.style.background = 'var(--bg-panel)';
        el.style.color = 'var(--ink)';
        el.style.borderColor = 'var(--primary)';
    };
    const leave = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        const el = e.currentTarget;
        el.style.background = 'transparent';
        el.style.color = 'var(--secondary)';
        el.style.borderColor = 'var(--stroke-dark)';
    };

    if (to) {
        return (
            <Link
                to={to}
                id={id}
                aria-label={ariaLabel}
                style={baseStyles}
                onMouseEnter={hover}
                onMouseLeave={leave}
            >
                {children}
            </Link>
        );
    }
    if (href) {
        return (
            <a
                href={href}
                id={id}
                aria-label={ariaLabel}
                style={baseStyles}
                onMouseEnter={hover}
                onMouseLeave={leave}
                onClick={onClick}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
                {children}
            </a>
        );
    }
    return (
        <button
            type="button"
            id={id}
            aria-label={ariaLabel}
            style={baseStyles}
            onMouseEnter={hover}
            onMouseLeave={leave}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
