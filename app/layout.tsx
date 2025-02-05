"use client"
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-context"
import CustomTitleBar from "@/lib/titlebar"
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// export const metadata: Metadata = {
//   title: "Connectify Desktop",
//   description: "Connectify Desktop is a versatile app built with Tauri and Next.js that syncs your mobile devices with your PC. Available for macOS, Windows, and Linux.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden`}
      >
        <CustomTitleBar />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="h-full overflow-auto pt-10">
            {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
