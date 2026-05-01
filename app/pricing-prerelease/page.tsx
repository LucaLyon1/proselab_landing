'use client'

import Link from 'next/link'
import { useState } from 'react'

type BillingPeriod = 'yearly' | 'monthly'

interface Plan {
  id: string
  label: string
  price: { yearly: string; monthly: string }
  cadence?: string
  billingNote?: { yearly: string; monthly: string }
  features: string[]
  cta: string
  isPopular?: boolean
  /** Plan slug passed through to the app's signup flow. */
  signupPlan: 'free' | 'pro'
}

const APP_SIGNUP_URL = 'https://app.proselab.io/signup'

const PLANS: Plan[] = [
  {
    id: 'free',
    label: 'Free',
    price: { yearly: 'Free', monthly: 'Free' },
    features: [
      '1 session per day',
      'Full rewrite + side-by-side comparison',
      'Browse the full extract library',
    ],
    cta: 'Get started',
    signupPlan: 'free',
  },
  {
    id: 'pro',
    label: 'Pro',
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
    cta: 'Get Pro',
    isPopular: true,
    signupPlan: 'pro',
  },
]

function buildSignupUrl(plan: Plan, billing: BillingPeriod): string {
  const params = new URLSearchParams({ plan: plan.signupPlan })
  if (plan.signupPlan === 'pro') params.set('billing', billing)
  return `${APP_SIGNUP_URL}?${params.toString()}`
}

export default function PricingPrereleasePage() {
  const [billing, setBilling] = useState<BillingPeriod>('yearly')

  const handleCtaClick = (plan: Plan) => {
    window.datafast?.('pricing_prerelease_click', {
      plan: plan.id,
      billing: plan.signupPlan === 'pro' ? billing : 'n/a',
    })
    window.umami?.track('pricing_prerelease_click', {
      plan: plan.id,
      billing: plan.signupPlan === 'pro' ? billing : 'n/a',
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
      <div className="pp-container">
        <header className="pp-header">
          <p className="pp-eyebrow">Pre-release pricing</p>
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

        <section className="pp-grid pp-grid-two" aria-label="Available plans">
          {PLANS.map((plan) => {
            const price = plan.price[billing]
            const note = plan.billingNote?.[billing]
            return (
              <article
                key={plan.id}
                className={`pp-card ${plan.isPopular ? 'pp-card-popular' : ''}`}
              >
                {plan.isPopular && (
                  <span className="pp-badge">Most popular</span>
                )}

                <div className="pp-card-header">
                  <h2 className="pp-card-title">{plan.label}</h2>
                  <p className="pp-card-price">
                    {price}
                    {plan.cadence && price !== 'Free' && (
                      <span className="pp-card-cadence">{plan.cadence}</span>
                    )}
                  </p>
                  {note && <p className="pp-card-savings">{note}</p>}
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
                    className={
                      plan.isPopular
                        ? 'pp-btn pp-btn-primary'
                        : 'pp-btn pp-btn-outline'
                    }
                  >
                    {plan.cta}
                  </button>
                </div>
              </article>
            )
          })}
        </section>

        <p className="pp-note">
          All plans include AI craft analysis, feedback, and text-to-speech.
          Cancel anytime from your account.
        </p>
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
