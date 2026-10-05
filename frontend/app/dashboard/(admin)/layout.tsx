"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useMe } from "@/lib/api/hooks/use-auth"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session } = useMe()

  React.useEffect(() => {
    if (session && session.role !== "Administrator") {
      toast.error("You do not have permission to access this page.")
      router.replace("/dashboard/overview")
    }
  }, [session, router])

  if (!session || session.role !== "Administrator") return null

  return <>{children}</>
}
