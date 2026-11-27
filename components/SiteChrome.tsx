"use client";

import { useEffect, useRef } from "react";
import { BlackFridayBanner } from "@/components/BlackFridayBanner";

/**
 * In-flow, sticky top chrome (offer banner + site header). Keeping these in
 * normal document flow means page content always starts below them, whatever
 * height the banner wraps to and whether or not it is showing.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      document.documentElement.style.setProperty(
        "--site-chrome-height",
        `${el.offsetHeight}px`,
      );
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--site-chrome-height");
    };
  }, []);

  return (
    <div className="site-chrome" ref={ref}>
      <BlackFridayBanner />
      {children}
    </div>
  );
}
