"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { OfflineBanner } from "@/components/shared/offline-banner"
import { FaviconSync } from "@/components/shared/favicon-sync"
import { ServerClockSync } from "@/components/shared/server-clock-sync"
import { ThemeColorSync } from "@/components/dashboard/theme-color-sync"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <FaviconSync />
        <ServerClockSync />
        <ThemeColorSync />
        <OfflineBanner />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--card)",
              color: "var(--card-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: {
                primary: "#15803d",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#dc2626",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
