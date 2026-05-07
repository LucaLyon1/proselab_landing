# Resend Waitlist Implementation (removed 2026-04-05)

Replaced by Supascribe inline embed (`data-supascribe-embed-id="927249536913"`). This file documents the original Resend-based flow so it can be restored quickly.

## Overview

The waitlist used a custom email form in `ExitIntentModal.tsx` that POSTed to `/api/waitlist`, which used the Resend SDK to:
1. Add the contact to a Resend audience segment
2. Send a welcome email to the subscriber
3. Send an admin notification to contact@proselab.io

Environment variables required: `RESEND_API_KEY`, `RESEND_SEGMENT_ID`

## Original ExitIntentModal.tsx

```tsx
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
      window.datafast?.('waitlist_signup', { source: 'homepage' })
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
```

## API Route: app/api/waitlist/route.ts

This route still exists in the codebase (used by the prose-analysis flow too). It handles:
- Creating a Resend contact with segment assignment
- Sending a welcome email via `emailLayout()`
- Sending an admin notification

The `resend` npm package is still installed. The `RESEND_API_KEY` and `RESEND_SEGMENT_ID` env vars must be set on the deployment platform for this route to work.

## What changed

- `ExitIntentModal.tsx` was rewritten to render a Supascribe inline subscribe embed instead of the custom form
- The Supascribe loader script (`7QcbcihIztbMpucNNbdjdhfkMQT2.js`) was already loaded globally in `app/layout.tsx`
- The `/api/waitlist` route and `resend` package were left in place (still used by prose-analysis)
