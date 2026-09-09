import posthog from "posthog-js";

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, unknown> },
    ) => void;
    umami?: { track: (event: string, props?: Record<string, unknown>) => void };
    whop?: { track: (event: string) => void };
  }
}

function trackPlausibleEvent(name: string, props?: Record<string, unknown>) {
  if (!window.plausible) return;
  if (props && Object.keys(props).length > 0) {
    window.plausible(name, { props });
    return;
  }

  window.plausible(name);
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
  trackPlausibleEvent("cta", props);
  window.umami?.track("cta", props);
  trackPostHog("cta", props);
  trackPostHog("landing_cta_clicked", props);
  if (destination === "app" || destination === "signup") {
    window.whop?.track("app_click");
  }
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  trackPlausibleEvent(name, props);
  window.umami?.track(name, props);
  trackPostHog(name, props);
}

export function trackWhopEvent(name: "lead") {
  window.whop?.track(name);
}
