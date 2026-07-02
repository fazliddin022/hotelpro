import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HotelPro — Hotel Management System",
  description: "Modern hotel management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={geist.variable}>
      <body className="font-sans antialiased bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}