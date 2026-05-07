'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { ExitIntentModal } from '@/components/ExitIntentModal'

declare global {
  interface Window {
    datafast?: (event: string, props?: Record<string, unknown>) => void
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

  const cyclePrompt = useCallback(() => {
    setPromptIndex((i) => (i + 1) % PROMPTS.length)
  }, [])

  // Auto-open the waitlist overlay on mount — analysis is offline right now.
  useEffect(() => {
    setModalOpen(true)
  }, [])

  const handleAnalyze = () => {
    if (!userText.trim()) return
    window.datafast?.('prose_analysis_click', { text_length: userText.trim().length })
    window.umami?.track('prose_analysis_click', { text_length: userText.trim().length })
    setModalOpen(true)
  }

  return (
    <div className="pa-root">
      <div className="pa-container">
        <div className="pa-header">
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
          id="writing-sample"
          name="writing-sample"
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
        <p className="pa-footer-brought">Brought to you by <Link href="/" className="pa-footer-brought-link">ProseLab</Link></p>
      </footer>

      <ExitIntentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        variant="dim"
        source="prose_analysis"
        dismissible={false}
        eyebrow="Heads up"
        title={
          <>
            Analysis is
            <br />
            <em>offline</em> right now
          </>
        }
        sub="We're rebuilding the analyzer. Drop your email — we'll let you know the moment it's back, and lock in your spot on the waitlist for full ProseLab access."
      />
    </div>
  )
}
