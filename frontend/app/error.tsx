"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BarangaySeal } from "@/components/shared/barangay-seal"

export default function GlobalErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 px-4 text-center">
      <BarangaySeal className="size-16" />
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
        <AlertTriangle className="size-8" />
      </div>
      <div>
        <p className="font-heading text-5xl font-extrabold text-primary">500</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-foreground">Something Went Wrong</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred while processing your request. Please try again or return to the homepage.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>
          <RefreshCcw className="size-4" />
          Try Again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="size-4" />
            Back to Homepage
          </Link>
        </Button>
      </div>
    </div>
  )
}
