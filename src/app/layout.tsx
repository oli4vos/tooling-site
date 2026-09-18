import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RuntimeMonitoringBootstrap } from "@/components/RuntimeMonitoringBootstrap";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-ui",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-ui",
});

export const metadata: Metadata = {
  applicationName: "Grip",
  title: {
    default: "Grip | Financiële rekentools",
    template: "%s | Grip",
  },
  description:
    "Onafhankelijke, privaat ontwikkelde rekentools op basis van openbare brongegevens.",
  openGraph: {
    siteName: "Grip",
    title: "Grip | Financiële rekentools",
    description:
      "Onafhankelijke, privaat ontwikkelde rekentools op basis van openbare brongegevens.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Grip | Financiële rekentools",
    description:
      "Onafhankelijke, privaat ontwikkelde rekentools op basis van openbare brongegevens.",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="nl">
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <RuntimeMonitoringBootstrap />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--deep)] focus:px-4 focus:py-2 focus:text-white"
        >
          Ga direct naar de inhoud
        </a>
        {children}
      </body>
    </html>
  );
}
