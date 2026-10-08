"use client"

import { LoaderCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export interface SubmissionStatusValue {
  message: string
  progress?: number
}

export function SubmissionStatus({ status }: { status: SubmissionStatusValue }) {
  return (
    <div role="status" aria-live="polite" className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" />
        <span>{status.message}</span>
      </div>
      {status.progress !== undefined ? (
        <div className="space-y-1 pl-6">
          <Progress value={status.progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground">{status.progress}% sent; waiting for the server to finish saving it.</p>
        </div>
      ) : null}
    </div>
  )
}
