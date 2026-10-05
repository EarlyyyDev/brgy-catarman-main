"use client"

import * as React from "react"
import { Check, Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { residentsApi } from "@/lib/api/endpoints"
import { cn } from "@/lib/utils"

export interface ResidentPickerValue {
  id: string
  fullName: string
}

interface ResidentSearchResult {
  id: string
  fullName: string
  purok: string
  sitio: string
}

interface ResidentPickerFieldProps {
  value: ResidentPickerValue | null
  onChange: (value: ResidentPickerValue | null) => void
  placeholder?: string
}

/** Identity-verification picker used by public forms (certificate requests,
 * incident reports) -- residents must select themselves from real records
 * instead of typing a free-text name, so only registered residents can
 * submit. See resident.controller.ts#searchPublicResidents for the backend. */
export function ResidentPickerField({ value, onChange, placeholder }: ResidentPickerFieldProps) {
  const [query, setQuery] = React.useState(value?.fullName ?? "")
  const [open, setOpen] = React.useState(false)
  const [results, setResults] = React.useState<ResidentSearchResult[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (value && query === value.fullName) return
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const data = await residentsApi.searchPublic(trimmed)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  function handleInputChange(next: string) {
    setQuery(next)
    setOpen(true)
    if (value) onChange(null)
  }

  function handleSelect(resident: ResidentSearchResult) {
    onChange({ id: resident.id, fullName: resident.fullName })
    setQuery(resident.fullName)
    setOpen(false)
  }

  const showPanel = open && (loading || query.trim().length >= 2)

  return (
    <Popover open={showPanel} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setOpen(true)}
            placeholder={placeholder ?? "Type your full name to search the resident records..."}
            className="pl-9"
            autoComplete="off"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[var(--radix-popper-anchor-width)] min-w-72 max-h-64 overflow-y-auto p-1"
      >
        {loading ? (
          <div className="flex items-center gap-2 px-2.5 py-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Searching...
          </div>
        ) : results.length === 0 ? (
          <p className="px-2.5 py-3 text-sm text-muted-foreground">
            No matching resident found. Only names registered in our household/resident records can submit.
          </p>
        ) : (
          results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelect(r)}
              className={cn(
                "flex w-full flex-col items-start gap-0.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent",
                value?.id === r.id && "bg-accent",
              )}
            >
              <span className="flex w-full items-center justify-between gap-2 font-medium text-foreground">
                {r.fullName}
                {value?.id === r.id ? <Check className="size-3.5 text-primary" /> : null}
              </span>
              <span className="text-xs text-muted-foreground">
                {r.purok}, {r.sitio}
              </span>
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}
