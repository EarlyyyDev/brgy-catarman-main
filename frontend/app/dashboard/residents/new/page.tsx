"use client"

import { useRouter } from "next/navigation"
import { ResidentFormDialog } from "@/components/dashboard/residents/resident-form-dialog"

export default function NewResidentPage() {
  const router = useRouter()

  return (
    <div className="mx-auto w-full max-w-5xl">
      <ResidentFormDialog
        open
        fullPage
        onOpenChange={(open) => {
          if (!open) router.push("/dashboard/residents")
        }}
      />
    </div>
  )
}