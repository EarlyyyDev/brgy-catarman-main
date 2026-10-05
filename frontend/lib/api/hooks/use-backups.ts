import { useQuery } from "@tanstack/react-query"
import { backupsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import { toBackupRecord } from "@/lib/api/adapters/backup.adapter"
import type { PaginatedResult } from "@/lib/api/types"
import type { BackupRecord } from "@/types"

export function useBackups(params?: { page?: number; pageSize?: number }) {
  const queryParams = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }
  const { data, isLoading } = useQuery<PaginatedResult<unknown>>({
    queryKey: [...qk.backups.all, queryParams],
    queryFn: () => backupsApi.list(queryParams) as Promise<PaginatedResult<unknown>>,
  })
  const backupRecords: BackupRecord[] = (data?.items ?? []).map((b) => toBackupRecord(b as never))
  return { backupRecords, total: data?.total ?? 0, isLoading }
}

export function useRunManualBackup() {
  return useApiMutation<BackupRecord, void>({
    mutationFn: async () => toBackupRecord((await backupsApi.create()) as never),
    invalidates: [qk.backups.all],
    successMessage: "Manual backup started.",
  })
}

export function useRestoreBackup() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => backupsApi.restore(id),
    invalidates: [qk.backups.all],
    successMessage: "Backup restored. Everyone will need to sign in again.",
  })
}

export function useDeleteBackup() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => backupsApi.delete(id),
    invalidates: [qk.backups.all],
    successMessage: "Backup deleted.",
  })
}

export function backupDownloadUrl(id: string) {
  return backupsApi.downloadUrl(id)
}
