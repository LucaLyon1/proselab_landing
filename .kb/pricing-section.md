# Pricing Section

Removed from the landing page on 2026-03-14. Not needed until paid launch — currently in pre-launch / lead magnet phase with all traffic directed to `/prose-analysis`.

Will be re-implemented when we're ready to launch paid plans. The pricing structure at time of removal:

- **Free**: $0/mo — browse passages, read craft analysis, 3 exercises/month, community
- **Writer (Early Bird)**: $9/mo annual ($108/yr) or $14/mo monthly (anchored at $15/$20)
- **Lifetime (Early Bird)**: $197 once (anchored at $349)

All paid plans include 14-day refund guarantee.

## Component State

Requires a `const [annual, setAnnual] = useState(true)` hook in the parent component.

## JSX

```tsx
{/* PRICING */}
<section className="landing-pricing">
  <div className="landing-section-header">
    <span className="landing-section-num">04 /</span>
    <h2 className="landing-section-title">
      Simple
      <br />
      Pricing
    </h2>
  </div>

  <div className="landing-pricing-prelaunch">
    <span className="landing-pricing-prelaunch-dot" />
    <p className="landing-pricing-prelaunch-text">
      We&apos;re currently in pre-launch. Join the waitlist to get early
      access and <strong>lock in early-bird pricing</strong> when we go live.
    </p>
  </div>

  <div className="landing-pricing-toggle">
    <button
      className={`landing-pricing-toggle-btn${annual ? '' : ' active'}`}
      onClick={() => setAnnual(false)}
    >
      Monthly
    </button>
    <button
      className={`landing-pricing-toggle-btn${annual ? ' active' : ''}`}
      onClick={() => setAnnual(true)}
    >
      Annual
      <span className="landing-pricing-toggle-save">Save 36%</span>
    </button>
  </div>

  <div className="landing-pricing-grid">
    <div className="landing-pricing-card">
      <span className="landing-pricing-tier">Free</span>
      <div className="landing-pricing-price">
        <span className="landing-pricing-amount">$0</span>
        <span className="landing-pricing-period">/ month</span>
      </div>
      <p className="landing-pricing-desc">
        Explore the library and see how Proselab works.
      </p>
      <ul className="landing-pricing-features">
        <li>Browse all passages</li>
        <li>Read craft analysis</li>
        <li>3 writing exercises / month</li>
        <li>Community access</li>
      </ul>
      <button
        className="landing-btn-outline landing-pricing-cta"
        onClick={() => setDiscountOpen(true)}
      >
        Join waitlist
      </button>
    </div>

    <div className="landing-pricing-card landing-pricing-card-featured">
      <span className="landing-pricing-badge">Early bird</span>
      <span className="landing-pricing-tier">Writer</span>
      <div className="landing-pricing-price">
        <span className="landing-pricing-anchor">{annual ? '$15' : '$20'}</span>
        <span key={annual ? 'a' : 'm'} className="landing-pricing-amount landing-pricing-amount-animate">
          {annual ? '$9' : '$14'}
        </span>
        <span className="landing-pricing-period">/ month</span>
      </div>
      {annual && (
        <p className="landing-pricing-billed">Billed annually at $108/yr</p>
      )}
      {!annual && (
        <p className="landing-pricing-original">$9/mo with annual plan</p>
      )}
      <p className="landing-pricing-desc">
        Full access to everything. The plan for serious practice.
      </p>
      <ul className="landing-pricing-features">
        <li>Unlimited writing exercises</li>
        <li>AI feedback on every piece</li>
        <li>ElevenLabs read-aloud</li>
        <li>Progress heatmap &amp; history</li>
        <li>New passages every week</li>
        <li>Priority access to new features</li>
      </ul>
      <button
        className="landing-btn-primary landing-pricing-cta"
        onClick={() => setDiscountOpen(true)}
      >
        Join waitlist
      </button>
    </div>

    <div className="landing-pricing-card landing-pricing-card-lifetime">
      <span className="landing-pricing-badge">Early bird</span>
      <span className="landing-pricing-tier">Lifetime</span>
      <div className="landing-pricing-price">
        <span className="landing-pricing-anchor">$349</span>
        <span className="landing-pricing-amount">$197</span>
        <span className="landing-pricing-period">once</span>
      </div>
      <p className="landing-pricing-desc">
        Pay once, own it forever. For writers who are in it for the long haul.
      </p>
      <ul className="landing-pricing-features">
        <li>Everything in Writer</li>
        <li>Every future feature included</li>
        <li>Founding member status</li>
        <li>No recurring fees, ever</li>
      </ul>
      <button
        className="landing-btn-primary landing-pricing-cta"
        onClick={() => setDiscountOpen(true)}
      >
        Join waitlist
      </button>
    </div>
  </div>

  <p className="landing-pricing-note">
    Prices shown are early-bird rates for waitlist members. All paid plans include a 14-day refund guarantee.
  </p>
</section>
```

## CSS Classes

All pricing CSS lives in `globals.css` under the `/* Pricing */` comment block. Class names prefixed with `.landing-pricing-*`. CSS is left in place (unused CSS won't affect performance) to make re-implementation easier.
