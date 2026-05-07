'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

declare global {
  interface Window {
    datafast?: (event: string, props?: Record<string, unknown>) => void
    umami?: { track: (event: string, props?: Record<string, unknown>) => void }
  }
}

interface ExitIntentModalProps {
  open: boolean
  onClose: () => void
  /** Override copy. Defaults match the homepage exit-intent flow. */
  eyebrow?: string
  title?: React.ReactNode
  sub?: React.ReactNode
  /** "default" = solid backdrop. "blur" = blurred page-behind look. */
  variant?: 'default' | 'dim'
  /** Tag waitlist signup events. Defaults to "homepage". */
  source?: string
  /** Hide the close button (e.g. when dismissal isn't desired). */
  dismissible?: boolean
}

const LOOPS_FORM_ENDPOINT =
  'https://app.loops.so/api/newsletter-form/cmnx3ea9a0afl0iz5xwexankm'

const DEFAULT_TITLE = (
  <>
    Join the
    <br />
    <em>waitlist</em>
  </>
)

export function ExitIntentModal({
  open,
  onClose,
  eyebrow = 'Coming soon',
  title = DEFAULT_TITLE,
  sub = "We're letting people in one by one. Join the waitlist and we'll reach out when it's your turn.",
  variant = 'default',
  source = 'homepage',
  dismissible = true,
}: ExitIntentModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1/min client-side rate limit — mirrors Loops' own snippet
    const now = Date.now()
    const previous = Number(localStorage.getItem('loops-form-timestamp') || 0)
    if (previous && previous + 60_000 > now) {
      setErrorMessage('Too many signups, please try again in a little while.')
      setStatus('error')
      return
    }
    localStorage.setItem('loops-form-timestamp', String(now))

    setStatus('loading')
    setErrorMessage('')

    try {
      const body = `userGroup=Waitlist&mailingLists=&email=${encodeURIComponent(email)}`
      const res = await fetch(LOOPS_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMessage(data?.message || res.statusText || 'Something went wrong.')
        setStatus('error')
        localStorage.setItem('loops-form-timestamp', '')
        return
      }

      window.datafast?.('waitlist_signup', { source })
      window.umami?.track('waitlist_signup', { source })
      setStatus('success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setErrorMessage(message)
      setStatus('error')
      localStorage.setItem('loops-form-timestamp', '')
    }
  }

  // Track client mount so we only portal once `document` exists.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock page scroll while the modal is open.
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

        {status === 'success' ? (
          <div className="exit-modal-success">
            <p className="exit-modal-eyebrow">Almost there</p>
            <h2 className="exit-modal-title">Check your inbox.</h2>
            <p className="exit-modal-sub">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click it to finish joining the waitlist.
            </p>
          </div>
        ) : (
          <>
            <p className="exit-modal-eyebrow">{eyebrow}</p>
            <h2 className="exit-modal-title">{title}</h2>
            <p className="exit-modal-sub">{sub}</p>

            <form className="exit-modal-form" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="exit-modal-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                className="exit-modal-submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Joining…' : 'Join waitlist →'}
              </button>
              {status === 'error' && (
                <p className="exit-modal-error">{errorMessage}</p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
