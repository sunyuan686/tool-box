type WorkModeSwitchProps = {
  mode: 'edit' | 'compare'
  onChange: (mode: 'edit' | 'compare') => void
}

export function WorkModeSwitch({ mode, onChange }: WorkModeSwitchProps) {
  return (
    <div className="work-mode-switch" role="group" aria-label="工作模式">
      <button
        type="button"
        aria-pressed={mode === 'edit'}
        className={mode === 'edit' ? 'active' : ''}
        onClick={() => onChange('edit')}
      >
        编辑
      </button>
      <button
        type="button"
        aria-pressed={mode === 'compare'}
        className={mode === 'compare' ? 'active' : ''}
        onClick={() => onChange('compare')}
      >
        对比
      </button>
    </div>
  )
}
