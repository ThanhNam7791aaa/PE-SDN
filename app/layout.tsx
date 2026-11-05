import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ExpenseProvider } from "@/context/expense-context";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "ExpenseTrail - Personal Expense Tracker",
  description: "Track your personal expenses, categorize spending, and stay on top of your budget.",
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
          <ExpenseProvider>
            <Header />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          </ExpenseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
