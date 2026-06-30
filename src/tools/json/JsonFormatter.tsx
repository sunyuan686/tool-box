import { useCallback, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { linter, lintGutter } from '@codemirror/lint'
import { EditorView } from '@codemirror/view'
import {
  escapeJsonString,
  formatJson,
  minifyJson,
  parseJson,
  sortJsonKeys,
  unescapeJsonString,
  type IndentOption,
} from './jsonUtils'

const SAMPLE_JSON = `{
  "name": "tool-box",
  "version": 1,
  "features": ["format", "minify", "validate"],
  "meta": {
    "private": true,
    "deploy": "cloudflare"
  }
}`

type Status = {
  type: 'idle' | 'success' | 'error'
  message: string
}

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '13px',
  },
  '.cm-scroller': {
    fontFamily: 'var(--mono)',
    lineHeight: '1.6',
  },
  '.cm-content': {
    padding: '12px 0',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--editor-gutter)',
    borderRight: '1px solid var(--border)',
    color: 'var(--text-muted)',
  },
})

export function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE_JSON)
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState<IndentOption>(2)
  const [status, setStatus] = useState<Status>({ type: 'idle', message: '就绪' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const inputExtensions = useMemo(
    () => [json(), linter(jsonParseLinter()), lintGutter(), editorTheme],
    [],
  )

  const outputExtensions = useMemo(() => [json(), EditorView.editable.of(false), editorTheme], [])

  const setError = useCallback((message: string, line?: number, column?: number) => {
    const detail =
      line !== undefined && column !== undefined ? `（第 ${line} 行，第 ${column} 列）` : ''
    setStatus({ type: 'error', message: `${message}${detail}` })
  }, [])

  const setSuccess = useCallback((message: string, result: string) => {
    setOutput(result)
    setStatus({ type: 'success', message })
  }, [])

  const handleFormat = useCallback(() => {
    const result = formatJson(input, indent)
    if (!result.ok) {
      setError(result.error, result.line, result.column)
      return
    }
    setSuccess('格式化成功', result.formatted)
  }, [indent, input, setError, setSuccess])

  const handleMinify = useCallback(() => {
    const result = minifyJson(input)
    if (!result.ok) {
      setError(result.error, result.line, result.column)
      return
    }
    setSuccess('压缩成功', result.formatted)
  }, [input, setError, setSuccess])

  const handleValidate = useCallback(() => {
    const result = parseJson(input)
    if (!result.ok) {
      setOutput('')
      setError(result.error, result.line, result.column)
      return
    }
    setSuccess('JSON 合法', JSON.stringify(result.data, null, indent === 'tab' ? '\t' : indent))
  }, [indent, input, setError, setSuccess])

  const handleSortKeys = useCallback(() => {
    const result = sortJsonKeys(input, indent)
    if (!result.ok) {
      setError(result.error, result.line, result.column)
      return
    }
    setInput(result.formatted)
    setSuccess('键名排序完成', result.formatted)
  }, [indent, input, setError, setSuccess])

  const handleEscape = useCallback(() => {
    const result = escapeJsonString(input)
    if (!result.ok) {
      setError(result.error, result.line, result.column)
      return
    }
    setSuccess('转义成功', result.formatted)
  }, [input, setError, setSuccess])

  const handleUnescape = useCallback(() => {
    const result = unescapeJsonString(input)
    if (!result.ok) {
      setError(result.error, result.line, result.column)
      return
    }
    setSuccess('反转义成功', result.formatted)
  }, [input, setError, setSuccess])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setStatus({ type: 'idle', message: '已清空' })
  }, [])

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_JSON)
    setOutput('')
    setStatus({ type: 'idle', message: '已加载示例' })
  }, [])

  const copyText = useCallback(async (text: string, label: string) => {
    if (!text) {
      setStatus({ type: 'error', message: `${label}为空，无法复制` })
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      setStatus({ type: 'success', message: `已复制${label}` })
    } catch {
      setStatus({ type: 'error', message: '复制失败，请检查浏览器权限' })
    }
  }, [])

  const handleDownload = useCallback(() => {
    const content = output || input
    if (!content.trim()) {
      setStatus({ type: 'error', message: '没有可下载的内容' })
      return
    }
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'data.json'
    anchor.click()
    URL.revokeObjectURL(url)
    setStatus({ type: 'success', message: '已开始下载' })
  }, [input, output])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return

      try {
        const text = await file.text()
        setInput(text)
        setOutput('')
        setStatus({ type: 'success', message: `已加载文件：${file.name}` })
      } catch {
        setStatus({ type: 'error', message: '文件读取失败' })
      }
    },
    [],
  )

  const stats = useMemo(() => {
    const chars = input.length
    const lines = input ? input.split('\n').length : 0
    return { chars, lines }
  }, [input])

  return (
    <section className="json-tool">
      <div className="page-header compact">
        <h1>JSON 格式化</h1>
        <p>格式化、压缩、校验、排序键名，支持转义与文件导入导出。</p>
      </div>

      <div className="toolbar" role="toolbar" aria-label="JSON 工具操作">
        <div className="toolbar-group">
          <button type="button" className="btn primary" onClick={handleFormat}>
            格式化
          </button>
          <button type="button" className="btn" onClick={handleMinify}>
            压缩
          </button>
          <button type="button" className="btn" onClick={handleValidate}>
            校验
          </button>
          <button type="button" className="btn" onClick={handleSortKeys}>
            排序键名
          </button>
        </div>

        <div className="toolbar-group">
          <label className="indent-picker">
            缩进
            <select
              value={String(indent)}
              onChange={(event) => {
                const value = event.target.value
                setIndent(value === 'tab' ? 'tab' : (Number(value) as IndentOption))
              }}
            >
              <option value="2">2 空格</option>
              <option value="4">4 空格</option>
              <option value="tab">Tab</option>
            </select>
          </label>
          <button type="button" className="btn" onClick={handleEscape}>
            转义
          </button>
          <button type="button" className="btn" onClick={handleUnescape}>
            反转义
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button" className="btn" onClick={() => copyText(input, '输入内容')}>
            复制输入
          </button>
          <button type="button" className="btn" onClick={() => copyText(output, '输出内容')}>
            复制输出
          </button>
          <button type="button" className="btn" onClick={handleDownload}>
            下载
          </button>
          <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
            打开文件
          </button>
          <button type="button" className="btn" onClick={handleLoadSample}>
            示例
          </button>
          <button type="button" className="btn danger" onClick={handleClear}>
            清空
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json,text/plain"
            hidden
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-panel">
          <div className="panel-head">
            <h2>输入</h2>
            <span>{stats.lines} 行 · {stats.chars} 字符</span>
          </div>
          <div className="editor-surface">
            <CodeMirror
              value={input}
              height="100%"
              extensions={inputExtensions}
              onChange={(value) => setInput(value)}
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
            <h2>输出</h2>
            <span>只读预览</span>
          </div>
          <div className="editor-surface">
            <CodeMirror
              value={output}
              height="100%"
              extensions={outputExtensions}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: false,
                bracketMatching: true,
              }}
            />
          </div>
        </div>
      </div>

      <footer className={`status-bar status-${status.type}`} aria-live="polite">
        {status.message}
      </footer>
    </section>
  )
}
