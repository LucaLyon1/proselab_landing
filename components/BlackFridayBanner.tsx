"use client";

import { useEffect } from "react";
import { trackCTA } from "@/lib/analytics";
import {
  BLACK_FRIDAY_ENDS_AT,
  BLACK_FRIDAY_STARTS_AT,
  isBlackFridayActive,
} from "@/lib/black-friday";

const PRICING_URL = "https://app.proselab.io/pricing";

/**
 * Site-wide Black Friday strip. Always rendered so server and client HTML
 * match. Visibility is a class on <html>: a blocking script sets it before
 * first paint, and this effect keeps it in sync until the window closes.
 */
export function BlackFridayBanner() {
  useEffect(() => {
    const sync = () => {
      document.documentElement.classList.toggle(
        "bf-live",
        isBlackFridayActive(),
      );
    };
    sync();
    const now = Date.now();
    const delays = [
      BLACK_FRIDAY_STARTS_AT - now,
      BLACK_FRIDAY_ENDS_AT - now + 1,
    ].filter((ms) => ms > 0);
    const timers = delays.map((ms) => window.setTimeout(sync, ms));
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  return (
    <a
      href={PRICING_URL}
      className="bf-banner"
      onClick={() => trackCTA("bf_banner", "pricing")}
      aria-label="Black Friday offer: a year of ProseLab for $79. See pricing."
    >
      <span className="bf-banner-label">Black Friday</span>
      <span className="bf-banner-text">
        A year of ProseLab for $79, $20 off. Ends Monday 30 November.
      </span>
      <span className="bf-banner-text">
        Code <code className="bf-banner-code">BLACKFRIDAY26</code>
      </span>
      <span className="bf-banner-cta">See pricing</span>
    </a>
  );
}
