import { useCallback, useMemo, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { linter, lintGutter } from '@codemirror/lint'
import { EditorView } from '@codemirror/view'
import {
  escapeJsonString,
  formatJson,
  lineColumnToOffset,
  minifyJson,
  parseJson,
  describeJsonValidation,
  repairJson,
  sortJsonKeys,
  unescapeJsonString,
  type IndentOption,
} from './jsonUtils'
import {
  createDocument,
  downloadFilename,
  nameFromFilename,
  updateDocument,
  type JsonDocument,
} from './jsonDocuments'
import { JsonDocTabs } from './JsonDocTabs'
import { WorkModeSwitch } from './WorkModeSwitch'
import { JsonCompareView } from './JsonCompareView'
import { defaultCompareConfig, type DiffConfig } from './diffTypes'
import { RepairConfirmDialog, type RepairPreview } from './RepairConfirmDialog'
import { CopyIcon, DownloadIcon, FileOpenIcon, TrashIcon } from '../../components/icons/ToolIcons'

const SAMPLE_JSON = `{
  "name": "tool-box",
  "version": 1,
  "features": ["format", "minify", "validate"],
  "meta": {
    "private": true,
    "deploy": "cloudflare"
  }
}`

const INITIAL_DOCUMENT = createDocument({
  name: '示例配置',
  content: SAMPLE_JSON,
})

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
  '.cm-tooltip.cm-tooltip-lint': {
    backgroundColor: '#1a2330',
    border: '1px solid rgba(255, 107, 107, 0.5)',
    color: '#e8edf4',
    borderRadius: '8px',
    padding: '2px 0',
    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.5)',
    maxWidth: 'min(420px, 90vw)',
  },
  '.cm-tooltip-lint .cm-diagnostic': {
    padding: '8px 14px',
    fontFamily: 'var(--sans)',
    fontSize: '13px',
    lineHeight: '1.55',
  },
  '.cm-tooltip-lint .cm-diagnostic-error': {
    color: '#ffc9c9',
  },
  '.cm-tooltip-lint .cm-diagnosticText': {
    color: '#ffc9c9',
  },
  '.cm-tooltip-lint ul': {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  '.cm-lintRange-error': {
    backgroundImage: 'none',
    backgroundColor: 'rgba(255, 107, 107, 0.18)',
    borderBottom: '2px wavy #ff6b6b',
  },
})

function friendlyJsonLinter() {
  return linter((view) => {
    const text = view.state.doc.toString()
    if (!text.trim()) return []

    const issue = describeJsonValidation(text)
    if (!issue) return []

    let from = 0
    let to = Math.min(1, text.length)
    if (issue.position !== undefined) {
      from = issue.position
      to = Math.min(from + 1, text.length)
    } else if (issue.line !== undefined && issue.column !== undefined) {
      from = lineColumnToOffset(text, issue.line, issue.column)
      to = Math.min(from + 1, text.length)
    }

    const line = view.state.doc.lineAt(from)
    from = line.from
    to = line.to

    return [
      {
        from,
        to,
        severity: 'error' as const,
        message: issue.line && issue.column
          ? `第 ${issue.line} 行，第 ${issue.column} 列：${issue.message}`
          : issue.message,
      },
    ]
  })
}

function scrollEditorToPosition(view: EditorView, position: number) {
  const safePos = Math.min(Math.max(position, 0), view.state.doc.length)
  view.dispatch({
    effects: EditorView.scrollIntoView(safePos, { y: 'center' }),
    selection: { anchor: safePos },
  })
  view.focus()
}

