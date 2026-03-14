'use client'

import { useState } from 'react'

declare global {
  interface Window {
    datafast?: { track: (event: string, props?: Record<string, unknown>) => void }
    umami?: { track: (event: string, props?: Record<string, unknown>) => void }
  }
}

interface ExitIntentModalProps {
  open: boolean
  onClose: () => void
}

export function ExitIntentModal({ open, onClose }: ExitIntentModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const json = await res.json()

    if (json.error) {
      setStatus('error')
    } else {
      window.datafast?.track('waitlist_signup', { source: 'homepage' })
      window.umami?.track('waitlist_signup', { source: 'homepage' })
      setStatus('success')
    }
  }

  if (!open) return null

  return (
    <div className="exit-modal-backdrop" onClick={onClose}>
      <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="exit-modal-close" onClick={onClose} aria-label="Close">
          ✕ close
        </button>

        {status === 'success' ? (
          <div className="exit-modal-success">
            <p className="exit-modal-eyebrow">You&apos;re in</p>
            <h2 className="exit-modal-title">We&apos;ll keep you posted.</h2>
            <p className="exit-modal-sub">
              We&apos;ve added {email} to the list. You&apos;ll be the first to know when we open the doors.
            </p>
          </div>
        ) : (
          <>
            <p className="exit-modal-eyebrow">Coming soon</p>
            <h2 className="exit-modal-title">
              Join the
              <br />
              <em>waitlist</em>
            </h2>
            <p className="exit-modal-sub">
              We&apos;re letting people in one by one. Join the waitlist and we&apos;ll reach out when it&apos;s your turn.
            </p>
            <form className="exit-modal-form" onSubmit={handleSubmit}>
              <input
                id="waitlist-email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="exit-modal-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="exit-modal-submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Joining...' : 'Join waitlist →'}
              </button>
            </form>
            <p className="exit-modal-consent">By submitting, you agree to receive emails from ProseLab. Unsubscribe anytime.</p>
            {status === 'error' && (
              <p className="exit-modal-error">Something went wrong. Please try again.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
