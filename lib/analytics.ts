import posthog from "posthog-js";

declare global {
  interface Window {
    umami?: { track: (event: string, props?: Record<string, unknown>) => void };
    whop?: {
      track: (event: string, data?: WhopTrackData) => void;
    };
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
  window.umami?.track("cta", props);
  trackPostHog("cta", props);
  trackPostHog("landing_cta_clicked", props);
  if (destination === "app" || destination === "signup") {
    window.whop?.track("app_click");
  }
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  window.umami?.track(name, props);
  trackPostHog(name, props);
}

/** Fields the Whop pixel forwards on conversion events today. */
export type WhopTrackData = {
  email?: string;
  event_id?: string;
  value?: number;
  currency?: string;
};

export function trackWhopEvent(name: "lead", data?: WhopTrackData) {
  if (typeof window === "undefined") return;
  if (data && Object.keys(data).length > 0) {
    window.whop?.track(name, data);
  } else {
    window.whop?.track(name);
  }
}

function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

async function sha256Hex(input: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return fnv1aHex(input);
  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Stable Whop `lead` event_id for one email. Whop counts each event name and
 * event_id pair once, so resubmits collapse into one lead. Matches the id
 * app.proselab.io uses for the same email at signup.
 */
export async function whopLeadEventId(email: string): Promise<string> {
  const hex = await sha256Hex(email.trim().toLowerCase());
  return `lead_${hex.slice(0, 32)}`;
}

/**
 * Report an email capture to Whop. Fire it when the email is submitted:
 * the API stores the contact before the (slow, fallible) analysis runs, so
 * waiting for the analysis to succeed undercounts leads.
 */
export async function trackWhopLead(email: string) {
  const trimmed = email.trim();
  if (!trimmed) return;
  try {
    trackWhopEvent("lead", {
      email: trimmed,
      event_id: await whopLeadEventId(trimmed),
    });
  } catch {
    // Pixel is best-effort; never block the form.
  }
}
