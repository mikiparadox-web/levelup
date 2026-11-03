import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// ---------- Icons (24px stroke, drawn to one grid so they match) ----------
const PATHS: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  quests: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5 10 17.5 19 7',
  flame: 'M12 22c4 0 7-2.7 7-6.8 0-3.6-2.5-6.2-4.4-8.2-.4 2.2-1.5 3.6-3 4.3.4-3.5-1-6.7-4-9.3.1 3.8-4.6 6.9-4.6 13.2C3 19.3 7 22 12 22z',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  left: 'M15 18 9 12l6-6',
  right: 'm9 18 6-6-6-6',
  x: 'M6 6l12 12M18 6 6 18',
  wand: 'm15 4 1.5 3L20 8.5 16.5 10 15 13l-1.5-3L10 8.5 13.5 7zM13 11 3 21',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  repeat: 'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z',
  alert: 'M12 8v5M12 16.5h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
}

export function Icon({ name, size = 20, stroke = 2, className }: { name: keyof typeof PATHS | string; size?: number; stroke?: number; className?: string }) {
  const filled = name === 'flame' || name === 'bolt'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[name]} />
    </svg>
  )
}

// ---------- Progress bar ----------
export function Bar({ value, tone = 'xp', label, size = 'md' }: { value: number; tone?: 'xp' | 'done' | 'brand' | 'muted'; label?: string; size?: 'sm' | 'md' | 'lg' }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className={`bar bar-${size}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label}>
      <motion.span className={`bar-fill tone-${tone}`} initial={false} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
    </div>
  )
}

// ---------- Avatar ----------
export const AVATARS = ['🧙', '🦸', '🥷', '🧝', '🧑‍🚀', '🦊', '🐉', '🦉', '🐼', '🐯', '🤖', '🌟']

export function Avatar({ emoji, size = 48 }: { emoji: string; size?: number }) {
  return <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.56 }} aria-hidden="true">{emoji}</span>
}

// ---------- Modal ----------
export function Modal({ open, onClose, title, children, labelledBy }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; labelledBy?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    window.setTimeout(() => ref.current?.querySelector<HTMLElement>('[data-autofocus], button')?.focus(), 30)
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div ref={ref} className="modal" role="dialog" aria-modal="true" aria-label={title} aria-labelledby={labelledBy}
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------- Toasts ----------
interface Toast { id: number; text: string; icon?: string; action?: { label: string; run: () => void }; tone?: 'xp' | 'ach' | 'plain' }
const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {})
let toastSeq = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([])
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = toastSeq++
    setList((l) => [...l.slice(-2), { ...t, id }])
    window.setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), t.action ? 5000 : 3200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite" role="status">
        <AnimatePresence>
          {list.map((t) => (
            <motion.div key={t.id} layout className={`toast tone-${t.tone ?? 'plain'}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              {t.icon && <span className="toast-icon" aria-hidden="true">{t.icon}</span>}
              <span className="toast-text">{t.text}</span>
              {t.action && (
                <button className="toast-btn" onClick={() => { t.action!.run(); setList((l) => l.filter((x) => x.id !== t.id)) }}>{t.action.label}</button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

// ---------- Segmented choice (radio group styled as tiles) ----------
export function Choice<T extends string>({ name, value, options, onChange, columns = 2 }: {
  name: string; value: T; columns?: number
  options: { value: T; label: string; desc?: string; icon?: ReactNode; extra?: ReactNode }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="choice" role="radiogroup" style={{ ['--cols' as string]: columns }}>
      {options.map((o) => (
        <label key={o.value} className={`choice-item ${value === o.value ? 'is-on' : ''}`}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          {o.icon && <span className="choice-icon" aria-hidden="true">{o.icon}</span>}
          <span className="choice-text">
            <b>{o.label}</b>
            {o.desc && <small>{o.desc}</small>}
          </span>
          {o.extra}
        </label>
      ))}
    </div>
  )
}
