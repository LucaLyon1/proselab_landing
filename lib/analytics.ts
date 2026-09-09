import posthog from "posthog-js";

declare global {
  interface Window {
    whop?: { track: (event: string) => void };
  }
}

function trackPostHog(name: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(name, props);
}

export function trackCTA(
  location: string,
  destination: string,
  extra?: Record<string, unknown>,
) {
  const props = { location, destination, ...extra };
  trackPostHog("cta", props);
  trackPostHog("landing_cta_clicked", props);
  if (destination === "app" || destination === "signup") {
    window.whop?.track("app_click");
  }
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  trackPostHog(name, props);
}

export function trackWhopEvent(name: "lead") {
  window.whop?.track(name);
}
