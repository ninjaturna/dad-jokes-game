import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="Toggle light or dark theme"
      className="inline-flex items-center gap-2 rounded-pill border border-border bg-bg-surface px-3 py-1.5 text-text-secondary"
    >
      <span className="h-2 w-2 rounded-pill bg-accent" />
      <span className="font-sans text-sm">{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
