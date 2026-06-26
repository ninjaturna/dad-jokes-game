import { useEffect } from 'react'
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
import RequireAuth from './components/auth/RequireAuth'
import HostDashboard from './pages/host/HostDashboard'
import CreateEvent from './pages/host/CreateEvent'
import ManageEvent from './pages/host/ManageEvent'
import Guests from './pages/host/Guests'
import Venues from './pages/host/Venues'
import SendInvites from './pages/host/SendInvites'
import InfoPages from './pages/host/InfoPages'
import Landing from './pages/Landing'
import IndexPage from './pages/Index'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import { GAME_BASE } from './lib/gameRoutes'

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

function App() {
  const { pathname } = useLocation()
  const inGame = pathname.startsWith(GAME_BASE)
  const hideChrome = inGame || pathname.startsWith('/e/') || pathname.startsWith('/host') || pathname === '/' || pathname === '/privacy' || pathname === '/terms'

  // one-time GA script injection
  useEffect(() => {
    if (!GA_ID) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any
    const s = document.createElement('script')
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    s.async = true
    document.head.appendChild(s)
    win.dataLayer = win.dataLayer || []
    win.gtag = function (...args: unknown[]) { win.dataLayer.push(args) }
    win.gtag('js', new Date())
    win.gtag('config', GA_ID)
  }, [])

  // page-view on navigation
  useEffect(() => {
    if (!GA_ID) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).gtag?.('config', GA_ID, { page_path: pathname })
  }, [pathname])

  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      {!hideChrome && (
        <header className="flex items-center justify-between px-6 py-5">
          <Wordmark variant="stacked" />
          <ThemeToggle />
        </header>
      )}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/index" element={<IndexPage />} />
        <Route path="/games" element={<GamesHub />} />
        <Route path="/e/:slug" element={<EventPage />} />
        <Route path="/e/:slug/rsvp" element={<RsvpFlow />} />
        <Route path="/host" element={<RequireAuth><HostDashboard /></RequireAuth>} />
        <Route path="/host/create" element={<RequireAuth><CreateEvent /></RequireAuth>} />
        <Route path="/host/event/:id" element={<RequireAuth><ManageEvent /></RequireAuth>} />
        <Route path="/host/event/:eventId/info" element={<RequireAuth><InfoPages /></RequireAuth>} />
        <Route path="/host/guests" element={<RequireAuth><Guests /></RequireAuth>} />
        <Route path="/host/venues" element={<RequireAuth><Venues /></RequireAuth>} />
        <Route path="/host/invites/:eventId" element={<RequireAuth><SendInvites /></RequireAuth>} />
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
