import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Home from './components/Home'
import JoinRoom from './components/JoinRoom'
import Lobby from './components/Lobby'
import GameRoom from './components/GameRoom'
import ConnectionStatus from './components/ConnectionStatus'

function App() {
  return (
    <>
      <ConnectionStatus />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<Home />} />
        <Route path="/join/:code" element={<JoinRoom />} />
        <Route path="/lobby/:code" element={<Lobby />} />
        <Route path="/room/:code" element={<GameRoom />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
