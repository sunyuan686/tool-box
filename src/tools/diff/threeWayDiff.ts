import { buildSideBySideDiff, type SideBySideRowType } from '../json/jsonDiff'

export type ThreeWayRowType = 'unchanged' | 'left-only' | 'right-only' | 'conflict'

export type ThreeWayRow = {
  type: ThreeWayRowType
  left: string
  center: string
  right: string
  leftLineNo: number | null
  centerLineNo: number | null
  rightLineNo: number | null
  rowIndex: number
}

export type ThreeWayDiffSummary = {
  unchanged: number
  leftOnly: number
  rightOnly: number
  conflict: number
  rows: ThreeWayRow[]
}

function mapRowType(sideType: SideBySideRowType): ThreeWayRowType {
  switch (sideType) {
    case 'unchanged':
      return 'unchanged'
    case 'removed':
      return 'left-only'
    case 'added':
      return 'right-only'
    case 'changed':
      return 'conflict'
  }
}

function defaultCenterForRow(type: ThreeWayRowType, left: string): string {
  if (type === 'unchanged') return left
  if (type === 'right-only') return ''
  return left
}

export function buildThreeWayDiff(
  leftText: string,
  rightText: string,
  centerLines: string[],
): ThreeWayDiffSummary {
  const diff = buildSideBySideDiff(leftText, rightText)
  const counts = { unchanged: 0, leftOnly: 0, rightOnly: 0, conflict: 0 }
  let centerLineNo = 1

  const rows: ThreeWayRow[] = diff.rows.map((row, rowIndex) => {
    const type = mapRowType(row.type)
    counts[type === 'left-only' ? 'leftOnly' : type === 'right-only' ? 'rightOnly' : type]++

    const center =
      centerLines[rowIndex] ??
      defaultCenterForRow(type, row.left)

    const centerNo = center ? centerLineNo++ : null

    return {
      type,
      left: row.left,
      center,
      right: row.right,
      leftLineNo: row.leftLineNo,
      centerLineNo: centerNo,
      rightLineNo: row.rightLineNo,
      rowIndex,
    }
  })

  return { ...counts, rows }
}

export function mergePreserveCenter(
  leftText: string,
  rightText: string,
  prevRows: ThreeWayRow[] | null,
): string[] {
  const diff = buildSideBySideDiff(leftText, rightText)

  return diff.rows.map((row) => {
    const type = mapRowType(row.type)
    const prevMatch = prevRows?.find(
      (item) => item.left === row.left && item.right === row.right,
    )

    if (prevMatch) return prevMatch.center

    return defaultCenterForRow(type, row.left)
  })
}

export function centerLinesToText(lines: string[]): string {
  if (lines.length === 0) return ''
  return lines.join('\n')
}

export function textToCenterLines(text: string, rowCount: number): string[] {
  const lines = text.split('\n')
  if (text.endsWith('\n')) lines.pop()

  const result = Array.from({ length: rowCount }, (_, index) => lines[index] ?? '')
  if (lines.length > rowCount) {
    for (let i = rowCount; i < lines.length; i++) {
      result.push(lines[i] ?? '')
    }
  }
  return result
}

function chunkRange(rows: ThreeWayRow[], rowIndex: number): [number, number] {
  let start = rowIndex
  let end = rowIndex

  while (start > 0 && rows[start - 1].type !== 'unchanged') start--
  while (end < rows.length - 1 && rows[end + 1].type !== 'unchanged') end++

  return [start, end]
}

export function applySideToChunk(
  centerLines: string[],
  rows: ThreeWayRow[],
  rowIndex: number,
  side: 'left' | 'right',
): string[] {
  const next = [...centerLines]
  const [start, end] = chunkRange(rows, rowIndex)

  for (let i = start; i <= end; i++) {
    if (rows[i].type === 'unchanged') continue
    next[i] = side === 'left' ? rows[i].left : rows[i].right
  }

  return next
}

export function applyAllFromSide(
  rows: ThreeWayRow[],
  side: 'left' | 'right',
): string[] {
  return rows.map((row) => {
    if (row.type === 'unchanged') return row.left
    return side === 'left' ? row.left : row.right
  })
}

export function formatThreeWaySummary(summary: ThreeWayDiffSummary): string {
  const parts: string[] = []
  if (summary.conflict > 0) parts.push(`${summary.conflict} 处冲突`)
  if (summary.leftOnly > 0) parts.push(`${summary.leftOnly} 行仅左侧`)
  if (summary.rightOnly > 0) parts.push(`${summary.rightOnly} 行仅右侧`)
  if (summary.unchanged > 0) parts.push(`${summary.unchanged} 行相同`)
  return parts.length > 0 ? parts.join('、') : '无差异'
}
