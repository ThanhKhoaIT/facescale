import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Facescale",
  description: "Headscale + Tailscale UI/UX for managing members & devices at Lixibox",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {session?.user ? (
          <div className="flex flex-1">
            <Sidebar role={session.user.role} />
            <div className="flex flex-1 flex-col">{children}</div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
