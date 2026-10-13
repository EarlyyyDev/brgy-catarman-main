import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ecatarman.online"),
  alternates: {
    canonical: "/",
  },
  applicationName: "e-Catarman",
  title: {
    default: "e-Catarman | Digital Barangay Operations Management System",
    template: "%s | e-Catarman",
  },
  description:
    "e-Catarman is the official digital barangay system for Barangay Catarman, featuring barangay history, current officials, emergency hotlines, public services, announcements, and online requests.",
  keywords: [
    "Barangay Catarman",
    "Catarman history",
    "Barangay officials Catarman",
    "Barangay emergency hotline Catarman",
    "Barangay services Catarman",
    "Barangay announcements Catarman",
    "Barangay certificate request Catarman",
    "Barangay report incident Catarman",
    "Digital barangay system",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Barangay Catarman | Digital Barangay Operations Management System",
    description:
      "Official community portal for Barangay Catarman — accessible services, council officials, emergency contacts, announcements, and public records.",
    siteName: "Barangay Catarman",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barangay Catarman",
    description:
      "Official digital barangay system for Barangay Catarman, including public announcements, emergency hotlines, and community information.",
  },
  icons: {
    icon: "/catarman-logo.jpg",
    shortcut: "/catarman-logo.jpg",
    apple: "/catarman-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
