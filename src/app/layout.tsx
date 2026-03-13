import type { Metadata, Viewport } from "next";
import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Events Mini App",
  description: "Telegram mini app for employee clubs and events",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Telegram WebApp SDK - КРИТИЧЕСКИ ВАЖНО для Mini App */}
        <script src="https://telegram.org/js/telegram-web-app.js" async />

        {/* Preload critical logo */}
        <link rel="preload" href="/some-logo.svg" as="image" type="image/svg+xml" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
