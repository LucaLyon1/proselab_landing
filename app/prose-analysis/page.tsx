'use client'

import Link from 'next/link'
import { useState, useCallback } from 'react'

declare global {
  interface Window {
    datafast?: { track: (event: string, props?: Record<string, unknown>) => void }
    umami?: { track: (event: string, props?: Record<string, unknown>) => void }
  }
}

const PROMPTS = [
  'Write about the last dinner you had at a restaurant — the light, the noise, the feeling of sitting across from someone.',
  'Write about a relationship that changed you. Not what happened, but what it left behind.',
  'Write about the last time you were alone and noticed it. Where were you? What did the silence sound like?',
]

export default function ProseAnalysisPage() {
  const [promptIndex, setPromptIndex] = useState(0)
  const [userText, setUserText] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const cyclePrompt = useCallback(() => {
    setPromptIndex((i) => (i + 1) % PROMPTS.length)
  }, [])

  const handleAnalyze = () => {
    if (!userText.trim()) return
    window.datafast?.track('prose_analysis_click', { text_length: userText.trim().length })
    window.umami?.track('prose_analysis_click', { text_length: userText.trim().length })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/prose-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, text: userText, prompt: PROMPTS[promptIndex] }),
      })
      const json = await res.json()

      if (json.error) {
        setStatus('error')
      } else {
        window.datafast?.track('prose_analysis_submit', { email_provided: true })
        window.umami?.track('prose_analysis_submit', { email_provided: true })
        setStatus('success')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="pa-root">
      <div className="pa-container">
        <div className="pa-header">
          <p className="pa-eyebrow">Prose Analysis</p>
          <h1 className="pa-title">
            Who Do You
            <br />
            <em>Write</em> Like?
          </h1>
          <p className="pa-subtitle">
            Write a short passage below and we&apos;ll tell you which author your prose most resembles.
          </p>
        </div>

        <div className="pa-prompt-box">
          <div className="pa-prompt-top">
            <span className="pa-prompt-label">Prompt</span>
            <button className="pa-prompt-refresh" onClick={cyclePrompt} aria-label="New prompt">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 2v5h5" />
                <path d="M14.5 14v-5h-5" />
                <path d="M13.5 5.5A6 6 0 0 0 3 3.5L1.5 7" />
                <path d="M2.5 10.5A6 6 0 0 0 13 12.5l1.5-3.5" />
              </svg>
              New prompt
            </button>
          </div>
          <p className="pa-prompt-text" key={promptIndex}>{PROMPTS[promptIndex]}</p>
        </div>

        <textarea
          className="pa-textarea"
          placeholder="Start writing here..."
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          rows={5}
        />

        <div className="pa-char-row">
          <span className="pa-char-count">{userText.length} characters</span>
          {userText.length > 0 && userText.length < 100 && (
            <span className="pa-char-hint">Write a little more for a better analysis</span>
          )}
        </div>

        <button
          className={`pa-btn-analyze${userText.trim().length >= 100 ? '' : ' pa-btn-analyze-disabled'}`}
          onClick={handleAnalyze}
        >
          Analyze my writing
        </button>

        <p className="pa-footer-note">
          Free. No account required. We&apos;ll email your results.
        </p>
      </div>

      {/* Footer */}
      <footer className="pa-footer">
        <div className="pa-footer-top">
          <Link href="/" className="pa-footer-logo">Proselab</Link>
          <span className="pa-footer-tagline">Train Your Voice. Every Day.</span>
        </div>
        <div className="pa-footer-links">
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/contact">Contact</Link>
          <a href="mailto:contact@proselab.io">Email ↗</a>
          <a href="https://x.com/proselab_io" target="_blank" rel="noopener noreferrer">X ↗</a>
          <a href="https://proselab.substack.com" target="_blank" rel="noopener noreferrer">Substack ↗</a>
        </div>
      </footer>

      {/* Email Modal */}
      {modalOpen && (
        <div className="exit-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="exit-modal-close" onClick={() => setModalOpen(false)} aria-label="Close">
              ✕ close
            </button>

            {status === 'success' ? (
              <div className="exit-modal-success">
                <p className="exit-modal-eyebrow">Sent</p>
                <h2 className="exit-modal-title">Check your inbox.</h2>
                <p className="exit-modal-sub">
                  We&apos;re analyzing your writing now. Your prose analysis will arrive at{' '}
                  <strong>{email}</strong> shortly.
                </p>
              </div>
            ) : (
              <>
                <p className="exit-modal-eyebrow">Almost there</p>
                <h2 className="exit-modal-title">
                  Where should we
                  <br />
                  send your <em>results</em>?
                </h2>
                <p className="exit-modal-sub">
                  We&apos;ll analyze your writing against 20 renowned authors and email you a
                  breakdown of who you write like — and why.
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
                    {status === 'loading' ? 'Sending...' : 'Send my analysis →'}
                  </button>
                </form>
                {status === 'error' && (
                  <p className="exit-modal-error">Something went wrong. Please try again.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
