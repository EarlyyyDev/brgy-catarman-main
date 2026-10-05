"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { CalendarDays, CalendarRange, PhilippinePeso, Wallet } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useMonthlyRevenue, useRevenueAnalytics, type RevenueBreakdownRow } from "@/lib/api/hooks/use-dashboard"
import { formatCurrency } from "@/lib/format"

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "allTime", label: "All Time" },
] as const

type PeriodValue = (typeof PERIODS)[number]["value"]

function currentManilaYear() {
  return new Date(Date.now() + 8 * 60 * 60 * 1000).getUTCFullYear()
}

function monthName(month: number, style: "short" | "long" = "short") {
  return new Intl.DateTimeFormat("en-PH", { month: style, timeZone: "UTC" }).format(new Date(Date.UTC(2024, month - 1, 1)))
}

export default function AnalyticsPage() {
  const { revenue, isLoading } = useRevenueAnalytics()
  const [period, setPeriod] = React.useState<PeriodValue>("today")
  const [chartYear, setChartYear] = React.useState(String(currentManilaYear()))
  const { monthlyRevenue, isLoading: isMonthlyLoading, isError: isMonthlyError } = useMonthlyRevenue(chartYear)

  const totals = revenue?.totals
  const rows: RevenueBreakdownRow[] = revenue?.breakdown[period] ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Revenue from completed document requests — counted only once a document has been claimed."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Revenue" value={isLoading ? "—" : formatCurrency(totals?.today)} icon={CalendarDays} accent="navy" />
        <StatCard label="Monthly Revenue" value={isLoading ? "—" : formatCurrency(totals?.month)} icon={CalendarRange} accent="gold" />
        <StatCard label="Yearly Revenue" value={isLoading ? "—" : formatCurrency(totals?.year)} icon={Wallet} accent="success" />
        <StatCard label="All-Time Revenue" value={isLoading ? "—" : formatCurrency(totals?.allTime)} icon={PhilippinePeso} accent="navy" />
      </div>

      <Card className="border-border/70">
        <CardContent className="p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Monthly Revenue</p>
              <p className="mt-1 text-xs text-muted-foreground">Compare claimed-document revenue across the selected year.</p>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Year total</p>
                <p className="text-lg font-semibold text-foreground">
                  {isMonthlyLoading ? "—" : formatCurrency(monthlyRevenue?.total)}
                </p>
              </div>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                Year
                <Input
                  type="number"
                  min={2000}
                  max={currentManilaYear()}
                  value={chartYear}
                  onChange={(event) => setChartYear(event.target.value)}
                  className="w-28 text-sm text-foreground"
                />
              </label>
            </div>
          </div>

          <div className="relative h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue?.monthly ?? []} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(month: number) => monthName(month)} />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) =>
                    new Intl.NumberFormat("en-PH", { notation: "compact", maximumFractionDigits: 1 }).format(value)
                  }
                />
                <Tooltip
                  labelFormatter={(month) => `${monthName(Number(month), "long")} ${chartYear}`}
                  formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                />
                <Bar dataKey="revenue" name="Revenue" fill="var(--gold)" radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
            {isMonthlyError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm text-destructive">
                Could not load revenue for this year.
              </div>
            ) : null}
            {!isMonthlyLoading && !isMonthlyError && Number(monthlyRevenue?.total) === 0 ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                No claimed revenue for this year.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="p-6">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Revenue Breakdown by Document Type</p>
            <p className="text-xs text-muted-foreground">Only successfully claimed/released documents are counted as revenue.</p>
          </div>

          <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodValue)}>
            <TabsList>
              {PERIODS.map((p) => (
                <TabsTrigger key={p.value} value={p.value}>
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {PERIODS.map((p) => (
              <TabsContent key={p.value} value={p.value}>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Completed Transactions</TableHead>
                        <TableHead className="text-right">Total Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                            {isLoading ? "Loading..." : "No completed transactions for this period."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((row) => (
                          <TableRow key={row.documentTypeId}>
                            <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                            <TableCell>{formatCurrency(row.price)}</TableCell>
                            <TableCell>{row.count}</TableCell>
                            <TableCell className="text-right font-semibold text-foreground">{formatCurrency(row.revenue)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
