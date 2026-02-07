import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Record",
  description: "Track your expenses with ease",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="mx-auto min-h-screen max-w-md pb-24">
            {children}
          </main>
          <NavBar />
        </Providers>
      </body>
    </html>
  );
}
