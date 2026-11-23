import type { Metadata } from "next";
import { IBM_Plex_Mono, Literata, Syne } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Palawan Wildlife",
    template: "%s · Palawan Wildlife",
  },
  description:
    "Field guide and sighting reporter for the endemic wildlife of Palawan, Philippines.",
  openGraph: {
    title: "Palawan Wildlife",
    description:
      "Identify species, learn the threats, and report what you see in the field.",
    locale: "en_PH",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${literata.variable} ${plexMono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
