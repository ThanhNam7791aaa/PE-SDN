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
          ReadLog
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600">
          A modern web app where you track your personal reading sessions: which book, how many minutes, what genre, and when.
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
            <CardTitle>Log every session</CardTitle>
            <CardDescription>Record book title, duration, and notes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Easily record what book you read, how many minutes you spent, and track your daily reading streak.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Sort by genre</CardTitle>
            <CardDescription>Organize your books by genre</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Classify your reading into Fiction, Non-Fiction, Sci-Fi, Biography, or Other for effortless filtering.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>See minutes read</CardTitle>
            <CardDescription>Real-time visual summaries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View live totals, favorite important sessions, and examine a detailed breakdown of your reading habits.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
