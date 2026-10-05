"use client"

import { cn } from "@/lib/utils"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"

export function BarangaySeal({ className }: { className?: string }) {
  const { settings } = usePublicSettings()
  const logoUrl = settings.logoUrl

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt="Barangay Catarman Official Seal"
        className={cn("size-10 rounded-full object-cover", className)}
      />
    )
  }

  return (
    <svg viewBox="0 0 100 100" className={cn("size-10", className)} role="img" aria-label="Barangay Catarman Official Seal">
      <defs>
        <linearGradient id="sealGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0d574" />
          <stop offset="50%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#8a6d1a" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#0b2c5f" stroke="url(#sealGold)" strokeWidth="3" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#sealGold)" strokeWidth="1.5" strokeDasharray="2 3" />
      <path d="M50 20 L58 42 L82 42 L62 56 L70 78 L50 64 L30 78 L38 56 L18 42 L42 42 Z" fill="url(#sealGold)" opacity="0.9" />
      <circle cx="50" cy="50" r="15" fill="#0b2c5f" stroke="url(#sealGold)" strokeWidth="1.5" />
      <text x="50" y="55" textAnchor="middle" fontSize="13" fontWeight="700" fill="#f0d574" fontFamily="Georgia, serif">
        BC
      </text>
    </svg>
  )
}
