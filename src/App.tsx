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
import Landing from './pages/Landing'
import IndexPage from './pages/Index'
import { GAME_BASE } from './lib/gameRoutes'

function App() {
  const { pathname } = useLocation()
  const inGame = pathname.startsWith(GAME_BASE)
  const hideChrome = inGame || pathname.startsWith('/e/') || pathname.startsWith('/host') || pathname === '/'
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
        <Route path="/index" element={<IndexPage />} />
        <Route path="/games" element={<GamesHub />} />
        <Route path="/e/:slug" element={<EventPage />} />
        <Route path="/e/:slug/rsvp" element={<RsvpFlow />} />
        <Route path="/host" element={<RequireAuth><HostDashboard /></RequireAuth>} />
        <Route path="/host/create" element={<RequireAuth><CreateEvent /></RequireAuth>} />
        <Route path="/host/event/:id" element={<RequireAuth><ManageEvent /></RequireAuth>} />
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
