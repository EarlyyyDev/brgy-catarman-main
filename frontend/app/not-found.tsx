import Link from "next/link"
import { Compass, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BarangaySeal } from "@/components/shared/barangay-seal"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 px-4 text-center">
      <BarangaySeal className="size-16" />
      <div>
        <p className="font-heading text-7xl font-extrabold text-primary">404</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-foreground">Page Not Found</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          The page you are looking for may have been moved, removed, or does not exist.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="size-4" />
            Back to Homepage
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/track-request">
            <Compass className="size-4" />
            Track a Request
          </Link>
        </Button>
      </div>
    </div>
  )
}
