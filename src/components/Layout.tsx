import { NavLink, Outlet } from 'react-router-dom'
import { BrandIcon } from './BrandIcon'
import { HomeIcon, ShieldLocalIcon, ToolIcon } from './icons/ToolIcons'
import { SITE_NAME } from '../lib/brand'
import { tools } from '../lib/tools'

export function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BrandIcon size={40} className="brand-icon" />
          <div>
            <p className="brand-title">{SITE_NAME}</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="工具导航">
          <NavLink to="/" end className="nav-item">
            <HomeIcon size={18} className="nav-icon" />
            <span>首页</span>
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
              <ToolIcon name={tool.icon} size={18} className="nav-icon" />
              <span>{tool.name}</span>
              {!tool.available && <span className="badge">即将上线</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <p className="privacy-chip">
            <ShieldLocalIcon size={15} className="privacy-chip-icon" />
            <span>本地处理，数据不上传服务器</span>
          </p>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
