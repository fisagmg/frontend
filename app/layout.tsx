import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import MDXWrapper from "./MDXWrapper";

export const metadata: Metadata = {
  title: "CVExpert",
  description: "CVE & 랜섬웨어 학습/실습 플랫폼",
  generator: "v0.app",
  icons: {
    icon: "/cvexpert.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Header />
          <MDXWrapper>
            <main className="flex-1 pt-20">{children}</main>
          </MDXWrapper>
          <Footer />
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}