export function JsonFormatter() {
  const [documents, setDocuments] = useState<JsonDocument[]>([INITIAL_DOCUMENT])
  const [activeId, setActiveId] = useState(INITIAL_DOCUMENT.id)
  const [indent, setIndent] = useState<IndentOption>(2)
  const [repairPreview, setRepairPreview] = useState<RepairPreview | null>(null)
  const [workMode, setWorkMode] = useState<'edit' | 'compare'>('edit')
  const [compareConfig, setCompareConfig] = useState<DiffConfig>(() =>
    defaultCompareConfig([INITIAL_DOCUMENT], INITIAL_DOCUMENT.id),
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputEditorRef = useRef<EditorView | null>(null)

  const activeDoc = useMemo(
    () => documents.find((doc) => doc.id === activeId) ?? documents[0],
    [activeId, documents],
  )

  const input = activeDoc?.content ?? ''
  const output = activeDoc?.output ?? ''
  const docLabel = activeDoc?.name?.trim() || '当前文档'

  const patchActive = useCallback(
    (patch: Partial<Pick<JsonDocument, 'name' | 'content' | 'output'>>) => {
      if (!activeDoc) return
      setDocuments((prev) => updateDocument(prev, activeDoc.id, patch))
    },
    [activeDoc],
  )

  const inputExtensions = useMemo(
    () => [json(), friendlyJsonLinter(), lintGutter(), editorTheme],
    [],
  )

  const outputExtensions = useMemo(() => [json(), EditorView.editable.of(false), editorTheme], [])

  const handleInputChange = useCallback(
    (value: string) => {
      patchActive({ content: value })
    },
    [patchActive],
  )

  const applyOutput = useCallback(
    (result: string) => {
      patchActive({ output: result })
    },
    [patchActive],
  )

  const handleSelectDoc = useCallback((id: string) => {
    setActiveId(id)
    setRepairPreview(null)
  }, [])

  const handleNameChange = useCallback((id: string, name: string) => {
    setDocuments((prev) => updateDocument(prev, id, { name }))
  }, [])

  const handleAddDoc = useCallback(() => {
    const doc = createDocument({ name: `文档 ${documents.length + 1}` })
    setDocuments((prev) => [...prev, doc])
    setActiveId(doc.id)
    setRepairPreview(null)
  }, [documents.length])

  const handleRemoveDoc = useCallback(
    (id: string) => {
      if (documents.length <= 1) return
      const index = documents.findIndex((doc) => doc.id === id)
      const next = documents.filter((doc) => doc.id !== id)
      setDocuments(next)
      const fallback = next[Math.min(index, next.length - 1)]
      if (activeId === id) {
        setActiveId(fallback.id)
      }
      setCompareConfig((prev) => ({
        ...prev,
        leftDocId: prev.leftDocId === id ? fallback.id : prev.leftDocId,
        rightDocId: prev.rightDocId === id ? fallback.id : prev.rightDocId,
      }))
      setRepairPreview(null)
    },
    [activeId, documents],
  )

  const handleWorkModeChange = useCallback(
    (mode: 'edit' | 'compare') => {
      if (mode === 'compare') {
        setCompareConfig(defaultCompareConfig(documents, activeId))
      }
      setWorkMode(mode)
    },
    [activeId, documents],
  )

  const handleFormat = useCallback(() => {
    const result = formatJson(input, indent)
    if (result.ok) {
      patchActive({ content: result.formatted })
      applyOutput(result.formatted)
      return
    }

    const repairResult = repairJson(input, indent)
    if (!repairResult.ok) return
    if (repairResult.formatted === input) {
      applyOutput(repairResult.formatted)
      return
    }
    setRepairPreview({
      original: input,
      repaired: repairResult.formatted,
      message: repairResult.repaired ? '检测到语法错误，已自动纠正' : 'JSON 已合法，已格式化',
    })
  }, [indent, input, patchActive, applyOutput])

  const handleFormatAll = useCallback(() => {
    const next = documents.map((doc) => {
      if (!doc.content.trim()) return doc
      const result = formatJson(doc.content, indent)
      if (result.ok) {
        return { ...doc, content: result.formatted, output: result.formatted }
      }
      const repairResult = repairJson(doc.content, indent)
      if (!repairResult.ok) return doc
      return { ...doc, content: repairResult.formatted, output: repairResult.formatted }
    })
    setDocuments(next)
  }, [documents, indent])

  const handleRepair = useCallback(() => {
    const result = repairJson(input, indent)
    if (!result.ok) return
    if (result.formatted === input) {
      applyOutput(result.formatted)
      return
    }
    setRepairPreview({
      original: input,
      repaired: result.formatted,
      message: result.repaired ? '已自动纠正' : 'JSON 已合法，已格式化',
    })
  }, [indent, input, applyOutput])

  const handleConfirmRepair = useCallback(() => {
    if (!repairPreview) return
    patchActive({ content: repairPreview.repaired })
    applyOutput(repairPreview.repaired)
    setRepairPreview(null)
  }, [patchActive, repairPreview, applyOutput])

  const handleCancelRepair = useCallback(() => {
    setRepairPreview(null)
  }, [])

  const handleMinify = useCallback(() => {
    const result = minifyJson(input)
    if (!result.ok) return
    patchActive({ content: result.formatted })
    applyOutput(result.formatted)
  }, [input, patchActive, applyOutput])

  const handleMinifyCopy = useCallback(async () => {
    const result = minifyJson(input)
    if (!result.ok) return
    patchActive({ content: result.formatted, output: result.formatted })
    try {
      await navigator.clipboard.writeText(result.formatted)
    } catch {
      // Clipboard permission denied — compressed result is still in the editor.
    }
  }, [input, patchActive])

  const handleValidate = useCallback(() => {
    const result = parseJson(input)
    if (!result.ok) {
      patchActive({ output: '' })
      return
    }
    applyOutput(JSON.stringify(result.data, null, indent === 'tab' ? '\t' : indent))
  }, [indent, input, patchActive, applyOutput])

  const handleSortKeys = useCallback(() => {
    const result = sortJsonKeys(input, indent)
    if (!result.ok) return
    patchActive({ content: result.formatted })
    applyOutput(result.formatted)
  }, [indent, input, patchActive, applyOutput])

  const handleEscape = useCallback(() => {
    const result = escapeJsonString(input)
    if (!result.ok) return
    patchActive({ content: result.formatted })
    applyOutput(result.formatted)
  }, [input, patchActive, applyOutput])

  const handleUnescape = useCallback(() => {
    const result = unescapeJsonString(input)
    if (!result.ok) return
    patchActive({ content: result.formatted })
    applyOutput(result.formatted)
  }, [input, patchActive, applyOutput])

  const handleClear = useCallback(() => {
    patchActive({ content: '', output: '' })
  }, [patchActive])

  const handleLoadSample = useCallback(() => {
    patchActive({ content: SAMPLE_JSON, output: '' })
  }, [patchActive])

  const copyText = useCallback(async (text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard permission denied.
    }
  }, [])

  const handleDownload = useCallback(() => {
    const content = output || input
    if (!content.trim()) return
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = downloadFilename(activeDoc?.name ?? 'data')
    anchor.click()
    URL.revokeObjectURL(url)
  }, [activeDoc?.name, input, output])

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

        if (loaded.length === 1 && !input.trim() && documents.length === 1) {
          setDocuments(loaded)
          setActiveId(loaded[0].id)
        } else {
          setDocuments((prev) => [...prev, ...loaded])
          setActiveId(loaded[loaded.length - 1].id)
        }

        setRepairPreview(null)
      } catch {
        // File read failed.
      }
    },
    [documents.length, input],
  )

  const stats = useMemo(() => {
    const chars = input.length
    const lines = input ? input.split('\n').length : 0
    return { chars, lines }
  }, [input])

  const inputIssue = useMemo(() => describeJsonValidation(input), [input])

  const focusInputError = useCallback(() => {
    const view = inputEditorRef.current
    if (!view || !inputIssue) return
    const position =
      inputIssue.position ??
      (inputIssue.line !== undefined && inputIssue.column !== undefined
        ? lineColumnToOffset(input, inputIssue.line, inputIssue.column)
        : 0)
    scrollEditorToPosition(view, position)
  }, [input, inputIssue])

  if (!activeDoc) return null

  return (
    <section className="json-tool">
      <header className="json-tool-head">
        <div className="json-tool-head-text">
          <h1>JSON 格式化</h1>
        </div>
        <WorkModeSwitch mode={workMode} onChange={handleWorkModeChange} />
      </header>

      <JsonDocTabs
        documents={documents}
        activeId={activeId}
        workMode={workMode}
        compareConfig={compareConfig}
        onSelect={handleSelectDoc}
        onNameChange={handleNameChange}
        onAdd={handleAddDoc}
        onRemove={handleRemoveDoc}
      />

      {workMode === 'edit' ? (
      <div className="toolbar" role="toolbar" aria-label="JSON 工具操作">
        <div className="toolbar-group">
          <button
            type="button"
            className="btn primary"
            onClick={handleFormat}
            title="格式化 JSON；若有语法错误将尝试自动纠正"
          >
            格式化
          </button>
          <button type="button" className="btn accent" onClick={handleMinifyCopy}>
            压缩复制
          </button>
          <button type="button" className="btn" onClick={handleMinify}>
            压缩
          </button>
          <button type="button" className="btn" onClick={handleValidate}>
            校验
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleRepair}
            title="自动修复常见 JSON 语法错误并格式化"
          >
            纠正
          </button>
          <button type="button" className="btn" onClick={handleSortKeys}>
            排序键名
          </button>
          {documents.length > 1 ? (
            <button type="button" className="btn ghost" onClick={handleFormatAll}>
              全部格式化
            </button>
          ) : null}
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
          <button type="button" className="btn ghost" onClick={handleEscape}>
            转义
          </button>
          <button type="button" className="btn ghost" onClick={handleUnescape}>
            反转义
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="btn soft"
            onClick={() => copyText(input)}
          >
            <CopyIcon size={14} className="btn-icon" />
            复制输入
          </button>
          <button
            type="button"
            className="btn soft"
            onClick={() => copyText(output)}
          >
            <CopyIcon size={14} className="btn-icon" />
            复制输出
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
            accept=".json,application/json,text/plain"
            multiple
            hidden
            onChange={handleFileChange}
          />
        </div>
      </div>
      ) : null}

      {workMode === 'edit' && inputIssue ? (
        <div className="json-parse-error" role="alert" aria-live="polite">
          <div className="json-parse-error-main">
            {inputIssue.line !== undefined && inputIssue.column !== undefined ? (
              <span className="json-parse-error-loc">
                第 {inputIssue.line} 行，第 {inputIssue.column} 列
              </span>
            ) : null}
            <span className="json-parse-error-msg">{inputIssue.message}</span>
          </div>
          <button type="button" className="json-parse-error-jump" onClick={focusInputError}>
            定位错误
          </button>
        </div>
      ) : null}

      {repairPreview ? (
        <RepairConfirmDialog
          preview={repairPreview}
          onConfirm={handleConfirmRepair}
          onCancel={handleCancelRepair}
        />
      ) : null}

      {workMode === 'compare' ? (
        <JsonCompareView
          documents={documents}
          activeId={activeId}
          config={compareConfig}
          onConfigChange={setCompareConfig}
        />
      ) : (
        <div className="editor-grid">
        <div className="editor-panel">
          <div className={`panel-head${inputIssue ? ' panel-head-error' : ''}`}>
            <h2>输入 · {docLabel}</h2>
            <span>
              {inputIssue
                ? '语法错误'
                : `${stats.lines} 行 · ${stats.chars} 字符`}
            </span>
          </div>
          <div className="editor-surface">
            <CodeMirror
              key={activeDoc.id}
              value={input}
              height="100%"
              extensions={inputExtensions}
              onChange={handleInputChange}
              onCreateEditor={(view) => {
                inputEditorRef.current = view
              }}
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
            <h2>输出 · {docLabel}</h2>
            <span>只读预览</span>
          </div>
          <div className="editor-surface">
            <CodeMirror
              key={`${activeDoc.id}-out`}
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
      )}
    </section>
  )
}
