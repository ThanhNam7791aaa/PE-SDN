import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Lightbulb, Clock, Star, Calendar, ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background radial gradient mesh + faint dotted grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-40 -z-10" />
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent border border-indigo-200/50 text-primary text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>A calm, premium reading journal</span>
          </div>

          <h1
            data-testid="home-title"
            className="font-serif text-4xl sm:text-6xl font-medium tracking-tight text-foreground leading-[1.15]"
          >
            ReadLog
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
            A quiet sanctuary to record your reading sessions, track your time, and understand how your literary habits unfold.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="rounded-xl gap-2 shadow-sm font-medium">
                Start your journal
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="rounded-xl font-medium">
                Sign in to continue
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative floating preview card (pure CSS, NO TESTIDS) */}
        <div className="max-w-lg mx-auto mb-20 px-2 sm:px-0">
          <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur shadow-subtle p-5 sm:p-6 transition-all hover:shadow-subtle-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                Latest session
              </span>
              <div className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                <Star className="h-4 w-4 fill-amber-400" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-serif font-medium text-lg text-foreground">
                  Atomic Habits
                </h4>
                <span className="font-medium text-sm text-foreground bg-secondary px-2.5 py-0.5 rounded-full tabular-nums">
                  45 mins
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-medium">
                  Non-Fiction
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Today
                </span>
              </div>

              <p className="text-xs text-muted-foreground italic pt-1 border-t border-border/50">
                &ldquo;Tiny changes remarkable results. Focus on systems rather than goals.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* 3 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-primary/40 motion-safe:hover:-translate-y-0.5 transition-all">
            <CardHeader className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Log every session</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Record book title, duration, and notes with effortless precision.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Capture the context and thoughts that make each reading hour meaningful.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 motion-safe:hover:-translate-y-0.5 transition-all">
            <CardHeader className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center">
                <Lightbulb className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Sort by genre</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Organize your library by Fiction, Non-Fiction, Sci-Fi, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Filter instantly to explore your reading habits across diverse genres.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 motion-safe:hover:-translate-y-0.5 transition-all">
            <CardHeader className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg sm:text-xl">See minutes read</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Live summaries of total time invested in your reading journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Watch your hours add up with real-time visual breakdown bars.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Tagline */}
        <footer className="mt-20 pt-8 border-t border-border/60 text-center text-xs text-muted-foreground">
          <p>ReadLog &mdash; Crafted for thoughtful readers everywhere.</p>
        </footer>
      </div>
    </div>
  );
}
