// import type { Metadata } from "next";
// import { ClerkProvider } from "@clerk/nextjs";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: "Ripple",
//   description: "Stay hydrated, one reminder at a time.",
//   // icons: {
//   //   icon: "/android-chrome-512x512.png",
//   // },
//   icons: {
//     icon: "/android-chrome-512x512.png?v=2",
//   },
// };

// export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <ClerkProvider>
//       <html lang="en" suppressHydrationWarning>
//         <body>{children}</body>
//       </html>
//     </ClerkProvider>
//   );
// }

import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import AppSplash from "@/components/AppSplash";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ripple",
  description: "Stay hydrated, one reminder at a time.",
  applicationName: "Ripple",
  appleWebApp: {
    capable: true,
    title: "Ripple",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#409e9e",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <AppSplash />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
