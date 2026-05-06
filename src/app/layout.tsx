import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ad Script Prompt Builder",
  description: "A private prompt-building workspace for high-converting video ad scripts and copy.",
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
