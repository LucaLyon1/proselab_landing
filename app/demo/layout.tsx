import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rewrite Woolf, Demo the App • ProseLab",
  description:
    "Try ProseLab on a single passage from Virginia Woolf. Rewrite it with the constraint, get a craft scorecard.",
  openGraph: {
    url: "https://www.proselab.io/demo",
    type: "website",
    title: "Demo — Rewrite Woolf • ProseLab",
    description:
      "Try ProseLab on a single passage from Virginia Woolf. Rewrite it with the constraint, get a craft scorecard.",
  },
  twitter: {
    card: "summary_large_image",
    site: "proselab.io",
    title: "Demo — Rewrite Woolf • ProseLab",
    description:
      "Try ProseLab on a single passage from Virginia Woolf. Rewrite it with the constraint, get a craft scorecard.",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
