import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "Ripple",
  description: "Stay hydrated, one reminder at a time.",
  // icons: {
  //   icon: "/android-chrome-512x512.png",
  // },
  icons: {
    icon: "/android-chrome-512x512.png?v=2",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          {children}
          <CookieBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}
