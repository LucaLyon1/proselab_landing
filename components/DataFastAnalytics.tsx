'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getAnalytics } from '@/lib/analytics';

export function DataFastAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      const analytics = await getAnalytics();
      analytics.trackPageview();
    })();
  }, [pathname]);

  return null;
}
