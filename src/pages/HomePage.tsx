import { Link } from 'react-router-dom'
import { BrandIcon } from '../components/BrandIcon'
import { ToolIcon } from '../components/icons/ToolIcons'
import { SITE_NAME } from '../lib/brand'
import { tools } from '../lib/tools'

export function HomePage() {
  return (
    <section className="home">
      <div className="page-header">
        <div className="home-hero">
          <BrandIcon size={56} className="home-logo" />
          <h1>{SITE_NAME}</h1>
        </div>
      </div>

      <div className="tool-grid">
        {tools.map((tool) =>
          tool.available ? (
            <Link key={tool.id} to={tool.path} className="tool-card">
              <div className="tool-card-icon" aria-hidden="true">
                <ToolIcon name={tool.icon} size={22} />
              </div>
              <h2>{tool.name}</h2>
              <p>{tool.description}</p>
              <span className="tool-card-cta">打开工具</span>
            </Link>
          ) : (
            <article key={tool.id} className="tool-card disabled">
              <div className="tool-card-icon" aria-hidden="true">
                <ToolIcon name={tool.icon} size={22} />
              </div>
              <h2>{tool.name}</h2>
              <p>{tool.description}</p>
              <span className="tool-card-cta">即将上线</span>
            </article>
          ),
        )}
      </div>
    </section>
  )
}
