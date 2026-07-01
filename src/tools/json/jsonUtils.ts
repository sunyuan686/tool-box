import { jsonrepair, JSONRepairError } from 'jsonrepair'

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

export function lineColumnToOffset(text: string, line: number, column: number): number {
  const lines = text.split('\n')
  let offset = 0
  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    offset += lines[i].length + 1
  }
  offset += column - 1
  return Math.min(Math.max(offset, 0), text.length)
}

export function humanizeJsonError(message: string): string {
  if (message.includes('Unexpected end of JSON input')) {
    return 'JSON 不完整，可能缺少闭合括号、引号或值'
  }
  if (message.includes('Expected double-quoted property name')) {
    return '此处不应继续写内容，常见原因是上一行末尾多了逗号'
  }
  if (message.includes("Expected ':' after property name")) {
    return '属性名后应有冒号'
  }
  if (message.includes("Expected ',' or '}' after property value")) {
    return '属性值后应有逗号或闭合花括号 }'
  }
  if (message.includes("Expected ',' or ']' after array element")) {
    return '数组元素后应有逗号或闭合方括号 ]'
  }
  if (message.includes('Unterminated string')) {
    return '字符串未闭合，缺少结束引号'
  }
  if (message.includes('Bad control character')) {
    return '字符串中包含非法控制字符'
  }
  if (message.includes('No number after minus sign')) {
    return '负号后缺少数字'
  }
  if (message.includes('Bad escaped character')) {
    return '字符串中存在无效的转义字符'
  }
  if (message.includes('Unexpected token')) {
    const tokenMatch = message.match(/Unexpected token (.+?) in JSON/i)
    if (tokenMatch) {
      return `意外的符号 ${tokenMatch[1]}，请检查语法`
    }
    return '存在无法识别的符号，请检查语法'
  }
  return 'JSON 语法错误，请检查格式'
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
    const raw = error instanceof Error ? error.message : 'JSON 解析失败'
    const friendly = humanizeJsonError(raw)
    const position = getErrorPosition(raw)
    if (position !== undefined) {
      const { line, column } = positionToLineColumn(input, position)
      return { ok: false, error: friendly, line, column, position }
    }
    return { ok: false, error: friendly }
  }
}

export type JsonValidationIssue = {
  message: string
  line?: number
  column?: number
  position?: number
}

/** Returns a user-facing validation issue when input has content but invalid JSON. */
export function describeJsonValidation(input: string): JsonValidationIssue | null {
  if (!input.trim()) return null
  const result = parseJson(input)
  if (result.ok) return null

  let issue: JsonValidationIssue = {
    message: result.error,
    line: result.line,
    column: result.column,
    position: result.position,
  }

  if (issue.line !== undefined && issue.line > 1) {
    const lines = input.split('\n')
    const prevLine = lines[issue.line - 2] ?? ''
    const pointsAtClosingBrace = lines[issue.line - 1]?.trimStart().startsWith('}')
    if (pointsAtClosingBrace && prevLine.trimEnd().endsWith(',')) {
      const commaColumn = prevLine.lastIndexOf(',') + 1
      issue = {
        message: '上一行末尾多了逗号，请删除多余的 ,',
        line: issue.line - 1,
        column: commaColumn,
        position: lineColumnToOffset(input, issue.line, commaColumn),
      }
    }
  }

  return issue
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

export function repairJson(input: string, indent: IndentOption): JsonResult & { repaired?: boolean } {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: '请输入 JSON 内容' }
  }

  const existing = parseJson(input)
  if (existing.ok) {
    const formatted = JSON.stringify(existing.data, null, indentString(indent))
    return { ok: true, data: existing.data, formatted, repaired: false }
  }

  try {
    const repaired = jsonrepair(trimmed)
    const data = JSON.parse(repaired)
    const formatted = JSON.stringify(data, null, indentString(indent))
    return { ok: true, data, formatted, repaired: true }
  } catch (error) {
    if (error instanceof JSONRepairError) {
      const { line, column } = positionToLineColumn(input, error.position)
      return {
        ok: false,
        error: '无法自动修复此处语法，请手动修改',
        line,
        column,
        position: error.position,
      }
    }
    const raw = error instanceof Error ? error.message : '修复失败'
    return { ok: false, error: humanizeJsonError(raw) }
  }
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
    const raw = error instanceof Error ? error.message : '反转义失败'
    const friendly = humanizeJsonError(raw)
    const position = getErrorPosition(raw)
    if (position !== undefined) {
      const { line, column } = positionToLineColumn(input, position)
      return { ok: false, error: friendly, line, column, position }
    }
    return { ok: false, error: friendly }
  }
}
