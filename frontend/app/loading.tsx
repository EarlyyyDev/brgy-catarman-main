import { BarangaySeal } from "@/components/shared/barangay-seal"

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <BarangaySeal className="size-12 animate-pulse" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  )
}
