import { Link } from 'react-router-dom'
import { BrandIcon } from '../components/BrandIcon'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '../lib/brand'
import { tools } from '../lib/tools'

export function HomePage() {
  return (
    <section className="home">
      <div className="page-header">
        <div className="home-hero">
          <BrandIcon size={56} className="home-logo" />
          <div>
            <h1>{SITE_NAME}</h1>
            <p className="home-tagline">{SITE_TAGLINE}</p>
          </div>
        </div>
        <p>{SITE_DESCRIPTION}</p>
      </div>

      <div className="tool-grid">
        {tools.map((tool) =>
          tool.available ? (
            <Link key={tool.id} to={tool.path} className="tool-card">
              <h2>{tool.name}</h2>
              <p>{tool.description}</p>
              <span className="tool-card-cta">打开工具</span>
            </Link>
          ) : (
            <article key={tool.id} className="tool-card disabled">
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
