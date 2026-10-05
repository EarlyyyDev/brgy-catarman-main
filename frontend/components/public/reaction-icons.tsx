import * as React from "react"
import { cn } from "@/lib/utils"

export type ReactionKey = "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry"

function useGradId(prefix: string) {
  const raw = React.useId()
  return `${prefix}-${raw.replace(/[:]/g, "")}`
}

function LikeGlyph({ className }: { className?: string }) {
  const id = useGradId("like")
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <linearGradient id={id} x1="6" y1="4" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6DB0FF" />
          <stop offset="100%" stopColor="#0866FF" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#${id})`} />
      <path
        fill="#fff"
        d="M13 16.5c0-.6.3-1 .8-1.4l4.2-3.7c.4-1 .5-2.6.4-3.6-.1-.8.4-1.6 1.3-1.7 1.5-.2 2.8.9 2.9 2.5.1 1.4-.2 2.9-.7 4h4.4c1.4 0 2.5 1.2 2.4 2.6l-.9 7.6c-.2 1.6-1.5 2.7-3 2.7H15c-1.1 0-2-.9-2-2v-6.9Z"
      />
      <rect x="9" y="15.2" width="3.4" height="10.8" rx="1.7" fill="#fff" />
    </svg>
  )
}

function LoveGlyph({ className }: { className?: string }) {
  const id = useGradId("love")
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <linearGradient id={id} x1="6" y1="4" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7A93" />
          <stop offset="100%" stopColor="#F33E58" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#${id})`} />
      <path
        fill="#fff"
        d="M18 27c-.4 0-.7-.1-1-.4-1.5-1.4-4-3.7-6-6-1.6-1.9-2.6-3.7-2.6-5.6 0-2.9 2.2-5 5-5 1.7 0 3.2.9 4.1 2.3.4.6 1.3.6 1.6 0 .9-1.4 2.4-2.3 4.1-2.3 2.8 0 5 2.1 5 5 0 1.9-1 3.7-2.6 5.6-2 2.3-4.5 4.6-6 6-.3.3-.6.4-1 .4Z"
      />
    </svg>
  )
}

function CareGlyph({ className }: { className?: string }) {
  const id = useGradId("care")
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFE58A" />
          <stop offset="100%" stopColor="#F7B125" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#${id})`} />
      <path d="M11 15.5c1.4-1.4 3-1.4 4 0" stroke="#5A3A00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M21 15.5c1.4-1.4 3-1.4 4 0" stroke="#5A3A00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M13 22c2.6 2.4 7.4 2.4 10 0" stroke="#5A3A00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M2 20c2-4 5-4 8 0-3 3-6 3-8 0Z" fill="#FF7A93" />
      <path d="M34 20c-2-4-5-4-8 0 3 3 6 3 8 0Z" fill="#FF7A93" />
    </svg>
  )
}

function HahaGlyph({ className }: { className?: string }) {
  const id = useGradId("haha")
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFE58A" />
          <stop offset="100%" stopColor="#F7B125" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#${id})`} />
      <path d="M9 14c1.8-2.4 4.6-2.4 6.4 0" stroke="#5A3A00" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M20.6 14c1.8-2.4 4.6-2.4 6.4 0" stroke="#5A3A00" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M9.5 20c1.5 5.5 6 8 8.5 8s7-2.5 8.5-8c.3-1.1-.6-1.5-1.4-1-2 1.2-4.6 1.8-7.1 1.8s-5.1-.6-7.1-1.8c-.8-.5-1.7-.1-1.4 1Z" fill="#5A3A00" />
      <path d="M13.5 21.5c1.4.6 2.9.9 4.5.9s3.1-.3 4.5-.9c-.6 2.2-2.3 4-4.5 4s-3.9-1.8-4.5-4Z" fill="#FF8A9B" />
    </svg>
  )
}

function WowGlyph({ className }: { className?: string }) {
  const id = useGradId("wow")
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFE58A" />
          <stop offset="100%" stopColor="#F7B125" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#${id})`} />
      <path d="M9.5 13.5c1.4-1.6 4-1.6 5.4 0" stroke="#5A3A00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M21.1 13.5c1.4-1.6 4-1.6 5.4 0" stroke="#5A3A00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="12.2" cy="17.5" r="2.3" fill="#5A3A00" />
      <circle cx="23.8" cy="17.5" r="2.3" fill="#5A3A00" />
      <ellipse cx="18" cy="25" rx="3" ry="4" fill="#5A3A00" />
    </svg>
  )
}

function SadGlyph({ className }: { className?: string }) {
  const id = useGradId("sad")
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFE58A" />
          <stop offset="100%" stopColor="#F7B125" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#${id})`} />
      <path d="M9.5 16c1.4-1.6 4-1.6 5.4 0" stroke="#5A3A00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M21.1 16c1.4-1.6 4-1.6 5.4 0" stroke="#5A3A00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="12.2" cy="19.5" r="2" fill="#5A3A00" />
      <circle cx="23.8" cy="19.5" r="2" fill="#5A3A00" />
      <path d="M13 27c1.7-2.4 3.5-3.4 5-3.4s3.3 1 5 3.4" stroke="#5A3A00" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M24 21c1.6 2.2 1.6 4.4 0 5.6-1.6 1.2-2.4-.2-1.8-2.1.4-1.3 1-2.4 1.8-3.5Z" fill="#54A5F8" />
    </svg>
  )
}

function AngryGlyph({ className }: { className?: string }) {
  const id = useGradId("angry")
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <defs>
        <radialGradient id={id} cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#FF9B6A" />
          <stop offset="100%" stopColor="#E0311C" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#${id})`} />
      <path d="M9 15.5 15 17.5" stroke="#4A0A00" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M27 15.5 21 17.5" stroke="#4A0A00" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="13.2" cy="19.5" r="1.9" fill="#4A0A00" />
      <circle cx="22.8" cy="19.5" r="1.9" fill="#4A0A00" />
      <path d="M13 26.5c1.7-1.6 8.3-1.6 10 0" stroke="#4A0A00" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

interface ReactionDef {
  key: ReactionKey
  label: string
  labelColor: string
  Icon: React.ComponentType<{ className?: string }>
}

export const REACTIONS: ReactionDef[] = [
  { key: "like", label: "Like", labelColor: "text-[#0866FF]", Icon: LikeGlyph },
  { key: "love", label: "Love", labelColor: "text-[#F33E58]", Icon: LoveGlyph },
  { key: "care", label: "Care", labelColor: "text-[#F7B125]", Icon: CareGlyph },
  { key: "haha", label: "Haha", labelColor: "text-[#F7B125]", Icon: HahaGlyph },
  { key: "wow", label: "Wow", labelColor: "text-[#F7B125]", Icon: WowGlyph },
  { key: "sad", label: "Sad", labelColor: "text-[#F7B125]", Icon: SadGlyph },
  { key: "angry", label: "Angry", labelColor: "text-[#E0311C]", Icon: AngryGlyph },
]

export function reactionByKey(key: ReactionKey) {
  return REACTIONS.find((r) => r.key === key)!
}

export function ReactionBubble({ reaction, className }: { reaction: ReactionKey; className?: string }) {
  const def = reactionByKey(reaction)
  return (
    <span className={cn("relative flex items-center justify-center overflow-hidden rounded-full ring-2 ring-card", className)}>
      <def.Icon className="size-full" />
    </span>
  )
}
