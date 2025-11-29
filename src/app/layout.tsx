import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import ClientProviders from "@/components/ClientProviders"; // Import the wrapper
import "./globals.css";

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair" 
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

export const metadata: Metadata = {
  title: "The Next Dawn | Future Intelligence",
  description: "Real-time probabilistic news from the future, powered by Polymarket and AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}