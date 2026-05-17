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
        <header className="legal-header">
          <h1 className="legal-title">Contact</h1>
          <p className="legal-subtitle">
            Have a question, feedback, or need support? We&apos;d love to hear
            from you.
          </p>
        </header>

        <article className="legal-content">
          <section>
            <h2>1. Email</h2>
            <p>
              For general inquiries, support, or feedback, write to us at{" "}
              <a href="mailto:contact@proselab.io">contact@proselab.io</a>.
            </p>
            <p>
              We aim to respond to emails within a few business days — 48 hours
              max. For urgent account or billing issues, please include
              &quot;Urgent&quot; in your subject line.
            </p>
          </section>

          <section>
            <h2>2. Social</h2>
            <p>Follow along and stay updated:</p>
            <ul>
              <li>
                <a
                  href="https://tiktok.com/@proselab.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TikTok — @proselab.io
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/proselab.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram — @proselab.io
                </a>
              </li>
              <li>
                <a
                  href="https://proselab.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Substack — proselab.substack.com
                </a>
              </li>
            </ul>
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
