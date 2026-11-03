import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORY_ICON, XP_BY_DIFFICULTY, type Quest } from '../lib/game'
import { useT } from '../lib/i18n'
import { Icon } from './ui'

export function QuestRow({ q, done, onToggle, streakDays }: { q: Pick<Quest, 'title' | 'category' | 'difficulty' | 'minutes' | 'frequency'>; done: boolean; onToggle?: () => void; streakDays?: number }) {
  const { t } = useT()
  const [burst, setBurst] = useState(0)
  const xp = XP_BY_DIFFICULTY[q.difficulty]
  const click = () => {
    if (!onToggle) return
    if (!done) setBurst((b) => b + 1)
    onToggle()
  }
  return (
    <li className={`qrow cat-${q.category} ${done ? 'is-done' : ''}`}>
      <button className="qcheck" onClick={click} aria-pressed={done} disabled={!onToggle}
        aria-label={t(done ? 'dash.markUndone' : 'dash.markDone', { q: q.title })}>
        <motion.span className="qcheck-box" animate={done ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
          {done && <Icon name="check" size={18} stroke={3} />}
        </motion.span>
      </button>
      <div className="qbody">
        <span className="qtitle">{q.title}</span>
        <span className="qmeta">
          <span aria-hidden="true">{CATEGORY_ICON[q.category]}</span> {t(`cat.${q.category}`)}
          {q.minutes ? <><span className="dot" />{t('u.min', { n: q.minutes })}</> : null}
          {q.frequency !== 'daily' && <><span className="dot" />{t(`freq.${q.frequency}`)}</>}
          {!!streakDays && streakDays > 1 && <><span className="dot" /><span className="qstreak"><Icon name="flame" size={12} />{streakDays}</span></>}
        </span>
      </div>
      <span className={`xp-chip ${done ? 'is-earned' : ''}`}>+{xp} XP</span>
      <AnimatePresence>
        {burst > 0 && done && (
          <motion.span key={burst} className="xp-float" initial={{ opacity: 0, y: 6 }} animate={{ opacity: [0, 1, 1, 0], y: -34 }} transition={{ duration: 1.1 }} aria-hidden="true">
            +{xp} XP
          </motion.span>
        )}
      </AnimatePresence>
    </li>
  )
}
