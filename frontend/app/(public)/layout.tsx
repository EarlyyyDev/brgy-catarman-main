"use client"

import { Navbar } from "@/components/public/navbar"
import { Footer } from "@/components/public/footer"
import { PublicActionDialogs } from "@/components/public/public-action-dialogs"
import { AiAssistantWidget } from "@/components/public/ai-assistant-widget"
import { MaintenanceScreen } from "@/components/public/maintenance-screen"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { settings } = usePublicSettings()

  if (settings.maintenanceMode) {
    return <MaintenanceScreen barangayName={settings.barangayName} message={settings.maintenanceMessage} />
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[6.25rem]">{children}</main>
      <Footer />
      <PublicActionDialogs />
      <AiAssistantWidget />
    </>
  )
}
