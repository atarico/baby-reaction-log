import { useEffect } from 'react'

interface ToastProps {
  readonly message: string
  readonly actionLabel?: string
  readonly onAction?: () => void
  readonly onDismiss: () => void
  readonly tone?: 'confirm' | 'alert'
  readonly autoDismissMs?: number
}

export const Toast = ({
  message,
  actionLabel,
  onAction,
  onDismiss,
  tone = 'confirm',
  autoDismissMs = 6000,
}: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoDismissMs)

    return () => clearTimeout(timer)
  }, [onDismiss, autoDismissMs, message])

  return (
    <output className={`toast toast--${tone}`}>
      <span className="toast__message">{message}</span>
      {actionLabel && onAction ? (
        <button type="button" className="toast__action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </output>
  )
}
