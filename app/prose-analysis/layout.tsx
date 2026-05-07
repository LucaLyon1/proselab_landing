import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Who Do You Write Like? \u2022 ProseLab',
  description:
    'Write a short passage and discover which renowned author your prose most resembles. Free prose analysis powered by AI.',
  openGraph: {
    url: 'https://www.proselab.io/prose-analysis',
    type: 'website',
    title: 'Who Do You Write Like? \u2022 ProseLab',
    description:
      'Write a short passage and discover which renowned author your prose most resembles. Free prose analysis powered by AI.',
    images: [{ url: 'https://www.proselab.io/prose-analysis-opengraph.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: 'proselab.io',
    title: 'Who Do You Write Like? \u2022 ProseLab',
    description:
      'Write a short passage and discover which renowned author your prose most resembles. Free prose analysis powered by AI.',
    images: ['https://www.proselab.io/prose-analysis-opengraph.png'],
  },
};

export default function ProseAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
