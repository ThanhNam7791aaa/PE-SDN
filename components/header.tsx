"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-blue-600 flex items-center gap-2">
          ReadLog
        </Link>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <span data-testid="user-email" className="text-sm font-medium text-gray-700">
                    {user.email}
                  </span>
                  <Link
                    href="/reading-logs"
                    data-testid="link-reading-logs"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Reading Logs
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="btn-logout"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm" data-testid="btn-login">
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
