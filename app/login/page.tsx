"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { checkAuth } = useAuth();
  const router = useRouter();

  const getEmailError = (val: string) => {
    if (!val.trim()) return "Email is required";
    if (!EMAIL_REGEX.test(val.trim())) return "Please enter a valid email address";
    return "";
  };

  const getPasswordError = (val: string) => {
    if (!val) return "Password is required";
    return "";
  };

  const emailError = hasSubmitted ? getEmailError(email) : "";
  const passwordError = hasSubmitted ? getPasswordError(password) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setAuthError("");

    const eErr = getEmailError(email);
    const pErr = getPasswordError(password);

    if (eErr || pErr) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Invalid email or password");
      } else {
        await checkAuth();
        router.push("/reading-logs");
      }
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-10" />
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <Card className="w-full max-w-md shadow-subtle border-border/80">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-serif">Welcome back</CardTitle>
          <CardDescription className="text-sm">
            Sign in to access your reading sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            noValidate
            data-testid="login-form"
            className="space-y-4"
          >
            {authError && (
              <div
                data-testid="error-auth"
                className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  data-testid="login-email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError("");
                  }}
                  placeholder="name@example.com"
                  className="pl-10"
                />
              </div>
              {emailError && (
                <div
                  data-testid="error-email"
                  className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  data-testid="login-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError("");
                  }}
                  placeholder="Your password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <div
                  data-testid="error-password"
                  className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full mt-2 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/60 py-4">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline transition-colors"
            >
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
