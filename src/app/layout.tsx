import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LeashBuddy - Custom Dog Accessories Powered by AI",
  description:
    "Create custom dog accessories that look just like your pup. Upload a photo and get AI-generated product specs, 3D previews, and crochet patterns powered by PupStitch.",
  keywords: [
    "leashbuddy",
    "dog accessories",
    "poop bag holder",
    "treat pouch",
    "custom pet products",
    "AI",
    "crochet",
    "amigurumi",
    "pupstitch",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background-warm text-text-warm`}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
