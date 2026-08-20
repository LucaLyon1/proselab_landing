"use client";

import { trackCTA } from "@/lib/analytics";

export function AuthNav() {
  return (
    <nav className="auth-nav">
      <a
        href="https://app.proselab.io/signup"
        className="auth-nav-cta"
        onClick={() => trackCTA("nav", "signup")}
      >
        Sign up
      </a>
    </nav>
  );
}
