import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"

export const metadata: Metadata = {
  title: "CVE LabHub - 보안 학습 플랫폼",
  description: "CVE & 랜섬웨어 학습/실습 플랫폼",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Header />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
