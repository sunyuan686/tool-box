import { useCallback, useRef, type KeyboardEvent } from 'react'
import { formatThreeWaySummary, type ThreeWayDiffSummary, type ThreeWayRow } from './threeWayDiff'

type ThreeWayDiffViewProps = {
  summary: ThreeWayDiffSummary
  onCenterLineChange: (rowIndex: number, value: string) => void
  onApplyLeft: (rowIndex: number) => void
  onApplyRight: (rowIndex: number) => void
  leftLabel?: string
  centerLabel?: string
  rightLabel?: string
}

function MergeActionButton({
  label,
  onClick,
  direction,
}: {
  label: string
  onClick: () => void
  direction: 'to-center-from-left' | 'to-center-from-right'
}) {
  return (
    <button
      type="button"
      className="merge-diff-action"
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {direction === 'to-center-from-left' ? '→' : '←'}
    </button>
  )
}

function MergeRow({
  row,
  onCenterLineChange,
  onApplyLeft,
  onApplyRight,
}: {
  row: ThreeWayRow
  onCenterLineChange: (rowIndex: number, value: string) => void
  onApplyLeft: (rowIndex: number) => void
  onApplyRight: (rowIndex: number) => void
}) {
  const showActions = row.type !== 'unchanged'

  return (
    <div className={`merge-diff-row merge-diff-row-${row.type}`}>
      <div className="merge-diff-cell merge-diff-left">
        <span className="diff-lineno" aria-hidden="true">
          {row.leftLineNo ?? ''}
        </span>
        <code>{row.left || ' '}</code>
      </div>

      <div className="merge-diff-gutter merge-diff-gutter-left">
        {showActions ? (
          <MergeActionButton
            label="采用左侧内容"
            direction="to-center-from-left"
            onClick={() => onApplyLeft(row.rowIndex)}
          />
        ) : null}
      </div>

      <div className="merge-diff-cell merge-diff-center">
        <span className="diff-lineno" aria-hidden="true">
          {row.centerLineNo ?? ''}
        </span>
        <input
          type="text"
          className="merge-diff-center-input"
          value={row.center}
          spellCheck={false}
          onChange={(event) => onCenterLineChange(row.rowIndex, event.target.value)}
          aria-label={`结果第 ${row.centerLineNo ?? row.rowIndex + 1} 行`}
        />
      </div>

      <div className="merge-diff-gutter merge-diff-gutter-right">
        {showActions ? (
          <MergeActionButton
            label="采用右侧内容"
            direction="to-center-from-right"
            onClick={() => onApplyRight(row.rowIndex)}
          />
        ) : null}
      </div>

      <div className="merge-diff-cell merge-diff-right">
        <span className="diff-lineno" aria-hidden="true">
          {row.rightLineNo ?? ''}
        </span>
        <code>{row.right || ' '}</code>
      </div>
    </div>
  )
}

export function ThreeWayDiffView({
  summary,
  onCenterLineChange,
  onApplyLeft,
  onApplyRight,
  leftLabel = '左侧',
  centerLabel = '结果',
  rightLabel = '右侧',
}: ThreeWayDiffViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return
    const step = event.shiftKey ? 240 : 80
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      scrollRef.current.scrollTop += step
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      scrollRef.current.scrollTop -= step
    }
  }, [])

  return (
    <div className="merge-diff-view">
      <p className="diff-summary">{formatThreeWaySummary(summary)}</p>
      <div className="merge-diff-split" aria-label="三路合并对比">
        <div className="merge-diff-columns-head">
          <span>{leftLabel}</span>
          <span aria-hidden="true" />
          <span>{centerLabel}</span>
          <span aria-hidden="true" />
          <span>{rightLabel}</span>
        </div>
        <div
          className="merge-diff-scroll"
          ref={scrollRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {summary.rows.length > 0 ? (
            summary.rows.map((row) => (
              <MergeRow
                key={row.rowIndex}
                row={row}
                onCenterLineChange={onCenterLineChange}
                onApplyLeft={onApplyLeft}
                onApplyRight={onApplyRight}
              />
            ))
          ) : (
            <p className="diff-empty">左右两侧内容均为空</p>
          )}
        </div>
      </div>
    </div>
  )
}
