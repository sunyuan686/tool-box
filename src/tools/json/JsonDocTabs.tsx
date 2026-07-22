import { EditableTabName } from '../../components/EditableTabName'
import { parseJson } from './jsonUtils'
import type { JsonDocument } from './jsonDocuments'

type JsonDocTabsProps = {
  documents: JsonDocument[]
  activeId: string
  workMode: 'edit' | 'compare'
  compareConfig?: { leftDocId: string; rightDocId: string }
  onSelect: (id: string) => void
  onNameChange: (id: string, name: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

export function JsonDocTabs({
  documents,
  activeId,
  workMode,
  compareConfig,
  onSelect,
  onNameChange,
  onAdd,
  onRemove,
}: JsonDocTabsProps) {
  return (
    <div className="json-doc-tabs" role="tablist" aria-label="JSON 文档列表">
      {documents.map((doc) => {
        const isActive = workMode === 'edit' && doc.id === activeId
        const isLeft = workMode === 'compare' && compareConfig?.leftDocId === doc.id
        const isRight = workMode === 'compare' && compareConfig?.rightDocId === doc.id
        const isValid = !doc.content.trim() || parseJson(doc.content).ok

        return (
          <div
            key={doc.id}
            role="tab"
            aria-selected={isActive}
            className={`json-doc-tab${isActive ? ' active' : ''}${isLeft ? ' compare-left' : ''}${isRight ? ' compare-right' : ''}`}
          >
            <button
              type="button"
              className="json-doc-tab-select"
              onClick={() => onSelect(doc.id)}
              title={doc.name}
            >
              <span
                className={`json-doc-status${isValid ? ' valid' : ' invalid'}`}
                aria-hidden="true"
              />
            </button>
            {workMode === 'compare' && (isLeft || isRight) ? (
              <span className="json-doc-compare-badges" aria-hidden="true">
                {isLeft ? <span className="compare-badge left">A</span> : null}
                {isRight ? <span className="compare-badge right">B</span> : null}
              </span>
            ) : null}
            <EditableTabName
              name={doc.name}
              readOnly={workMode === 'compare'}
              onSelect={() => onSelect(doc.id)}
              onNameChange={(name) => onNameChange(doc.id, name)}
            />
            {documents.length > 1 && workMode === 'edit' ? (
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
      {workMode === 'edit' ? (
        <button type="button" className="json-doc-add btn ghost" onClick={onAdd}>
          + 新建
        </button>
      ) : null}
    </div>
  )
}
