import { diffLines } from 'diff'

export type SideBySideRowType = 'unchanged' | 'added' | 'removed' | 'changed'

export type SideBySideRow = {
  type: SideBySideRowType
  left: string
  right: string
  leftLineNo: number | null
  rightLineNo: number | null
}

export type SideBySideDiffSummary = {
  added: number
  removed: number
  changed: number
  unchanged: number
  rows: SideBySideRow[]
}

function splitLines(value: string): string[] {
  if (!value) return []
  const lines = value.split('\n')
  if (value.endsWith('\n')) lines.pop()
  return lines
}

function rowType(left: string, right: string): SideBySideRowType {
  if (left && right) return left === right ? 'unchanged' : 'changed'
  if (left) return 'removed'
  return 'added'
}

function pushRow(
  rows: SideBySideRow[],
  counts: Pick<SideBySideDiffSummary, 'added' | 'removed' | 'changed' | 'unchanged'>,
  left: string,
  right: string,
  lineNos: { left: number; right: number },
) {
  const type = rowType(left, right)
  rows.push({
    type,
    left,
    right,
    leftLineNo: left ? lineNos.left++ : null,
    rightLineNo: right ? lineNos.right++ : null,
  })
  counts[type]++
}

export function buildSideBySideDiff(oldText: string, newText: string): SideBySideDiffSummary {
  const changes = diffLines(oldText, newText)
  const rows: SideBySideRow[] = []
  const counts = { added: 0, removed: 0, changed: 0, unchanged: 0 }
  const lineNos = { left: 1, right: 1 }

  for (let i = 0; i < changes.length; i++) {
    const part = changes[i]

    if (!part.added && !part.removed) {
      for (const line of splitLines(part.value)) {
        pushRow(rows, counts, line, line, lineNos)
      }
      continue
    }

    if (part.removed && i + 1 < changes.length && changes[i + 1].added) {
      const removedLines = splitLines(part.value)
      const addedLines = splitLines(changes[i + 1].value)
      const maxLen = Math.max(removedLines.length, addedLines.length)

      for (let j = 0; j < maxLen; j++) {
        pushRow(rows, counts, removedLines[j] ?? '', addedLines[j] ?? '', lineNos)
      }
      i++
      continue
    }

    if (part.removed) {
      for (const line of splitLines(part.value)) {
        pushRow(rows, counts, line, '', lineNos)
      }
      continue
    }

    if (part.added) {
      for (const line of splitLines(part.value)) {
        pushRow(rows, counts, '', line, lineNos)
      }
    }
  }

  return { ...counts, rows }
}
