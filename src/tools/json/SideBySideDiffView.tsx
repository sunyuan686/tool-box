import { useMemo } from 'react'
import { buildSideBySideDiff } from './jsonDiff'

export function formatDiffSummary(diff: ReturnType<typeof buildSideBySideDiff>) {
  const parts: string[] = []
  if (diff.removed > 0) parts.push(`${diff.removed} 行删除`)
  if (diff.added > 0) parts.push(`${diff.added} 行新增`)
  if (diff.changed > 0) parts.push(`${diff.changed} 行修改`)
  if (diff.unchanged > 0) parts.push(`${diff.unchanged} 行未变`)
  return parts.length > 0 ? parts.join('、') : '无变化'
}

type SideBySideDiffViewProps = {
  leftLabel: string
  rightLabel: string
  leftText: string
  rightText: string
  ariaLabel?: string
  embedded?: boolean
  hideSummary?: boolean
}

export function SideBySideDiffView({
  leftLabel,
  rightLabel,
  leftText,
  rightText,
  ariaLabel = '差异对比',
  embedded = false,
  hideSummary = false,
}: SideBySideDiffViewProps) {
  const diff = useMemo(() => buildSideBySideDiff(leftText, rightText), [leftText, rightText])

  return (
    <div className={embedded ? 'diff-view-embedded' : 'diff-view-dialog'}>
      {!hideSummary ? <p className="diff-summary">{formatDiffSummary(diff)}</p> : null}
      <div className="repair-diff-split" aria-label={ariaLabel}>
        <div className="repair-diff-columns-head">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
        <div className="repair-diff-scroll">
          {diff.rows.length > 0 ? (
            diff.rows.map((row, index) => (
              <div key={index} className={`diff-split-row diff-split-row-${row.type}`}>
                <div className="diff-split-cell diff-split-left">
                  <span className="diff-lineno" aria-hidden="true">
                    {row.leftLineNo ?? ''}
                  </span>
                  <code>{row.left || ' '}</code>
                </div>
                <div className="diff-split-cell diff-split-right">
                  <span className="diff-lineno" aria-hidden="true">
                    {row.rightLineNo ?? ''}
                  </span>
                  <code>{row.right || ' '}</code>
                </div>
              </div>
            ))
          ) : (
            <p className="diff-empty">两侧内容均为空</p>
          )}
        </div>
      </div>
    </div>
  )
}
