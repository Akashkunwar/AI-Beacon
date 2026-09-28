import { Link } from 'react-router-dom';

export interface ButtonLinkProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'md' | 'sm';
    /** Internal route (renders a router <Link>) */
    to?: string;
    /** External or hash URL (renders an <a>) */
    href?: string;
    id?: string;
    className?: string;
    'aria-label'?: string;
    onClick?: (e: React.MouseEvent) => void;
}

/**
 * One button primitive for the whole app. Renders a router Link when `to` is
 * set, an anchor when `href` is set (external links open in a new tab), or a
 * <button> otherwise. Styling lives in index.css (.btn, .btn-primary, …).
 */
export function ButtonLink({
    children,
    variant = 'primary',
    size = 'md',
    to,
    href,
    id,
    className,
    'aria-label': ariaLabel,
    onClick,
}: ButtonLinkProps) {
    const cls = ['btn', `btn-${variant}`, size === 'sm' ? 'btn-sm' : '', className ?? ''].filter(Boolean).join(' ');

    if (to) {
        return (
            <Link to={to} id={id} aria-label={ariaLabel} className={cls} onClick={onClick}>
                {children}
            </Link>
        );
    }
    if (href) {
        const external = href.startsWith('http');
        return (
            <a
                href={href}
                id={id}
                aria-label={ariaLabel}
                className={cls}
                onClick={onClick}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
            >
                {children}
            </a>
        );
    }
    return (
        <button type="button" id={id} aria-label={ariaLabel} className={cls} onClick={onClick}>
            {children}
        </button>
    );
}
