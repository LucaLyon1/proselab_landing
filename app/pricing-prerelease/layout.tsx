import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing • ProseLab',
  description:
    'Pre-release pricing for ProseLab. Lock in launch pricing by joining the waitlist now.',
  openGraph: {
    url: 'https://www.proselab.io/pricing-prerelease',
    type: 'website',
    title: 'Pricing • ProseLab',
    description:
      'Pre-release pricing for ProseLab. Lock in launch pricing by joining the waitlist now.',
  },
  twitter: {
    card: 'summary_large_image',
    site: 'proselab.io',
    title: 'Pricing • ProseLab',
    description:
      'Pre-release pricing for ProseLab. Lock in launch pricing by joining the waitlist now.',
  },
};

export default function PricingPrereleaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
