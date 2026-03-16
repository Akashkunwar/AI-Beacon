import { Link } from 'react-router-dom';

const linkStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--s2)',
    padding: '0.6rem 1.25rem',
    background: 'var(--bg-inverse)',
    border: '1px solid var(--bg-inverse)',
    borderRadius: 'var(--r-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--weight-medium)' as const,
    color: 'var(--text-inverse)',
    textDecoration: 'none',
    transition: 'background var(--dur-fast) var(--ease-out)',
};

export interface PrimaryButtonProps {
    children: React.ReactNode;
    to?: string;
    href?: string;
    id?: string;
    'aria-label'?: string;
    onClick?: (e: React.MouseEvent) => void;
}

/**
 * Primary CTA: dark background. Use for main actions (e.g. "Explore Timeline").
 * Renders as Link if `to`, as <a> if `href`, else <button>.
 */
export function PrimaryButton({ children, to, href, id, 'aria-label': ariaLabel, onClick }: PrimaryButtonProps) {
    const hover = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        const el = e.currentTarget;
        el.style.background = 'var(--hover-inverse)';
        el.style.borderColor = 'var(--hover-inverse)';
    };
    const leave = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        const el = e.currentTarget;
        el.style.background = 'var(--bg-inverse)';
        el.style.borderColor = 'var(--bg-inverse)';
    };

    if (to) {
        return (
            <Link
                to={to}
                id={id}
                aria-label={ariaLabel}
                style={linkStyles}
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
                style={linkStyles}
                onMouseEnter={hover}
                onMouseLeave={leave}
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
            style={linkStyles}
            onMouseEnter={hover}
            onMouseLeave={leave}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
