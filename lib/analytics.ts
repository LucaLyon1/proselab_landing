declare global {
  interface Window {
    datafast?: (event: string, props?: Record<string, unknown>) => void;
    umami?: { track: (event: string, props?: Record<string, unknown>) => void };
  }
}

export function trackCTA(
  location: string,
  destination: string,
  extra?: Record<string, unknown>,
) {
  const props = { location, destination, ...extra };
  window.datafast?.("cta", props);
  window.umami?.track("cta", props);
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  window.datafast?.(name, props);
  window.umami?.track(name, props);
}
