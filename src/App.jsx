import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import YouTubeFavouritePlay from './pages/YouTubeFavouritePlay'
import About from './pages/About'
import AboutTeam from './pages/AboutTeam'
import AboutContact from './pages/AboutContact'
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <div className="app">
      <Header />
      <div className="layout">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/youtube/favourite" element={<YouTubeFavouritePlay />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/team" element={<AboutTeam />} />
            <Route path="/about/contact" element={<AboutContact />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
