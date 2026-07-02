import { useEffect, useId, useRef, useState } from 'react'

let mermaidInitialized = false

async function renderMermaid(renderId: string, chart: string): Promise<string> {
  const mermaid = (await import('mermaid')).default
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'strict',
    })
    mermaidInitialized = true
  }
  const { svg } = await mermaid.render(renderId, chart)
  return svg
}

type MermaidBlockProps = {
  chart: string
}

export function MermaidBlock({ chart }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const renderId = useId().replace(/:/g, '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !chart.trim()) {
      setError(null)
      return
    }

    let cancelled = false

    renderMermaid(`mermaid-${renderId}`, chart)
      .then((svg) => {
        if (cancelled || !containerRef.current) return
        containerRef.current.innerHTML = svg
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Mermaid 渲染失败')
      })

    return () => {
      cancelled = true
    }
  }, [chart, renderId])

  if (!chart.trim()) {
    return null
  }

  return (
    <div className="mermaid-block">
      {error ? <p className="mermaid-error">{error}</p> : null}
      <div ref={containerRef} className="mermaid-output" aria-hidden={Boolean(error)} />
    </div>
  )
}
