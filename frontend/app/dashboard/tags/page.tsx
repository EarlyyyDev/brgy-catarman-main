"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Tags as TagsIcon, Pencil } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagAssignDialog } from "@/components/dashboard/residents/tag-assign-dialog"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { getResidentFullName } from "@/data/residents"
import { RESIDENT_TAGS } from "@/lib/constants"
import type { Resident } from "@/types"

const GOLD = "var(--gold)"

export default function ResidentTaggingPage() {
  const { residents } = useAllResidents()
  const [tagFilter, setTagFilter] = React.useState<string>("all")
  const [editing, setEditing] = React.useState<Resident | undefined>()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const chartData = React.useMemo(
    () => RESIDENT_TAGS.map((tag) => ({ tag, count: residents.filter((r) => r.tags.includes(tag)).length })),
    [residents]
  )

  const filtered = React.useMemo(
    () => (tagFilter === "all" ? residents : residents.filter((r) => r.tags.includes(tagFilter as Resident["tags"][number]))),
    [residents, tagFilter]
  )

  const columns = React.useMemo<ColumnDef<Resident>[]>(
    () => [
      {
        id: "name",
        header: "Resident",
        accessorFn: (r) => getResidentFullName(r),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <InitialsAvatar name={getResidentFullName(row.original)} size="sm" />
            <div>
              <p className="font-medium text-foreground">{getResidentFullName(row.original)}</p>
              <p className="text-xs text-muted-foreground">{row.original.address.purok}</p>
            </div>
          </div>
        ),
      },
      {
        id: "tags",
        header: "Assigned Tags",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.length === 0 ? (
              <span className="text-xs text-muted-foreground">No tags assigned</span>
            ) : (
              row.original.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(row.original)
              setDialogOpen(true)
            }}
          >
            <Pencil className="size-3.5" />
            Manage Tags
          </Button>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Resident Tagging" description="Assign special classifications to residents for program eligibility and reporting." />

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Tag Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] px-2 sm:px-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="tag"
                width={110}
                tickLine={false}
                axisLine={false}
                interval={0}
                fontSize={11}
                className="text-[11px]"
              />
              <Tooltip />
              <Bar dataKey="count" name="Residents" fill={GOLD} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search residents..."
        emptyTitle="No residents found"
        emptyDescription="No residents match this tag filter."
        toolbar={
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <TagsIcon className="size-3.5" />
                All Tags
              </SelectItem>
              {RESIDENT_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <TagAssignDialog open={dialogOpen} onOpenChange={setDialogOpen} resident={editing} />
    </div>
  )
}
