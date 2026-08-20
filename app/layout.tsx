import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthNav } from "@/components/auth/AuthNav";

export const viewport: Viewport = {
  themeColor: "#f5f0e8",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ProseLab",
  description:
    "Train your voice. Study passages with AI craft analysis, write your own version, get feedback, and track your progress.",
  openGraph: {
    url: "https://www.proselab.io/",
    type: "website",
    title: "ProseLab",
    description:
      "Train your voice. Study passages with AI craft analysis, write your own version, get feedback, and track your progress.",
    images: [{ url: "https://www.proselab.io/opengraph.png" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "proselab.io",
    title: "ProseLab",
    description:
      "Train your voice. Study passages with AI craft analysis, write your own version, get feedback, and track your progress.",
    images: ["https://www.proselab.io/opengraph.png"],
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

const whopPixelSnippet = `<script>!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_tGIL6R2J3Z0k5p");whop.track("page");</script>`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`light ${GeistMono.variable}`}>
      <head dangerouslySetInnerHTML={{ __html: whopPixelSnippet }} />
      <body>
        <header className="auth-header">
          <Link href="/" className="auth-header-logo">
            ProseLab
          </Link>
          <AuthNav />
        </header>
        {children}
        <Script
          defer
          data-domain="www.proselab.io"
          data-api="/assets/pl/api/event"
          src="/assets/pl/js/pa-R4Nu9a6RngMVOiNn7nRID.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-queue" strategy="beforeInteractive">{`
          window.plausible = window.plausible || function() {
            window.plausible.q = window.plausible.q || [];
            window.plausible.q.push(arguments);
          };
        `}</Script>
        <Script
          id="cookieyes"
          type="text/javascript"
          src="https://cdn-cookieyes.com/client_data/89f12ea21621052ee39f69acc448847c/script.js"
          strategy="afterInteractive"
        />
        <Script
          defer
          data-website-id="51d4b355-7309-41fd-84c5-cd2218b76b82"
          src="https://cloud.umami.is/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
