'use client'

import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Providers } from "@/contexts/Providers"
import { ConnectButton } from "@rainbow-me/rainbowkit";

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-center bg-no-repeat bg-black bg-[radial-gradient(circle_at_center,_rgba(153,27,27,0.2)_0%,_black_80%)]`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="py-4">
              <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10">
                    <img
                      src="/logo.svg"
                      alt="iLayer Logo" />
                  </div>
                  <h1 className="hidden md:flex text-xl font-semibold text-white">iLayer Orderbook</h1>
                </div>
                <ConnectButton
                  chainStatus={"none"}
                  showBalance={false}
                  accountStatus={{
                    smallScreen: "avatar",
                    largeScreen: "full",
                  }}
                />
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body >
    </html >
  )
}
