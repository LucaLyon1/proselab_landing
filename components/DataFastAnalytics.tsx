'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { initAnalytics, getAnalytics, optOutAnalytics } from '@/lib/analytics';

function hasAnalyticsConsent(): boolean {
  if (typeof document === 'undefined') return false;
  const match = document.cookie.match(/cookieyes-consent=([^;]+)/);
  if (!match) return false;
  return /analytics:yes/.test(decodeURIComponent(match[1]));
}

export function DataFastAnalytics() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // On mount: initialize if already consented, and listen for future consent changes
  useEffect(() => {
    if (hasAnalyticsConsent()) {
      initAnalytics().then((analytics) => analytics.trackPageview(pathnameRef.current));
    }

    const handleConsent = (event: Event) => {
      const detail = (event as CustomEvent<{ accepted: string[]; rejected: string[] }>).detail ?? {};
      const accepted = detail.accepted ?? [];
      const rejected = detail.rejected ?? [];

      if (accepted.includes('analytics')) {
        initAnalytics().then((analytics) => analytics.trackPageview(pathnameRef.current));
      } else if (rejected.includes('analytics')) {
        optOutAnalytics();
      }
    };

    document.addEventListener('cookieyes:consent', handleConsent);
    return () => document.removeEventListener('cookieyes:consent', handleConsent);
  }, []);

  // Track route changes once analytics is initialized
  useEffect(() => {
    getAnalytics()?.trackPageview(pathname);
  }, [pathname]);

  return null;
}
