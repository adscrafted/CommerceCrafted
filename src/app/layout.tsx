import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CommerceCrafted - Amazon Product Research Platform",
  description: "Professional Amazon product research, analysis, and opportunity discovery platform for FBA sellers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        <SessionProvider>
          <AnalyticsProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AnalyticsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
