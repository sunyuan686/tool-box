import { Children, isValidElement, useMemo, type ReactElement, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { ExtraProps } from 'react-markdown'
import { MermaidBlock } from './MermaidBlock'
import 'highlight.js/styles/github-dark.min.css'

type MarkdownPreviewProps = {
  source: string
}

function getCodeLanguage(className?: string): string | undefined {
  const match = /language-([\w-]+)/.exec(className ?? '')
  return match?.[1]
}

function getCodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(getCodeText).join('')
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getCodeText(node.props.children)
  }
  return ''
}

function PreBlock({ children }: { children?: ReactNode }) {
  const child = Children.toArray(children).find(isValidElement) as
    | ReactElement<{ className?: string; children?: ReactNode }>
    | undefined

  if (child?.props.className && getCodeLanguage(child.props.className) === 'mermaid') {
    const chart = getCodeText(child.props.children).replace(/\n$/, '')
    return <MermaidBlock chart={chart} />
  }

  return <pre>{children}</pre>
}

export function MarkdownPreview({ source }: MarkdownPreviewProps) {
  const components = useMemo(
    () => ({
      pre: PreBlock,
      code(props: React.ComponentProps<'code'> & ExtraProps) {
        const { className, children, ...rest } = props
        const language = getCodeLanguage(className)

        if (language === 'mermaid') {
          return null
        }

        return (
          <code className={className} {...rest}>
            {children}
          </code>
        )
      },
      a(props: React.ComponentProps<'a'> & ExtraProps) {
        const { href, children, ...rest } = props
        return (
          <a href={href} target="_blank" rel="noreferrer noopener" {...rest}>
            {children}
          </a>
        )
      },
    }),
    [],
  )

  return (
    <div className="markdown-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}
