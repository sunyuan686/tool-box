import { markdown } from '@codemirror/lang-markdown'
import CodeMirror from '@uiw/react-codemirror'
import { codeEditorSyntax, codeEditorViewTheme } from '../../lib/codemirrorTheme'
import { useCallback, useDeferredValue, useMemo, useRef, useState } from 'react'
import { CopyIcon, DownloadIcon, FileOpenIcon, TrashIcon } from '../../components/icons/ToolIcons'
import { MarkdownDocTabs } from './MarkdownDocTabs'
import { MarkdownPreview } from './MarkdownPreview'
import {
  createDocument,
  downloadFilename,
  nameFromFilename,
  updateDocument,
  type MarkdownDocument,
} from './markdownDocuments'

const SAMPLE_MARKDOWN = `# Markdown 预览示例

支持 **GFM** 语法：表格、任务列表、删除线等。

## 代码高亮

\`\`\`typescript
type Tool = {
  id: string
  name: string
  available: boolean
}

const tools: Tool[] = [{ id: 'markdown', name: 'Markdown 预览', available: true }]
\`\`\`

## Mermaid 图表

\`\`\`mermaid
flowchart LR
  A[编辑 Markdown] --> B[实时预览]
  B --> C[本地处理]
\`\`\`

## 表格

| 功能 | 状态 |
| --- | --- |
| GFM | ✅ |
| 代码高亮 | ✅ |
| Mermaid | ✅ |

## 任务列表

- [x] 多文档 Tab
- [x] 文件导入导出
- [ ] 按需扩展更多语法
`

const INITIAL_DOCUMENT = createDocument({
  name: '示例文档',
  content: SAMPLE_MARKDOWN,
})

export function MarkdownEditor() {
  const [documents, setDocuments] = useState<MarkdownDocument[]>([INITIAL_DOCUMENT])
  const [activeId, setActiveId] = useState(INITIAL_DOCUMENT.id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeDoc = useMemo(
    () => documents.find((doc) => doc.id === activeId) ?? documents[0],
    [activeId, documents],
  )

  const content = activeDoc?.content ?? ''
  const deferredContent = useDeferredValue(content)
  const docLabel = activeDoc?.name?.trim() || '当前文档'

  const patchActive = useCallback(
    (patch: Partial<Pick<MarkdownDocument, 'name' | 'content'>>) => {
      if (!activeDoc) return
      setDocuments((prev) => updateDocument(prev, activeDoc.id, patch))
    },
    [activeDoc],
  )

  const editorExtensions = useMemo(
    () => [markdown(), codeEditorSyntax, codeEditorViewTheme],
    [],
  )

  const handleInputChange = useCallback(
    (value: string) => {
      patchActive({ content: value })
    },
    [patchActive],
  )

  const handleSelectDoc = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const handleNameChange = useCallback((id: string, name: string) => {
    setDocuments((prev) => updateDocument(prev, id, { name }))
  }, [])

  const handleAddDoc = useCallback(() => {
    const doc = createDocument({ name: `文档 ${documents.length + 1}` })
    setDocuments((prev) => [...prev, doc])
    setActiveId(doc.id)
  }, [documents.length])

  const handleRemoveDoc = useCallback(
    (id: string) => {
      if (documents.length <= 1) return
      const index = documents.findIndex((doc) => doc.id === id)
      const next = documents.filter((doc) => doc.id !== id)
      setDocuments(next)
      if (activeId === id) {
        setActiveId(next[Math.min(index, next.length - 1)].id)
      }
    },
    [activeId, documents],
  )

  const copyText = useCallback(async (text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard permission denied.
    }
  }, [])

  const handleDownload = useCallback(() => {
    if (!content.trim()) return
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = downloadFilename(activeDoc?.name ?? 'document')
    anchor.click()
    URL.revokeObjectURL(url)
  }, [activeDoc?.name, content])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      event.target.value = ''
      if (!files?.length) return

      try {
        const loaded = await Promise.all(
          Array.from(files).map(async (file) => {
            const text = await file.text()
            return createDocument({
              name: nameFromFilename(file.name),
              content: text,
            })
          }),
        )

        if (loaded.length === 1 && !content.trim() && documents.length === 1) {
          setDocuments(loaded)
          setActiveId(loaded[0].id)
        } else {
          setDocuments((prev) => [...prev, ...loaded])
          setActiveId(loaded[loaded.length - 1].id)
        }
      } catch {
        // File read failed.
      }
    },
    [content, documents.length],
  )

  const handleLoadSample = useCallback(() => {
    patchActive({ content: SAMPLE_MARKDOWN })
  }, [patchActive])

  const handleClear = useCallback(() => {
    patchActive({ content: '' })
  }, [patchActive])

  const stats = useMemo(() => {
    const chars = content.length
    const lines = content ? content.split('\n').length : 0
    return { chars, lines }
  }, [content])

  if (!activeDoc) return null

  return (
    <section className="json-tool markdown-tool">
      <header className="json-tool-head">
        <div className="json-tool-head-text">
          <h1>Markdown 预览</h1>
        </div>
      </header>

      <MarkdownDocTabs
        documents={documents}
        activeId={activeId}
        onSelect={handleSelectDoc}
        onNameChange={handleNameChange}
        onAdd={handleAddDoc}
        onRemove={handleRemoveDoc}
      />

      <div className="toolbar" role="toolbar" aria-label="Markdown 工具操作">
        <div className="toolbar-group">
          <button type="button" className="btn soft" onClick={() => copyText(content)}>
            <CopyIcon size={14} className="btn-icon" />
            复制源码
          </button>
          <button type="button" className="btn" onClick={handleDownload}>
            <DownloadIcon size={14} className="btn-icon" />
            下载
          </button>
          <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
            <FileOpenIcon size={14} className="btn-icon" />
            打开文件
          </button>
          <button type="button" className="btn ghost" onClick={handleLoadSample}>
            示例
          </button>
          <button type="button" className="btn danger" onClick={handleClear}>
            <TrashIcon size={14} className="btn-icon" />
            清空
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,text/markdown,text/plain"
            multiple
            hidden
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-panel">
          <div className="panel-head">
            <h2>编辑 · {docLabel}</h2>
            <span>
              {stats.lines} 行 · {stats.chars} 字符
            </span>
          </div>
          <div className="editor-surface">
            <CodeMirror
              key={activeDoc.id}
              value={content}
              height="100%"
              theme="none"
              extensions={editorExtensions}
              onChange={handleInputChange}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: true,
                bracketMatching: true,
              }}
            />
          </div>
        </div>

        <div className="editor-panel">
          <div className="panel-head">
            <h2>预览 · {docLabel}</h2>
            <span>{deferredContent !== content ? '更新中…' : '实时渲染'}</span>
          </div>
          <div className="editor-surface markdown-preview-surface">
            {content.trim() ? (
              <MarkdownPreview source={deferredContent} />
            ) : (
              <p className="markdown-empty">输入 Markdown 后将在此实时预览</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
