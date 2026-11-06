"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen, LogOut } from "lucide-react";

export function Header() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const initialLetter = user?.email ? user.email[0].toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo mark + wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        >
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-serif font-semibold text-xl tracking-tight text-foreground">
            ReadLog
          </span>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    href="/reading-logs"
                    data-testid="link-reading-logs"
                    className={`text-sm font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                      pathname === "/reading-logs"
                        ? "text-primary font-semibold bg-accent"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Reading Logs
                  </Link>

                  {/* User Email Pill */}
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs sm:text-sm font-medium border border-border/60">
                    <span className="hidden sm:flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center font-bold text-[11px]">
                      {initialLetter}
                    </span>
                    <span
                      data-testid="user-email"
                      className="truncate max-w-[32vw] sm:max-w-[200px]"
                    >
                      {user.email}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid="btn-logout"
                    onClick={logout}
                    className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="btn-login"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" data-testid="btn-register">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
