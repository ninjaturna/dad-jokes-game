/** @type {import('tailwindcss').Config} */
// Marly's Yard — design tokens for Tailwind v3.
// Brand palette is the source of truth; semantic colors read CSS variables
// (defined in src/index.css) so the dark/light themes swap with [data-theme].
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // --- Brand palette (source of truth) ---
        oxblood: '#260306',
        plum: '#590242',
        rust: '#733122',
        red: '#A62F24',
        terracotta: '#D96B43',
        camel: '#A67244',
        teal: '#315955',
        greenery: '#5DCAA5',
        olive: '#403513',
        candle: '#E0A867',
        cream: '#FAFBF5',

        // --- Semantic (theme-aware via CSS vars) ---
        bg: {
          page: 'var(--bg-page)',
          surface: 'var(--bg-surface)',
          'surface-2': 'var(--bg-surface-2)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          2: 'var(--accent-2)',
        },
        border: 'var(--border)',
        danger: 'var(--danger)',
        success: 'var(--success)',
      },
      fontFamily: {
        // Display flexes from airy light-tracked to loud black.
        display: ['Archivo', 'system-ui', 'sans-serif'],
        // Body / forms — humanist, legible, tabular numerals.
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wordmark: '0.22em',   // MARLY'S / YARD
        elevated: '0.14em',   // elevated-register headings
      },
      borderRadius: {
        card: '12px',
        control: '8px',       // inputs / buttons
        pill: '999px',
      },
      boxShadow: {
        // Soft and low — Marly's Yard uses gentle shadows.
        card: '0 8px 24px rgba(20,2,4,0.35)',
        'card-light': '0 12px 28px rgba(38,3,6,0.10)',
      },
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
    },
  },
  plugins: [],
}
