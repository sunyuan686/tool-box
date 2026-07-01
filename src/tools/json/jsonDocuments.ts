export type JsonDocument = {
  id: string
  name: string
  content: string
  output: string
}

export function createDocument(partial?: Partial<JsonDocument>): JsonDocument {
  return {
    id: crypto.randomUUID(),
    name: partial?.name ?? '未命名',
    content: partial?.content ?? '',
    output: partial?.output ?? '',
  }
}

export function nameFromFilename(filename: string): string {
  return filename.replace(/\.json$/i, '') || filename
}

export function downloadFilename(name: string): string {
  const trimmed = name.trim() || 'data'
  const safe = trimmed.replace(/[^\w\u4e00-\u9fff.-]+/g, '_')
  return safe.endsWith('.json') ? safe : `${safe}.json`
}

export function updateDocument(
  documents: JsonDocument[],
  id: string,
  patch: Partial<Pick<JsonDocument, 'name' | 'content' | 'output'>>,
): JsonDocument[] {
  return documents.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc))
}
