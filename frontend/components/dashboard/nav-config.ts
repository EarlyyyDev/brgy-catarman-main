import type { LucideIcon } from "lucide-react"
import {
  Archive,
  Bell,
  Building2,
  Database,
  FileStack,
  FileText,
  Gavel,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Settings,
  ShieldAlert,
  Tags,
  TrendingUp,
  Users2,
  UsersRound,
} from "lucide-react"
import type { UserRole } from "@/types"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard/overview", icon: LayoutDashboard, roles: ["Staff", "Administrator"] },
      { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp, roles: ["Staff", "Administrator"] },
    ],
  },
  {
    label: "Community Records",
    items: [
      { label: "Resident Management", href: "/dashboard/residents", icon: UsersRound, roles: ["Staff", "Administrator"] },
      { label: "Households", href: "/dashboard/households", icon: Building2, roles: ["Staff", "Administrator"] },
      { label: "Tags", href: "/dashboard/tags", icon: Tags, roles: ["Staff", "Administrator"] },
    ],
  },
  {
    label: "Requests & Cases",
    items: [
      { label: "Document Requests", href: "/dashboard/certificates", icon: FileStack, roles: ["Staff", "Administrator"] },
      { label: "Certificate Templates", href: "/dashboard/certificate-templates", icon: FileText, roles: ["Staff", "Administrator"] },
      { label: "Blotter Records", href: "/dashboard/blotters", icon: Gavel, roles: ["Staff", "Administrator"] },
      { label: "Blotter Templates", href: "/dashboard/blotter-templates", icon: FileText, roles: ["Staff", "Administrator"] },
      { label: "Complaints", href: "/dashboard/complaints", icon: ShieldAlert, roles: ["Staff", "Administrator"] },
    ],
  },
  {
    label: "Engagement",
    items: [{ label: "Announcement", href: "/dashboard/announcements", icon: Megaphone, roles: ["Staff", "Administrator"] }],
  },
  {
    label: "Administration",
    items: [
      { label: "Staff Accounts", href: "/dashboard/staff", icon: Users2, roles: ["Administrator"] },
      { label: "System Settings", href: "/dashboard/settings", icon: Settings, roles: ["Administrator"] },
      { label: "Backup & Restore", href: "/dashboard/backup", icon: Database, roles: ["Administrator"] },
      { label: "Activity Logs", href: "/dashboard/logs", icon: ScrollText, roles: ["Administrator"] },
    ],
  },
]

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)

export const NOTIFICATION_ICON: Record<string, LucideIcon> = {
  info: Bell,
  success: Archive,
  warning: ShieldAlert,
  error: ShieldAlert,
}
