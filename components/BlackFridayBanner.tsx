"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { trackCTA } from "@/lib/analytics";
import {
  BLACK_FRIDAY_ENDS_AT,
  BLACK_FRIDAY_STARTS_AT,
  isBlackFridayActive,
} from "@/lib/black-friday";

const PRICING_URL = "https://app.proselab.io/pricing";

function subscribeToBlackFriday(onStoreChange: () => void) {
  const now = Date.now();
  const delays = [
    BLACK_FRIDAY_STARTS_AT - now,
    BLACK_FRIDAY_ENDS_AT - now + 1,
  ].filter((ms) => ms > 0);
  if (delays.length === 0) return () => {};
  const timers = delays.map((ms) => window.setTimeout(onStoreChange, ms));
  return () => {
    for (const timer of timers) window.clearTimeout(timer);
  };
}

/**
 * Site-wide Black Friday strip. The server snapshot is always hidden, and
 * the client snapshot is compared against the fixed UTC window after
 * hydration, so the banner cannot mismatch or outlive the offer.
 */
export function BlackFridayBanner() {
  const visible = useSyncExternalStore(
    subscribeToBlackFriday,
    isBlackFridayActive,
    () => false,
  );
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!visible) return;
    const el = ref.current;
    if (!el) return;
    const syncHeight = () => {
      document.documentElement.style.setProperty(
        "--bf-banner-height",
        `${el.offsetHeight}px`,
      );
    };
    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--bf-banner-height");
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <a
      ref={ref}
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
