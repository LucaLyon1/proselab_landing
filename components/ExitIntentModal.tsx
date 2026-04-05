'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    datafast?: (event: string, props?: Record<string, unknown>) => void
    umami?: { track: (event: string, props?: Record<string, unknown>) => void }
    Supascribe?: {
      trackSubmit: (...args: unknown[]) => void
      _dfPatched?: boolean
    }
  }
}

interface ExitIntentModalProps {
  open: boolean
  onClose: () => void
}

const EMBED_ID = '927249536913'

export function ExitIntentModal({ open, onClose }: ExitIntentModalProps) {
  const embedRef = useRef<HTMLDivElement>(null)

  // Re-initialize Supascribe for dynamically rendered embed divs
  useEffect(() => {
    if (!open || !embedRef.current) return

    const el = embedRef.current
    const script = document.createElement('script')
    script.src = 'https://js.supascribe.com/v1/loader/7QcbcihIztbMpucNNbdjdhfkMQT2.js'
    script.async = true
    el.appendChild(script)

    return () => {
      if (el.contains(script)) {
        el.removeChild(script)
      }
    }
  }, [open])

  // Patch Supascribe.trackSubmit to fire DataFast/Umami events on successful signup
  useEffect(() => {
    const patch = () => {
      const S = window.Supascribe
      if (!S?.trackSubmit || S._dfPatched) return false

      const original = S.trackSubmit
      S.trackSubmit = (...args: unknown[]) => {
        original.apply(S, args)
        if (String(args[0]) === EMBED_ID) {
          window.datafast?.('waitlist_signup', { source: 'homepage' })
          window.umami?.track('waitlist_signup', { source: 'homepage' })
        }
      }
      S._dfPatched = true
      return true
    }

    if (!patch()) {
      const interval = setInterval(() => {
        if (patch()) clearInterval(interval)
      }, 200)
      return () => clearInterval(interval)
    }
  }, [])

  if (!open) return null

  return (
    <div className="exit-modal-backdrop" onClick={onClose}>
      <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="exit-modal-close" onClick={onClose} aria-label="Close">
          ✕ close
        </button>

        <p className="exit-modal-eyebrow">Coming soon</p>
        <h2 className="exit-modal-title">
          Join the
          <br />
          <em>waitlist</em>
        </h2>
        <p className="exit-modal-sub">
          We&apos;re letting people in one by one. Join the waitlist and we&apos;ll reach out when it&apos;s your turn.
        </p>

        <div ref={embedRef}>
          <div data-supascribe-embed-id={EMBED_ID} data-supascribe-subscribe></div>
        </div>
      </div>
    </div>
  )
}
