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
    a: 'No. As long as you remain subscribed without a gap, your rate stays at the early-bird price. If you cancel and resubscribe later, you\'ll pay the then-current launch price.',
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
  /** Plan slug passed through to the app's signup flow. */
  signupPlan: 'pro'
}

const APP_SIGNUP_URL = 'https://app.proselab.io/signup'

const PLANS: Plan[] = [
  {
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
    cta: 'Get ProseLab Core',
    signupPlan: 'pro',
  },
]

function buildSignupUrl(plan: Plan, billing: BillingPeriod): string {
  const params = new URLSearchParams({ plan: plan.signupPlan, billing })
  return `${APP_SIGNUP_URL}?${params.toString()}`
}

export default function PricingPrereleasePage() {
  const [billing, setBilling] = useState<BillingPeriod>('yearly')

  const handleCtaClick = (plan: Plan) => {
    window.datafast?.('pricing_prerelease_click', {
      plan: plan.id,
      billing,
    })
    window.umami?.track('pricing_prerelease_click', {
      plan: plan.id,
      billing,
    })
    window.location.assign(buildSignupUrl(plan, billing))
  }

  const handleToggle = (next: BillingPeriod) => {
    if (next === billing) return
    setBilling(next)
    window.datafast?.('pricing_prerelease_toggle', { billing: next })
    window.umami?.track('pricing_prerelease_toggle', { billing: next })
  }

  return (
    <div className="pp-root">
      <div className="pp-banner" role="status" aria-live="polite">
        <span className="pp-banner-label">Pre-release pricing</span>
        <span className="pp-banner-sep" aria-hidden>
          ·
        </span>
        <span className="pp-banner-text">
          code <code className="pp-banner-code">PRERELEASE26</code> already
          applied at checkout
        </span>
      </div>
      <div className="pp-container">
        <header className="pp-header">
          <h1 className="pp-title">
            Choose your
            <br />
            <em>plan</em>
          </h1>
          <p className="pp-subtitle">
            ProseLab is in pre-release. Lock in early-bird pricing — 20% off
            the launch rate, for as long as you stay subscribed.
          </p>
        </header>

        <div
          className="pp-toggle"
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

        <section className="pp-grid pp-grid-one" aria-label="Available plans">
          {PLANS.map((plan) => {
            const price = plan.price[billing]
            const note = plan.billingNote?.[billing]
            return (
              <article key={plan.id} className="pp-card pp-card-popular">
                <div className="pp-card-header">
                  <h2 className="pp-card-title">{plan.label}</h2>
                  <p className="pp-card-price">
                    {price}
                    {plan.cadence && (
                      <span className="pp-card-cadence">{plan.cadence}</span>
                    )}
                  </p>
                  {note && <p className="pp-card-savings">{note}</p>}
                  <p className="pp-card-applied" aria-live="polite">
                    <span className="pp-card-applied-check" aria-hidden>
                      ✓
                    </span>
                    <span>
                      code{' '}
                      <code className="pp-card-applied-code">
                        PRERELEASE26
                      </code>{' '}
                      applied — 20% off
                    </span>
                  </p>
                </div>

                <ul className="pp-features" aria-label="Plan features">
                  {plan.features.map((feature) => (
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
                    onClick={() => handleCtaClick(plan)}
                    className="pp-btn pp-btn-primary"
                  >
                    {plan.cta}
                  </button>
                </div>
              </article>
            )
          })}
        </section>

        <p className="pp-note">
          Cancel anytime from your account, 7-day money-back guarantee included.
        </p>

        <section className="pp-faq" aria-label="Frequently asked questions">
          <p className="pp-faq-eyebrow">FAQs</p>
          <div className="pp-faq-list">
            {FAQS.map((item) => (
              <details key={item.q} className="pp-faq-item">
                <summary className="pp-faq-question">
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
        </section>
      </div>

      <footer className="pp-footer">
        <p className="pp-footer-brought">
          Brought to you by{' '}
          <Link href="/" className="pp-footer-brought-link">
            ProseLab
          </Link>
        </p>
      </footer>
    </div>
  )
}
