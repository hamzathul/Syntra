import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppProviders } from "./providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Syntra ERP",
    template: "%s | Syntra ERP",
  },
  description:
    "Syntra ERP is an open-source microservice ERP system: Next.js frontend, Express Core (auth) and ERP APIs, and an AI chatbot over live ERP data.",
  keywords: [
    "ERP",
    "ERP system",
    "open source ERP",
    "Next.js",
    "Express",
    "Prisma",
    "AI chatbot",
  ],
  authors: [{ name: "Hamzathul Favas E" }],
  creator: "Hamzathul Favas E",
  // TODO: set metadataBase + opengraph images once a production domain and
  // social preview image (e.g. public/og-image.png, 1200x630) exist.
  openGraph: {
    type: "website",
    siteName: "Syntra ERP",
    title: "Syntra ERP",
    description:
      "Open-source microservice ERP with Next.js, Express APIs, and an AI chatbot.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntra ERP",
    description:
      "Open-source microservice ERP with Next.js, Express APIs, and an AI chatbot.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
