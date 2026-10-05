import { Crown, Gem } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CommentAuthorRole } from "@/lib/api/adapters/engagement.adapter"

const CONFIG: Record<CommentAuthorRole, { label: string; icon: typeof Crown; className: string }> = {
  Administrator: {
    label: "Admin",
    icon: Crown,
    className: "bg-gradient-to-r from-[#F4D06F] to-[#D4AF37] text-[#3D2F00]",
  },
  Staff: {
    label: "Staff",
    icon: Gem,
    className: "bg-gradient-to-r from-[#60D5FF] to-[#2563EB] text-white",
  },
}

export function AuthorRoleBadge({ role, className }: { role: CommentAuthorRole; className?: string }) {
  const config = CONFIG[role]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm",
        config.className,
        className
      )}
    >
      <config.icon className="size-2.5" />
      {config.label}
    </span>
  )
}
