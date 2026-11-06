"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [authError, setAuthError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getEmailError = (val: string) => {
    if (!val.trim()) return "Email is required";
    if (!EMAIL_REGEX.test(val.trim())) return "Please enter a valid email address";
    return "";
  };

  const getPasswordError = (val: string) => {
    if (!val) return "Password is required";
    if (val.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const getConfirmPasswordError = (confirmVal: string, passVal: string) => {
    if (!confirmVal) return "Confirm password is required";
    if (confirmVal !== passVal) return "Passwords do not match";
    return "";
  };

  const emailError = hasSubmitted ? getEmailError(email) : "";
  const passwordError = hasSubmitted ? getPasswordError(password) : "";
  const confirmPasswordError = hasSubmitted ? getConfirmPasswordError(confirmPassword, password) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setAuthError("");
    setSuccessMessage("");

    const eErr = getEmailError(email);
    const pErr = getPasswordError(password);
    const cpErr = getConfirmPasswordError(confirmPassword, password);

    if (eErr || pErr || cpErr) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Registration failed");
      } else {
        setSuccessMessage("Registration successful");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setHasSubmitted(false);
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
          <CardTitle className="text-2xl font-serif">Create your journal</CardTitle>
          <CardDescription className="text-sm">
            Sign up to start tracking your daily reading habits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            noValidate
            data-testid="register-form"
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

            {successMessage && (
              <div
                data-testid="form-success"
                className="p-3 text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
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
                  data-testid="register-email"
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
                  data-testid="register-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError("");
                  }}
                  placeholder="At least 6 characters"
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

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  data-testid="register-confirm-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setAuthError("");
                  }}
                  placeholder="Repeat your password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <div
                  data-testid="error-confirm-password"
                  className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{confirmPasswordError}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full mt-2 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/60 py-4">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
