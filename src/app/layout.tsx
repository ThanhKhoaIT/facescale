import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { auth, signOut } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
      className={`${plexSans.variable} ${plexMono.variable} min-h-dvh antialiased ${session?.user ? "bg-paper-muted" : "bg-ink"}`}
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this rule targets Pages Router _document.js; app/layout.tsx is the App Router equivalent global head */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`min-h-dvh flex flex-col ${session?.user ? "bg-paper-muted" : "bg-ink"}`}>
        {session?.user ? (
          <div className="flex flex-1 flex-col sm:flex-row">
            <MobileNav
              role={session.user.role}
              onSignOut={async () => {
                "use server";
                await signOut();
              }}
            />
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
