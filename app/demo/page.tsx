'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ExitIntentModal } from '@/components/ExitIntentModal'

declare global {
  interface Window {
    datafast?: (event: string, props?: Record<string, unknown>) => void
    umami?: { track: (event: string, props?: Record<string, unknown>) => void }
  }
}

const CONSTRAINT_PROMPT =
  "Rewrite this passage so that the character's loneliness is conveyed entirely through concrete, physical detail — what the body does, what the senses register, what the world looks like. Remove every abstraction: no 'sense,' no 'feeling,' no naming of emotions. Let the reader feel the isolation only through tangible things."

const CRAFT_NOTES = {
  voice:
    "Woolf's interior voice: \"perpetual\" suggests something ongoing, inescapable — not a passing mood but a state of being. The word choice bleeds personality.",
  imagery:
    'Concrete anchor: the taxi cabs ground the abstract feeling. We see what she sees. The mundane detail makes the loneliness tangible.',
  structure:
    'Repetition creates rhythm: "out, out, far out" — each word pushes further. The syntax mirrors the feeling of distance, of being cast away.',
  pacing:
    '"Alone." A single word. The sentence stops. The pause lets the weight of isolation land before the next thought.',
} as const

function CraftTooltip({ note, children }: { note: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLSpanElement>(null)

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={() => {
          setShow(true)
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            setPos({ x: rect.left + rect.width / 2, y: rect.top })
          }
        }}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </span>
      {show &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="demo-tooltip"
            style={{ left: pos.x, top: pos.y - 8, transform: 'translate(-50%, -100%)' }}
          >
            <span className="demo-tooltip-text">{note}</span>
            <span className="demo-tooltip-arrow" />
          </div>,
          document.body
        )}
    </>
  )
}

export default function DemoPage() {
  const [userText, setUserText] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const ready = userText.trim().length >= 60

  // Auto-open the waitlist overlay on mount — analysis is offline right now.
  useEffect(() => {
    setModalOpen(true)
  }, [])

  const handleAnalyze = () => {
    if (!ready) return
    window.datafast?.('demo_analyze_click', { text_length: userText.trim().length })
    window.umami?.track('demo_analyze_click', { text_length: userText.trim().length })
    setModalOpen(true)
  }

  return (
    <div className="pa-root demo-root">
      <div className="pa-container demo-container">
        <div className="pa-header">
          <h1 className="pa-title">
            Rewrite
            <br />
            <em>Woolf</em>.
          </h1>
          <p className="pa-subtitle">
            Read the extract. Notice the craft. Then rewrite it under a constraint and get a
            scorecard back.
          </p>
        </div>

        {/* SECTION 01 — READ */}
        <section className="demo-section">
          <div className="demo-section-head">
            <span className="demo-section-num">01</span>
            <span className="demo-section-label">READ — WOOLF</span>
            <span className="demo-section-rule" />
          </div>
          <p className="demo-section-caption">
            Hover the highlighted segments to read craft notes.
          </p>

          <p className="demo-passage">
            &ldquo;She had a{' '}
            <CraftTooltip note={CRAFT_NOTES.voice}>
              <span className="demo-hl demo-hl-voice">perpetual sense</span>
            </CraftTooltip>
            , as she{' '}
            <CraftTooltip note={CRAFT_NOTES.imagery}>
              <span className="demo-hl demo-hl-imagery">watched the taxi cabs</span>
            </CraftTooltip>
            , of being{' '}
            <CraftTooltip note={CRAFT_NOTES.structure}>
              <span className="demo-hl demo-hl-structure">out, out, far out</span>
            </CraftTooltip>{' '}
            to sea and{' '}
            <CraftTooltip note={CRAFT_NOTES.pacing}>
              <span className="demo-hl demo-hl-pacing">alone</span>
            </CraftTooltip>
            …&rdquo;
          </p>
          <p className="demo-passage-source">— Virginia Woolf, Mrs Dalloway</p>

          <div className="demo-legend">
            <span className="demo-legend-item">
              <span className="demo-legend-dot demo-legend-structure" /> Structure
            </span>
            <span className="demo-legend-item">
              <span className="demo-legend-dot demo-legend-voice" /> Voice
            </span>
            <span className="demo-legend-item">
              <span className="demo-legend-dot demo-legend-imagery" /> Imagery
            </span>
            <span className="demo-legend-item">
              <span className="demo-legend-dot demo-legend-pacing" /> Pacing
            </span>
          </div>
        </section>

        {/* SECTION 02 — WRITE */}
        <section className="demo-section">
          <div className="demo-section-head">
            <span className="demo-section-num">02</span>
            <span className="demo-section-label">WRITE — YOUR TURN</span>
            <span className="demo-section-rule" />
          </div>

          <div className="pa-prompt-box demo-prompt-box">
            <div className="pa-prompt-top">
              <span className="pa-prompt-label">Prompt</span>
            </div>
            <p className="pa-prompt-text">{CONSTRAINT_PROMPT}</p>
          </div>

          <textarea
            id="demo-rewrite"
            name="demo-rewrite"
            className="pa-textarea"
            placeholder="Inspired by Woolf's passage, write your own version here…"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            rows={6}
          />

          <div className="pa-char-row">
            <span className="pa-char-count">{userText.length} characters</span>
            {userText.length > 0 && userText.length < 60 && (
              <span className="pa-char-hint">A sentence or two more for a fuller scorecard</span>
            )}
          </div>

          <button
            className={`pa-btn-analyze${ready ? '' : ' pa-btn-analyze-disabled'}`}
            onClick={handleAnalyze}
          >
            Analyze my rewrite
          </button>

          <p className="pa-footer-note">
            Free. No account required. We&apos;ll email your scorecard.
          </p>
        </section>
      </div>

      <footer className="pa-footer">
        <p className="pa-footer-brought">
          Brought to you by{' '}
          <Link href="/" className="pa-footer-brought-link">
            ProseLab
          </Link>
        </p>
      </footer>

      <ExitIntentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        variant="dim"
        source="demo"
        dismissible={false}
        eyebrow="Heads up"
        title={
          <>
            Analysis is
            <br />
            <em>offline</em> right now
          </>
        }
        sub="We're rebuilding the scoring pipeline. Drop your email — we'll let you know the moment it's back, and lock in your spot on the waitlist for full ProseLab access."
      />
    </div>
  )
}
