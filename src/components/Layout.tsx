import { NavLink, Outlet } from 'react-router-dom'
import { BrandIcon } from './BrandIcon'
import { SITE_NAME, SITE_TAGLINE } from '../lib/brand'
import { tools } from '../lib/tools'

export function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BrandIcon size={40} className="brand-icon" />
          <div>
            <p className="brand-title">{SITE_NAME}</p>
            <p className="brand-subtitle">{SITE_TAGLINE}</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="工具导航">
          <NavLink to="/" end className="nav-item">
            首页
          </NavLink>
          {tools.map((tool) => (
            <NavLink
              key={tool.id}
              to={tool.path}
              className={({ isActive }) =>
                `nav-item${isActive ? ' active' : ''}${tool.available ? '' : ' disabled'}`
              }
              aria-disabled={!tool.available}
            >
              {tool.name}
              {!tool.available && <span className="badge">即将上线</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <p className="topbar-note">本地处理，数据不上传服务器</p>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
