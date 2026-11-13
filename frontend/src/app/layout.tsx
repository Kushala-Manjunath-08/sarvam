
import type { Metadata } from "next";
import "./globals.css";
import HeritageChatbot from "./components/HeritageChatbot";
import SiteNavigation from "./components/SiteNavigation";

export const metadata: Metadata = {
  title: "Sarvam — A Living Atlas",
  description: "A journey through the places, people and living heritage of India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SiteNavigation />
        <HeritageChatbot />
      </body>
    </html>
  );
}
