import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://shining-food-owner-demo.linkist39.chatgpt.site";
const title = "SHINING food｜デモサイト";
const description = "SHINING foodのデリバリー・テイクアウトを体験できるデモサイトです。実際のご注文・決済は行われません。";
const socialImage = {
  url: `${siteUrl}/og.png`,
  width: 1731,
  height: 909,
  alt: "SHINING food｜全国の気になるおいしさを、北軽井沢・嬬恋へ。",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "SHINING food",
    title,
    description,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {capable:true, statusBarStyle:"default", title:"SHINING food"},
  robots: { index: false, follow: false },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#174c3b"};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
