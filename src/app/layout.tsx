
import type { Metadata } from "next";
import ClientLayout from "./layout-client";
import 'leaflet/dist/leaflet.css';


export const metadata: Metadata = {
  title: "Vroom",
  description: "Your Journey, Our Cars",
  icons: {
    icon: "/favicon.ico", // The main favicon format
    shortcut: "/favicon.ico", 
    apple: "/apple-touch-icon.png", 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}


