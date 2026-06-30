import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import faviconUrl from './assets/favicon.svg'
import './index.css'
import App from './App.tsx'

const faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
if (faviconLink) {
  faviconLink.href = faviconUrl
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
