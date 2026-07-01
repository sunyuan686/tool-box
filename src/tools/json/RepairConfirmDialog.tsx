import { useEffect } from 'react'
import { SideBySideDiffView } from './SideBySideDiffView'

export type RepairPreview = {
  original: string
  repaired: string
  message: string
}

type RepairConfirmDialogProps = {
  preview: RepairPreview
  onConfirm: () => void
  onCancel: () => void
}

export function RepairConfirmDialog({ preview, onConfirm, onCancel }: RepairConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div className="repair-dialog-backdrop" onClick={onCancel}>
      <div
        className="repair-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="repair-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="repair-dialog-head">
          <div>
            <h2 id="repair-dialog-title">确认应用纠正</h2>
            <p>{preview.message}</p>
          </div>
          <button type="button" className="btn" onClick={onCancel} aria-label="关闭">
            关闭
          </button>
        </div>

        <SideBySideDiffView
          leftLabel="修改前"
          rightLabel="修改后"
          leftText={preview.original}
          rightText={preview.repaired}
          ariaLabel="纠正前后差异"
        />

        <div className="repair-dialog-actions">
          <button type="button" className="btn" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="btn primary" onClick={onConfirm}>
            应用修改
          </button>
        </div>
      </div>
    </div>
  )
}
