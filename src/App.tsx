import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'
import JoinRoom from './components/JoinRoom'
import Lobby from './components/Lobby'
import GameRoom from './components/GameRoom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/join/:code" element={<JoinRoom />} />
      <Route path="/lobby/:code" element={<Lobby />} />
      <Route path="/room/:code" element={<GameRoom />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
