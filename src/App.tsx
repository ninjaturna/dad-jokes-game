import ThemeToggle from './components/ThemeToggle'

function App() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="font-display font-semibold tracking-wordmark">MARLY&apos;S YARD</span>
        <ThemeToggle />
      </header>
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
        <p className="font-display text-xs uppercase tracking-[0.28em] text-text-muted">
          An intimate gathering house · Miami
        </p>
        <h1 className="font-display text-5xl font-light leading-tight md:text-6xl">
          The yard is being planted.
        </h1>
        <p className="font-sans text-lg text-text-secondary">
          Foundation is live — brand tokens, fonts, and the dark/light theme are wired. Screens land next.
        </p>
        <div className="mt-4 rounded-card border border-border bg-bg-surface p-6 shadow-card">
          <p className="font-sans text-sm text-text-secondary">accent · greenery · candle · plum</p>
          <div className="mt-3 flex gap-3">
            <span className="h-8 w-8 rounded-control bg-accent" />
            <span className="h-8 w-8 rounded-control bg-greenery" />
            <span className="h-8 w-8 rounded-control bg-candle" />
            <span className="h-8 w-8 rounded-control bg-plum" />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
