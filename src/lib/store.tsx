import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { addDays, todayKey, weekdayIndex } from './date'
import { XP_BY_DIFFICULTY, type Category, type Completion, type Profile, type Quest } from './game'
import { STARTERS, type Template } from './helper'
import type { Lang } from './i18n'

export type Theme = 'system' | 'light' | 'dark'
export interface Settings { lang: Lang; theme: Theme; sound: boolean }

export interface State {
  profile: Profile | null
  quests: Quest[]
  completions: Completion[]
  settings: Settings
  demo: boolean
}

export type QuestInput = Omit<Quest, 'id' | 'createdAt'>

type Action =
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'onboard'; profile: Profile; quest: QuestInput }
  | { type: 'profile'; patch: Partial<Profile> }
  | { type: 'addQuests'; quests: QuestInput[] }
  | { type: 'updateQuest'; id: string; patch: QuestInput }
  | { type: 'deleteQuest'; id: string }
  | { type: 'toggle'; id: string; date: string }
  | { type: 'demo'; lang: Lang }
  | { type: 'reset' }

const KEY = 'levelup:v1'
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

function defaultSettings(): Settings {
  const th = typeof navigator !== 'undefined' && /^th/i.test(navigator.language || '')
  return { lang: th ? 'th' : 'en', theme: 'system', sound: true }
}

const empty = (settings = defaultSettings()): State => ({ profile: null, quests: [], completions: [], settings, demo: false })

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const s = JSON.parse(raw) as State
    return { ...empty(), ...s, settings: { ...defaultSettings(), ...s.settings } }
  } catch {
    return empty()
  }
}

const mkQuest = (q: QuestInput, createdAt = todayKey()): Quest => ({ ...q, id: uid(), createdAt })

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'settings':
      return { ...s, settings: { ...s.settings, ...a.patch } }
    case 'onboard':
      return { ...empty(s.settings), profile: a.profile, quests: [mkQuest(a.quest)] }
    case 'profile':
      return s.profile ? { ...s, profile: { ...s.profile, ...a.patch } } : s
    case 'addQuests':
      return { ...s, quests: [...s.quests, ...a.quests.map((q) => mkQuest(q))] }
    case 'updateQuest':
      return { ...s, quests: s.quests.map((q) => (q.id === a.id ? { ...q, ...a.patch } : q)) }
    case 'deleteQuest':
      return { ...s, quests: s.quests.filter((q) => q.id !== a.id) }
    case 'toggle': {
      const exists = s.completions.some((c) => c.questId === a.id && c.date === a.date)
      if (exists) return { ...s, completions: s.completions.filter((c) => !(c.questId === a.id && c.date === a.date)) }
      const q = s.quests.find((x) => x.id === a.id)
      if (!q) return s
      const c: Completion = { questId: q.id, date: a.date, xp: XP_BY_DIFFICULTY[q.difficulty], at: Date.now(), category: q.category, title: q.title }
      return { ...s, completions: [...s.completions, c] }
    }
    case 'demo':
      return makeDemo(s.settings, a.lang)
    case 'reset':
      return empty(s.settings)
  }
}

// ---------- Sample data so visitors can see a lived-in dashboard right away ----------
function makeDemo(settings: Settings, lang: Lang): State {
  const today = todayKey()
  const start = addDays(today, -15)
  const pick = (cat: Category, i: number, over: Partial<Template> = {}): QuestInput => {
    const tp = { ...STARTERS[cat][i], ...over }
    return { title: lang === 'th' ? tp.th : tp.en, category: tp.category, frequency: tp.frequency, difficulty: tp.difficulty, minutes: tp.minutes }
  }
  const quests: Quest[] = [
    pick('study', 0),
    pick('fitness', 0),
    pick('growth', 0),
    pick('fitness', 2),
    pick('career', 1),
  ].map((q) => mkQuest(q, start))
  const rate = [0.9, 0.7, 0.65, 0.6, 0.6]
  let seed = 7
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const restDays = new Set([addDays(today, -5), addDays(today, -11)])
  const completions: Completion[] = []
  for (let d = start; d < today; d = addDays(d, 1)) {
    if (restDays.has(d)) continue
    quests.forEach((q, i) => {
      const wd = weekdayIndex(d)
      const due = q.frequency === 'daily' || (q.frequency === 'weekdays' && wd < 5) || (q.frequency === 'weekends' && wd >= 5)
      const forced = i === 0 // keep the English quest steady so the streak survives
      if (due && (forced || rnd() < rate[i])) {
        completions.push({ questId: q.id, date: d, xp: XP_BY_DIFFICULTY[q.difficulty], at: 0, category: q.category, title: q.title })
      }
    })
  }
  // Today: one quest already done, the rest waiting, so the visitor can finish them.
  const walk = quests[1]
  completions.push({ questId: walk.id, date: today, xp: XP_BY_DIFFICULTY[walk.difficulty], at: Date.now(), category: walk.category, title: walk.title })
  return {
    profile: { name: lang === 'th' ? 'ฟ้า' : 'Alex', avatar: '🧙', focus: ['study', 'fitness', 'growth'], createdAt: start },
    quests,
    completions,
    settings: { ...settings, lang },
    demo: true,
  }
}

// ---------- Context ----------
const Ctx = createContext<{ s: State; d: React.Dispatch<Action> } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage unavailable: keep working in memory */ }
  }, [s])
  const value = useMemo(() => ({ s, d }), [s])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore outside StoreProvider')
  return c
}
