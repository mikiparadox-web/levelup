// Dates are stored as local "YYYY-MM-DD" keys so a quest done at 23:59 counts for that day.
export type DateKey = string

const pad = (n: number) => String(n).padStart(2, '0')

export function toKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromKey(k: DateKey): Date {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = () => toKey(new Date())

export function addDays(k: DateKey, n: number): DateKey {
  const d = fromKey(k)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

/** 0 = Monday … 6 = Sunday */
export function weekdayIndex(k: DateKey): number {
  return (fromKey(k).getDay() + 6) % 7
}

export function startOfWeek(k: DateKey): DateKey {
  return addDays(k, -weekdayIndex(k))
}

export function weekDays(start: DateKey): DateKey[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}
