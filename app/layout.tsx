import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHINING food｜デリバリー・テイクアウト",
  description: "全国の気になるおいしさを、北軽井沢・嬬恋へ。",
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
