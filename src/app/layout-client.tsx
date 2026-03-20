// "use client";

// import { SessionProvider } from "next-auth/react";
// import { Toaster } from "react-hot-toast";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export default function ClientLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
//       <SessionProvider>{children}</SessionProvider>
//       <Toaster position="top-right" reverseOrder={false} />
//     </body>
//   );
// }


// layout-client.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </SessionProvider>
  );
}
