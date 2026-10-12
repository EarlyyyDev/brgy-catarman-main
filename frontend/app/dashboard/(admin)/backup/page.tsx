"use client"

import { AlertTriangle, Cloud, ExternalLink, HardDrive, ShieldCheck } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BackupPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Backup & Recovery" description="Where to protect and recover your system data." />

      <Card className="border-amber-300 bg-amber-50 text-amber-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-5" />
            App backups are unavailable on Vercel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            The old backup buttons saved files on the backend server. Vercel does not keep that server storage permanently, so those
            buttons cannot provide a dependable backup or restore for the live system. They have been removed to avoid giving a false
            sense of protection.
          </p>
          <p>Use the data services below instead. They protect different things.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <HardDrive className="size-4 text-primary" />
              Database records — Neon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Neon retains database history for a limited period based on your plan and history-window setting. If data is lost, create
              a separate branch from before the problem and verify it before considering any production recovery.
            </p>
            <a
              href="https://console.neon.tech/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
            >
              Open Neon Console <ExternalLink className="size-3.5" />
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Cloud className="size-4 text-primary" />
              Uploaded photos and files — Cloudinary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Cloudinary asset backups are configured separately from Neon and this website. In Cloudinary settings, enable automatic
              backup and run “Back Up Existing Assets” to include files uploaded before you enabled it.
            </p>
            <a
              href="https://console.cloudinary.com/app/settings/backup"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
            >
              Open Cloudinary Backup Settings <ExternalLink className="size-3.5" />
            </a>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="size-4 text-primary" />
            Before restoring anything
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Neon recovery covers database records; Cloudinary backup covers original uploaded assets. Neither replaces the other.</p>
          <p>Restore to a separate Neon branch first, verify the recovered data, and do not point the live site at it until you intend to.</p>
          <p>Cloudinary’s default backup storage may count toward your Cloudinary storage quota. Review the account usage and plan.</p>
        </CardContent>
      </Card>
    </div>
  )
}
