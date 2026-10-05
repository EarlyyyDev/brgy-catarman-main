"use client"

import * as React from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useDocumentTypes, useUpdateDocumentTypeFee } from "@/lib/api/hooks/use-document-types"

export function CertificatePricingForm() {
  const { documentTypes, isLoading } = useDocumentTypes()
  const updateFee = useUpdateDocumentTypeFee()
  const [drafts, setDrafts] = React.useState<Record<string, string>>({})

  function draftFor(id: string, currentFee: string | number) {
    return drafts[id] ?? String(currentFee)
  }

  function isDirty(id: string, currentFee: string | number) {
    return id in drafts && drafts[id] !== String(currentFee)
  }

  async function handleSave(id: string) {
    const raw = drafts[id]
    const fee = Number(raw)
    if (!raw || Number.isNaN(fee) || fee < 0) return
    await updateFee.mutateAsync({ id, fee })
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Certificate & Document Pricing</p>
        <p className="text-xs text-muted-foreground">
          Set the price charged for each document type. Changes only apply to requests approved from now on — already-approved requests keep the price they were charged at the time.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Type</TableHead>
              <TableHead>Price (₱)</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : documentTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                  No document types found.
                </TableCell>
              </TableRow>
            ) : (
              documentTypes.map((docType) => (
                <TableRow key={docType.id}>
                  <TableCell className="font-medium text-foreground">{docType.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-32"
                      value={draftFor(docType.id, docType.fee)}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [docType.id]: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!isDirty(docType.id, docType.fee) || updateFee.isPending}
                      onClick={() => handleSave(docType.id)}
                    >
                      <Save className="size-3.5" />
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
