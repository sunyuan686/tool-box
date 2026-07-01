import type { JsonDocument } from './jsonDocuments'
import {
  defaultCompareConfig,
  pickOtherDocId,
  type DiffConfig,
} from './diffTypes'
import { SideBySideDiffView, formatDiffSummary } from './SideBySideDiffView'
import { buildSideBySideDiff } from './jsonDiff'
import { useMemo } from 'react'

type JsonCompareViewProps = {
  documents: JsonDocument[]
  activeId: string
  config: DiffConfig
  onConfigChange: (config: DiffConfig) => void
}

function CompareSidePicker({
  side,
  docId,
  documents,
  onDocChange,
}: {
  side: 'left' | 'right'
  docId: string
  documents: JsonDocument[]
  onDocChange: (id: string) => void
}) {
  return (
    <div className={`json-compare-side json-compare-side-${side}`}>
      <div className="json-compare-side-head">
        <span className="json-compare-side-tag">{side === 'left' ? 'A' : 'B'}</span>
        <select
          value={docId}
          onChange={(event) => onDocChange(event.target.value)}
          aria-label={`${side === 'left' ? '左侧' : '右侧'}文档`}
        >
          {documents.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name.trim() || '未命名'}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function JsonCompareView({
  documents,
  activeId,
  config,
  onConfigChange,
}: JsonCompareViewProps) {
  const multiDoc = documents.length > 1

  const leftDoc = documents.find((doc) => doc.id === config.leftDocId)
  const rightDoc = documents.find((doc) => doc.id === config.rightDocId)

  const leftText = leftDoc?.content ?? ''
  const rightText = rightDoc?.content ?? ''

  const leftLabel = leftDoc?.name.trim() || '未命名'
  const rightLabel = rightDoc?.name.trim() || '未命名'

  const diff = useMemo(() => buildSideBySideDiff(leftText, rightText), [leftText, rightText])

  const sameSide = config.leftDocId === config.rightDocId

  const patchLeftDoc = (leftDocId: string) => {
    const next: DiffConfig = { ...config, leftDocId }
    if (leftDocId === next.rightDocId && documents.length > 1) {
      next.rightDocId = pickOtherDocId(documents, leftDocId)
    }
    onConfigChange(next)
  }

  const patchRightDoc = (rightDocId: string) => {
    const next: DiffConfig = { ...config, rightDocId }
    if (next.leftDocId === rightDocId && documents.length > 1) {
      next.leftDocId = pickOtherDocId(documents, rightDocId)
    }
    onConfigChange(next)
  }

  const swapSides = () => {
    onConfigChange({
      leftDocId: config.rightDocId,
      rightDocId: config.leftDocId,
    })
  }

  return (
    <div className="json-compare-view">
      <div className="json-compare-panel">
        <div className="json-compare-toolbar">
          <CompareSidePicker
            side="left"
            docId={config.leftDocId}
            documents={documents}
            onDocChange={patchLeftDoc}
          />

          <button
            type="button"
            className="json-compare-swap"
            onClick={swapSides}
            title="交换左右"
            aria-label="交换左右"
          >
            ⇄
          </button>

          <CompareSidePicker
            side="right"
            docId={config.rightDocId}
            documents={documents}
            onDocChange={patchRightDoc}
          />
        </div>

        <div className="json-compare-meta">
          <p className="json-compare-summary">
            {sameSide ? (
              <span className="json-compare-hint warn">两侧选择了同一文档，请更换其中一个</span>
            ) : (
              <span>{formatDiffSummary(diff)}</span>
            )}
          </p>
          {multiDoc ? (
            <div className="json-compare-quick">
              <button
                type="button"
                className="compare-quick"
                onClick={() => onConfigChange(defaultCompareConfig(documents, activeId))}
              >
                当前 ↔ 其他 Tab
              </button>
            </div>
          ) : null}
        </div>

        <SideBySideDiffView
          embedded
          hideSummary
          leftLabel={leftLabel}
          rightLabel={rightLabel}
          leftText={leftText}
          rightText={rightText}
        />
      </div>
    </div>
  )
}
