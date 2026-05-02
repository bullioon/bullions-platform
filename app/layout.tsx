import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bullions",
  description: "Copy-trading and trader funding platform.",
  icons: {
    icon: [
      { url: "/favicon.png?v=99", type: "image/png" },
      { url: "/icon.png?v=99", type: "image/png" },
    ],
    shortcut: ["/favicon.png?v=99"],
    apple: ["/apple-touch-icon.png?v=99"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050607] text-white">
        {children}
      </body>
    </html>
  );
}
