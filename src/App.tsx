import { Routes, Route, useLocation } from 'react-router-dom'
import ThemeToggle from './components/ThemeToggle'
import Wordmark from './components/brand/Wordmark'
import GamesHub from './pages/games/GamesHub'
import LandingPage from './pages/LandingPage'
import Home from './components/Home'
import JoinRoom from './components/JoinRoom'
import Lobby from './components/Lobby'
import GameRoom from './components/GameRoom'
import EventPage from './pages/EventPage'
import RsvpFlow from './pages/RsvpFlow'
import { GAME_BASE } from './lib/gameRoutes'

function Placeholder() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
      <p className="font-display text-xs uppercase tracking-[0.28em] text-text-muted">An intimate gathering house · Miami</p>
      <h1 className="font-display text-5xl font-light leading-tight md:text-6xl">The yard is being planted.</h1>
      <p className="font-sans text-lg text-text-secondary">Foundation is live — brand tokens, fonts, and the dark/light theme are wired. Screens land next.</p>
    </main>
  )
}

function App() {
  const { pathname } = useLocation()
  const inGame = pathname.startsWith(GAME_BASE)
  const hideHeader = inGame || pathname.startsWith('/e/')
  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      {!hideHeader && (
        <header className="flex items-center justify-between px-6 py-5">
          <Wordmark variant="stacked" />
          <ThemeToggle />
        </header>
      )}
      <Routes>
        <Route path="/" element={<Placeholder />} />
        <Route path="/games" element={<GamesHub />} />
        <Route path="/e/:slug" element={<EventPage />} />
        <Route path="/e/:slug/rsvp" element={<RsvpFlow />} />
        <Route path={GAME_BASE} element={<LandingPage />} />
        <Route path={`${GAME_BASE}/play`} element={<Home />} />
        <Route path={`${GAME_BASE}/join`} element={<JoinRoom />} />
        <Route path={`${GAME_BASE}/join/:code`} element={<JoinRoom />} />
        <Route path={`${GAME_BASE}/lobby/:code`} element={<Lobby />} />
        <Route path={`${GAME_BASE}/room/:code`} element={<GameRoom />} />
      </Routes>
    </div>
  )
}

export default App
