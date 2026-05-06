import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ad Script Prompt Builder",
  description: "A prompt-building workspace for high-converting video ad scripts and copy.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
