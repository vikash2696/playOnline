import { useLocation, NavLink } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()
  let top = 'home'
  if (location.pathname.startsWith('/youtube')) top = 'youtube'
  else if (location.pathname.startsWith('/about')) top = 'about'
  
  // Hide sidebar for YouTube and home sections
  if (top === 'youtube' || top === 'home') {
    return null
  }
  
  const menuItems = 
    top === 'about'
      ? [
          { label: 'Team', path: '/about/team' },
          { label: 'Contact', path: '/about/contact' }
        ]
      : []

  return (
    <aside className="sidebar">
      <ul>
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink to={item.path} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
