"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, Sparkles, X } from "lucide-react"
import { usePublicDialogStore, type PublicDialogKey } from "@/lib/stores/public-dialog-store"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"
import { aiAssistantApi } from "@/lib/api/endpoints"
import { ApiError } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  role: "assistant" | "user"
  text: string
}

const QUICK_ACTIONS: { label: string; prompt: string }[] = [
  { label: "Request a Document", prompt: "I want to request a document" },
  { label: "Track My Request", prompt: "I want to track my request" },
  { label: "Report an Incident", prompt: "I want to report an incident" },
  { label: "Office Hours", prompt: "What are your office hours?" },
]

/** Opening the right form is a deterministic UI action, not something the AI
 * needs to decide -- kept as simple local keyword matching, separate from
 * the actual reply text (now real AI-generated). */
function detectAction(input: string): Exclude<PublicDialogKey, null> | undefined {
  const q = input.toLowerCase()
  if (/document|certificate|clearance|indigency|residency/.test(q)) return "request-document"
  if (/track|status|reference|ref\.?\s*no/.test(q)) return "track-request"
  if (/report|incident|complaint|blotter|dispute/.test(q)) return "report-incident"
  return undefined
}

export function AiAssistantWidget() {
  const { settings } = usePublicSettings()
  const setOpenDialog = usePublicDialogStore((s) => s.setOpenDialog)

  const [open, setOpen] = React.useState(false)
  const [showTeaser, setShowTeaser] = React.useState(false)
  const [teaserDismissed, setTeaserDismissed] = React.useState(false)
  const [typing, setTyping] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "greeting",
      role: "assistant",
      text: `Hi, I'm the ${settings.barangayName} Assistant! Ask me about document requests, tracking your application, reporting an incident, or office hours.`,
    },
  ])
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const messageCounter = React.useRef(0)
  function nextMessageId(prefix: "u" | "a") {
    messageCounter.current += 1
    return `${prefix}-${messageCounter.current}`
  }

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!open) setShowTeaser(true)
    }, 3500)
    return () => window.clearTimeout(timer)
  }, [open])

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, typing])

  function openWidget() {
    setOpen(true)
    setShowTeaser(false)
    setTeaserDismissed(true)
  }

  async function respondTo(text: string) {
    const userMessage: ChatMessage = { id: nextMessageId("u"), role: "user", text }
    const history = messages.filter((m) => m.id !== "greeting").map((m) => ({ role: m.role, text: m.text }))
    setMessages((prev) => [...prev, userMessage])
    setTyping(true)

    try {
      const { text: replyText } = await aiAssistantApi.chat(text, history)
      setMessages((prev) => [...prev, { id: nextMessageId("a"), role: "assistant", text: replyText }])
    } catch (err) {
      const fallback =
        err instanceof ApiError && err.status === 429
          ? "You've sent a lot of messages -- please wait a bit before trying again."
          : "Sorry, I'm having trouble responding right now. Please try again or contact the barangay office directly."
      setMessages((prev) => [...prev, { id: nextMessageId("a"), role: "assistant", text: fallback }])
    } finally {
      setTyping(false)
    }

    const action = detectAction(text)
    if (action) {
      window.setTimeout(() => setOpenDialog(action), 500)
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const value = input.trim()
    if (!value) return
    setInput("")
    respondTo(value)
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-[min(560px,70vh)] w-[min(360px,90vw)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-3 bg-primary px-4 py-3.5 text-primary-foreground">
              <AssistantAvatar avatarUrl={settings.aiAssistantAvatarUrl} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{settings.barangayName} Assistant</p>
                <p className="flex items-center gap-1 text-[11px] text-primary-foreground/70">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Online
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                      m.role === "user" ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-secondary text-foreground"
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {typing ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2.5">
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "120ms" }} />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-1.5 border-t border-border px-3.5 py-2.5">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => respondTo(qa.prompt)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  {qa.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {!open && showTeaser && !teaserDismissed ? (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="flex max-w-[220px] items-center gap-2 rounded-2xl rounded-br-sm border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-lg"
          >
            <Sparkles className="size-4 shrink-0 text-gold" />
            <span className="flex-1">Need help? Chat with our assistant!</span>
            <button
              type="button"
              onClick={() => setTeaserDismissed(true)}
              aria-label="Dismiss"
              className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="size-3" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openWidget())}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className="group relative flex size-15 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_28px_-6px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        <span className="pointer-events-none absolute inset-0 rounded-full bg-gold/25 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
        {open ? (
          <X className="size-6" />
        ) : (
          <AssistantAvatar avatarUrl={settings.aiAssistantAvatarUrl} size={60} />
        )}
        {!open ? (
          <span className="absolute bottom-0.5 right-0.5 flex size-3.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" style={{ animationDuration: "2.2s" }} />
            <span className="relative inline-flex size-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </span>
        ) : null}
      </button>
    </div>
  )
}

function AssistantAvatar({ avatarUrl, size }: { avatarUrl?: string; size: number }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold/60 text-primary"
      style={{ width: size, height: size }}
    >
      <Bot style={{ width: size * 0.55, height: size * 0.55 }} />
    </span>
  )
}
