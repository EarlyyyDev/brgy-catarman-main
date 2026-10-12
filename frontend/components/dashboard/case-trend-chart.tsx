"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const NAVY = "var(--primary)"
const GOLD = "var(--gold)"

export function CaseTrendChart({ trend }: { trend: { month: string; requests: number; complaints: number }[] }) {
  const data = React.useMemo(
    () =>
      trend.map((row) => ({
        month: new Date(`${row.month}-01T00:00:00`).toLocaleString("en", { month: "short", timeZone: "UTC" }),
        "Requested Documents": row.requests,
        Complaints: row.complaints,
      })),
    [trend],
  )

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Monthly Case Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="Requested Documents" stroke={NAVY} strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Complaints" stroke={GOLD} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
      <CardContent className="h-64 border-t border-border pt-4 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, top: 8 }} barCategoryGap="25%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Requested Documents" fill={NAVY} radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="Complaints" fill={GOLD} radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
