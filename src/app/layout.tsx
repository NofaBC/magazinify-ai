// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // keep if you have Tailwind/global styles

export const metadata: Metadata = {
  title: "Magazinify AI™",
  description: "Business-branded AI magazines with interactive flipbook viewer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
