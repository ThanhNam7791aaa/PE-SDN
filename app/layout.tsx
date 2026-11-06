import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ReadingLogProvider } from "@/context/reading-log-context";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "ReadLog - Track Personal Reading Sessions",
  description: "Track your personal reading sessions, categorize by genre, and monitor minutes read.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <AuthProvider>
          <ReadingLogProvider>
            <Header />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          </ReadingLogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
