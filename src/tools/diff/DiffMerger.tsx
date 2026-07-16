import CodeMirror from '@uiw/react-codemirror'
import { codeEditorSyntax, codeEditorViewTheme } from '../../lib/codemirrorTheme'
import { useCallback, useMemo, useRef, useState } from 'react'
import { CopyIcon, DownloadIcon, FileOpenIcon } from '../../components/icons/ToolIcons'
import { ThreeWayDiffView } from './ThreeWayDiffView'
import {
  applyAllFromSide,
  applySideToChunk,
  buildThreeWayDiff,
  centerLinesToText,
  mergePreserveCenter,
  textToCenterLines,
} from './threeWayDiff'

const SAMPLE_LEFT = `function greet(name) {
  const prefix = 'Hello'
  console.log(prefix + ', ' + name)
  return prefix
}

export { greet }`

const SAMPLE_RIGHT = `function greet(name) {
  const prefix = 'Hi'
  console.log(\`\${prefix}, \${name}!\`)
  logEvent('greet')
  return prefix
}

export { greet }`

const diffEditorTheme = [codeEditorSyntax, codeEditorViewTheme]

async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function DiffMerger() {
  const [leftText, setLeftText] = useState(SAMPLE_LEFT)
  const [rightText, setRightText] = useState(SAMPLE_RIGHT)
  const [centerLines, setCenterLines] = useState<string[]>(() =>
    mergePreserveCenter(SAMPLE_LEFT, SAMPLE_RIGHT, null),
  )
  const [showSourceEditor, setShowSourceEditor] = useState(false)
  const [copyHint, setCopyHint] = useState('')

  const leftFileRef = useRef<HTMLInputElement>(null)
  const rightFileRef = useRef<HTMLInputElement>(null)

  const summary = useMemo(
    () => buildThreeWayDiff(leftText, rightText, centerLines),
    [leftText, rightText, centerLines],
  )

  const resultText = useMemo(() => centerLinesToText(centerLines), [centerLines])

  const syncCenterFromSides = useCallback(
    (nextLeft: string, nextRight: string) => {
      setCenterLines((prev) => {
        const prevSummary = buildThreeWayDiff(leftText, rightText, prev)
        return mergePreserveCenter(nextLeft, nextRight, prevSummary.rows)
      })
    },
    [leftText, rightText],
  )

  const handleLeftTextChange = useCallback(
    (value: string) => {
      setLeftText(value)
      syncCenterFromSides(value, rightText)
    },
    [rightText, syncCenterFromSides],
  )

  const handleRightTextChange = useCallback(
    (value: string) => {
      setRightText(value)
      syncCenterFromSides(leftText, value)
    },
    [leftText, syncCenterFromSides],
  )

  const handleCenterTextChange = useCallback(
    (value: string) => {
      setCenterLines(textToCenterLines(value, summary.rows.length))
    },
    [summary.rows.length],
  )

  const handleCenterLineChange = useCallback((rowIndex: number, value: string) => {
    setCenterLines((prev) => {
      const next = [...prev]
      next[rowIndex] = value
      return next
    })
  }, [])

  const handleApplyLeft = useCallback(
    (rowIndex: number) => {
      setCenterLines((prev) => applySideToChunk(prev, summary.rows, rowIndex, 'left'))
    },
    [summary.rows],
  )

  const handleApplyRight = useCallback(
    (rowIndex: number) => {
      setCenterLines((prev) => applySideToChunk(prev, summary.rows, rowIndex, 'right'))
    },
    [summary.rows],
  )

  const handleApplyAllLeft = useCallback(() => {
    setCenterLines(applyAllFromSide(summary.rows, 'left'))
  }, [summary.rows])

  const handleApplyAllRight = useCallback(() => {
    setCenterLines(applyAllFromSide(summary.rows, 'right'))
  }, [summary.rows])

  const handleSwapSides = useCallback(() => {
    const nextLeft = rightText
    const nextRight = leftText
    setLeftText(nextLeft)
    setRightText(nextRight)
    syncCenterFromSides(nextLeft, nextRight)
  }, [leftText, rightText, syncCenterFromSides])

  const handleResetCenter = useCallback(() => {
    setCenterLines(mergePreserveCenter(leftText, rightText, null))
  }, [leftText, rightText])

  const handleCopyResult = useCallback(async () => {
    await copyText(resultText)
    setCopyHint('已复制结果')
    window.setTimeout(() => setCopyHint(''), 1600)
  }, [resultText])

  const handleDownloadResult = useCallback(() => {
    downloadText(resultText, 'merge-result.txt')
  }, [resultText])

  const readFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }, [])

  const handleLeftFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return
      handleLeftTextChange(await readFile(file))
    },
    [handleLeftTextChange, readFile],
  )

  const handleRightFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return
      handleRightTextChange(await readFile(file))
    },
    [handleRightTextChange, readFile],
  )

  return (
    <section className="json-tool diff-tool">
      <header className="json-tool-head">
        <div className="json-tool-head-text">
          <h1>文本合并</h1>
          <p>左中右三路对比，中间为保留结果；点击箭头将差异块从左侧或右侧并入结果。</p>
        </div>
      </header>

      <div className="toolbar" role="toolbar" aria-label="合并工具操作">
        <div className="toolbar-group">
          <button
            type="button"
            className="btn soft"
            onClick={() => leftFileRef.current?.click()}
          >
            <FileOpenIcon size={16} />
            打开左侧
          </button>
          <button
            type="button"
            className="btn soft"
            onClick={() => rightFileRef.current?.click()}
          >
            <FileOpenIcon size={16} />
            打开右侧
          </button>
          <button type="button" className="btn ghost" onClick={handleSwapSides}>
            交换左右
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button" className="btn soft" onClick={handleApplyAllLeft}>
            全部采用左侧
          </button>
          <button type="button" className="btn soft" onClick={handleApplyAllRight}>
            全部采用右侧
          </button>
          <button type="button" className="btn ghost" onClick={handleResetCenter}>
            重置结果
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button" className="btn primary" onClick={handleCopyResult}>
            <CopyIcon size={16} />
            复制结果
          </button>
          <button type="button" className="btn soft" onClick={handleDownloadResult}>
            <DownloadIcon size={16} />
            下载结果
          </button>
          <button
            type="button"
            className={`btn ghost${showSourceEditor ? ' active' : ''}`}
            onClick={() => setShowSourceEditor((value) => !value)}
            aria-pressed={showSourceEditor}
          >
            {showSourceEditor ? '隐藏源文本' : '编辑源文本'}
          </button>
        </div>
      </div>

      {copyHint ? <p className="diff-tool-hint">{copyHint}</p> : null}

      {showSourceEditor ? (
        <div className="merge-source-grid">
          <div className="editor-panel">
            <div className="panel-head">
              <h2>左侧</h2>
            </div>
            <div className="editor-surface">
              <CodeMirror
                value={leftText}
                height="100%"
                theme="none"
                extensions={diffEditorTheme}
                onChange={handleLeftTextChange}
                basicSetup={{ lineNumbers: true, foldGutter: false }}
              />
            </div>
          </div>

          <div className="editor-panel merge-source-center">
            <div className="panel-head">
              <h2>结果</h2>
            </div>
            <div className="editor-surface">
              <CodeMirror
                value={resultText}
                height="100%"
                theme="none"
                extensions={diffEditorTheme}
                onChange={handleCenterTextChange}
                basicSetup={{ lineNumbers: true, foldGutter: false }}
              />
            </div>
          </div>

          <div className="editor-panel">
            <div className="panel-head">
              <h2>右侧</h2>
            </div>
            <div className="editor-surface">
              <CodeMirror
                value={rightText}
                height="100%"
                theme="none"
                extensions={diffEditorTheme}
                onChange={handleRightTextChange}
                basicSetup={{ lineNumbers: true, foldGutter: false }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <ThreeWayDiffView
        summary={summary}
        onCenterLineChange={handleCenterLineChange}
        onApplyLeft={handleApplyLeft}
        onApplyRight={handleApplyRight}
      />

      <input
        ref={leftFileRef}
        type="file"
        accept=".txt,.md,.json,.ts,.tsx,.js,.jsx,.css,.html,.xml,.yaml,.yml,.csv,.log,text/*"
        hidden
        onChange={handleLeftFile}
      />
      <input
        ref={rightFileRef}
        type="file"
        accept=".txt,.md,.json,.ts,.tsx,.js,.jsx,.css,.html,.xml,.yaml,.yml,.csv,.log,text/*"
        hidden
        onChange={handleRightFile}
      />
    </section>
  )
}
