"use client"

import * as React from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAllHouseholds } from "@/lib/api/hooks/use-households"
import { useSitios } from "@/lib/api/hooks/use-geography"
import { useMe } from "@/lib/api/hooks/use-auth"
import { cn } from "@/lib/utils"

function useLocationSummaries() {
  const { puroks } = useSitios()
  const { households } = useAllHouseholds()

  return React.useMemo(
    () =>
      puroks.map((location) => {
        const locationHouseholds = households.filter((household) => household.purokId === location.id)
        const lastUpdated = locationHouseholds.reduce<string | undefined>((latest, household) => {
          if (!latest) return household.updatedAt
          return new Date(household.updatedAt) > new Date(latest) ? household.updatedAt : latest
        }, undefined)
        const residentCount = new Set(locationHouseholds.flatMap((household) => household.memberIds)).size
        return { ...location, householdCount: locationHouseholds.length, residentCount, lastUpdated }
      }),
    [puroks, households],
  )
}

interface LocationSidebarProps {
  selectedLocationId: string
  onSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function LocationSidebar({ selectedLocationId, onSelect, onEdit, onDelete }: LocationSidebarProps) {
  const summaries = useLocationSummaries()
  const { data: session } = useMe()
  const canManage = Boolean(session)

  return (
    <nav aria-label="Sitio / Purok locations" className="hidden w-[280px] shrink-0 lg:block">
      <div className="sticky top-24 space-y-1 rounded-lg border border-border bg-card p-2 shadow-sm">
        <p className="px-2.5 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sitio / Purok</p>
        {summaries.map((location) => {
          const isSelected = location.id === selectedLocationId
          return (
            <div
              key={location.id}
              className={cn(
                "flex items-start gap-1 rounded-md border-l-2 border-transparent transition-colors",
                isSelected ? "border-l-primary bg-primary/10" : "hover:bg-secondary",
              )}
            >
              <button type="button" onClick={() => onSelect(location.id)} className="flex min-w-0 flex-1 items-start gap-2.5 px-2.5 py-2.5 text-left">
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm font-semibold", isSelected ? "text-primary" : "text-foreground")}>{location.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {location.householdCount} households · {location.residentCount} residents
                  </span>
                </span>
              </button>
              {canManage ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="mt-1 mr-1 size-7 shrink-0 rounded-md text-muted-foreground hover:bg-secondary" aria-label={`Actions for ${location.name}`}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEdit(location.id)}><Pencil className="size-4" />Rename</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(location.id)}><Trash2 className="size-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          )
        })}
        {summaries.length === 0 ? <p className="px-2.5 py-4 text-sm text-muted-foreground">No Sitio/Purok locations yet.</p> : null}
      </div>
    </nav>
  )
}

export function MobileLocationSelect({ selectedLocationId, onSelect }: Pick<LocationSidebarProps, "selectedLocationId" | "onSelect">) {
  const summaries = useLocationSummaries()

  return (
    <div className="lg:hidden">
      <Select value={selectedLocationId} onValueChange={onSelect}>
        <SelectTrigger className="h-11 w-full rounded-lg border-border bg-card">
          <SelectValue placeholder="Select Sitio / Purok" />
        </SelectTrigger>
        <SelectContent>
          {summaries.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name} · {location.householdCount} households
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}