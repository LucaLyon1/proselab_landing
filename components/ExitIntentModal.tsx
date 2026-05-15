'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { trackCTA } from '@/lib/analytics'

interface ExitIntentModalProps {
  open: boolean
  onClose: () => void
  /** Override copy. Defaults nudge people toward the demo. */
  eyebrow?: string
  title?: React.ReactNode
  sub?: React.ReactNode
  /** "default" = solid backdrop. "dim" = dimmer page-behind look. */
  variant?: 'default' | 'dim'
  /** Tag the exit-intent CTA event. Defaults to "homepage". */
  source?: string
  /** Hide the close button (e.g. when dismissal isn't desired). */
  dismissible?: boolean
}

const DEFAULT_TITLE = (
  <>
    Before you go —
    <br />
    <em>try the demo</em>
  </>
)

export function ExitIntentModal({
  open,
  onClose,
  eyebrow = 'See it in action',
  title = DEFAULT_TITLE,
  sub = "Study a passage, write your own version, and get instant AI feedback. No signup needed.",
  variant = 'default',
  source = 'homepage',
  dismissible = true,
}: ExitIntentModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open || !mounted) return null

  const backdropClass =
    variant === 'dim'
      ? 'exit-modal-backdrop exit-modal-backdrop-dim'
      : 'exit-modal-backdrop'

  const overlay = (
    <div className={backdropClass} onClick={dismissible ? onClose : undefined}>
      <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
        {dismissible && (
          <button className="exit-modal-close" onClick={onClose} aria-label="Close">
            ✕ close
          </button>
        )}

        <p className="exit-modal-eyebrow">{eyebrow}</p>
        <h2 className="exit-modal-title">{title}</h2>
        <p className="exit-modal-sub">{sub}</p>

        <div className="exit-modal-form">
          <Link
            href="/demo"
            className="exit-modal-submit"
            onClick={() => trackCTA('exit-modal', 'demo', { source })}
          >
            Try the demo
          </Link>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
