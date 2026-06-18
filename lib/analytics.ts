declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, unknown> },
    ) => void;
    umami?: { track: (event: string, props?: Record<string, unknown>) => void };
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

export function trackCTA(
  location: string,
  destination: string,
  extra?: Record<string, unknown>,
) {
  const props = { location, destination, ...extra };
  trackPlausibleEvent("cta", props);
  window.umami?.track("cta", props);
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  trackPlausibleEvent(name, props);
  window.umami?.track(name, props);
}
