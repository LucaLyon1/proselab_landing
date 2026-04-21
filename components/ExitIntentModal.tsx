'use client'

import { useState } from 'react'

declare global {
  interface Window {
    datafast?: (event: string, props?: Record<string, unknown>) => void
    umami?: { track: (event: string, props?: Record<string, unknown>) => void }
  }
}

interface ExitIntentModalProps {
  open: boolean
  onClose: () => void
}

const LOOPS_FORM_ENDPOINT =
  'https://app.loops.so/api/newsletter-form/cmnx3ea9a0afl0iz5xwexankm'

export function ExitIntentModal({ open, onClose }: ExitIntentModalProps) {
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

      window.datafast?.('waitlist_signup', { source: 'homepage' })
      window.umami?.track('waitlist_signup', { source: 'homepage' })
      setStatus('success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setErrorMessage(message)
      setStatus('error')
      localStorage.setItem('loops-form-timestamp', '')
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
            <p className="exit-modal-eyebrow">Almost there</p>
            <h2 className="exit-modal-title">Check your inbox.</h2>
            <p className="exit-modal-sub">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click it to finish joining the waitlist.
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
}
