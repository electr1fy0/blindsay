import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "Unsaid";
const siteDescription = "Anonymous inboxes for the words people never said out loud.";

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: "%s · Unsaid",
  },
  description: siteDescription,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  icons: {
    icon: "/unsaid.png",
    apple: "/unsaid.png",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    images: ["/unsaid.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/unsaid.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistMono.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
