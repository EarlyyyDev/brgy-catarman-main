"use client"

import * as React from "react"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"
import { applyPrimaryColor, applyAccentColor } from "@/lib/theme-color"

export function ThemeColorSync() {
  const { settings } = usePublicSettings()
  const { themePrimaryColor: primary, themeAccentColor: accent } = settings

  React.useEffect(() => {
    applyPrimaryColor(primary)
  }, [primary])

  React.useEffect(() => {
    applyAccentColor(accent)
  }, [accent])

  return null
}
