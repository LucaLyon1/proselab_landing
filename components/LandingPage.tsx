'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ExitIntentModal } from './ExitIntentModal'

declare global {
  interface Window {
    datafast?: (event: string, props?: Record<string, unknown>) => void
    umami?: { track: (event: string, props?: Record<string, unknown>) => void }
  }
}


const CONSTRAINT_PROMPT =
  "Rewrite this passage so that the character's loneliness is conveyed entirely through concrete, physical detail — what the body does, what the senses register, what the world looks like. Remove every abstraction: no 'sense,' no 'feeling,' no naming of emotions. Let the reader feel the isolation only through tangible things."

const MANUSCRIPT_NOTES = {
  voice:
    "Woolf's interior voice: \"perpetual\" suggests something ongoing, inescapable — not a passing mood but a state of being. The word choice bleeds personality.",
  imagery:
    'Concrete anchor: the taxi cabs ground the abstract feeling. We see what she sees. The mundane detail makes the loneliness tangible.',
  structure:
    'Repetition creates rhythm: "out, out, far out" — each word pushes further. The syntax mirrors the feeling of distance, of being cast away.',
  pacing:
    '"Alone." A single word. The sentence stops. The pause lets the weight of isolation land before the next thought.',
} as const

const AUTHOR_QUOTES: Record<string, { quote: string; work: string }> = {
  'Virginia Woolf': {
    quote: 'She had a perpetual sense, as she watched the taxi cabs, of being out, out, far out to sea and alone.',
    work: 'Mrs Dalloway',
  },
  'Toni Morrison': {
    quote: 'It was not a story to pass on. They forgot her like a bad dream.',
    work: 'Beloved',
  },
  'Ernest Hemingway': {
    quote: '"Would you please please please please please please please stop talking?"',
    work: 'Hills Like White Elephants',
  },
  'Raymond Carver': {
    quote: 'He kept talking. He asked me to do this for him. I did it. He was having a good time.',
    work: 'Cathedral',
  },
}

function AuthorCard({ name, note }: { name: string; note: string }) {
  const quote = AUTHOR_QUOTES[name]

  return (
    <div className="landing-author-item">
      <p className="landing-author-name">{name}</p>
      <p className="landing-author-note">{note}</p>
      {quote && (
        <div className="landing-author-passages">
          <p className="landing-author-quote">&ldquo;{quote.quote}&rdquo;</p>
          <p className="landing-author-quote-source">— {quote.work}</p>
        </div>
      )}
    </div>
  )
}

function CraftTooltip({ note, children }: { note: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = () => setShow(true)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ x: rect.left + rect.width / 2, y: rect.top })
  }
  const handleMouseLeave = () => setShow(false)

  return (
    <>
      <span ref={ref} onMouseEnter={handleMouseEnter} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        {children}
      </span>
      {show &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="landing-ms-tooltip"
            style={{ left: pos.x, top: pos.y - 8, transform: 'translate(-50%, -100%)' }}
          >
            <span className="landing-ms-tooltip-text">{note}</span>
            <span className="landing-ms-tooltip-arrow" />
          </div>,
          document.body
        )}
    </>
  )
}

