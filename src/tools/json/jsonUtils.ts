export type IndentOption = 2 | 4 | 'tab'

export type JsonResult =
  | { ok: true; data: unknown; formatted: string }
  | { ok: false; error: string; line?: number; column?: number; position?: number }

function indentString(option: IndentOption): string | number {
  return option === 'tab' ? '\t' : option
}

function getErrorPosition(message: string): number | undefined {
  const match = message.match(/position\s+(\d+)/i)
  return match ? Number(match[1]) : undefined
}

function positionToLineColumn(text: string, position: number) {
  const before = text.slice(0, position)
  const lines = before.split('\n')
  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  }
}

export function parseJson(input: string): JsonResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: '请输入 JSON 内容' }
  }

  try {
    const data = JSON.parse(trimmed)
    return { ok: true, data, formatted: trimmed }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON 解析失败'
    const position = getErrorPosition(message)
    if (position !== undefined) {
      const { line, column } = positionToLineColumn(input, position)
      return { ok: false, error: message, line, column, position }
    }
    return { ok: false, error: message }
  }
}

export function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys)
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObjectKeys((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return value
}

export function formatJson(input: string, indent: IndentOption): JsonResult {
  const parsed = parseJson(input)
  if (!parsed.ok) return parsed

  const formatted = JSON.stringify(parsed.data, null, indentString(indent))
  return { ok: true, data: parsed.data, formatted }
}

export function minifyJson(input: string): JsonResult {
  const parsed = parseJson(input)
  if (!parsed.ok) return parsed

  const formatted = JSON.stringify(parsed.data)
  return { ok: true, data: parsed.data, formatted }
}

export function sortJsonKeys(input: string, indent: IndentOption): JsonResult {
  const parsed = parseJson(input)
  if (!parsed.ok) return parsed

  const sorted = sortObjectKeys(parsed.data)
  const formatted = JSON.stringify(sorted, null, indentString(indent))
  return { ok: true, data: sorted, formatted }
}

export function escapeJsonString(input: string): JsonResult {
  const parsed = parseJson(input)
  if (!parsed.ok) return parsed

  const formatted = JSON.stringify(JSON.stringify(parsed.data))
  return { ok: true, data: parsed.data, formatted }
}

export function unescapeJsonString(input: string): JsonResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: '请输入需要反转义的 JSON 字符串' }
  }

  try {
    const unescaped = JSON.parse(trimmed)
    if (typeof unescaped !== 'string') {
      return { ok: false, error: '内容不是转义后的 JSON 字符串' }
    }

    const data = JSON.parse(unescaped)
    const formatted = JSON.stringify(data, null, indentString(2))
    return { ok: true, data, formatted }
  } catch (error) {
    const message = error instanceof Error ? error.message : '反转义失败'
    const position = getErrorPosition(message)
    if (position !== undefined) {
      const { line, column } = positionToLineColumn(input, position)
      return { ok: false, error: message, line, column, position }
    }
    return { ok: false, error: message }
  }
}
