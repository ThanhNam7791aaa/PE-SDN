"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Sign In</CardTitle>
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
                className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
              >
                {authError}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
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
              />
              {emailError && (
                <p data-testid="error-email" className="text-xs text-red-600 mt-1">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                data-testid="login-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError("");
                }}
                placeholder="Your password"
              />
              {passwordError && (
                <p data-testid="error-password" className="text-xs text-red-600 mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Log In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t py-4">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
