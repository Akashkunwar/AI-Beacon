import { useTheme } from '@/hooks/useTheme';
import { MoonIcon, SunIcon } from './Icons';

/** Icon button that switches between the light and dark themes. */
export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const next = theme === 'dark' ? 'light' : 'dark';
    return (
        <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${next} theme`}
            title={`Switch to ${next} theme`}
        >
            {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
        </button>
    );
}
