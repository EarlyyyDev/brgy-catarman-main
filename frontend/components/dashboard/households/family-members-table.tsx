"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { UsersRound } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { EmptyState } from "@/components/shared/empty-state"
import { useAllResidents } from "@/lib/api/hooks/use-residents"
import { getResidentAge, getResidentFullName } from "@/data/residents"
import { getRelationshipToHead } from "@/lib/relationship"
import type { Household, Resident } from "@/types"

export function FamilyMembersTable({ household }: { household: Household }) {
  const { residents } = useAllResidents()

  const members = React.useMemo(() => {
    const residentMap = new Map(residents.map((r) => [r.id, r]))
    return household.memberIds.map((id) => residentMap.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r))
  }, [residents, household.memberIds])

  const head: Resident | undefined = residents.find((r) => r.id === household.headResidentId)

  if (members.length === 0) {
    return (
      <EmptyState
        icon={UsersRound}
        title="No family members on record"
        description="This household has no linked residents yet."
        className="m-3 border-none bg-transparent py-8"
      />
    )
  }

  return (
    <div className="overflow-x-auto p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <UsersRound className="size-3.5 text-muted-foreground" />
        Family Members ({members.length})
      </div>
      <div className="overflow-hidden rounded-[12px] border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 text-muted-foreground"></TableHead>
              <TableHead className="text-muted-foreground">Full Name</TableHead>
              <TableHead className="text-muted-foreground">Relationship to Head</TableHead>
              <TableHead className="text-muted-foreground">Age</TableHead>
              <TableHead className="text-muted-foreground">Gender</TableHead>
              <TableHead className="text-muted-foreground">Civil Status</TableHead>
              <TableHead className="text-muted-foreground">Community Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, idx) => {
              const fullName = getResidentFullName(member)
              const isHead = member.id === household.headResidentId
              const relationship = isHead
                ? "Head"
                : member.relationshipToHead ?? (head ? getRelationshipToHead(member, head) : "Relative")

              return (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: idx * 0.02, ease: "easeOut" }}
                  className="border-b border-border last:border-0 hover:bg-secondary"
                >
                  <TableCell>
                    <InitialsAvatar name={fullName} photoUrl={member.photoUrl} size="sm" />
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-foreground">{fullName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        relationship === "Head"
                          ? "border-primary/30 bg-primary/10 font-medium text-primary"
                          : "border-border font-normal text-foreground/80"
                      }
                    >
                      {relationship}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground/80">{getResidentAge(member.birthdate)}</TableCell>
                  <TableCell className="text-sm text-foreground/80">{member.gender}</TableCell>
                  <TableCell className="text-sm text-foreground/80">{member.civilStatus}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground/70">—</span>
                      ) : (
                        member.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                            {tag}
                          </span>
                        ))
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
