'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ExitIntentModal } from './ExitIntentModal'
import { HeroAnimation } from './HeroAnimation'
import { HeroAnimationMobile } from './HeroAnimationMobile'
import { LandingPricing } from './LandingPricing'

declare global {
  interface Window {
    datafast?: (event: string, props?: Record<string, unknown>) => void
    umami?: { track: (event: string, props?: Record<string, unknown>) => void }
  }
}

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

function AuthorCard({
  name,
  note,
  onClick,
}: {
  name: string
  note: string
  onClick?: () => void
}) {
  const quote = AUTHOR_QUOTES[name]

  return (
    <button
      type="button"
      className="landing-author-item"
      onClick={onClick}
      aria-label={`Join the waitlist to read ${name} passages`}
    >
      <p className="landing-author-name">{name}</p>
      <p className="landing-author-note">{note}</p>
      {quote && (
        <div className="landing-author-passages">
          <p className="landing-author-quote">&ldquo;{quote.quote}&rdquo;</p>
          <p className="landing-author-quote-source">— {quote.work}</p>
        </div>
      )}
    </button>
  )
}

export function LandingPage() {
  const [discountOpen, setDiscountOpen] = useState(false)

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
          <h1 className="landing-hero-title">
            Write Like
            <br />
            <em>The Greats.</em>
          </h1>
          <p className="landing-hero-subtitle">
            Study passages from the Classics, and try your hand at writing your own versions from prompts.
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
              Get started
            </button>
            <Link
              href="/demo"
              className="landing-btn-outline"
              onClick={() => {
                window.datafast?.('demo_click', { location: 'hero-secondary' })
                window.umami?.track('demo_click', { location: 'hero-secondary' })
              }}
            >
              Try the demo
            </Link>
          </div>
        </div>
        <div className="landing-hero-right">
          <div className="landing-hero-anim landing-hero-anim-desktop">
            <HeroAnimation />
          </div>
          <div className="landing-hero-anim landing-hero-anim-mobile">
            <HeroAnimationMobile />
          </div>
          <Link
            href="/demo"
            className="landing-hero-cta"
            onClick={() => {
              window.datafast?.('demo_click', { location: 'hero' })
              window.umami?.track('demo_click', { location: 'hero' })
            }}
          >
            <span className="landing-hero-cta-label">Want to try it yourself?</span>
            <span className="landing-hero-cta-arrow">Try the demo →</span>
          </Link>
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
              <em>Feedback</em>, Share &amp; Save
            </h3>
            <p className="landing-phase-desc">
              AI feedback on your writing. Save completions to your profile. Track
              your activity with a heatmap. Build a daily practice. Share your efforts with other users if you wish.
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
            color: 'var(--landing-muted)',
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
          <AuthorCard
            name="Virginia Woolf"
            note="Interiority"
            onClick={() => {
              window.datafast?.('popup_click', { location: 'passages-card', author: 'Virginia Woolf' })
              window.umami?.track('popup_click', { location: 'passages-card', author: 'Virginia Woolf' })
              setDiscountOpen(true)
            }}
          />
          <AuthorCard
            name="Toni Morrison"
            note="Weight &amp; Memory"
            onClick={() => {
              window.datafast?.('popup_click', { location: 'passages-card', author: 'Toni Morrison' })
              window.umami?.track('popup_click', { location: 'passages-card', author: 'Toni Morrison' })
              setDiscountOpen(true)
            }}
          />
          <AuthorCard
            name="Ernest Hemingway"
            note="Dialogue"
            onClick={() => {
              window.datafast?.('popup_click', { location: 'passages-card', author: 'Ernest Hemingway' })
              window.umami?.track('popup_click', { location: 'passages-card', author: 'Ernest Hemingway' })
              setDiscountOpen(true)
            }}
          />
          <AuthorCard
            name="Raymond Carver"
            note="Minimalism"
            onClick={() => {
              window.datafast?.('popup_click', { location: 'passages-card', author: 'Raymond Carver' })
              window.umami?.track('popup_click', { location: 'passages-card', author: 'Raymond Carver' })
              setDiscountOpen(true)
            }}
          />
          <span className="landing-author-more">and more</span>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="landing-pricing"
        aria-label="Pricing"
      >
        <div className="landing-section-header">
          <span className="landing-section-num">03 /</span>
          <h2 className="landing-section-title">
            Now live —
            <br />
            <em>lock in</em> pre-release pricing
          </h2>
        </div>
        <p className="landing-pricing-intro">
          ProseLab is in pre-release and we&apos;re letting people in soon. Join
          the waitlist to start your countdown — when it hits zero, you&apos;re
          inside, locked in at 20% off the launch rate for as long as you stay
          subscribed.
        </p>
        <LandingPricing />
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
            Explore passages
          </button>
          <button className="landing-btn-outline" onClick={() => {
              window.datafast?.('popup_click', { location: 'cta-waitlist' })
              window.umami?.track('popup_click', { location: 'cta-waitlist' })
              setDiscountOpen(true)
            }}>
            Join waitlist
          </button>
        </div>
      </section>

      <ExitIntentModal open={discountOpen} onClose={() => setDiscountOpen(false)} />

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-top">
          <div className="landing-footer-socials">
            <a
              href="https://tiktok.com/@proselab.io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="landing-footer-social"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/proselab.io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="landing-footer-social"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://proselab.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Substack"
              className="landing-footer-social"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
              </svg>
            </a>
          </div>
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
        </div>
      </footer>
    </div>
  )
}
