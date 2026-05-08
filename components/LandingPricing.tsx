'use client'

import Link from 'next/link'
import { type ReactNode, useState } from 'react'

type BillingPeriod = 'yearly' | 'monthly'

interface FaqItem {
  q: string
  a: ReactNode
}

const FAQS: FaqItem[] = [
  {
    q: 'What is "pre-release pricing"?',
    a: 'ProseLab is in pre-release. Sign up now to lock in early-bird pricing — 20% below the launch rate — for as long as you stay subscribed.',
  },
  {
    q: 'Will my price go up after launch?',
    a: "No. As long as you remain subscribed without a gap, your rate stays at the early-bird price. If you cancel and resubscribe later, you'll pay the then-current launch price.",
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — cancel in one click from your account. You keep access through the end of the current billing period.',
  },
  {
    q: 'Can I switch between monthly and yearly?',
    a: 'Yes. You can change your billing period from your account settings whenever you like.',
  },
  {
    q: 'What does ProseLab actually do?',
    a: (
      <>
        ProseLab is a craft tool for prose. You rewrite passages from a curated
        extract library, then get a side-by-side comparison and detailed AI
        feedback — strong points, weak points, and what to try next — plus a
        follow-up chat about each rewrite. Want a taste before paying? Try a
        small snippet of everything at{' '}
        <Link href="/demo" className="pp-faq-link">
          proselab.io/demo
        </Link>
        .
      </>
    ),
  },
]

interface Plan {
  id: string
  label: string
  price: { yearly: string; monthly: string }
  cadence?: string
  billingNote?: { yearly: string; monthly: string }
  features: string[]
  cta: string
  signupPlan: 'pro'
}

const PLAN: Plan = {
  id: 'pro',
  label: 'ProseLab Core',
  price: { yearly: '$6.58', monthly: '$7.99' },
  cadence: '/ month',
  billingNote: {
    yearly: 'Billed $79 annually — save 17%',
    monthly: 'Billed monthly',
  },
  features: [
    'Unlimited sessions',
    'AI analysis of every rewrite',
    'Detailed feedback — strong points, weak points, what to try next',
    'Personal practice record',
    'Follow-up chat after every analysis',
    'Structured session mode with focus axes',
    'Choose your preferred voice for text-to-speech',
    'Full extract library',
    'Cancel anytime',
  ],
  cta: 'Join the waitlist',
  signupPlan: 'pro',
}

export function LandingPricing() {
  const [billing, setBilling] = useState<BillingPeriod>('yearly')

  const handleCtaClick = () => {
    window.datafast?.('popup_click', {
      location: 'pricing-card',
      plan: PLAN.id,
      billing,
    })
    window.umami?.track('popup_click', {
      location: 'pricing-card',
      plan: PLAN.id,
      billing,
    })
    // While waitlist mode is on, all front-page CTAs route to the waitlist
    // modal rather than the signup flow.
    window.dispatchEvent(new CustomEvent('open-subscribe-modal'))
  }

  const handleToggle = (next: BillingPeriod) => {
    if (next === billing) return
    setBilling(next)
    window.datafast?.('pricing_prerelease_toggle', {
      billing: next,
      location: 'landing',
    })
    window.umami?.track('pricing_prerelease_toggle', {
      billing: next,
      location: 'landing',
    })
  }

  const price = PLAN.price[billing]
  const note = PLAN.billingNote?.[billing]

  return (
    <div className="pp-embedded landing-pricing-grid">
      {/* LEFT — the offer */}
      <div className="landing-pricing-offer">
        <div className="landing-pricing-stack">
        <div
          className="pp-toggle landing-pricing-toggle"
          role="tablist"
          aria-label="Billing period"
        >
          <button
            type="button"
            role="tab"
            aria-selected={billing === 'yearly'}
            className={`pp-toggle-btn ${billing === 'yearly' ? 'pp-toggle-btn-active' : ''}`}
            onClick={() => handleToggle('yearly')}
          >
            Yearly
            <span className="pp-toggle-pill">Save 17%</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={billing === 'monthly'}
            className={`pp-toggle-btn ${billing === 'monthly' ? 'pp-toggle-btn-active' : ''}`}
            onClick={() => handleToggle('monthly')}
          >
            Monthly
          </button>
        </div>

        <article className="pp-card pp-card-popular landing-pricing-card">
          <div className="pp-card-header">
            <h3 className="pp-card-title">{PLAN.label}</h3>
            <p className="pp-card-price">
              {price}
              {PLAN.cadence && (
                <span className="pp-card-cadence">{PLAN.cadence}</span>
              )}
            </p>
            {note && <p className="pp-card-savings">{note}</p>}
            <p className="pp-card-applied" aria-live="polite">
              <span className="pp-card-applied-check" aria-hidden>
                ✓
              </span>
              <span>
                code{' '}
                <code className="pp-card-applied-code">PRERELEASE26</code>{' '}
                applied — 20% off
              </span>
            </p>
          </div>

          <ul className="pp-features" aria-label="Plan features">
            {PLAN.features.map((feature) => (
              <li key={feature} className="pp-feature">
                <span className="pp-feature-check" aria-hidden>
                  ✓
                </span>
                <span className="pp-feature-label">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="pp-card-cta">
            <button
              type="button"
              onClick={handleCtaClick}
              className="pp-btn pp-btn-primary"
            >
              {PLAN.cta}
            </button>
          </div>
        </article>

        <p className="pp-note landing-pricing-note">
          Cancel anytime from your account, 7-day money-back guarantee included.
        </p>
        </div>
      </div>

      {/* RIGHT — questions */}
      <aside
        className="landing-pricing-questions"
        aria-label="Frequently asked questions"
      >
        <p className="landing-pricing-faq-eyebrow">Questions, answered</p>
        <div className="pp-faq-list landing-pricing-faq-list">
          {FAQS.map((item, i) => (
            <details key={item.q} className="pp-faq-item">
              <summary className="pp-faq-question">
                <span className="pp-faq-num" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="pp-faq-q-text">{item.q}</span>
                <span className="pp-faq-icon" aria-hidden>
                  →
                </span>
              </summary>
              <div className="pp-faq-answer">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </aside>
    </div>
  )
}
