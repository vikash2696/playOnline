import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="header">
      <nav className="topmenu">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
          Home
        </NavLink>
        <NavLink to="/youtube/favourite" className={({ isActive }) => (isActive ? 'active' : '')}>
          YouTube
        </NavLink>
        <NavLink to="/about/team" className={({ isActive }) => (isActive ? 'active' : '')}>
          About
        </NavLink>
      </nav>
    </header>
  )
}
