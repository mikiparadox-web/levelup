import { useMemo } from 'react'
import { todayKey } from './date'
import { ACHIEVEMENTS, bestStreak, currentStreak, isDone, isDue, levelInfo, totalXp, unlockedIds } from './game'
import { useStore } from './store'

/** Everything the screens derive from raw state, computed in one place. */
export function useGame() {
  const { s } = useStore()
  return useMemo(() => {
    const today = todayKey()
    const xp = totalXp(s.completions)
    const lvl = levelInfo(xp)
    const todays = s.quests.filter((q) => isDue(q, today, s.completions))
    const doneIds = new Set(todays.filter((q) => isDone(q.id, today, s.completions)).map((q) => q.id))
    const xpToday = s.completions.filter((c) => c.date === today).reduce((n, c) => n + c.xp, 0)
    const snap = { quests: s.quests, completions: s.completions, today }
    const unlocked = unlockedIds(snap)
    const next = ACHIEVEMENTS.filter((a) => !unlocked.includes(a.id))
      .map((a) => ({ a, p: a.progress(snap) }))
      .sort((x, y) => y.p.value / y.p.target - x.p.value / x.p.target)[0]
    return {
      today, xp, lvl, todays, doneIds, xpToday, snap, unlocked, next,
      streak: currentStreak(s.completions, today),
      best: bestStreak(s.completions),
      doneToday: s.completions.some((c) => c.date === today),
    }
  }, [s.quests, s.completions])
}
