import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 mb-16">
        <h1
          data-testid="home-title"
          className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl"
        >
          ExpenseTrail
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600">
          A modern personal expense tracker designed to help you take control of your daily finances with real-time analytics and category breakdown.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Link href="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Track spending</CardTitle>
            <CardDescription>Log your daily purchases with precision</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Easily record what you spent, the amount, date, and optional notes to keep track of every dollar.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Sort into categories</CardTitle>
            <CardDescription>Organize your money logically</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Categorize expenses into Food, Transport, Bills, Shopping, or Other for effortless filtering.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>See where it goes</CardTitle>
            <CardDescription>Real-time visual summaries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View live totals, star important expenses, and examine a detailed breakdown of your highest spending areas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

