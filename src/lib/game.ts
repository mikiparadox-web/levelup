import { addDays, todayKey, weekdayIndex, type DateKey } from './date'

export type Category = 'fitness' | 'study' | 'career' | 'growth' | 'health' | 'creative'
export type Frequency = 'daily' | 'weekdays' | 'weekends' | 'once'
export type Difficulty = 'easy' | 'medium' | 'hard'

export const CATEGORIES: Category[] = ['fitness', 'study', 'career', 'growth', 'health', 'creative']
export const FREQUENCIES: Frequency[] = ['daily', 'weekdays', 'weekends', 'once']
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export const CATEGORY_ICON: Record<Category, string> = {
  fitness: '🏃', study: '📚', career: '💼', growth: '🌱', health: '💧', creative: '🎨',
}

/** XP is set by difficulty so users don't have to invent numbers. */
export const XP_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 25, medium: 50, hard: 100 }

export interface Quest {
  id: string
  title: string
  category: Category
  frequency: Frequency
  difficulty: Difficulty
  minutes: number | null
  createdAt: DateKey
}

export interface Completion {
  questId: string
  date: DateKey
  xp: number
  at: number
  /** Copied from the quest so stats still work after a quest is deleted. */
  category: Category
  title: string
}

export interface Profile {
  name: string
  avatar: string
  focus: Category[]
  createdAt: DateKey
}

// ---------- Levels ----------
// Going from level L to L+1 costs 100 + 50·(L−1) XP: 100, 150, 200, …
export const xpForLevel = (level: number) => 100 + 50 * (level - 1)

export function levelInfo(totalXp: number) {
  let level = 1
  let rest = totalXp
  while (rest >= xpForLevel(level)) {
    rest -= xpForLevel(level)
    level++
  }
  const need = xpForLevel(level)
  return { level, current: rest, need, toNext: need - rest, pct: rest / need }
}

export const totalXp = (c: Completion[]) => c.reduce((s, x) => s + x.xp, 0)

// ---------- Schedule ----------
export function isDue(q: Quest, date: DateKey, completions: Completion[]): boolean {
  if (date < q.createdAt) return false
  const wd = weekdayIndex(date)
  switch (q.frequency) {
    case 'daily': return true
    case 'weekdays': return wd < 5
    case 'weekends': return wd >= 5
    case 'once': {
      const done = completions.find((c) => c.questId === q.id)
      return done ? done.date === date : date === todayKey()
    }
  }
}

export const isDone = (questId: string, date: DateKey, c: Completion[]) =>
  c.some((x) => x.questId === questId && x.date === date)

// ---------- Streaks ----------
export function activeDays(c: Completion[]): Set<DateKey> {
  return new Set(c.map((x) => x.date))
}

/** Days in a row with at least one completed quest, ending today (or yesterday, so the streak isn't "lost" before you've had a chance today). */
export function currentStreak(c: Completion[], today = todayKey()): number {
  const days = activeDays(c)
  let d = days.has(today) ? today : addDays(today, -1)
  let n = 0
  while (days.has(d)) { n++; d = addDays(d, -1) }
  return n
}

export function bestStreak(c: Completion[]): number {
  const days = [...activeDays(c)].sort()
  let best = 0, run = 0, prev = ''
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return best
}

// ---------- Achievements ----------
export interface GameSnapshot {
  quests: Quest[]
  completions: Completion[]
  today: DateKey
}

export interface AchievementDef {
  id: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold'
  progress: (s: GameSnapshot) => { value: number; target: number }
}

const perfectDays = (s: GameSnapshot) => {
  const days = activeDays(s.completions)
  let n = 0
  days.forEach((d) => {
    const due = s.quests.filter((q) => isDue(q, d, s.completions))
    if (due.length >= 2 && due.every((q) => isDone(q.id, d, s.completions))) n++
  })
  return n
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first', icon: '⭐', tier: 'bronze', progress: (s) => ({ value: s.completions.length, target: 1 }) },
  { id: 'builder', icon: '🧱', tier: 'bronze', progress: (s) => ({ value: s.quests.length, target: 3 }) },
  { id: 'streak3', icon: '🔥', tier: 'bronze', progress: (s) => ({ value: bestStreak(s.completions), target: 3 }) },
  { id: 'perfect', icon: '💯', tier: 'silver', progress: (s) => ({ value: perfectDays(s), target: 1 }) },
  { id: 'explorer', icon: '🧭', tier: 'silver', progress: (s) => ({ value: new Set(s.completions.map((c) => c.category)).size, target: 3 }) },
  { id: 'streak7', icon: '🏆', tier: 'silver', progress: (s) => ({ value: bestStreak(s.completions), target: 7 }) },
  { id: 'quests25', icon: '⚔️', tier: 'silver', progress: (s) => ({ value: s.completions.length, target: 25 }) },
  { id: 'level5', icon: '🛡️', tier: 'gold', progress: (s) => ({ value: levelInfo(totalXp(s.completions)).level, target: 5 }) },
  { id: 'xp1000', icon: '💎', tier: 'gold', progress: (s) => ({ value: totalXp(s.completions), target: 1000 }) },
  { id: 'level10', icon: '👑', tier: 'gold', progress: (s) => ({ value: levelInfo(totalXp(s.completions)).level, target: 10 }) },
  { id: 'streak30', icon: '🌋', tier: 'gold', progress: (s) => ({ value: bestStreak(s.completions), target: 30 }) },
]

export function unlockedIds(s: GameSnapshot): string[] {
  return ACHIEVEMENTS.filter((a) => { const p = a.progress(s); return p.value >= p.target }).map((a) => a.id)
}

/** Consecutive scheduled days this quest was done (non-scheduled days are skipped, not counted as misses). */
export function questStreak(q: Quest, c: Completion[], today = todayKey()): number {
  if (q.frequency === 'once') return 0
  const done = new Set(c.filter((x) => x.questId === q.id).map((x) => x.date))
  let d = done.has(today) ? today : addDays(today, -1)
  let n = 0
  for (let i = 0; i < 400 && d >= q.createdAt; i++, d = addDays(d, -1)) {
    if (!isDue(q, d, c)) continue
    if (!done.has(d)) break
    n++
  }
  return n
}
