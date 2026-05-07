import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | ProseLab",
  description:
    "Contact ProseLab. Get in touch for support, feedback, or business inquiries.",
};

export default function ContactPage() {
  return (
    <div className="legal-root">
      <div className="legal-inner">
        <Link href="/" className="legal-back-link">
          ← Back to home
        </Link>

        <header className="legal-header">
          <p className="legal-eyebrow">Get in touch</p>
          <h1 className="legal-title">Contact</h1>
          <p className="legal-subtitle">
            Have a question, feedback, or need support? We&apos;d love to hear from you.
          </p>
        </header>

        <article className="legal-content contact-content">
          <section className="contact-section">
            <h2>Email</h2>
            <p>
              For general inquiries, support, or feedback:
            </p>
            <a href="mailto:contact@proselab.io" className="contact-link">
              contact@proselab.io
            </a>
          </section>

          <section className="contact-section">
            <h2>Social</h2>
            <p>Follow us and stay updated:</p>
            <ul className="contact-socials">
              <li>
                <a
                  href="https://tiktok.com/@proselab.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/proselab.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://proselab.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Substack"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
                  </svg>
                </a>
              </li>
            </ul>
          </section>

          <section className="contact-section">
            <h2>Response Time</h2>
            <p>
              We aim to respond to emails within a few business days. For urgent
              account or billing issues, please include &quot;Urgent&quot; in
              your subject line.
            </p>
          </section>
        </article>

        <nav className="legal-nav">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
        </nav>
      </div>
    </div>
  );
}
