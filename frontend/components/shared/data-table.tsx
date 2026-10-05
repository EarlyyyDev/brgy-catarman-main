"use client"

import * as React from "react"
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/shared/empty-state"
import { Inbox } from "lucide-react"

export interface ServerPaginationProps {
  pageIndex: number
  pageSize: number
  totalRows: number
  onPageIndexChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
  search: string
  onSearchChange: (search: string) => void
  isLoading?: boolean
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  toolbar?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  pageSize?: number
  /** Omit for the default fully-client-side mode (search/sort/paginate the
   * given `data` array in the browser). Pass this when `data` is already a
   * single server-paginated page — the table then drives page/pageSize/search
   * through these callbacks instead of TanStack Table's own row models. */
  server?: ServerPaginationProps
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  toolbar,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
  pageSize = 10,
  server,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [clientFilter, setClientFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    manualPagination: Boolean(server),
    manualFiltering: Boolean(server),
    pageCount: server ? Math.max(1, Math.ceil(server.totalRows / server.pageSize)) : undefined,
    state: {
      sorting,
      globalFilter: server ? server.search : clientFilter,
      ...(server ? { pagination: { pageIndex: server.pageIndex, pageSize: server.pageSize } } : {}),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: server ? server.onSearchChange : setClientFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: server ? undefined : getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: server ? undefined : getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const rows = table.getRowModel().rows
  const totalRows = server ? server.totalRows : table.getFilteredRowModel().rows.length
  const pageIndex = server ? server.pageIndex : table.getState().pagination.pageIndex
  const currentPageSize = server ? server.pageSize : table.getState().pagination.pageSize
  const pageCount = server ? Math.max(1, Math.ceil(server.totalRows / server.pageSize)) : Math.max(table.getPageCount(), 1)
  const canPreviousPage = pageIndex > 0
  const canNextPage = pageIndex < pageCount - 1

  function goToPage(index: number) {
    if (server) server.onPageIndexChange(index)
    else table.setPageIndex(index)
  }

  function setPageSize(size: number) {
    if (server) server.onPageSizeChange(size)
    else table.setPageSize(size)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={server ? server.search : clientFilter}
            onChange={(e) => (server ? server.onSearchChange(e.target.value) : setClientFilter(e.target.value))}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-secondary/60 hover:bg-secondary/60">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer select-none whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {server?.isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-10 text-center text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} className="border-none" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalRows > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {pageIndex * currentPageSize + 1}–
              {Math.min((pageIndex + 1) * currentPageSize, totalRows)} of {totalRows}
            </span>
            <Select value={String(currentPageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-8" onClick={() => goToPage(0)} disabled={!canPreviousPage}>
              <ChevronsLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8" onClick={() => goToPage(pageIndex - 1)} disabled={!canPreviousPage}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 text-sm text-muted-foreground">
              Page {pageIndex + 1} of {pageCount}
            </span>
            <Button variant="outline" size="icon" className="size-8" onClick={() => goToPage(pageIndex + 1)} disabled={!canNextPage}>
              <ChevronRight className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8" onClick={() => goToPage(pageCount - 1)} disabled={!canNextPage}>
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
