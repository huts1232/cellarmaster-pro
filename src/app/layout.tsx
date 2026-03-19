import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CellarMaster Pro — The ultimate digital wine cellar management platform for serious collectors",
  description: "CellarMaster Pro helps wine connoisseurs digitally manage their entire collection with AI-powered wine recognition, real-time valuation tracking, and ",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  )
}