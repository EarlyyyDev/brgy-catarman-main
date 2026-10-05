"use client"

import * as React from "react"
import { MoreHorizontal, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface RowAction {
  label: string
  icon?: LucideIcon
  onClick: () => void
  destructive?: boolean
  separatorBefore?: boolean
  disabled?: boolean
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {actions.map((action, idx) => (
          <React.Fragment key={action.label}>
            {action.separatorBefore && idx > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(action.destructive && "text-destructive focus:text-destructive")}
            >
              {action.icon ? <action.icon className="size-4" /> : null}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
