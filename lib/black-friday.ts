/**
 * Black Friday yearly offer.
 *
 * Mirrors LucaLyon1/writinggym `lib/black-friday.ts` on main: the promo code,
 * the live window, and the price a visitor is shown cannot drift apart.
 *
 *   code      BLACKFRIDAY26
 *   discount  flat $20 off the $99 yearly price, USD (Core and Premium)
 *   expires   2026-11-30T23:59:00Z, matching the Whop promo expiry
 */

export const BLACK_FRIDAY_PROMO_CODE = "BLACKFRIDAY26"

/** Wednesday 25 November 2026, 00:00 UTC. */
export const BLACK_FRIDAY_STARTS_AT = Date.parse("2026-11-25T00:00:00Z")

/** Monday 30 November 2026, 23:59:00 UTC. Matches the Whop promo expiry and writinggym lib/black-friday.ts after #38. Europe/London is UTC in November. */
export const BLACK_FRIDAY_ENDS_AT = Date.parse("2026-11-30T23:59:00Z")

export function isBlackFridayActive(now: number = Date.now()): boolean {
  return now >= BLACK_FRIDAY_STARTS_AT && now <= BLACK_FRIDAY_ENDS_AT
}
