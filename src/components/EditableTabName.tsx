import { useEffect, useRef, useState } from 'react'

type EditableTabNameProps = {
  name: string
  readOnly?: boolean
  onSelect: () => void
  onNameChange: (name: string) => void
}

export function EditableTabName({
  name,
  readOnly = false,
  onSelect,
  onNameChange,
}: EditableTabNameProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)
  const nameAtEditStart = useRef(name)
  const editingRef = useRef(false)

  useEffect(() => {
    if (!editing) setDraft(name)
  }, [name, editing])

  useEffect(() => {
    if (!editing) return
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.select()
  }, [editing])

  const startEditing = () => {
    if (readOnly || editingRef.current) return
    nameAtEditStart.current = name
    setDraft(name)
    editingRef.current = true
    setEditing(true)
    onSelect()
  }

  const commit = () => {
    if (!editingRef.current) return
    editingRef.current = false
    const next = draft.trim()
    const fallback = nameAtEditStart.current
    const finalName = next || fallback
    if (finalName !== name) onNameChange(finalName)
    setDraft(finalName)
    setEditing(false)
  }

  const cancel = () => {
    if (!editingRef.current) return
    editingRef.current = false
    setDraft(nameAtEditStart.current)
    setEditing(false)
  }

  if (editing && !readOnly) {
    return (
      <input
        ref={inputRef}
        type="text"
        className="json-doc-name is-editing"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit()
          } else if (event.key === 'Escape') {
            event.preventDefault()
            cancel()
          }
        }}
        onClick={(event) => event.stopPropagation()}
        placeholder="备注名称"
        aria-label={`文档备注：${name}`}
      />
    )
  }

  const displayName = name.trim()
  return (
    <span
      className={`json-doc-name${displayName ? '' : ' is-placeholder'}${readOnly ? ' is-readonly' : ''}`}
      onClick={() => onSelect()}
      onDoubleClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        startEditing()
      }}
      title={readOnly ? displayName || undefined : displayName || '双击重命名'}
      role="presentation"
    >
      {displayName || '备注名称'}
    </span>
  )
}
