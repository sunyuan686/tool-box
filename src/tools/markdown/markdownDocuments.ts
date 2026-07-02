export type MarkdownDocument = {
  id: string
  name: string
  content: string
}

export function createDocument(partial?: Partial<MarkdownDocument>): MarkdownDocument {
  return {
    id: crypto.randomUUID(),
    name: partial?.name ?? '未命名',
    content: partial?.content ?? '',
  }
}

export function nameFromFilename(filename: string): string {
  return filename.replace(/\.(md|markdown)$/i, '') || filename
}

export function downloadFilename(name: string): string {
  const trimmed = name.trim() || 'document'
  const safe = trimmed.replace(/[^\w\u4e00-\u9fff.-]+/g, '_')
  return safe.endsWith('.md') ? safe : `${safe}.md`
}

export function updateDocument(
  documents: MarkdownDocument[],
  id: string,
  patch: Partial<Pick<MarkdownDocument, 'name' | 'content'>>,
): MarkdownDocument[] {
  return documents.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc))
}
