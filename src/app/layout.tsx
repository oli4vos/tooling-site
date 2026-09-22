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
  applicationName: "IPC Ole",
  title: {
    default: "IPC Ole | Financiële rekentools",
    template: "%s | IPC Ole",
  },
  description:
    "Onafhankelijke, privaat ontwikkelde rekentools op basis van openbare brongegevens.",
  openGraph: {
    siteName: "IPC Ole",
    title: "IPC Ole | Financiële rekentools",
    description:
      "Onafhankelijke, privaat ontwikkelde rekentools op basis van openbare brongegevens.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "IPC Ole | Financiële rekentools",
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
