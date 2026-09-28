/**
 * Skip link for keyboard and screen reader users. It is the first focusable
 * element on every page and jumps to <main id="main">.
 */
export function SkipToMain() {
    return (
        <>
            <a href="#main" className="skip-to-main">Skip to main content</a>
            <style>{`
                .skip-to-main {
                    position: fixed;
                    left: var(--s2);
                    top: var(--s2);
                    z-index: var(--z-modal);
                    padding: var(--s2) var(--s4);
                    background: var(--bg-inverse);
                    color: var(--text-inverse);
                    font-size: var(--text-sm);
                    font-weight: var(--weight-medium);
                    border-radius: var(--r-md);
                    transform: translateY(-200%);
                    transition: transform var(--dur-fast) var(--ease-out);
                }
                .skip-to-main:focus { transform: translateY(0); }
            `}</style>
        </>
    );
}
