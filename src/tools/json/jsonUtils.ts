import { jsonrepair, JSONRepairError } from 'jsonrepair'

export type IndentOption = 2 | 4 | 'tab'

export type JsonResult =
  | { ok: true; data: unknown; formatted: string }
  | { ok: false; error: string; line?: number; column?: number; position?: number }

function indentString(option: IndentOption): string | number {
  return option === 'tab' ? '\t' : option
}

function leadingTrimOffset(input: string): number {
  const match = input.match(/^\s*/)
  return match ? match[0].length : 0
}

function getErrorPosition(message: string): number | undefined {
  const match = message.match(/position\s+(\d+)/i)
  return match ? Number(match[1]) : undefined
}

function getErrorLineColumn(message: string): { line: number; column: number } | undefined {
  const match = message.match(/line\s+(\d+)\s+column\s+(\d+)/i)
  if (!match) return undefined
  return { line: Number(match[1]), column: Number(match[2]) }
}

function absoluteErrorLocation(
  input: string,
  trimmed: string,
  leading: number,
  rawMessage: string,
): { line: number; column: number; position: number } | undefined {
  const positionInTrimmed = getErrorPosition(rawMessage)
  if (positionInTrimmed !== undefined) {
    const position = leading + positionInTrimmed
    const { line, column } = positionToLineColumn(input, position)
    return { line, column, position }
  }

  const lineColumn = getErrorLineColumn(rawMessage)
  if (lineColumn) {
    const position = leading + lineColumnToOffset(trimmed, lineColumn.line, lineColumn.column)
    const { line, column } = positionToLineColumn(input, position)
    return { line, column, position }
  }

  return undefined
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

  const leading = leadingTrimOffset(input)

  try {
    const data = JSON.parse(trimmed)
    return { ok: true, data, formatted: trimmed }
  } catch (error) {
    const raw = error instanceof Error ? error.message : 'JSON 解析失败'
    const friendly = humanizeJsonError(raw)
    const location = absoluteErrorLocation(input, trimmed, leading, raw)
    if (location) {
      return {
        ok: false,
        error: friendly,
        line: location.line,
        column: location.column,
        position: location.position,
      }
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

function repeatIndent(option: IndentOption, depth: number): string {
  const unit = option === 'tab' ? '\t' : ' '.repeat(option)
  return unit.repeat(Math.max(depth, 0))
}

/** Pretty-print JSON-like text without requiring valid syntax. */
export function prettyPrintJsonStructure(input: string, indent: IndentOption): string {
  let result = ''
  let depth = 0
  let inString = false
  let escaped = false

  const appendNewlineIndent = () => {
    result += '\n' + repeatIndent(indent, depth)
  }

  const trimTrailingWhitespace = () => {
    result = result.replace(/[ \t]+$/, '')
  }

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]

    if (inString) {
      result += ch
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
      result += ch
      continue
    }

    if (ch === '{' || ch === '[') {
      result += ch
      depth++
      let j = i + 1
      while (j < input.length && /\s/.test(input[j])) j++
      const next = input[j]
      if (next !== '}' && next !== ']') {
        appendNewlineIndent()
      }
      continue
    }

    if (ch === '}' || ch === ']') {
      depth = Math.max(0, depth - 1)
      trimTrailingWhitespace()
      appendNewlineIndent()
      result += ch
      continue
    }

    if (ch === ',') {
      result += ch
      appendNewlineIndent()
      let j = i + 1
      while (j < input.length && /\s/.test(input[j])) {
        j++
      }
      i = j - 1
      continue
    }

    if (ch === ':') {
      result += ': '
      let j = i + 1
      while (j < input.length && /\s/.test(input[j])) {
        j++
      }
      i = j - 1
      continue
    }

    if (/\s/.test(ch)) {
      if (result.at(-1) && !/\s/.test(result.at(-1)!)) {
        const next = input.slice(i + 1).match(/\S/)?.[0]
        if (next && next !== '}' && next !== ']' && next !== ',') {
          result += ' '
        }
      }
      continue
    }

    result += ch
  }

  return result.trimEnd()
}

export type BestEffortFormatResult = {
  formatted: string
  fullyValid: boolean
  autoRepaired: boolean
}

/** Format as much as possible: strict parse, auto-repair, then structural pretty-print. */
export function formatJsonBestEffort(input: string, indent: IndentOption): BestEffortFormatResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { formatted: input, fullyValid: false, autoRepaired: false }
  }

  const strict = formatJson(input, indent)
  if (strict.ok) {
    return { formatted: strict.formatted, fullyValid: true, autoRepaired: false }
  }

  const repaired = repairJson(input, indent)
  if (repaired.ok) {
    return { formatted: repaired.formatted, fullyValid: true, autoRepaired: repaired.repaired === true }
  }

  return {
    formatted: prettyPrintJsonStructure(input, indent),
    fullyValid: false,
    autoRepaired: false,
  }
}

export function errorHighlightRange(
  text: string,
  position: number,
): { from: number; to: number } {
  const from = Math.min(Math.max(position, 0), text.length)
  let to = Math.min(from + 1, text.length)
  const token = /[^\s,:[\]{}"]/

  while (to < text.length && token.test(text[to])) to++
  if (to === from + 1 && from > 0 && token.test(text[from - 1])) {
    let start = from - 1
    while (start > 0 && token.test(text[start - 1])) start--
    return { from: start, to: Math.max(to, from + 1) }
  }

  return { from, to: Math.max(to, from + 1) }
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
    const trimmed = input.trim()
    const leading = leadingTrimOffset(input)
    const location = absoluteErrorLocation(input, trimmed, leading, raw)
    if (location) {
      return {
        ok: false,
        error: friendly,
        line: location.line,
        column: location.column,
        position: location.position,
      }
    }
    return { ok: false, error: friendly }
  }
}
