import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardStatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  href: string
}

export function DashboardStatCard({ label, value, icon: Icon, href }: DashboardStatCardProps) {
  return (
    <Card className="border-border/70 transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-5">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <Link href={href} className="flex items-center gap-0.5 text-sm font-semibold text-gold-foreground hover:underline">
          Learn more
          <ChevronRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}
