"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { LogOut } from "lucide-react"
import toast from "react-hot-toast"
import { NAV_GROUPS } from "@/components/dashboard/nav-config"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useMe, useLogout } from "@/lib/api/hooks/use-auth"
import type { UserRole } from "@/types"
import { cn } from "@/lib/utils"

// Subtle fractal-noise grain, tiled behind the profile header for a less flat, more premium feel.
const NOISE_TEXTURE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

export function DashboardSidebar({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useMe()
  const logout = useLogout()
  const [signOutOpen, setSignOutOpen] = React.useState(false)

  async function handleSignOut() {
    await logout.mutateAsync()
    toast.success("You have been logged out.")
    router.replace("/portal/a8K92LmX/login")
  }

  return (
    <div className="relative isolate flex h-full flex-col overflow-hidden border-r border-white/[0.08] text-white">
      {/* Layer 1+2: the user's own avatar image, heavily blurred/darkened via CSS filters only — never shown recognizably */}
      <div className="absolute inset-0 overflow-hidden bg-primary">
        <AnimatePresence mode="sync">
          {session?.avatarUrl ? (
            <motion.img
              key={session.avatarUrl}
              src={session.avatarUrl}
              alt=""
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 size-full scale-[1.42] object-cover object-center [filter:blur(34px)_brightness(40%)_contrast(114%)_saturate(128%)]"
            />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Layer 3: premium dark navy gradient, tinted from the admin's theme primary color so it stays admin-configurable */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--primary) 82%, transparent) 0%, color-mix(in srgb, var(--primary) 90%, black 12%) 50%, color-mix(in srgb, var(--primary) 97%, black 35%) 100%)",
        }}
      />

      {/* Left/right edge vignette for a cinematic, non-flat edge */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.38) 0%, transparent 16%, transparent 84%, rgba(0,0,0,0.38) 100%)" }}
      />

      {/* Layer 4: near-invisible lighting glow, seated behind the avatar */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{ background: "radial-gradient(60% 60% at 50% 12%, rgba(255,255,255,0.06) 0%, transparent 70%)" }}
      />

      {/* Layer 5: ultra-faint grain so the panel doesn't read as flat */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: `url("${NOISE_TEXTURE_URL}")`, backgroundSize: "120px 120px" }}
      />

      {/* Layer 6: transparent glass wash */}
      <div
        className="pointer-events-none absolute inset-0 backdrop-blur-[14px]"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />

      {/* Layer 7: sidebar content */}
      <div className="group/profile relative z-10 flex flex-col items-center gap-3 px-5 py-8">
        <div className="relative">
          <div className="rounded-full bg-gradient-to-br from-gold via-gold/70 to-white/30 p-[2px] shadow-[0_0_0_5px_rgba(66,133,244,0.14),0_12px_28px_-6px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out group-hover/profile:scale-[1.03]">
            <InitialsAvatar
              name={session?.name ?? "?"}
              photoUrl={session?.avatarUrl}
              size="lg"
              className="ring-[3px] ring-primary/80"
            />
          </div>
          <span className="absolute bottom-0.5 right-0.5 flex size-3.5">
            <span
              className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50"
              style={{ animationDuration: "2.2s" }}
            />
            <span className="relative inline-flex size-3.5 rounded-full bg-emerald-400 ring-2 ring-white shadow-[0_0_6px_2px_rgba(52,211,153,0.55)]" />
          </span>
        </div>
        <div className="max-w-full text-center">
          <p className="line-clamp-2 max-w-[10.5rem] text-[15px] font-extrabold tracking-[0.2px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
            {session?.name}
          </p>
          <span
            className="mt-1.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-[10px]"
            style={{ background: "rgba(255,215,0,0.15)", borderColor: "rgba(255,215,0,0.30)", color: "var(--gold)" }}
          >
            {role === "Administrator" ? "Administrator" : "Staff"}
          </span>
        </div>
      </div>

      <nav className="themed-scrollbar relative z-10 flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => item.roles.includes(role))
          if (items.length === 0) return null
          return (
            <div key={group.label}>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/50">{group.label}</p>
              <div className="mt-2 space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200",
                        active
                          ? "rounded-full bg-white/10 text-white shadow-[0_0_0_1px_rgba(66,133,244,0.35),0_6px_16px_-4px_rgba(0,0,0,0.4)] backdrop-blur-md"
                          : "rounded-lg text-white/75 hover:bg-white/10 hover:text-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:backdrop-blur-sm"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="relative z-10 border-t border-white/10 p-3">
        <button
          onClick={() => setSignOutOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-white/10 hover:text-red-300"
        >
          <LogOut className="size-4 shrink-0" />
          Sign-out
        </button>
      </div>

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out?"
        description="You will need to sign in again to access your dashboard."
        confirmLabel="Sign Out"
        destructive
        onConfirm={handleSignOut}
      />
    </div>
  )
}
