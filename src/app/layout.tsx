import type { Metadata } from "next";
import { Provider as ChackraProvider } from "../components/ui/provider";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { SwapProvider } from "@/contexts/SwapContext";
// import "./globals.css";

export const metadata: Metadata = {
  title: "iLayer Swap",
  description: "Crosschain Swaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ChackraProvider>
          <ColorModeProvider>
            <ConfigProvider configPath="config.json">
              <SwapProvider>{children}</SwapProvider>
            </ConfigProvider>
          </ColorModeProvider>
        </ChackraProvider>
      </body>
    </html>
  );
}
