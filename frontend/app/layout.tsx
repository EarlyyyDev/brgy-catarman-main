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
  title: {
    default: "e-Catarman | Digital Barangay Operations Management System",
    template: "%s | e-Catarman",
  },
  description:
    "e-Catarman, the official Digital Barangay Operations Management System of Barangay Catarman — request documents, track applications, report incidents, and stay informed of community announcements.",
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
