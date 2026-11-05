"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Create an account</CardTitle>
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
                className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
              >
                {authError}
              </div>
            )}

            {successMessage && (
              <div
                data-testid="form-success"
                className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md"
              >
                {successMessage}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
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
                data-testid="register-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError("");
                }}
                placeholder="At least 6 characters"
              />
              {passwordError && (
                <p data-testid="error-password" className="text-xs text-red-600 mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                data-testid="register-confirm-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setAuthError("");
                }}
                placeholder="Repeat password"
              />
              {confirmPasswordError && (
                <p data-testid="error-confirm-password" className="text-xs text-red-600 mt-1">
                  {confirmPasswordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t py-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

