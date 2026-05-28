import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Curriculum from './pages/Curriculum'
import Simulator from './pages/Simulator'
import Analytics from './pages/Analytics'
import Journal from './pages/Journal'
import Quiz from './pages/Quiz'
import Mentor from './pages/Mentor'
import Strategy from './pages/Strategy'
import Gamification from './pages/Gamification'
import DailyRoutine from './pages/DailyRoutine'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="curriculum" element={<Curriculum />} />
        <Route path="simulator" element={<Simulator />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="journal" element={<Journal />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="mentor" element={<Mentor />} />
        <Route path="strategy" element={<Strategy />} />
        <Route path="routine" element={<DailyRoutine />} />
        <Route path="gamification" element={<Gamification />} />
      </Route>
    </Routes>
  )
}
