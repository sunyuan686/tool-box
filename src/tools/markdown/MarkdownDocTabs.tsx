import type { MarkdownDocument } from './markdownDocuments'

type MarkdownDocTabsProps = {
  documents: MarkdownDocument[]
  activeId: string
  onSelect: (id: string) => void
  onNameChange: (id: string, name: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

export function MarkdownDocTabs({
  documents,
  activeId,
  onSelect,
  onNameChange,
  onAdd,
  onRemove,
}: MarkdownDocTabsProps) {
  return (
    <div className="json-doc-tabs" role="tablist" aria-label="Markdown 文档列表">
      {documents.map((doc) => {
        const isActive = doc.id === activeId

        return (
          <div
            key={doc.id}
            role="tab"
            aria-selected={isActive}
            className={`json-doc-tab${isActive ? ' active' : ''}`}
          >
            <button
              type="button"
              className="json-doc-tab-select"
              onClick={() => onSelect(doc.id)}
              title={doc.name}
            >
              <span className="json-doc-status valid" aria-hidden="true" />
            </button>
            <input
              type="text"
              className="json-doc-name"
              value={doc.name}
              onChange={(event) => onNameChange(doc.id, event.target.value)}
              onFocus={() => onSelect(doc.id)}
              placeholder="备注名称"
              aria-label={`文档备注：${doc.name}`}
            />
            {documents.length > 1 ? (
              <button
                type="button"
                className="json-doc-close"
                onClick={() => onRemove(doc.id)}
                aria-label={`关闭 ${doc.name}`}
              >
                ×
              </button>
            ) : null}
          </div>
        )
      })}
      <button type="button" className="json-doc-add btn ghost" onClick={onAdd}>
        + 新建
      </button>
    </div>
  )
}
