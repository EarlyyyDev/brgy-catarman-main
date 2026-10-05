import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const PALETTE = [
  "bg-navy text-navy-foreground",
  "bg-gold text-gold-foreground",
  "bg-emerald-700 text-white",
  "bg-slate-700 text-white",
  "bg-rose-800 text-white",
  "bg-indigo-700 text-white",
  "bg-amber-700 text-white",
  "bg-teal-700 text-white",
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

interface InitialsAvatarProps {
  name: string
  photoUrl?: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const SIZE_CLASSES: Record<NonNullable<InitialsAvatarProps["size"]>, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
  xl: "size-24 text-2xl",
}

export function InitialsAvatar({ name, photoUrl, className, size = "md" }: InitialsAvatarProps) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "?"

  const colorClass = PALETTE[hashString(name) % PALETTE.length]

  return (
    <Avatar className={cn(SIZE_CLASSES[size], className)}>
      {photoUrl ? <AvatarImage src={photoUrl} alt={name} /> : null}
      <AvatarFallback className={cn("font-semibold", colorClass)}>{initials}</AvatarFallback>
    </Avatar>
  )
}
