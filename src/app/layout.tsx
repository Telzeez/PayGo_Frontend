import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PayGo",
  description: "Prepaid solar-energy metering and billing platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PayGo",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090B", // zinc-950
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased min-h-screen`}>
      <body className="min-h-screen flex flex-col font-sans">
        {process.env.NEXT_PUBLIC_PAYGO_MAINTENANCE_MODE !== 'false' ? (
          <main className="flex min-h-screen flex-1 items-center justify-center bg-zinc-950 px-6 text-center text-white">
            <section className="w-full max-w-lg">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">PayGo</p>
              <h1 className="mb-4 text-3xl font-semibold tracking-tight">We’ll be back shortly.</h1>
              <p className="text-base leading-7 text-zinc-300">
                PayGo is temporarily unavailable while we complete a security and authentication update.
                Your account and transaction records remain safe and unchanged. Please check back later.
              </p>
            </section>
          </main>
        ) : (
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <AuthProvider>
              {children}
              <CookieConsent />
            </AuthProvider>
          </GoogleOAuthProvider>
        )}
      </body>
    </html>
  );
}
