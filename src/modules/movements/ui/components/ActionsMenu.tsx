import { useEffect, useRef } from 'react'

export interface MenuAction {
  readonly label: string
  readonly onSelect: () => void
  readonly disabled?: boolean
}

interface ActionsMenuProps {
  readonly actions: readonly MenuAction[]
}

export const ActionsMenu = ({ actions }: ActionsMenuProps) => {
  const menuRef = useRef<HTMLDetailsElement>(null)

  const close = () => menuRef.current?.removeAttribute('open')

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) close()
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <details className="menu" ref={menuRef}>
      <summary className="menu__trigger" aria-label="Más acciones">
        ⋯
      </summary>

      <div className="menu__panel">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="menu__item"
            disabled={action.disabled}
            onClick={() => {
              close()
              action.onSelect()
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </details>
  )
}
