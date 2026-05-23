import type { Metadata } from "next";
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
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18184728367"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18184728367');
            `,
          }}
        />
      </head>

      <body>{children}</body>
    </html>
  );
}
