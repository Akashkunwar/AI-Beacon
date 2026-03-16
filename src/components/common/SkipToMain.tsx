/**
 * Skip link for keyboard and screen reader users.
 * Renders first focusable element; moves focus to #main on click.
 */

export function SkipToMain() {
    return (
        <a
            href="#main"
            className="skip-to-main"
            style={{
                position: 'absolute',
                left: '-9999px',
                top: 'var(--s2)',
                zIndex: 'var(--z-modal)',
                padding: 'var(--s2) var(--s4)',
                background: 'var(--bg-inverse)',
                color: 'var(--text-inverse)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                borderRadius: 'var(--r-md)',
                textDecoration: 'none',
                transition: 'left var(--dur-fast) var(--ease-out)',
            }}
            onFocus={(e) => {
                e.currentTarget.style.left = 'var(--s2)';
            }}
            onBlur={(e) => {
                e.currentTarget.style.left = '-9999px';
            }}
        >
            Skip to main content
        </a>
    );
}
