import { format, subMonths, startOfMonth } from "date-fns"

export function lastNMonthLabels(n: number, referenceDate = new Date()): { key: string; label: string; date: Date }[] {
  return Array.from({ length: n }).map((_, idx) => {
    const date = startOfMonth(subMonths(referenceDate, n - 1 - idx))
    return { key: format(date, "yyyy-MM"), label: format(date, "MMM"), date }
  })
}

export function countByMonth<T>(items: T[], getDate: (item: T) => string, months: { key: string; label: string }[]): Record<string, number> {
  const counts: Record<string, number> = {}
  months.forEach((m) => (counts[m.key] = 0))
  items.forEach((item) => {
    const key = getDate(item).slice(0, 7)
    if (key in counts) counts[key] += 1
  })
  return counts
}
