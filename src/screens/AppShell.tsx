import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Logo } from '../components/Brand'
import { Avatar, Bar, Icon, Modal, useToast } from '../components/ui'
import { ACHIEVEMENTS } from '../lib/game'
import { fmtNum, useT, type Key } from '../lib/i18n'
import { go } from '../lib/router'
import { sound } from '../lib/sound'
import { useStore } from '../lib/store'
import { useGame } from '../lib/useGame'

const NAV: { path: string; icon: string; key: Key }[] = [
  { path: '/today', icon: 'home', key: 'nav.today' },
  { path: '/quests', icon: 'quests', key: 'nav.quests' },
  { path: '/progress', icon: 'chart', key: 'nav.progress' },
  { path: '/profile', icon: 'user', key: 'nav.profile' },
]

/** Watches XP and achievements and celebrates changes the user just caused. */
function Celebrations() {
  const { s } = useStore()
  const { t, lang } = useT()
  const g = useGame()
  const toast = useToast()
  const [lvlUp, setLvlUp] = useState<number | null>(null)
  const prev = useRef<{ id: string; level: number; unlocked: string[] } | null>(null)
  const id = `${s.profile?.createdAt}|${s.profile?.name}|${s.demo}`

  useEffect(() => {
    const p = prev.current
    prev.current = { id, level: g.lvl.level, unlocked: g.unlocked }
    if (!p || p.id !== id) return // new profile or demo loaded: set a baseline, don't celebrate
    if (g.lvl.level > p.level) { setLvlUp(g.lvl.level); sound.levelUp() }
    const fresh = g.unlocked.filter((x) => !p.unlocked.includes(x))
    fresh.forEach((aid, i) => {
      const a = ACHIEVEMENTS.find((x) => x.id === aid)!
      window.setTimeout(() => {
        toast({ text: t('dash.achToast', { name: t(`a.${aid}` as Key) }), icon: a.icon, tone: 'ach' })
        if (g.lvl.level <= p.level) sound.achievement()
      }, 700 + i * 500)
    })
  }, [g.lvl.level, g.unlocked, id, t, toast])

  return (
    <Modal open={lvlUp !== null} onClose={() => setLvlUp(null)} labelledBy="lvl-title">
      <div className="levelup">
        <motion.div className="levelup-badge" initial={{ scale: 0.4, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
          <span className="levelup-ring" aria-hidden="true" />
          <span className="levelup-num">{lvlUp}</span>
        </motion.div>
        <h2 id="lvl-title">{t('dash.lvlTitle')}</h2>
        <p>{t('dash.lvlText', { n: lvlUp ?? 0 })}</p>
        <p className="levelup-xp"><Icon name="bolt" size={16} /> {fmtNum(g.xp, lang)} XP</p>
        <button className="btn btn-primary" data-autofocus onClick={() => setLvlUp(null)}>{t('dash.lvlBtn')}</button>
      </div>
    </Modal>
  )
}

export function AppShell({ path, children }: { path: string; children: ReactNode }) {
  const { s } = useStore()
  const { t, lang } = useT()
  const g = useGame()
  const p = s.profile!
  const active = (n: string) => path === n || path.startsWith(n + '/')

  return (
    <div className="shell">
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>{t('nav.skip')}</a>

      <aside className="side">
        <button className="logo-btn" onClick={() => go('/')} aria-label="LevelUp home"><Logo /></button>
        <button className="side-hero" onClick={() => go('/profile')}>
          <Avatar emoji={p.avatar} size={44} />
          <span className="side-hero-text">
            <b>{p.name}</b>
            <small>{t('u.level', { n: g.lvl.level })} · {fmtNum(g.xp, lang)} XP</small>
          </span>
          <span className="side-hero-bar"><Bar value={g.lvl.pct} size="sm" label="XP" /></span>
        </button>
        <nav className="side-nav" aria-label="Main">
          {NAV.map((n) => (
            <a key={n.path} href={`#${n.path}`} className={active(n.path) ? 'is-on' : ''} aria-current={active(n.path) ? 'page' : undefined}>
              <Icon name={n.icon} /> {t(n.key)}
            </a>
          ))}
        </nav>
        <button className="btn btn-primary side-new" onClick={() => go('/quests/new')}><Icon name="plus" /> {t('nav.newQuest')}</button>
        {g.streak > 0 && (
          <div className="side-streak"><Icon name="flame" size={18} /> <b>{t(g.streak === 1 ? 'u.day' : 'u.days', { n: g.streak })}</b> <small>{t('dash.streak')}</small></div>
        )}
      </aside>

      <header className="topbar">
        <button className="logo-btn" onClick={() => go('/')} aria-label="LevelUp home"><Logo size={28} /></button>
        <button className="top-pill" onClick={() => go('/profile')} aria-label={`${p.name}, ${t('u.level', { n: g.lvl.level })}`}>
          {g.streak > 0 && <span className="top-streak"><Icon name="flame" size={14} />{g.streak}</span>}
          <span className="top-lv">{t('u.lv', { n: g.lvl.level })}</span>
          <Avatar emoji={p.avatar} size={30} />
        </button>
      </header>

      <main id="main" tabIndex={-1} className="main">{children}</main>

      <nav className="tabbar" aria-label="Main">
        {NAV.slice(0, 2).map((n) => (
          <a key={n.path} href={`#${n.path}`} className={active(n.path) ? 'is-on' : ''} aria-current={active(n.path) ? 'page' : undefined}>
            <Icon name={n.icon} size={22} /><span>{t(n.key)}</span>
          </a>
        ))}
        <button className="tab-new" onClick={() => go('/quests/new')} aria-label={t('nav.newQuest')}><Icon name="plus" size={26} stroke={2.5} /></button>
        {NAV.slice(2).map((n) => (
          <a key={n.path} href={`#${n.path}`} className={active(n.path) ? 'is-on' : ''} aria-current={active(n.path) ? 'page' : undefined}>
            <Icon name={n.icon} size={22} /><span>{t(n.key)}</span>
          </a>
        ))}
      </nav>

      <Celebrations />
    </div>
  )
}
