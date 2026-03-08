'use client'

import { useState } from 'react'

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

    const res = await fetch('/api/discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const json = await res.json()

    if (json.error) {
      setStatus('error')
    } else {
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
            <p className="exit-modal-eyebrow">Doors are closed</p>
            <h2 className="exit-modal-title">
              We&apos;re getting
              <br />
              <em>ready</em>
            </h2>
            <p className="exit-modal-sub">
              Proselab is closed while we prepare for launch. Sign up to get notified when we open the doors, plus early updates and news.
            </p>
            <form className="exit-modal-form" onSubmit={handleSubmit}>
              <input
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
                {status === 'loading' ? 'Subscribing...' : 'Subscribe →'}
              </button>
            </form>
            {status === 'error' && (
              <p className="exit-modal-error">Something went wrong. Please try again.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
