"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { trackCTA, trackEvent } from "@/lib/analytics";

const PROMPTS = [
  "Write about the last dinner you had at a restaurant — the light, the noise, the feeling of sitting across from someone.",
  "Write about a relationship that changed you. Not what happened, but what it left behind.",
  "Write about the last time you were alone and noticed it. Where were you? What did the silence sound like?",
];

export default function ProseAnalysisPage() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [userText, setUserText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const writeStartFired = useRef(false);

  const cyclePrompt = useCallback(() => {
    setPromptIndex((i) => (i + 1) % PROMPTS.length);
  }, []);

  const handleTextChange = (value: string) => {
    if (!writeStartFired.current && value.trim().length > 0) {
      writeStartFired.current = true;
      trackEvent("prose_write_start", { prompt_index: promptIndex });
    }
    setUserText(value);
  };

  const handleAnalyze = () => {
    if (!userText.trim()) return;
    trackEvent("prose_analyze_click", {
      text_length: userText.trim().length,
      prompt_index: promptIndex,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    trackEvent("prose_email_submit", {
      text_length: userText.trim().length,
      prompt_index: promptIndex,
    });

    setStatus("loading");

    try {
      const res = await fetch("/api/prose-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          text: userText,
          prompt: PROMPTS[promptIndex],
        }),
      });
      const json = await res.json();

      if (json.error) {
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
    }
  };

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
            Write or paste a short passage below (it can be the prompt or your
            own work), and we&apos;ll tell you which author out of the 25+ in
            the ProseLab library your work most resembles in style…
          </p>
        </div>

        <div className="pa-prompt-box">
          <div className="pa-prompt-top">
            <span className="pa-prompt-label">Prompt</span>
            <button
              className="pa-prompt-refresh"
              onClick={cyclePrompt}
              aria-label="New prompt"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1.5 2v5h5" />
                <path d="M14.5 14v-5h-5" />
                <path d="M13.5 5.5A6 6 0 0 0 3 3.5L1.5 7" />
                <path d="M2.5 10.5A6 6 0 0 0 13 12.5l1.5-3.5" />
              </svg>
              New prompt
            </button>
          </div>
          <p className="pa-prompt-text" key={promptIndex}>
            {PROMPTS[promptIndex]}
          </p>
        </div>

        <textarea
          id="writing-sample"
          name="writing-sample"
          className="pa-textarea"
          placeholder="Start writing here..."
          value={userText}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={5}
        />

        <div className="pa-char-row">
          <span className="pa-char-count">{userText.length} characters</span>
          {userText.length > 0 && userText.length < 100 && (
            <span className="pa-char-hint">
              Write a little more for a better analysis
            </span>
          )}
        </div>

        <button
          className={`pa-btn-analyze${userText.trim().length >= 100 ? "" : " pa-btn-analyze-disabled"}`}
          onClick={handleAnalyze}
        >
          Analyze my writing
        </button>

        <p className="pa-footer-note">Free. No account required.</p>
      </div>

      <footer className="pa-footer">
        <p className="pa-footer-brought">
          Brought to you by{" "}
          <Link href="/" className="pa-footer-brought-link">
            ProseLab
          </Link>
        </p>
      </footer>

      {/* Email modal */}
      {modalOpen && (
        <div
          className="exit-modal-backdrop"
          onClick={() => setModalOpen(false)}
        >
          <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="exit-modal-close"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ✕ close
            </button>

            {status === "success" ? (
              <div className="exit-modal-success">
                <p className="exit-modal-eyebrow">Sent</p>
                <h2 className="exit-modal-title">Check your inbox.</h2>
                <p className="exit-modal-sub">
                  We&apos;re analyzing your writing now. Your prose analysis
                  will arrive at <strong>{email}</strong> shortly.
                </p>
                <p className="exit-modal-sub">
                  If you want to save, manage and browse your extracts, create
                  an account by clicking below…
                </p>
                <a
                  href="https://app.proselab.io/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="exit-modal-signup"
                  onClick={() => trackCTA("prose-success", "signup")}
                >
                  Sign up & create an account →
                </a>
              </div>
            ) : (
              <>
                <p className="exit-modal-eyebrow">Almost there</p>
                <h2 className="exit-modal-title">
                  Where should we
                  <br />
                  send your <em>results</em>?
                </h2>
                <p className="exit-modal-sub">
                  We&apos;ll analyze your writing against 20 renowned authors
                  and email you a breakdown of who you write like — and why.
                </p>
                <form className="exit-modal-form" onSubmit={handleSubmit}>
                  <input
                    id="analysis-email"
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="exit-modal-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="exit-modal-submit"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Sending..." : "Send my analysis →"}
                  </button>
                </form>
                {status === "error" && (
                  <p className="exit-modal-error">
                    Something went wrong. Please try again.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
