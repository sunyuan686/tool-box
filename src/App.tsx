import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { JsonFormatter } from './tools/json/JsonFormatter'

const MarkdownEditor = lazy(() =>
  import('./tools/markdown/MarkdownEditor').then((module) => ({
    default: module.MarkdownEditor,
  })),
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="json" element={<JsonFormatter />} />
          <Route
            path="markdown"
            element={
              <Suspense fallback={<p className="route-loading">加载 Markdown 工具…</p>}>
                <MarkdownEditor />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
