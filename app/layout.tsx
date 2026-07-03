import type { Metadata } from "next";
import Script from "next/script";

import { AuthProvider } from "@/providers/AuthProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Bullions",
  description: "Bullions AI Trading Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18184728367"
          strategy="afterInteractive"
        />

        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18184728367');
          `}
        </Script>
      </body>
    </html>
  );
}
