"use client"

import * as React from "react"

function getGreeting(hour: number): string {
  if (hour < 12) return "Good Morning"
  if (hour < 18) return "Good Afternoon"
  return "Good Evening"
}

export function WelcomeBanner({ name, pendingCount }: { name: string; pendingCount: number }) {
  const [greeting, setGreeting] = React.useState("Good Morning")

  React.useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()))
  }, [])

  return (
    <div
      className="rounded-2xl p-6 text-primary-foreground shadow-md sm:p-7"
      style={{ background: "linear-gradient(to bottom right, var(--primary), color-mix(in srgb, var(--primary) 100%, black 28%))" }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">{greeting}</p>
      <h2 className="mt-1.5 font-heading text-2xl font-bold sm:text-3xl">Welcome back, {name}!</h2>
      <p className="mt-1.5 text-sm text-primary-foreground/70">
        You have <span className="font-semibold text-white">{pendingCount}</span> pending request{pendingCount === 1 ? "" : "s"} as of the moment.
      </p>
    </div>
  )
}
