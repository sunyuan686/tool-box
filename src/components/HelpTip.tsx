import { useEffect, useId, useRef, useState } from 'react'

type HelpTipProps = {
  label: string
  children: string
}

export function HelpTip({ label, children }: HelpTipProps) {
  const tipId = useId()
  const rootRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <span
      ref={rootRef}
      className={`help-tip${open ? ' is-open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="help-tip-trigger"
        aria-label={label}
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        ?
      </button>
      {open ? (
        <span id={tipId} role="tooltip" className="help-tip-panel">
          {children}
        </span>
      ) : null}
    </span>
  )
}