export function LandingPage() {
  const [discountOpen, setDiscountOpen] = useState(false)
  const [userText, setUserText] = useState('')

useEffect(() => {
    if (sessionStorage.getItem('exit-modal-seen')) return

    const readyAt = Date.now() + 5000

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 5 && Date.now() >= readyAt) {
        setDiscountOpen(true)
        document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
        sessionStorage.setItem('exit-modal-seen', '1')
      }
    }

    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    return () => document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  useEffect(() => {
    const openModal = () => setDiscountOpen(true)
    window.addEventListener('open-subscribe-modal', openModal)
    return () => window.removeEventListener('open-subscribe-modal', openModal)
  }, [])

  return (
    <div className="landing-root">
      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-left">
          <p className="landing-hero-eyebrow">A writing practice tool</p>
          <h1 className="landing-hero-title">
            Train Your
            <br />
            <em>Voice.</em>
            <br />
            Every Day.
          </h1>
          <p className="landing-hero-subtitle">
            Study passages from Eliot, Plath, Tolstoy, Woolf, Morrison, Hemingway, and more with
            guided craft analysis. Write your own version, get feedback, and
            track your progress.
          </p>
          <div className="landing-hero-actions">
            <button
              className="landing-btn-primary"
              id="start"
              onClick={() => {
                window.datafast?.('popup_click', { location: 'hero' })
                window.umami?.track('popup_click', { location: 'hero' })
                setDiscountOpen(true)
              }}
            >
              Explore passages
            </button>
          </div>
        </div>
        <div className="landing-hero-right">
          <div className="landing-manuscript-mock">
            <p className="landing-ms-label">Extract — Woolf</p>
            <p className="landing-ms-phase-header" style={{ marginBottom: '0.5rem' }}>
              Craft highlights — segments tagged by category, hover to read notes
            </p>
            <p className="landing-ms-passage">
              &quot;She had a{' '}
              <CraftTooltip note={MANUSCRIPT_NOTES.voice}>
                <span className="landing-ms-hl landing-ms-hl-voice">perpetual sense</span>
              </CraftTooltip>
              , as she{' '}
              <CraftTooltip note={MANUSCRIPT_NOTES.imagery}>
                <span className="landing-ms-hl landing-ms-hl-imagery">watched the taxi cabs</span>
              </CraftTooltip>
              , of being{' '}
              <CraftTooltip note={MANUSCRIPT_NOTES.structure}>
                <span className="landing-ms-hl landing-ms-hl-structure">out, out, far out</span>
              </CraftTooltip>
              {' '}to sea and{' '}
              <CraftTooltip note={MANUSCRIPT_NOTES.pacing}>
                <span className="landing-ms-hl landing-ms-hl-pacing">alone</span>
              </CraftTooltip>
              ...&quot;
            </p>
            <div className="landing-ms-legend">
              <span className="landing-ms-legend-item">
                <span className="landing-ms-legend-dot landing-ms-legend-structure" />
                Structure
              </span>
              <span className="landing-ms-legend-item">
                <span className="landing-ms-legend-dot landing-ms-legend-voice" />
                Voice
              </span>
              <span className="landing-ms-legend-item">
                <span className="landing-ms-legend-dot landing-ms-legend-imagery" />
                Imagery
              </span>
              <span className="landing-ms-legend-item">
                <span className="landing-ms-legend-dot landing-ms-legend-pacing" />
                Pacing
              </span>
            </div>
            <div className="landing-write-section">
              <p className="landing-ms-phase-header">
                Try it — write your own version
              </p>
              <div className="landing-constraint-prompt">
                <span className="landing-constraint-label">Prompt</span>
                <p>{CONSTRAINT_PROMPT}</p>
              </div>
              <textarea
                className="landing-user-textarea"
                placeholder="Inspired by Woolf's passage, write your own version here..."
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                rows={4}
              />
              <button
                className={`landing-btn-analyze${userText.trim() ? '' : ' landing-btn-analyze-disabled'}`}
                onClick={() => {
                  if (!userText.trim()) return
                  window.datafast?.('popup_click', { location: 'analyze' })
                  window.umami?.track('popup_click', { location: 'analyze' })
                  setDiscountOpen(true)
                }}
              >
                Analyze my writing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PHASES */}
      <section className="landing-phases" id="how">
        <div className="landing-section-header">
          <span className="landing-section-num">01 /</span>
          <h2 className="landing-section-title">
            Study, Write,
            <br />
            Improve
          </h2>
        </div>
        <div className="landing-phases-grid">
          <div className="landing-phase-card">
            <div className="landing-phase-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/features/feature-01-study.gif" alt="Craft analysis — hover highlighted segments to read annotations" className="landing-phase-gif" />
            </div>
            <span className="landing-phase-num">01</span>
            <h3 className="landing-phase-name">
              <em>Study</em> the Extract
            </h3>
            <p className="landing-phase-desc">
              AI-powered analysis highlights structure, voice, imagery, and pacing.
              Hover over segments to see craft notes. Understand what makes the
              passage work before you write.
            </p>
          </div>
          <div className="landing-phase-card">
            <div className="landing-phase-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/features/feature-02-write.gif" alt="Writing exercise with constraints" className="landing-phase-gif" />
            </div>
            <span className="landing-phase-num">02</span>
            <h3 className="landing-phase-name">
              Write <em>Your</em> Version
            </h3>
            <p className="landing-phase-desc">
              Each passage comes with hand-authored constraints — prompts that
              push you to think differently. Write your own take. Optionally hear
              it read aloud with ElevenLabs.
            </p>
          </div>
          <div className="landing-phase-card">
            <div className="landing-phase-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/features/feature-03-feedback.gif" alt="AI feedback on your writing" className="landing-phase-gif" />
            </div>
            <span className="landing-phase-num">03</span>
            <h3 className="landing-phase-name">
              Get <em>Feedback</em> &amp; Save
            </h3>
            <p className="landing-phase-desc">
              AI feedback on your writing. Save completions to your profile. Track
              your activity with a heatmap. Build a daily practice.
            </p>
          </div>
        </div>
      </section>

      {/* PASSAGES */}
      <section className="landing-passages">
        <div className="landing-section-header">
          <span className="landing-section-num">02 /</span>
          <h2 className="landing-section-title">9 Categories, 40+ Passages</h2>
        </div>
        <p
          className="landing-reveal"
          style={{
            fontFamily: 'var(--landing-mono)',
            fontSize: '0.98rem',
            color: 'rgba(245,240,232,0.7)',
            maxWidth: '55ch',
            lineHeight: 1.8,
          }}
        >
          Passages organized by craft: character intro, in medias res, place
          &amp; atmosphere, dialogue, interiority, time &amp; memory, rhythm
          &amp; style, tension &amp; dread, poetry. Filter by tags. Each one teaches
          something different.
        </p>
        <div className="landing-authors-list">
          <AuthorCard name="Virginia Woolf" note="Interiority" />
          <AuthorCard name="Toni Morrison" note="Weight &amp; Memory" />
          <AuthorCard name="Ernest Hemingway" note="Dialogue" />
          <AuthorCard name="Raymond Carver" note="Minimalism" />
          <span className="landing-author-more">and more</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-how">
        <div className="landing-section-header">
          <span className="landing-section-num">03 /</span>
          <h2 className="landing-section-title">
            How It
            <br />
            Works
          </h2>
        </div>
        <div className="landing-steps">
          <div className="landing-step">
            <span className="landing-step-num">01</span>
            <div className="landing-step-body">
              <p className="landing-step-title">Browse &amp; pick a passage</p>
              <p className="landing-step-desc">
                Filter by category or tag. Each passage shows author, work, and
                context. Pick one that speaks to you.
              </p>
            </div>
          </div>
          <div className="landing-step">
            <span className="landing-step-num">02</span>
            <div className="landing-step-body">
              <p className="landing-step-title">Study the AI analysis</p>
              <p className="landing-step-desc">
                Claude annotates structure, voice, imagery, and pacing. Hover
                highlights to see craft notes. Understand before you write.
              </p>
            </div>
          </div>
          <div className="landing-step">
            <span className="landing-step-num">03</span>
            <div className="landing-step-body">
              <p className="landing-step-title">Write your version</p>
              <p className="landing-step-desc">
                Follow the constraint prompt. Optionally hear your text read
                aloud with ElevenLabs.
              </p>
            </div>
          </div>
          <div className="landing-step">
            <span className="landing-step-num">04</span>
            <div className="landing-step-body">
              <p className="landing-step-title">Get AI feedback</p>
              <p className="landing-step-desc">
                Submit your writing for analysis. See what works and what to
                improve.
              </p>
            </div>
          </div>
          <div className="landing-step">
            <span className="landing-step-num">05</span>
            <div className="landing-step-body">
              <p className="landing-step-title">Save &amp; track progress</p>
              <p className="landing-step-desc">
                Sign up to save completions to your profile. View your activity
                heatmap. Build a daily practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <h2 className="landing-cta-title">
          Start
          <br />
          <em>Writing</em>
          <br />
          Today.
        </h2>
        <p className="landing-cta-sub">
          ProseLab gives you AI-powered craft analysis, hand-authored
          constraints, and feedback. Study the masters. Write more.
        </p>
        <div className="landing-reveal landing-cta-buttons">
          <button
            className="landing-btn-primary"
            onClick={() => {
              window.datafast?.('popup_click', { location: 'cta' })
              window.umami?.track('popup_click', { location: 'cta' })
              setDiscountOpen(true)
            }}
          >
            Explore passages →
          </button>
          <button className="landing-btn-outline" onClick={() => {
              window.datafast?.('popup_click', { location: 'cta-waitlist' })
              window.umami?.track('popup_click', { location: 'cta-waitlist' })
              setDiscountOpen(true)
            }}>
            Join waitlist →
          </button>
        </div>
        <p className="landing-cta-badge">
          We&apos;re letting people in gradually — join the waitlist
        </p>
      </section>

      <ExitIntentModal open={discountOpen} onClose={() => setDiscountOpen(false)} />

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-top">
          <span className="landing-footer-logo">ProseLab</span>
          <span className="landing-footer-tagline">Train Your Voice. Every Day.</span>
        </div>
        <div className="landing-footer-contact">
          <Link href="/privacy" className="landing-footer-mono">
            Privacy
          </Link>
          <Link href="/terms" className="landing-footer-mono">
            Terms
          </Link>
          <Link href="/cookies" className="landing-footer-mono">
            Cookies
          </Link>
          <Link href="/contact" className="landing-footer-mono">
            Contact
          </Link>
          <a href="mailto:contact@proselab.io" className="landing-footer-mono">
            Email ↗
          </a>
          <a
            href="https://x.com/proselab_io"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-footer-mono"
          >
            X ↗
          </a>
          <a
            href="https://proselab.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-footer-mono"
          >
            Substack ↗
          </a>
        </div>
      </footer>
    </div>
  )
}
