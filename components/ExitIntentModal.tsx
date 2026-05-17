'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { trackCTA } from '@/lib/analytics'

interface ExitIntentModalProps {
  open: boolean
  onClose: () => void
  /** Override copy. Defaults nudge people toward /prose-analysis. */
  eyebrow?: string | null
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
    <em>
      who do you
      <br />
      write like?
    </em>
  </>
)

export function ExitIntentModal({
  open,
  onClose,
  eyebrow = null,
  title = DEFAULT_TITLE,
  sub = "Enter some writing of yours and we'll match you to your classic author twin in the ProseLab library, with reasons. Free, and no signup required…",
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

        {eyebrow && <p className="exit-modal-eyebrow">{eyebrow}</p>}
        <h2 className="exit-modal-title">{title}</h2>
        <p className="exit-modal-sub">{sub}</p>

        <div className="exit-modal-form">
          <Link
            href="/prose-analysis"
            className="exit-modal-submit"
            onClick={() => trackCTA('exit-modal', 'prose-analysis', { source })}
          >
            TRY NOW
          </Link>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
